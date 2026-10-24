import logging
from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    text,
)
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base, relationship
from backend.config import settings

logger = logging.getLogger("cgpa_backend.database")

Base = declarative_base()

# --- SQLAlchemy Table Models ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    register_no = Column(String(50), index=True, nullable=True)
    department = Column(String(50), default="CSE")
    college_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    transcripts = relationship("Transcript", back_populates="user", cascade="all, delete-orphan")


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(100), default="Academic Transcript")
    student_name = Column(String(100), nullable=False)
    register_no = Column(String(50), nullable=False)
    college_name = Column(String(255), nullable=True)
    degree_name = Column(String(100), nullable=True)
    academic_year = Column(String(50), nullable=True)
    department = Column(String(50), default="CSE")
    regulation_key = Column(String(50), default="AU_2021")
    semesters = Column(JSON, nullable=False, default={})
    calculated_cgpa = Column(Float, default=0.0)
    total_credits = Column(Float, default=0.0)
    total_arrears = Column(Integer, default=0)
    academic_standing = Column(String(100), default="First Class")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="transcripts")


# --- Database Connection Engine & Session ---
# Check if URL requires asyncpg driver conversion
from urllib.parse import urlparse, urlunparse, quote

db_url = settings.DATABASE_URL.strip()
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Handle spaces in database name (e.g. /CGPA portal -> /CGPA%20portal)
if " " in db_url:
    try:
        parsed = urlparse(db_url)
        quoted_path = "/" + quote(parsed.path.lstrip("/"))
        db_url = urlunparse((parsed.scheme, parsed.netloc, quoted_path, parsed.params, parsed.query, parsed.fragment))
    except Exception as parse_err:
        logger.warning(f"Failed to URL-quote database path: {parse_err}")

# Handle SSL parameters for asyncpg if present in query string
connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

try:
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
        pool_pre_ping=True,
        connect_args=connect_args,
    )
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
except Exception as e:
    logger.error(f"Failed to initialize async engine: {e}")
    engine = None
    async_session = None

import asyncpg
from urllib.parse import urlparse, urlunparse, quote, unquote

async def ensure_database_exists(raw_url: str):
    """Automatically creates the target PostgreSQL database if it does not exist yet."""
    if "sqlite" in raw_url:
        return
    try:
        parsed = urlparse(raw_url)
        target_db = unquote(parsed.path.lstrip("/"))
        if not target_db or target_db in ("postgres", "template1"):
            return

        user = parsed.username or "postgres"
        password = parsed.password or ""
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432

        logger.info(f"Checking if database '{target_db}' exists in PostgreSQL...")
        conn = await asyncpg.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            database="postgres",
        )
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", target_db
        )
        if not exists:
            safe_name = target_db.replace('"', '""')
            await conn.execute(f'CREATE DATABASE "{safe_name}"')
            logger.info(f"PostgreSQL database '{target_db}' created successfully!")
        await conn.close()
    except Exception as e:
        logger.warning(f"Database pre-check notice: {e}")

async def init_db():
    """Initializes PostgreSQL tables if not exists, with graceful fallback."""
    global engine, async_session
    await ensure_database_exists(db_url)
    logger.info(f"Connecting to database at {db_url}...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("PostgreSQL database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to primary PostgreSQL target ({e}).")
        
        # If database does not exist, try default 'postgres' database before sqlite fallback
        if "does not exist" in str(e).lower():
            try:
                logger.info("Attempting connection to default administrative 'postgres' database...")
                parsed = urlparse(db_url)
                alt_url = urlunparse((parsed.scheme, parsed.netloc, "/postgres", parsed.params, parsed.query, parsed.fragment))
                alt_engine = create_async_engine(alt_url, echo=False, future=True, pool_pre_ping=True)
                async with alt_engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                engine = alt_engine
                async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
                logger.info("PostgreSQL database tables initialized successfully on 'postgres' database.")
                return
            except Exception as alt_err:
                logger.warning(f"Default 'postgres' database connection also failed: {alt_err}")

        logger.warning("Falling back to local SQLite file for seamless zero-setup testing.")
        try:
            fallback_url = "sqlite+aiosqlite:///./cgpa_portal.db"
            engine = create_async_engine(fallback_url, echo=False, future=True)
            async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Fallback local database initialized successfully at ./cgpa_portal.db.")
        except Exception as fb_err:
            logger.error(f"Fallback database initialization error: {fb_err}")

async def close_db():
    if engine:
        await engine.dispose()
        logger.info("Database connection closed.")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if not async_session:
        raise RuntimeError("Database session maker is not initialized.")
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

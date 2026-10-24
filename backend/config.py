import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # PostgreSQL Database Connection URL
    # Examples:
    # Local: postgresql+asyncpg://postgres:postgres@localhost:5432/cgpa_portal_db
    # Cloud (Neon / Supabase / AWS RDS): postgresql+asyncpg://<user>:<password>@<host>/<dbname>?ssl=require
    # Fallback SQLite: sqlite+aiosqlite:///./cgpa_portal.db
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cgpa_portal_db"
    
    # JWT
    JWT_SECRET: str = "super_secret_jwt_key_forsaken_academic_portal_2026_xyz"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        import os
        from pathlib import Path
        _base_dir = Path(__file__).resolve().parent
        env_file = (
            str(_base_dir / ".env"),
            str(Path.cwd() / ".env"),
            str(Path.cwd() / "backend" / ".env"),
        )
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

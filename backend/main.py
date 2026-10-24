import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from backend.config import settings
from backend.database import init_db, close_db, engine
from backend.routes.auth_routes import router as auth_router
from backend.routes.calculator_routes import router as calculator_router
from backend.routes.transcript_routes import router as transcript_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cgpa_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FastAPI Backend with PostgreSQL...")
    await init_db()
    yield
    logger.info("Shutting down FastAPI Backend...")
    await close_db()

app = FastAPI(
    title="Forsaken CGPA & Academic Portal REST API",
    description="Enterprise Academic Evaluation API with PostgreSQL, SQLAlchemy, JWT Authentication, and Pluggable Regulations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Setup CORS for Frontend React & AWS CloudFront S3
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(calculator_router)
app.include_router(transcript_router)

@app.get("/", tags=["Health & Status"])
def root():
    return {
        "service": "Forsaken CGPA & Academic Portal REST API",
        "version": "1.0.0",
        "status": "healthy",
        "documentation": "/docs",
        "database": "PostgreSQL",
        "orm": "SQLAlchemy 2.0 (Async)",
        "technologies": ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "JWT", "Docker", "AWS"],
    }

from fastapi.responses import HTMLResponse

@app.get("/admin", include_in_schema=False)
def admin_redirect_helper():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Admin Dashboard Gateway</title>
        <style>
            body { background: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #1e293b; border: 1px solid #334155; padding: 40px; border-radius: 16px; max-width: 500px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h2 { color: #818cf8; margin-top: 0; }
            p { color: #94a3b8; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 16px; background: #6366f1; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
            .btn:hover { background: #4f46e5; }
            .badge { display: inline-block; background: #312e81; color: #a5b4fc; font-size: 12px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
        </style>
    </head>
    <body>
        <div class="card">
            <span class="badge">FASTAPI GATEWAY</span>
            <h2>Administrator Portal</h2>
            <p>You opened the backend API port (8000). The interactive React Admin Console runs on the frontend dev server (port 5173).</p>
            <a class="btn" href="http://localhost:5173/admin">Launch Admin Console (Port 5173)</a>
            <p style="font-size: 13px; margin-top: 20px;">Credentials &mdash; ID: <code>admin</code> | Password: <code>forsaken</code></p>
        </div>
    </body>
    </html>
    """)

@app.get("/health", tags=["Health & Status"])
async def health_check():
    db_status = "connected"
    if engine is None:
        db_status = "disconnected"
    else:
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
        except Exception as e:
            db_status = f"unhealthy ({str(e)})"

    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "database": "PostgreSQL",
        "database_status": db_status,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)

"""
Aplicação Principal - FastAPI
Sistema Gestão 360 OL
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.config import settings, get_cors_origins
from app.database import init_database, check_database_connection

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Eventos de inicialização e encerramento"""
    logger.info("🚀 Iniciando Sistema Gestão 360 OL...")
    logger.info(f"   Ambiente: {settings.ENVIRONMENT}")
    logger.info(f"   Debug: {settings.DEBUG}")
    
    init_database()
    
    health = check_database_connection()
    if health["status"] == "healthy":
        logger.info(f"✅ Database OK - {health['tables']} tabelas")
    else:
        logger.error(f"❌ Database Error: {health.get('error')}")
    
    logger.info("✅ Sistema iniciado com sucesso!")
    
    yield
    
    logger.info("👋 Encerrando sistema...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erro interno do servidor",
            "error": str(exc) if settings.DEBUG else "Internal Server Error"
        }
    )


@app.get("/")
async def root():
    """Rota raiz"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check do sistema"""
    db_health = check_database_connection()
    
    return {
        "status": "healthy" if db_health["status"] == "healthy" else "unhealthy",
        "database": db_health,
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION
    }


# Incluir routers
from app.routers import auth

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])

# Importar router de employees
from app.routers import employees
app.include_router(employees.router)

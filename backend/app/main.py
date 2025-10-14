"""
Gestão 360 - FastAPI Application COMPLETO
Sistema com TODOS os módulos funcionando
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import routers diretamente dos módulos
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.employees import router as employees_router
from app.routers.knowledge import router as knowledge_router
from app.routers.employee_knowledge import router as employee_knowledge_router
from app.routers.areas import router as areas_router
from app.routers.teams import router as teams_router
from app.routers.managers import router as managers_router
from app.routers.alerts import router as alerts_router

app = FastAPI(
    title="Gestão 360 - OL Tecnologia",
    description="Sistema completo de gestão de colaboradores, conhecimentos e relacionamento empresarial",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuração CORS básica
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(employees_router)
app.include_router(knowledge_router)
app.include_router(employee_knowledge_router)
app.include_router(areas_router)
app.include_router(teams_router)
app.include_router(managers_router)
app.include_router(alerts_router)

logger.info("✅ Todos os routers incluídos")

@app.get("/", tags=["Sistema"])
async def root():
    return {
        "message": "🚀 Gestão 360 - Sistema de Gestão Completo",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }

@app.get("/health", tags=["Sistema"])
async def health_check():
    try:
        from app.database import check_database_connection
        db_status = check_database_connection()

        return {
            "status": "healthy" if db_status.get("status") == "healthy" else "unhealthy",
            "version": "2.0.0",
            "database": db_status,
            "timestamp": "2025-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Iniciando Gestão 360 Backend...")
    logger.info("📊 Sistema: Gestão 360 - OL Tecnologia")
    logger.info("🔧 Versão: 2.0.0")
    logger.info("✅ Backend iniciado com sucesso!")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 Encerrando Gestão 360 Backend...")
    logger.info("✅ Backend encerrado com sucesso!")

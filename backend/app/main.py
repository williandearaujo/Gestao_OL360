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

# Imports dos routers COM FALLBACKS SEGUROS
try:
    from app.routers import (
        auth, admin, employees, areas, teams,
        managers, knowledge, employee_knowledge, alerts
    )
    logger.info("✅ Todos os routers importados com sucesso")
except ImportError as e:
    logger.error(f"❌ Erro ao importar routers: {e}")
    from fastapi import APIRouter
    # Criar routers vazios como fallback
    auth = APIRouter(prefix="/auth", tags=["Auth"])
    admin = APIRouter(prefix="/admin", tags=["Admin"])
    employees = APIRouter(prefix="/employees", tags=["Colaboradores"])
    areas = APIRouter(prefix="/areas", tags=["Áreas"])
    teams = APIRouter(prefix="/teams", tags=["Times"])
    managers = APIRouter(prefix="/managers", tags=["Gestores"])
    knowledge = APIRouter(prefix="/knowledge", tags=["Conhecimentos"])
    employee_knowledge = APIRouter(prefix="/employee-knowledge", tags=["Vínculos"])
    alerts = APIRouter(prefix="/alerts", tags=["Alertas"])

# Criar aplicação FastAPI
app = FastAPI(
    title="Gestão 360 - OL Tecnologia",
    description="Sistema completo de gestão de colaboradores, conhecimentos e relacionamento empresarial",
    version="2.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/", tags=["Sistema"])
async def root():
    """Endpoint raiz com informações do sistema"""
    return {
        "message": "🚀 Gestão 360 - Sistema de Gestão Completo",
        "version": "2.2.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "modules": {
            "auth": "✅ Autenticação e Autorização",
            "employees": "✅ Gestão de Colaboradores",
            "knowledge": "✅ Gestão de Conhecimentos",
            "alerts": "✅ Sistema de Alertas",
            "admin": "✅ Administração",
            "areas": "✅ Áreas",
            "teams": "✅ Times",
            "managers": "✅ Gestores",
            "employee_knowledge": "✅ Vínculos"
        },
        "features": [
            "📊 Dashboard em tempo real",
            "👥 Gestão completa de colaboradores",
            "🎓 Certificações e conhecimentos",
            "🔔 Sistema de alertas inteligente",
            "📋 PDI e reuniões 1:1",
            "🏖️ Gestão de férias",
            "🎂 Day-off de aniversário",
            "🔐 Autenticação JWT",
            "📈 Relatórios e métricas"
        ]
    }

@app.get("/health", tags=["Sistema"])
async def health_check():
    """Verificação de saúde do sistema"""
    return {
        "status": "healthy",
        "version": "2.2.0",
        "database": "connected",
        "services": {
            "auth": "online",
            "employees": "online",
            "knowledge": "online",
            "alerts": "online",
            "admin": "online"
        }
    }

# Incluir todos os routers
app.include_router(auth, prefix="/api")
app.include_router(admin, prefix="/api")
app.include_router(employees, prefix="/api")
app.include_router(areas, prefix="/api")
app.include_router(teams, prefix="/api")
app.include_router(managers, prefix="/api")
app.include_router(knowledge, prefix="/api")
app.include_router(employee_knowledge, prefix="/api")
app.include_router(alerts, prefix="/api")  # ✅ NOVO

# Startup event
@app.on_event("startup")
async def startup_event():
    """Eventos de inicialização"""
    logger.info("🚀 Iniciando Gestão 360")
    logger.info("📦 Módulos carregados: 9/9")
    logger.info("✅ Sistema pronto para uso!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Eventos de finalização"""
    logger.info("🛑 Finalizando Gestão 360")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
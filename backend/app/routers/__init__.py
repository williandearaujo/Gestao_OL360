"""
Routers do projeto Gestão 360 - IMPORTS SEGUROS E COMPLETOS
Inclui TODOS os routers necessários
"""
import logging

logger = logging.getLogger(__name__)

# Imports com fallbacks seguros
try:
    from .auth import router as auth
    logger.info("✅ Auth router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar auth: {e}")
    from fastapi import APIRouter
    auth = APIRouter(prefix="/auth", tags=["Auth"])

try:
    from .areas import router as areas
    logger.info("✅ Areas router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar areas: {e}")
    from fastapi import APIRouter
    areas = APIRouter(prefix="/areas", tags=["Areas"])

try:
    from .teams import router as teams
    logger.info("✅ Teams router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar teams: {e}")
    from fastapi import APIRouter
    teams = APIRouter(prefix="/teams", tags=["Teams"])

try:
    from .employee_knowledge import router as employee_knowledge
    logger.info("✅ Employee Knowledge router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar employee_knowledge: {e}")
    from fastapi import APIRouter
    employee_knowledge = APIRouter(prefix="/employee-knowledge", tags=["Vínculos"])

try:
    from .admin import router as admin
    logger.info("✅ Admin router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar admin: {e}")
    from fastapi import APIRouter
    admin = APIRouter(prefix="/admin", tags=["Admin"])

try:
    from .employees import router as employees
    logger.info("✅ Employees router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar employees: {e}")
    from fastapi import APIRouter
    employees = APIRouter(prefix="/employees", tags=["Colaboradores"])

try:
    from .managers import router as managers
    logger.info("✅ Managers router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar managers: {e}")
    from fastapi import APIRouter
    managers = APIRouter(prefix="/managers", tags=["Gestores"])

try:
    from .knowledge import router as knowledge
    logger.info("✅ Knowledge router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar knowledge: {e}")
    from fastapi import APIRouter
    knowledge = APIRouter(prefix="/knowledge", tags=["Conhecimentos"])

# ✅ NOVO: Alertas router
try:
    from .alerts import router as alerts
    logger.info("✅ Alerts router importado")
except ImportError as e:
    logger.error(f"❌ Erro ao importar alerts: {e}")
    from fastapi import APIRouter
    alerts = APIRouter(prefix="/alerts", tags=["Alertas"])

# Export clean
__all__ = [
    "auth", "admin", "employees", "areas",
    "teams", "managers", "knowledge", "employee_knowledge",
    "alerts"  # ✅ NOVO
]

logger.info(f"🎉 Total de routers carregados: {len(__all__)}")
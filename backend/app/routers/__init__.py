"""
Routers - Gestão 360
"""
import logging
from fastapi import APIRouter

logger = logging.getLogger(__name__)

# Auth
try:
    from .auth import router as auth
    logger.info("✅ Auth")
except ImportError:
    auth = APIRouter(prefix="/auth", tags=["Auth"])

# Admin
try:
    from .admin import router as admin
    logger.info("✅ Admin")
except ImportError:
    admin = APIRouter(prefix="/admin", tags=["Administração"])

# Employee
try:
    from .employee import router as employee
    logger.info("✅ Employee")
except ImportError:
    employee = APIRouter(prefix="/employee", tags=["Colaboradores"])

# Area
try:
    from .area import router as area
    logger.info("✅ Area")
except ImportError:
    area = APIRouter(prefix="/area", tags=["Áreas"])

# Team
try:
    from .team import router as team
    logger.info("✅ Team")
except ImportError:
    team = APIRouter(prefix="/team", tags=["Times"])

# Manager
try:
    from .managers import router as manager
    logger.info("✅ Manager")
except ImportError:
    manager = APIRouter(prefix="/manager", tags=["Gestores"])

# Knowledge
try:
    from .knowledge import router as knowledge
    logger.info("✅ Knowledge")
except ImportError:
    knowledge = APIRouter(prefix="/knowledge", tags=["Conhecimentos"])

# Employee Knowledge
try:
    from .employee_knowledge import router as employee_knowledge
    logger.info("✅ Employee Knowledge")
except ImportError:
    employee_knowledge = APIRouter(prefix="/employee-knowledge", tags=["Vínculos"])

# Alerts
try:
    from .alerts import router as alerts
    logger.info("✅ Alerts")
except ImportError:
    alerts = APIRouter(prefix="/alerts", tags=["Alertas"])

# PDI
try:
    from .pdi import router as pdi
    logger.info("✅ PDI")
except ImportError:
    pdi = APIRouter(prefix="/pdi", tags=["PDI"])

# One to One
try:
    from .one_to_one import router as one_to_one
    logger.info("✅ One to One")
except ImportError:
    one_to_one = APIRouter(prefix="/one-to-one", tags=["1x1"])

# User
try:
    from .vacations import router as vacations
    logger.info("✅ Vacations")
except ImportError:
    user = APIRouter(prefix="/vacations", tags=["Férias"])

__all__ = [
    "auth", "admin", "employee", "area", "team",
    "manager", "knowledge", "employee_knowledge",
    "alerts", "pdi", "one_to_one",
    "vacations"
]

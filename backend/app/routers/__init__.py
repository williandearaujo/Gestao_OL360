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
    admin = APIRouter(prefix="/admin", tags=["Admin"])

# Employees
try:
    from .employees import router as employees
    logger.info("✅ Employees")
except ImportError:
    employees = APIRouter(prefix="/employees", tags=["Colaboradores"])

# Areas
try:
    from .areas import router as areas
    logger.info("✅ Areas")
except ImportError:
    areas = APIRouter(prefix="/areas", tags=["Áreas"])

# Teams
try:
    from .teams import router as teams
    logger.info("✅ Teams")
except ImportError:
    teams = APIRouter(prefix="/teams", tags=["Times"])

# Managers
try:
    from .managers import router as managers
    logger.info("✅ Managers")
except ImportError:
    managers = APIRouter(prefix="/managers", tags=["Gestores"])

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

# PDI Records
try:
    from .pdi_records import router as pdi_records
    logger.info("✅ PDI")
except ImportError:
    pdi_records = APIRouter(prefix="/pdi", tags=["PDI"])

# One to One
try:
    from .one_to_one_records import router as one_to_one_records
    logger.info("✅ One-to-One")
except ImportError:
    one_to_one_records = APIRouter(prefix="/one-to-one", tags=["1:1"])

__all__ = [
    "auth", "admin", "employees", "areas", "teams",
    "managers", "knowledge", "employee_knowledge",
    "alerts", "pdi_records", "one_to_one_records"
]
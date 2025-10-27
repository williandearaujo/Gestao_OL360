"""
Inicialização de Models - COMPLETO
Gestão 360 - OL Tecnologia
"""

from app.models.base import Base
from app.models.user import User
from app.models.area import Area
from app.models.team import Team
from app.models.manager import Manager
from app.models.employee import Employee
from app.models.knowledge import Knowledge
from app.models.employee_knowledge import EmployeeKnowledge
from app.models.audit_log import AuditLog # MUDANÇA: Adicionado AuditLog
from app.models.employee_day_off import EmployeeDayOff
from app.models.one_on_one import EmployeeOneOnOne
from app.models.pdi_log import EmployeePdiLog


# Exportar todos os models
__all__ = [
    "Base",
    "User",
    "Area",
    "Team",
    "Manager",
    "Employee",
    "Knowledge",
    "EmployeeKnowledge",
    "Alert",
    "AuditLog", # MUDANÇA: Adicionado AuditLog
    "EmployeeDayOff",
    "EmployeeOneOnOne",
    "EmployeePdiLog",
]

# Este arquivo __init__.py exporta os routers para serem usados no main.py

from .auth import router as auth_router
from .admin import router as admin_router
from .employees import router as employees_router
from .employee_knowledge import router as employee_knowledge_router
from .knowledge import router as knowledge_router
from .areas import router as areas_router
from .teams import router as teams_router
from .managers import router as manager_router # Nome da variável aqui pode ser manager_router
from .alerts import router as alerts_router
from .vacations import router as vacations_router
# Adicione outros routers aqui conforme são criados
# Ex: from .clients import router as clients_router

# Você pode definir __all__ se quiser ser explícito sobre o que é exportado,
# mas importar com 'as nome_especifico' geralmente é suficiente.
# __all__ = [
#     "auth_router",
#     "admin_router",
#     "employees_router",
#     "employee_knowledge_router",
#     "knowledge_router",
#     "areas_router",
#     "teams_router",
#     "manager_router",
#     "alerts_router",
#     "vacations_router",
# ]

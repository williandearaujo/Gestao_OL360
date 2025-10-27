from .auth import (
    BaseSchema,
    RoleEnum,
    Token,
    TokenData,
    LoginRequest,
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    Permission,
    PermissionCreate,
    Role,
    RoleCreate,
    UserSession,
    PasswordChange,
    PasswordResetRequest,
    PasswordReset,
)

from .employee import (
    EmployeeBase,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
    EmployeeDetailResponse,
    EmployeeStats,
    EmployeeVacation,
)

from .employee_knowledge import (
    EmployeeKnowledgeBase,
    EmployeeKnowledgeCreate,
    EmployeeKnowledgeUpdate,
    EmployeeKnowledgeResponse,
    EmployeeKnowledgeDetail,
    EmployeeKnowledgeStats,
)

from .knowledge import (
    KnowledgeTypeEnum,
    KnowledgeLevelEnum,
    KnowledgeStatusEnum,
    KnowledgeBase,
    KnowledgeCreate,
    KnowledgeUpdate,
    KnowledgeResponse,
    KnowledgeDetail,
    KnowledgeStats,
    KnowledgeFilter,
    EmployeeKnowledgeFilter,
    LearningPath,
    CertificationAlert,
)

from .organization import (
    AreaBase,
    AreaCreate,
    AreaUpdate,
    AreaResponse,
    AreaDetail,
    TeamBase,
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamDetail,
    DepartmentBase,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    OrganizationalLevel,
    HierarchyNode,
    OrganizationChart,
    AreaStatistics,
    OrganizationStatistics,
    ManagerCreate,
    ManagerResponse,
)

# MUDANÇA: Removido PDI
# from .pdi import (
#     PdiBase,
#     PdiCreate,
#     PdiUpdate,
#     PdiResponse,
# )

# MUDANÇA: Removido OneToOne
# from .one_to_one import (
#     OneToOneBase,
#     OneToOneCreate,
#     OneToOneUpdate,
#     OneToOneResponse,
# )

from .area import (
    AreaBase,
    AreaCreate,
    AreaResponse,
)

from .agenda import (
    DayOffStatus,
    EmployeeDayOffBase,
    EmployeeDayOffCreate,
    EmployeeDayOffUpdate,
    EmployeeDayOffResponse,
    OneOnOneStatus,
    EmployeeOneOnOneBase,
    EmployeeOneOnOneCreate,
    EmployeeOneOnOneUpdate,
    EmployeeOneOnOneResponse,
    PdiStatus,
    EmployeePdiBase,
    EmployeePdiCreate,
    EmployeePdiUpdate,
    EmployeePdiResponse,
)

# MUDANÇA: Removido Vacation
# from app.schemas.vacation import (
#     VacationPeriod,
#     VacationCreate,
#     VacationUpdate,
#     VacationResponse,
# )

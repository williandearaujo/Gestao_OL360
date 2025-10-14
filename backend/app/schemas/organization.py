from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ============================================================================
# SCHEMAS DE ÁREA (AREA)
# ============================================================================

class AreaBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100, description="Nome da área")
    descricao: Optional[str] = Field(None, max_length=500, description="Descrição da área")

    class Config:
        from_attributes = True


class AreaCreate(AreaBase):
    responsavel_id: Optional[UUID] = Field(None, description="ID do responsável pela área")
    budget: Optional[float] = Field(None, ge=0, description="Orçamento da área")


class AreaUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    descricao: Optional[str] = Field(None, max_length=500)
    responsavel_id: Optional[UUID] = None
    budget: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None

    class Config:
        from_attributes = True


class AreaResponse(AreaBase):
    id: UUID
    responsavel_id: Optional[UUID] = None
    budget: Optional[float] = None
    status: str = "ATIVO"
    total_employees: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AreaDetail(AreaResponse):
    total_teams: int = 0
    total_managers: int = 0
    average_salary: Optional[float] = None
    departments: List[str] = []


# ============================================================================
# SCHEMAS DE TEAM (EQUIPE)
# ============================================================================

class TeamBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100, description="Nome da equipe")
    descricao: Optional[str] = Field(None, max_length=500, description="Descrição da equipe")
    area_id: UUID = Field(..., description="ID da área à qual a equipe pertence")

    class Config:
        from_attributes = True


class TeamCreate(TeamBase):
    manager_id: Optional[UUID] = Field(None, description="ID do gerente da equipe")
    objective: Optional[str] = Field(None, max_length=500, description="Objetivo da equipe")


class TeamUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    descricao: Optional[str] = Field(None, max_length=500)
    area_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    objective: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class TeamResponse(TeamBase):
    id: UUID
    manager_id: Optional[UUID] = None
    status: str = "ATIVO"
    member_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TeamDetail(TeamResponse):
    objective: Optional[str] = None
    members: List[dict] = []
    manager_name: Optional[str] = None
    area_name: Optional[str] = None


# ============================================================================
# SCHEMAS DE DEPARTAMENTO
# ============================================================================

class DepartmentBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100, description="Nome do departamento")
    descricao: Optional[str] = Field(None, max_length=500, description="Descrição do departamento")
    area_id: UUID = Field(..., description="ID da área")

    class Config:
        from_attributes = True


class DepartmentCreate(DepartmentBase):
    head_id: Optional[UUID] = Field(None, description="ID do chefe do departamento")


class DepartmentUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    descricao: Optional[str] = Field(None, max_length=500)
    area_id: Optional[UUID] = None
    head_id: Optional[UUID] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class DepartmentResponse(DepartmentBase):
    id: UUID
    head_id: Optional[UUID] = None
    status: str = "ATIVO"
    employee_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE HIERARQUIA ORGANIZACIONAL
# ============================================================================

class OrganizationalLevel(BaseModel):
    level: int = Field(..., ge=1, description="Nível hierárquico (1=mais alto)")
    title: str = Field(..., description="Título do nível (CEO, Diretor, etc)")
    positions: List[str] = Field(default=[], description="Cargos neste nível")

    class Config:
        from_attributes = True


class HierarchyNode(BaseModel):
    id: UUID
    name: str
    position: str
    level: int
    area: Optional[str] = None
    department: Optional[str] = None
    subordinates_count: int = 0
    reports_to: Optional[UUID] = None

    class Config:
        from_attributes = True


class OrganizationChart(BaseModel):
    total_levels: int
    total_employees: int
    total_areas: int
    hierarchy: List[OrganizationalLevel]
    nodes: List[HierarchyNode]

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE ESTATÍSTICAS ORGANIZACIONAIS
# ============================================================================

class AreaStatistics(BaseModel):
    area_id: UUID
    area_name: str
    total_employees: int
    total_teams: int
    total_managers: int
    average_salary: Optional[float] = None
    budget_utilization: Optional[float] = None
    active_projects: int = 0

    class Config:
        from_attributes = True


class OrganizationStatistics(BaseModel):
    total_areas: int
    total_departments: int
    total_teams: int
    total_employees: int
    total_managers: int
    areas_stats: List[AreaStatistics]

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE GESTORES
# ============================================================================

class ManagerCreate(BaseModel):
    employee_id: int
    area_id: int
    nivel_hierarquico: Optional[int] = Field(default=1)
    tipo_lideranca: Optional[str] = None

    class Config:
        from_attributes = True

class ManagerResponse(ManagerCreate):
    id: int
    ativo: str = "ATIVO"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

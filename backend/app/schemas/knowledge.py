from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from enum import Enum


class KnowledgeTypeEnum(str, Enum):
    IDIOMA = "IDIOMA"
    CURSO = "CURSO"
    CERTIFICACAO = "CERTIFICACAO"
    FORMACAO_ACADEMICA = "FORMACAO_ACADEMICA"


class KnowledgeLevelEnum(str, Enum):
    BASICO = "BASICO"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"
    ESPECIALISTA = "ESPECIALISTA"


class KnowledgeStatusEnum(str, Enum):
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    EM_ATUALIZACAO = "EM_ATUALIZACAO"
    OBSOLETO = "OBSOLETO"


class KnowledgeBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    tipo: KnowledgeTypeEnum = Field(...)
    nivel_minimo: KnowledgeLevelEnum = Field(default=KnowledgeLevelEnum.BASICO)

    class Config:
        from_attributes = True
        use_enum_values = True


class KnowledgeCreate(KnowledgeBase):
    categoria: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = Field(default=[])
    validade_meses: Optional[int] = Field(None, ge=0)
    carga_horaria: Optional[int] = Field(None, ge=0)
    url_material: Optional[str] = Field(None, max_length=500)


class KnowledgeUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    tipo: Optional[KnowledgeTypeEnum] = None
    nivel_minimo: Optional[KnowledgeLevelEnum] = None
    categoria: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    validade_meses: Optional[int] = Field(None, ge=0)
    carga_horaria: Optional[int] = Field(None, ge=0)
    url_material: Optional[str] = Field(None, max_length=500)
    status: Optional[KnowledgeStatusEnum] = None

    class Config:
        from_attributes = True
        use_enum_values = True


class KnowledgeResponse(KnowledgeBase):
    id: UUID
    categoria: Optional[str] = None
    tags: List[str] = []
    validade_meses: Optional[int] = None
    carga_horaria: Optional[int] = None
    status: KnowledgeStatusEnum = KnowledgeStatusEnum.ATIVO
    total_employees: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        use_enum_values = True


class KnowledgeDetail(KnowledgeResponse):
    url_material: Optional[str] = None
    employees_with_knowledge: List[dict] = []
    completion_rate: float = 0.0


class EmployeeKnowledgeBase(BaseModel):
    employee_id: UUID = Field(..., description="ID do colaborador")
    knowledge_id: UUID = Field(..., description="ID do conhecimento")
    nivel_obtido: KnowledgeLevelEnum = Field(..., description="Nível obtido pelo colaborador")

    class Config:
        from_attributes = True
        use_enum_values = True


class EmployeeKnowledgeCreate(EmployeeKnowledgeBase):
    data_obtencao: date = Field(default_factory=date.today)
    data_expiracao: Optional[date] = None
    certificado_url: Optional[str] = Field(None, max_length=500)
    observacoes: Optional[str] = Field(None, max_length=500)

    @validator('data_expiracao')
    def validate_expiration_date(cls, v, values):
        if v and 'data_obtencao' in values and v <= values['data_obtencao']:
            raise ValueError('Data de validade deve ser posterior à data de obtenção')
        return v


class EmployeeKnowledgeUpdate(BaseModel):
    nivel_obtido: Optional[KnowledgeLevelEnum] = None
    data_obtencao: Optional[date] = None
    data_expiracao: Optional[date] = None
    certificado_url: Optional[str] = Field(None, max_length=500)
    observacoes: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True


class EmployeeKnowledgeResponse(EmployeeKnowledgeBase):
    id: UUID
    data_obtencao: date
    data_expiracao: Optional[date] = None
    certificado_url: Optional[str] = None
    status: str = "ATIVO"
    dias_para_vencer: Optional[int] = None
    vencido: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeKnowledgeDetail(EmployeeKnowledgeResponse):
    knowledge_name: str
    knowledge_type: str
    employee_name: str
    employee_cargo: str
    observacoes: Optional[str] = None

    class Config:
        from_attributes = True


class KnowledgeStats(BaseModel):
    total_knowledge: int
    by_type: dict
    by_level: dict
    by_status: dict
    most_common: List[dict]
    expiring_soon: int

    class Config:
        from_attributes = True


class EmployeeKnowledgeStats(BaseModel):
    employee_id: UUID
    employee_name: str
    total_knowledge: int
    by_type: dict
    by_level: dict
    certifications_count: int
    expiring_soon: int
    completion_rate: float

    class Config:
        from_attributes = True


class LearningPath(BaseModel):
    id: UUID
    nome: str
    descricao: Optional[str] = None
    conhecimentos: List[UUID]
    ordem: List[int]
    duracao_total_horas: int
    nivel_requerido: KnowledgeLevelEnum

    class Config:
        from_attributes = True
        use_enum_values = True


class CertificationAlert(BaseModel):
    employee_id: UUID
    employee_name: str
    knowledge_id: UUID
    knowledge_name: str
    data_expiracao: date
    dias_restantes: int
    prioridade: str  # "ALTA", "MEDIA", "BAIXA"

    class Config:
        from_attributes = True


class KnowledgeFilter(BaseModel):
    tipo: Optional[KnowledgeTypeEnum] = None
    nivel_minimo: Optional[KnowledgeLevelEnum] = None
    categoria: Optional[str] = None
    status: Optional[KnowledgeStatusEnum] = None
    tags: Optional[List[str]] = None

    class Config:
        use_enum_values = True


class EmployeeKnowledgeFilter(BaseModel):
    employee_id: Optional[UUID] = None
    knowledge_id: Optional[UUID] = None
    nivel_obtido: Optional[KnowledgeLevelEnum] = None
    status: Optional[str] = None
    vencido: Optional[bool] = None
    vence_em_dias: Optional[int] = None

    class Config:
        from_attributes = True

"""
Schemas de Knowledge - CORRIGIDO
Schemas para Conhecimentos, Certificações e Competências
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class KnowledgeTypeEnum(str, Enum):
    """Tipos de conhecimento"""
    TECNICO = "TECNICO"
    COMPORTAMENTAL = "COMPORTAMENTAL"
    CERTIFICACAO = "CERTIFICACAO"
    IDIOMA = "IDIOMA"
    FERRAMENTA = "FERRAMENTA"
    METODOLOGIA = "METODOLOGIA"


class KnowledgeLevelEnum(str, Enum):
    """Níveis de conhecimento"""
    BASICO = "BASICO"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"
    ESPECIALISTA = "ESPECIALISTA"


class KnowledgeStatusEnum(str, Enum):
    """Status do conhecimento"""
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    EM_ATUALIZACAO = "EM_ATUALIZACAO"
    OBSOLETO = "OBSOLETO"


# ============================================================================
# SCHEMAS BASE DE KNOWLEDGE
# ============================================================================

class KnowledgeBase(BaseModel):
    """Schema base para conhecimento"""
    nome: str = Field(..., min_length=2, max_length=200, description="Nome do conhecimento")
    descricao: Optional[str] = Field(None, max_length=1000, description="Descrição detalhada")
    tipo: KnowledgeTypeEnum = Field(..., description="Tipo de conhecimento")
    nivel_minimo: KnowledgeLevelEnum = Field(
        default=KnowledgeLevelEnum.BASICO,
        description="Nível mínimo requerido"
    )

    class Config:
        from_attributes = True
        use_enum_values = True


class KnowledgeCreate(KnowledgeBase):
    """Schema para criação de conhecimento"""
    categoria: Optional[str] = Field(None, max_length=100, description="Categoria do conhecimento")
    tags: Optional[List[str]] = Field(default=[], description="Tags para busca")
    prerequisitos: Optional[List[UUID]] = Field(default=[], description="Conhecimentos pré-requisitos")
    validade_meses: Optional[int] = Field(None, ge=0, description="Validade em meses (0 = sem validade)")
    carga_horaria: Optional[int] = Field(None, ge=0, description="Carga horária em horas")
    url_material: Optional[str] = Field(None, max_length=500, description="URL do material de estudo")


class KnowledgeUpdate(BaseModel):
    """Schema para atualização de conhecimento"""
    nome: Optional[str] = Field(None, min_length=2, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    tipo: Optional[KnowledgeTypeEnum] = None
    nivel_minimo: Optional[KnowledgeLevelEnum] = None
    categoria: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    prerequisitos: Optional[List[UUID]] = None
    validade_meses: Optional[int] = Field(None, ge=0)
    carga_horaria: Optional[int] = Field(None, ge=0)
    url_material: Optional[str] = Field(None, max_length=500)
    status: Optional[KnowledgeStatusEnum] = None

    class Config:
        from_attributes = True
        use_enum_values = True


class KnowledgeResponse(KnowledgeBase):
    """Schema para resposta de conhecimento"""
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
    """Schema detalhado de conhecimento"""
    url_material: Optional[str] = None
    prerequisitos: List[dict] = []
    employees_with_knowledge: List[dict] = []
    completion_rate: float = 0.0


# ============================================================================
# SCHEMAS DE EMPLOYEE KNOWLEDGE (VÍNCULO COLABORADOR-CONHECIMENTO)
# ============================================================================

class EmployeeKnowledgeBase(BaseModel):
    """Schema base para vínculo colaborador-conhecimento"""
    employee_id: UUID = Field(..., description="ID do colaborador")
    knowledge_id: UUID = Field(..., description="ID do conhecimento")
    nivel_obtido: KnowledgeLevelEnum = Field(..., description="Nível obtido pelo colaborador")

    class Config:
        from_attributes = True
        use_enum_values = True


class EmployeeKnowledgeCreate(EmployeeKnowledgeBase):
    """Schema para criação de vínculo"""
    data_obtencao: date = Field(default_factory=date.today, description="Data de obtenção")
    data_validade: Optional[date] = Field(None, description="Data de validade (se aplicável)")
    certificado_url: Optional[str] = Field(None, max_length=500, description="URL do certificado")
    observacoes: Optional[str] = Field(None, max_length=500, description="Observações")

    @validator('data_validade')
    def validate_expiration_date(cls, v, values):
        """Valida se data de validade é posterior à data de obtenção"""
        if v and 'data_obtencao' in values and v <= values['data_obtencao']:
            raise ValueError('Data de validade deve ser posterior à data de obtenção')
        return v


class EmployeeKnowledgeUpdate(BaseModel):
    """Schema para atualização de vínculo"""
    nivel_obtido: Optional[KnowledgeLevelEnum] = None
    data_obtencao: Optional[date] = None
    data_validade: Optional[date] = None
    certificado_url: Optional[str] = Field(None, max_length=500)
    observacoes: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True


class EmployeeKnowledgeResponse(EmployeeKnowledgeBase):
    """Schema para resposta de vínculo"""
    id: UUID
    data_obtencao: date
    data_validade: Optional[date] = None
    certificado_url: Optional[str] = None
    status: str = "ATIVO"
    dias_para_vencer: Optional[int] = None
    vencido: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeKnowledgeDetail(EmployeeKnowledgeResponse):
    """Schema detalhado de vínculo com informações do conhecimento e colaborador"""
    knowledge_name: str
    knowledge_type: str
    employee_name: str
    employee_cargo: str
    observacoes: Optional[str] = None


# ============================================================================
# SCHEMAS DE ESTATÍSTICAS E RELATÓRIOS
# ============================================================================

class KnowledgeStats(BaseModel):
    """Estatísticas de conhecimento"""
    total_knowledge: int
    by_type: dict
    by_level: dict
    by_status: dict
    most_common: List[dict]
    expiring_soon: int

    class Config:
        from_attributes = True


class EmployeeKnowledgeStats(BaseModel):
    """Estatísticas de conhecimentos de um colaborador"""
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
    """Trilha de aprendizado"""
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
    """Alerta de certificação"""
    employee_id: UUID
    employee_name: str
    knowledge_id: UUID
    knowledge_name: str
    data_validade: date
    dias_restantes: int
    prioridade: str  # "ALTA", "MEDIA", "BAIXA"

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS DE BUSCA E FILTROS
# ============================================================================

class KnowledgeFilter(BaseModel):
    """Filtros para busca de conhecimentos"""
    tipo: Optional[KnowledgeTypeEnum] = None
    nivel_minimo: Optional[KnowledgeLevelEnum] = None
    categoria: Optional[str] = None
    status: Optional[KnowledgeStatusEnum] = None
    tags: Optional[List[str]] = None

    class Config:
        use_enum_values = True


class EmployeeKnowledgeFilter(BaseModel):
    """Filtros para busca de vínculos"""
    employee_id: Optional[UUID] = None
    knowledge_id: Optional[UUID] = None
    nivel_obtido: Optional[KnowledgeLevelEnum] = None
    status: Optional[str] = None
    vencido: Optional[bool] = None
    vence_em_dias: Optional[int] = None

    class Config:
        use_enum_values = True
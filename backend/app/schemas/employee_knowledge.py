from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from enum import Enum


class KnowledgeLevelEnum(str, Enum):
    BASICO = "BASICO"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"
    ESPECIALISTA = "ESPECIALISTA"




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
    data_expiracao: Optional[date] = Field(None, description="Data de validade (se aplicável)")
    certificado_url: Optional[str] = Field(None, max_length=500, description="URL do certificado")
    observacoes: Optional[str] = Field(None, max_length=500, description="Observações")

    @validator('data_expiracao')
    def validate_expiration_date(cls, v, values):
        """Valida se data de validade é posterior à data de obtenção"""
        if v and 'data_obtencao' in values and v <= values['data_obtencao']:
            raise ValueError('Data de validade deve ser posterior à data de obtenção')
        return v


class EmployeeKnowledgeUpdate(BaseModel):
    """Schema para atualização de vínculo"""
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
    """Schema para resposta de vínculo"""
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
    """Schema detalhado de vínculo com informações do conhecimento e colaborador"""
    knowledge_name: str
    knowledge_type: str
    employee_name: str
    employee_cargo: str
    observacoes: Optional[str] = None

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

class EmployeeKnowledgeFilter(BaseModel):
    employee_id: Optional[UUID] = None
    knowledge_id: Optional[UUID] = None
    nivel_obtido: Optional[str] = None
    status: Optional[str] = None
    vencido: Optional[bool] = None
    vence_em_dias: Optional[int] = None

    class Config:
        from_attributes = True
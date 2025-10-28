from decimal import Decimal
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict

from pydantic import BaseModel, Field

from app.models.knowledge import KnowledgeCategoryEnum


class KnowledgeBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=255)
    descricao: Optional[str] = Field(None, max_length=2000)
    tipo: KnowledgeCategoryEnum = KnowledgeCategoryEnum.CURSO
    fornecedor: Optional[str] = Field(None, max_length=255)
    codigo_certificacao: Optional[str] = Field(None, max_length=120)
    orgao_certificador: Optional[str] = Field(None, max_length=120)
    tipo_formacao: Optional[str] = Field(None, max_length=80)
    area: Optional[str] = Field(None, max_length=100)
    dificuldade: Optional[str] = Field("MEDIO", max_length=20)
    carga_horaria: Optional[int] = Field(None, ge=0)
    validade_meses: Optional[int] = Field(None, ge=0)
    prioridade: Optional[str] = Field("MEDIA", max_length=20)
    status: Optional[str] = Field("ATIVO", max_length=20)
    obrigatorio: bool = False
    url_referencia: Optional[str] = Field(None, max_length=500)
    custo_estimado: Optional[Decimal] = Field(None, ge=0)
    observacoes_internas: Optional[str] = Field(None, max_length=2000)

    class Config:
        from_attributes = True
        use_enum_values = True


class KnowledgeCreate(KnowledgeBase):
    pass


class KnowledgeUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=255)
    descricao: Optional[str] = Field(None, max_length=2000)
    tipo: Optional[KnowledgeCategoryEnum] = None
    fornecedor: Optional[str] = Field(None, max_length=255)
    codigo_certificacao: Optional[str] = Field(None, max_length=120)
    orgao_certificador: Optional[str] = Field(None, max_length=120)
    tipo_formacao: Optional[str] = Field(None, max_length=80)
    area: Optional[str] = Field(None, max_length=100)
    dificuldade: Optional[str] = Field(None, max_length=20)
    carga_horaria: Optional[int] = Field(None, ge=0)
    validade_meses: Optional[int] = Field(None, ge=0)
    prioridade: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, max_length=20)
    obrigatorio: Optional[bool] = None
    url_referencia: Optional[str] = Field(None, max_length=500)
    custo_estimado: Optional[Decimal] = Field(None, ge=0)
    observacoes_internas: Optional[str] = Field(None, max_length=2000)

    class Config:
        from_attributes = True
        use_enum_values = True


class KnowledgeResponse(KnowledgeBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    total_vinculos: int = 0
    total_obrigatorios: int = 0
    total_obtidos: int = 0
    total_desejados: int = 0


class KnowledgeSummary(BaseModel):
    total: int
    por_tipo: Dict[str, int]
    obrigatorios: int
    expiram_ate_60_dias: int
    colaboradores_afetados: int

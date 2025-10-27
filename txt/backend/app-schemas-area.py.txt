from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class AreaBase(BaseModel):
    """Schema base de área"""
    nome: str = Field(..., example="Infraestrutura")
    sigla: Optional[str] = Field(None, example="INFRA")  # Pode ser None
    descricao: Optional[str] = Field(None, example="Área responsável pela sustentação técnica e redes")
    cor: Optional[str] = Field("#3B82F6", example="#3B82F6")
    ativa: Optional[bool] = True

    class Config:
        from_attributes = True  # Atualizado para Pydantic v2

class AreaCreate(AreaBase):
    """Schema para criação de área"""
    pass

class AreaUpdate(AreaBase):
    """Schema para atualização de área"""
    nome: Optional[str] = None
    sigla: Optional[str] = None

class AreaResponse(AreaBase):
    """Schema de retorno de área"""
    id: UUID
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # Atualizado para Pydantic v2

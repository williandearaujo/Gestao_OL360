from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class AreaBase(BaseModel):
    """Schema base de área"""
    nome: str = Field(..., example="Infraestrutura")
    descricao: Optional[str] = Field(None, example="Área responsável pela sustentação técnica e redes")

    class Config:
        from_attributes = True


class AreaCreate(AreaBase):
    """Schema para criação de área"""
    pass


class AreaUpdate(BaseModel):
    """Schema para atualização de área"""
    nome: Optional[str] = None
    descricao: Optional[str] = None

    class Config:
        from_attributes = True


class AreaResponse(AreaBase):
    """Schema de retorno de área"""
    id: UUID

    class Config:
        from_attributes = True

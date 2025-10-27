from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

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

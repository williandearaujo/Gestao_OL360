from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

from app.models.employee_knowledge import StatusEnum as KnowledgeLinkStatus


class EmployeeKnowledgeBase(BaseModel):
    """Base attributes shared by create and update payloads."""

    employee_id: UUID = Field(..., description="Employee identifier")
    knowledge_id: UUID = Field(..., description="Knowledge identifier")
    status: KnowledgeLinkStatus = Field(
        default=KnowledgeLinkStatus.DESEJADO,
        description="Current status for the employee knowledge record",
    )
    progresso: Optional[float] = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Progress percentage achieved by the employee",
    )
    data_inicio: Optional[date] = Field(
        default=None,
        description="Planned start date for the learning plan",
    )
    data_limite: Optional[date] = Field(
        default=None,
        description="Target date to complete the plan",
    )
    data_obtencao: Optional[date] = Field(
        default=None,
        description="Date when the knowledge was obtained",
    )
    certificado_url: Optional[str] = Field(
        default=None,
        max_length=500,
        description="URL of the certificate asset",
    )
    observacoes: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Free form notes about the record",
    )

    class Config:
        from_attributes = True
        use_enum_values = True

    @validator("data_limite")
    def validate_data_limite(cls, value, values):
        inicio = values.get("data_inicio")
        if value and inicio and value < inicio:
            raise ValueError("Target date must be after or equal to start date")
        return value


class EmployeeKnowledgeCreate(EmployeeKnowledgeBase):
    """Payload used when creating a new employee knowledge record."""

    data_expiracao: Optional[date] = Field(
        default=None,
        description="Expiration date for certifications (optional)",
    )

    @validator("data_expiracao")
    def validate_data_expiracao(cls, value, values):
        data_obtencao = values.get("data_obtencao")
        if value and data_obtencao and value <= data_obtencao:
            raise ValueError("Expiration must be after the obtained date")
        return value


class EmployeeKnowledgeUpdate(BaseModel):
    """Payload used to partially update a record."""

    status: Optional[KnowledgeLinkStatus] = None
    progresso: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    data_inicio: Optional[date] = None
    data_limite: Optional[date] = None
    data_obtencao: Optional[date] = None
    data_expiracao: Optional[date] = None
    certificado_url: Optional[str] = Field(default=None, max_length=500)
    observacoes: Optional[str] = Field(default=None, max_length=2000)

    class Config:
        from_attributes = True
        use_enum_values = True

    @validator("data_limite")
    def validate_data_limite(cls, value, values):
        inicio = values.get("data_inicio")
        if value and inicio and value < inicio:
            raise ValueError("Target date must be after or equal to start date")
        return value

    @validator("data_expiracao")
    def validate_data_expiracao(cls, value, values):
        data_obtencao = values.get("data_obtencao")
        if value and data_obtencao and value <= data_obtencao:
            raise ValueError("Expiration must be after the obtained date")
        return value


class EmployeeKnowledgeResponse(EmployeeKnowledgeBase):
    """Default response returned by the API."""

    id: UUID
    data_expiracao: Optional[date] = None
    dias_para_expirar: Optional[int] = None
    vencido: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    employee_nome: Optional[str] = None
    knowledge_nome: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True


class EmployeeKnowledgeDetail(EmployeeKnowledgeResponse):
    """Detailed response returned by the API."""

    knowledge_tipo: Optional[str] = None
    employee_cargo: Optional[str] = None


class EmployeeKnowledgeStats(BaseModel):
    """Aggregate indicators about the employee knowledge portfolio."""

    employee_id: UUID
    employee_nome: str
    total: int
    por_status: dict
    expiram_em_breve: int
    expirados: int
    progresso_medio: Optional[float] = None

    class Config:
        from_attributes = True


class EmployeeKnowledgeFilter(BaseModel):
    """Accepted filters for list endpoints."""

    employee_id: Optional[UUID] = None
    knowledge_id: Optional[UUID] = None
    status: Optional[KnowledgeLinkStatus] = None
    vencido: Optional[bool] = None

    class Config:
        from_attributes = True

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator


class DayOffStatus(str, Enum):
    AGENDADO = "AGENDADO"
    REALIZADO = "REALIZADO"
    CANCELADO = "CANCELADO"


class EmployeeDayOffBase(BaseModel):
    data: date
    status: DayOffStatus = Field(default=DayOffStatus.AGENDADO)
    motivo: Optional[str] = Field(default=None, max_length=150)
    observacoes: Optional[str] = None


class EmployeeDayOffCreate(EmployeeDayOffBase):
    employee_id: UUID


class EmployeeDayOffUpdate(BaseModel):
    data: Optional[date] = None
    status: Optional[DayOffStatus] = None
    motivo: Optional[str] = Field(default=None, max_length=150)
    observacoes: Optional[str] = None


class EmployeeDayOffResponse(EmployeeDayOffBase):
    id: UUID
    employee_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OneOnOneStatus(str, Enum):
    AGENDADO = "AGENDADO"
    CONCLUIDO = "CONCLUIDO"
    ATRASADO = "ATRASADO"
    CANCELADO = "CANCELADO"


class EmployeeOneOnOneBase(BaseModel):
    data_agendada: date
    data_realizada: Optional[date] = None
    status: OneOnOneStatus = Field(default=OneOnOneStatus.AGENDADO)
    notas: Optional[str] = None
    pdi_alinhado: bool = False

    @validator("data_realizada")
    def validate_dates(cls, value, values):
        agendada = values.get("data_agendada")
        if value and agendada and value < agendada:
            raise ValueError("Data realizada não pode ser anterior à data agendada")
        return value


class EmployeeOneOnOneCreate(EmployeeOneOnOneBase):
    employee_id: UUID


class EmployeeOneOnOneUpdate(BaseModel):
    data_agendada: Optional[date] = None
    data_realizada: Optional[date] = None
    status: Optional[OneOnOneStatus] = None
    notas: Optional[str] = None
    pdi_alinhado: Optional[bool] = None

    @validator("data_realizada")
    def validate_dates(cls, value, values):
        agendada = values.get("data_agendada")
        if value and agendada and value < agendada:
            raise ValueError("Data realizada não pode ser anterior à data agendada")
        return value


class EmployeeOneOnOneResponse(EmployeeOneOnOneBase):
    id: UUID
    employee_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PdiStatus(str, Enum):
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDO = "CONCLUIDO"
    ATRASADO = "ATRASADO"
    CANCELADO = "CANCELADO"


class EmployeePdiBase(BaseModel):
    titulo: str = Field(..., max_length=120)
    descricao: Optional[str] = None
    status: PdiStatus = Field(default=PdiStatus.EM_ANDAMENTO)
    data_planejada: date
    data_realizada: Optional[date] = None

    @validator("data_realizada")
    def validate_pdi_dates(cls, value, values):
        planejada = values.get("data_planejada")
        if value and planejada and value < planejada:
            raise ValueError("Data realizada não pode ser anterior à data planejada")
        return value


class EmployeePdiCreate(EmployeePdiBase):
    employee_id: UUID


class EmployeePdiUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, max_length=120)
    descricao: Optional[str] = None
    status: Optional[PdiStatus] = None
    data_planejada: Optional[date] = None
    data_realizada: Optional[date] = None

    @validator("data_realizada")
    def validate_pdi_dates(cls, value, values):
        planejada = values.get("data_planejada")
        if value and planejada and value < planejada:
            raise ValueError("Data realizada não pode ser anterior à data planejada")
        return value


class EmployeePdiResponse(EmployeePdiBase):
    id: UUID
    employee_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

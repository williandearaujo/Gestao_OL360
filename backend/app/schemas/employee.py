from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class EmployeeBase(BaseModel):
    cpf: str = Field(..., min_length=11, max_length=14)
    data_nascimento: date
    cargo: str
    data_admissao: date

class EmployeeCreate(EmployeeBase):
    nome_completo: str
    email_corporativo: EmailStr
    telefone_corporativo: Optional[str] = None
    user_id: Optional[UUID] = None  # Permite vínculo opcional com usuário

class EmployeeUpdate(BaseModel):
    cargo: Optional[str] = None
    senioridade: Optional[str] = None
    area: Optional[str] = None
    status: Optional[str] = None
    nome_completo: Optional[str] = None
    email_corporativo: Optional[EmailStr] = None
    telefone_corporativo: Optional[str] = None
    user_id: Optional[UUID] = None

class EmployeeResponse(BaseModel):
    id: UUID
    nome_completo: str
    cpf: str
    rg: str | None
    data_nascimento: date
    estado_civil: str | None
    email_pessoal: str | None
    email_corporativo: str
    telefone_pessoal: str | None
    telefone_corporativo: str | None
    endereco: str | None
    cargo: str
    departamento: str
    data_admissao: date
    salario: float | None
    status: str

    class Config:
        from_attributes = True

class EmployeeListResponse(EmployeeResponse):
    pass

class EmployeeDetailResponse(EmployeeResponse):
    rg: Optional[str] = None
    data_nascimento: date
    filhos_qtd: int = 0
    senioridade: Optional[str] = None
    area: Optional[str] = None

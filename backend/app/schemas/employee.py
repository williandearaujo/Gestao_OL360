"""
Schemas de Employee - CORRIGIDO
Adiciona imports faltantes do Pydantic
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import date, datetime
from uuid import UUID

# ============================================================================
# SCHEMAS BASE DE EMPLOYEE
# ============================================================================

class EmployeeBase(BaseModel):
    """Schema base para colaborador"""
    cpf: str = Field(..., min_length=11, max_length=14, description="CPF do colaborador")
    data_nascimento: Optional[date] = Field(None, description="Data de nascimento")
    cargo: str = Field(..., min_length=2, max_length=100, description="Cargo do colaborador")
    data_admissao: Optional[date] = Field(None, description="Data de admissão")

    @validator('cpf')
    def validate_cpf(cls, v):
        """Valida formato do CPF"""
        cpf = ''.join(filter(str.isdigit, v))
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return cpf

    @validator('data_nascimento')
    def validate_birth_date(cls, v):
        """Valida se data de nascimento não é futura"""
        if v and v > date.today():
            raise ValueError('Data de nascimento não pode ser futura')
        return v

    class Config:
        from_attributes = True


class EmployeeCreate(EmployeeBase):
    """Schema para criação de colaborador"""
    nome_completo: str = Field(..., min_length=3, max_length=200)
    email_corporativo: EmailStr
    telefone_corporativo: Optional[str] = None
    rg: Optional[str] = None
    estado_civil: Optional[str] = None
    email_pessoal: Optional[str] = None
    telefone_pessoal: Optional[str] = None
    endereco: Optional[str] = None
    departamento: str = Field(..., min_length=2, max_length=100)
    salario: Optional[float] = Field(None, ge=0)
    status: str = Field(default="ATIVO")
    user_id: Optional[UUID] = None  # Permite vínculo opcional com usuário


class EmployeeUpdate(BaseModel):
    """Schema para atualização de colaborador"""
    nome_completo: Optional[str] = Field(None, min_length=3, max_length=200)
    cargo: Optional[str] = Field(None, min_length=2, max_length=100)
    departamento: Optional[str] = Field(None, min_length=2, max_length=100)
    email_corporativo: Optional[EmailStr] = None
    telefone_corporativo: Optional[str] = None
    rg: Optional[str] = None
    estado_civil: Optional[str] = None
    email_pessoal: Optional[str] = None
    telefone_pessoal: Optional[str] = None
    endereco: Optional[str] = None
    salario: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    senioridade: Optional[str] = None
    area: Optional[str] = None
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class EmployeeResponse(BaseModel):
    id: int
    nome_completo: str = Field(..., alias="nome")
    cpf: str
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    estado_civil: Optional[str] = None
    email_pessoal: Optional[str] = None
    email_corporativo: EmailStr = Field(..., alias="email")
    telefone_pessoal: Optional[str] = None
    telefone_corporativo: Optional[str] = Field(None, alias="telefone")
    endereco: Optional[str] = None
    cargo: str
    departamento: Optional[str] = None
    data_admissao: Optional[date] = None
    salario: Optional[float] = None
    status: str

    class Config:
        orm_mode = True
        allow_population_by_field_name = True



class EmployeeListResponse(EmployeeResponse):
    """Schema para listagem de colaboradores"""
    pass


class EmployeeDetailResponse(EmployeeResponse):
    """Schema detalhado de colaborador"""
    filhos_qtd: int = 0
    senioridade: Optional[str] = None
    area: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeStats(BaseModel):
    """Schema para estatísticas de colaborador"""
    total_employees: int
    active_employees: int
    inactive_employees: int
    by_department: dict
    by_cargo: dict

    class Config:
        from_attributes = True


class EmployeeVacation(BaseModel):
    """Schema para férias de colaborador"""
    employee_id: int  # Ajustado para int
    start_date: date
    end_date: date
    days: int
    status: str = "PENDING"

    @validator('end_date')
    def validate_dates(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('Data final deve ser posterior à data inicial')
        return v

    class Config:
        from_attributes = True


class EmployeePDI(BaseModel):
    """Schema para PDI (Plano de Desenvolvimento Individual)"""
    employee_id: int  # Ajustado para int
    goal: str
    description: Optional[str] = None
    deadline: date
    status: str = "IN_PROGRESS"

    class Config:
        from_attributes = True

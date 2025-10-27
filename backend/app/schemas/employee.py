from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import date, datetime
from app.schemas.area import AreaResponse
from uuid import UUID


class EmployeeBase(BaseModel):
    """Schema base para colaborador"""
    nome_completo: str = Field(..., min_length=3, max_length=200)
    email_corporativo: EmailStr
    email_pessoal: Optional[EmailStr] = None
    cargo: str = Field(..., min_length=2, max_length=100)
    cpf: Optional[str] = Field(None, min_length=11, max_length=14)
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    telefone_pessoal: Optional[str] = None
    telefone_corporativo: Optional[str] = None
    endereco_completo: Optional[str] = None
    contato_emergencia_nome: Optional[str] = None
    contato_emergencia_telefone: Optional[str] = None
    data_admissao: Optional[date] = None
    senioridade: Optional[str] = None
    status: Optional[str] = Field(default="ATIVO")
    area_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    data_proximo_pdi: Optional[date] = None
    data_ultimo_pdi: Optional[date] = None
    data_proxima_1x1: Optional[date] = None
    data_ultima_1x1: Optional[date] = None
    ferias_dados: Optional[Dict[str, Any]] = None

    @validator("cpf")
    def validar_cpf(cls, v):
        """Valida o CPF (básico)"""
        if v:
            cpf = "".join(filter(str.isdigit, v))
            if len(cpf) != 11:
                raise ValueError("CPF deve ter 11 dígitos numéricos")
            return cpf
        return v

    class Config:
        from_attributes = True


class EmployeeCreate(EmployeeBase):
    """Schema para criação de colaborador"""
    pass


class EmployeeUpdate(BaseModel):
    """Schema para atualização parcial"""
    nome_completo: Optional[str] = None
    email_corporativo: Optional[EmailStr] = None
    email_pessoal: Optional[EmailStr] = None
    cargo: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    telefone_pessoal: Optional[str] = None
    telefone_corporativo: Optional[str] = None
    endereco_completo: Optional[str] = None
    contato_emergencia_nome: Optional[str] = None
    contato_emergencia_telefone: Optional[str] = None
    data_admissao: Optional[date] = None
    senioridade: Optional[str] = None
    status: Optional[str] = None
    area_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    manager_id: Optional[UUID] = None
    data_proximo_pdi: Optional[date] = None
    data_ultimo_pdi: Optional[date] = None
    data_proxima_1x1: Optional[date] = None
    data_ultima_1x1: Optional[date] = None
    ferias_dados: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class EmployeeResponse(EmployeeBase):
    id: UUID

    class Config:
        from_attributes = True


class EmployeeListResponse(EmployeeResponse):
    """Schema para listagem de colaboradores"""
    pass


class EmployeeDetailResponse(EmployeeResponse):
    """Schema detalhado com campos extras"""
    data_nascimento: Optional[date] = None
    observacoes: Optional[str] = None
    senioridade: Optional[str] = None
    filhos_qtd: Optional[int] = None
    ferias_dados: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class EmployeePDI(BaseModel):
    """Schema para PDI"""
    objetivo: str
    descricao: Optional[str] = None
    data_limite: date
    status: str = "EM_ANDAMENTO"

    class Config:
        from_attributes = True


class EmployeeVacation(BaseModel):
    """Schema para férias"""
    inicio: date
    fim: date
    dias: int
    status: str = "PENDENTE"

    @validator("fim")
    def validate_dates(cls, v, values):
        if "inicio" in values and v <= values["inicio"]:
            raise ValueError("Data final deve ser posterior à inicial")
        return v

    class Config:
        from_attributes = True


class EmployeeStats(BaseModel):
    """Schema de estatísticas"""
    total: int
    ativos: int
    ferias: int
    afastados: int
    desligados: int
    timestamp: datetime

    class Config:
        from_attributes = True

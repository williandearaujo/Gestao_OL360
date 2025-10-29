from decimal import Decimal
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, validator, computed_field

from app.models.employee import EmployeeTypeEnum
from app.schemas.area import AreaResponse
from app.schemas.manager import ManagerResponse


class EmployeeNoteBase(BaseModel):
    note: str = Field(..., min_length=3, max_length=2000)

    class Config:
        from_attributes = True


class EmployeeNoteCreate(EmployeeNoteBase):
    employee_id: Optional[UUID] = None


class EmployeeNoteResponse(EmployeeNoteBase):
    id: UUID
    employee_id: UUID
    author_id: UUID
    created_at: datetime


class EmployeeSalaryHistoryBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    effective_date: date
    reason: Optional[str] = Field(None, max_length=500)

    class Config:
        from_attributes = True


class EmployeeSalaryHistoryCreate(EmployeeSalaryHistoryBase):
    employee_id: Optional[UUID] = None


class EmployeeSalaryHistoryResponse(EmployeeSalaryHistoryBase):
    id: UUID
    employee_id: UUID
    created_by: Optional[UUID] = None
    created_by_name: Optional[str] = None
    created_at: datetime


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
    tipo_cadastro: EmployeeTypeEnum = EmployeeTypeEnum.COLABORADOR
    salario_atual: Optional[Decimal] = None
    ultima_alteracao_salarial: Optional[date] = None
    observacoes_internas: Optional[str] = None

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
        use_enum_values = True


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
    tipo_cadastro: Optional[EmployeeTypeEnum] = None
    salario_atual: Optional[Decimal] = None
    ultima_alteracao_salarial: Optional[date] = None
    observacoes_internas: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True


class EmployeeResponse(EmployeeBase):
    id: UUID
    area: Optional[AreaResponse] = None
    manager: Optional[ManagerResponse] = None

    @computed_field
    @property
    def manager_employee_id(self) -> Optional[UUID]:
        if self.manager:
            return self.manager.employee_id
        return None

    class Config:
        from_attributes = True
        use_enum_values = True


class EmployeeListResponse(EmployeeResponse):
    """Schema para listagem de colaboradores"""
    pass


class EmployeeDetailResponse(EmployeeResponse):
    """Schema detalhado com histórico e observações"""

    notes: List[EmployeeNoteResponse] = Field(default_factory=list)
    salary_history: List[EmployeeSalaryHistoryResponse] = Field(default_factory=list)


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
    inicio: Optional[date] = None
    fim: Optional[date] = None
    dias: int = 0
    status: str = "PENDENTE"
    dias_disponiveis: int = 0
    periodos: List[Dict[str, Any]] = Field(default_factory=list)

    @validator("fim")
    def validate_dates(cls, value, values):
        inicio = values.get("inicio")
        if value and inicio and value <= inicio:
            raise ValueError("Data final deve ser posterior à inicial")
        return value

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
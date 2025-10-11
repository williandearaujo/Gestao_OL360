"""
Router de Colaboradores (Employees)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.employee import Employee
from app.core.security import get_current_user
from pydantic import BaseModel
from datetime import date
from uuid import UUID

router = APIRouter(prefix="/api/employees", tags=["employees"])

# ============================================================================
# SCHEMAS
# ============================================================================
class EmployeeCreate(BaseModel):
    nome_completo: str
    cpf: str
    rg: str | None = None
    data_nascimento: date
    estado_civil: str | None = None
    email_pessoal: str | None = None
    email_corporativo: str
    telefone_pessoal: str | None = None
    telefone_corporativo: str | None = None
    endereco: str | None = None
    cargo: str
    departamento: str
    data_admissao: date
    salario: float | None = None
    status: str = "ATIVO"

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

# ============================================================================
# ROUTES
# ============================================================================
@router.get("", response_model=List[EmployeeResponse])
async def list_employees(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Lista todos os colaboradores"""
    employees = db.query(Employee).all()
    return employees

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Busca um colaborador por ID"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    return employee

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Cria um novo colaborador"""
    # Verificar se CPF já existe
    existing = db.query(Employee).filter(Employee.cpf == employee_data.cpf).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPF já cadastrado"
        )
    
    employee = Employee(**employee_data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: UUID,
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Atualiza um colaborador"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    
    for key, value in employee_data.model_dump().items():
        setattr(employee, key, value)
    
    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Deleta um colaborador"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Colaborador não encontrado"
        )
    
    db.delete(employee)
    db.commit()
    return None

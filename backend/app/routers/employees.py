from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.employee import Employee
from app.core.security import get_current_user
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["Colaboradores"])

@router.get("/", response_model=List[EmployeeResponse])
async def list_employees(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = Query(None, description="Filtrar por status"),
    team_id: Optional[UUID] = Query(None, description="Filtrar por time"),
    area_id: Optional[UUID] = Query(None, description="Filtrar por área"),
    cargo: Optional[str] = Query(None, description="Filtrar por cargo"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Employee).options(joinedload(Employee.area))
    if search:
        query = query.filter(
            or_(
                Employee.nome_completo.ilike(f"%{search}%"), # MUDANÇA: de nome para nome_completo
                Employee.email.ilike(f"%{search}%"),
                Employee.cargo.ilike(f"%{search}%")
            )
        )
    if status:
        query = query.filter(Employee.status == status)
    if team_id:
        query = query.filter(Employee.team_id == team_id)
    if cargo:
        query = query.filter(Employee.cargo.ilike(f"%{cargo}%"))
    if area_id:
        query = query.filter(Employee.area_id == area_id)
    query = query.order_by(Employee.nome_completo) # MUDANÇA: de nome para nome_completo
    employees = query.offset(skip).limit(limit).all()
    return employees

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = (
        db.query(Employee)
        .options(joinedload(Employee.area))
        .filter(Employee.id == employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return employee

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "diretoria", "gerente"]:
        raise HTTPException(status_code=403, detail="Sem permissão para criar colaboradores")
    if db.query(Employee).filter(Employee.email == employee_data.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    if employee_data.cpf and db.query(Employee).filter(Employee.cpf == employee_data.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado")

    # Os dados já vêm validados pelo schema EmployeeCreate (que usa EmployeeBase)
    # e o frontend já envia `nome_completo`
    data = employee_data.model_dump(exclude_unset=True) 
    
    # Remove campos que serão definidos manualmente
    data.pop("data_admissao", None)
    data.pop("status", None)

    new_employee = Employee(
        **data,
        data_admissao=employee_data.data_admissao or date.today(),
        status=employee_data.status or "ATIVO",
        #ferias_dados={"dias_disponiveis": 30, "periodos": []}, # MUDANÇA: Removido, pois não está no modelo
        #pdi_dados={"checks": [], "objetivos": []} # MUDANÇA: Removido, pois não está no modelo
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: UUID,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    if current_user.role not in ["admin", "diretoria", "gerente"]:
        raise HTTPException(status_code=403, detail="Sem permissão para atualizar colaboradores")

    # O schema EmployeeUpdate já usa `nome_completo`
    update_data = employee_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "diretoria"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar colaboradores")
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    db.delete(employee)
    db.commit()
    return None

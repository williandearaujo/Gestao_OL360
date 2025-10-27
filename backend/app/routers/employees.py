from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.employee import Employee
from app.models.manager import Manager
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
    if search: query = query.filter(or_(Employee.nome_completo.ilike(f"%{search}%"), Employee.email_corporativo.ilike(f"%{search}%")))
    if status: query = query.filter(Employee.status == status)
    if team_id: query = query.filter(Employee.team_id == team_id)
    if cargo: query = query.filter(Employee.cargo.ilike(f"%{cargo}%"))
    if area_id: query = query.filter(Employee.area_id == area_id)
    employees = query.order_by(Employee.nome_completo).offset(skip).limit(limit).all()
    return employees

@router.get("/supervisors", response_model=List[EmployeeResponse])
async def list_supervisors(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    supervisor_roles = {"admin", "diretoria", "gerente", "coordenador"}
    query = db.query(Employee).join(User, Employee.user).options(joinedload(Employee.area)).filter(User.role.in_(supervisor_roles)).order_by(Employee.nome_completo)
    return query.all()

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = db.query(Employee).options(joinedload(Employee.area), joinedload(Employee.manager)).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return employee

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee_data: EmployeeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "diretoria", "gerente"]:
        raise HTTPException(status_code=403, detail="Sem permissão para criar colaboradores")
    if db.query(Employee).filter(Employee.email_corporativo == employee_data.email_corporativo).first():
        raise HTTPException(status_code=400, detail="Email corporativo já cadastrado")
    data = employee_data.model_dump(exclude_unset=True)
    if data.get('manager_id'):
        manager_employee_id = data.pop('manager_id')
        if manager_employee_id:
            manager_record = db.query(Manager).filter(Manager.employee_id == manager_employee_id).first()
            if not manager_record:
                raise HTTPException(status_code=404, detail=f"Registro de Gestor não encontrado para o colaborador com ID: {manager_employee_id}")
            data['manager_id'] = manager_record.id
    new_employee = Employee(**data, data_admissao=employee_data.data_admissao or date.today(), status=employee_data.status or "ATIVO")
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(employee_id: UUID, employee_data: EmployeeUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    if current_user.role not in ["admin", "diretoria", "gerente"]:
        raise HTTPException(status_code=403, detail="Sem permissão para atualizar colaboradores")
    update_data = employee_data.model_dump(exclude_unset=True)
    if 'manager_id' in update_data:
        manager_employee_id = update_data.pop('manager_id')
        if manager_employee_id:
            manager_record = db.query(Manager).filter(Manager.employee_id == manager_employee_id).first()
            if not manager_record:
                raise HTTPException(status_code=404, detail=f"Registro de Gestor não encontrado para o colaborador com ID: {manager_employee_id}")
            employee.manager_id = manager_record.id
        else:
            employee.manager_id = None
    for field, value in update_data.items():
        setattr(employee, field, value)
    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {e}")
    return employee

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "diretoria"]:
        raise HTTPException(status_code=403, detail="Apenas administradores podem deletar colaboradores")
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    db.delete(employee)
    db.commit()
    return None

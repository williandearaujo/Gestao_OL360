from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.employee import Employee, EmployeeTypeEnum
from app.models.manager import Manager
from app.models.employee_note import EmployeeNote
from app.models.employee_salary_history import EmployeeSalaryHistory
from app.core.security import get_current_user
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeDetailResponse,
    EmployeeNoteResponse,
    EmployeeNoteCreate,
    EmployeeSalaryHistoryResponse,
    EmployeeSalaryHistoryCreate,
)

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
    query = db.query(Employee).options(joinedload(Employee.area), joinedload(Employee.manager))
    if search: query = query.filter(or_(Employee.nome_completo.ilike(f"%{search}%"), Employee.email_corporativo.ilike(f"%{search}%")))
    if status: query = query.filter(Employee.status == status)
    if team_id: query = query.filter(Employee.team_id == team_id)
    if cargo: query = query.filter(Employee.cargo.ilike(f"%{cargo}%"))
    if area_id: query = query.filter(Employee.area_id == area_id)
    employees = query.order_by(Employee.nome_completo).offset(skip).limit(limit).all()
    return employees

@router.get("/supervisors", response_model=List[EmployeeResponse])
async def list_supervisors(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Primeiro, tente obter os gestores efetivos a partir da tabela `managers`
    managers = db.query(Manager).options(joinedload(Manager.employee)).all()
    supervisors = []
    for m in managers:
        if m.employee:
            supervisors.append(m.employee)

    # Se não encontrou nenhum manager na tabela, como fallback, retorna employees
    # cujo tipo de cadastro seja Diretor/Gerente/Coordenador (compatibilidade retroativa)
    if not supervisors:
        supervisor_types = (
            EmployeeTypeEnum.DIRETOR,
            EmployeeTypeEnum.GERENTE,
            EmployeeTypeEnum.COORDENADOR,
        )
        query = (
            db.query(Employee)
            .options(joinedload(Employee.area))
            .filter(Employee.tipo_cadastro.in_(supervisor_types))
            .order_by(Employee.nome_completo)
        )
        return query.all()

    # Ordenar supervisores por nome
    supervisors.sort(key=lambda e: e.nome_completo if e and getattr(e, 'nome_completo', None) else '')
    return supervisors

@router.get("/{employee_id}", response_model=EmployeeDetailResponse)
async def get_employee(employee_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = (
        db.query(Employee)
        .options(
            joinedload(Employee.area),
            joinedload(Employee.manager),
            joinedload(Employee.notes).joinedload(EmployeeNote.author),
            joinedload(Employee.salary_history).joinedload(EmployeeSalaryHistory.created_by_user),
        )
        .filter(Employee.id == employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return employee

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee_data: EmployeeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "diretoria", "gerente"]:
        raise HTTPException(status_code=403, detail="Sem permissão para criar colaboradores")
    if db.query(Employee).filter(Employee.email_corporativo == employee_data.email_corporativo).first():
        raise HTTPException(status_code=400, detail="Email corporativo já cadastrado")
    payload = employee_data.model_dump(exclude_unset=True)
    tipo_value = payload.get("tipo_cadastro", EmployeeTypeEnum.COLABORADOR)
    tipo_cadastro = tipo_value if isinstance(tipo_value, EmployeeTypeEnum) else EmployeeTypeEnum(tipo_value)
    manager_employee_id = payload.pop("manager_id", None)
    if tipo_cadastro in (EmployeeTypeEnum.GERENTE, EmployeeTypeEnum.COORDENADOR, EmployeeTypeEnum.COLABORADOR) and not manager_employee_id:
        raise HTTPException(status_code=400, detail="É necessário informar um gestor responsável")
    manager_record = None
    if manager_employee_id:
        manager_record = db.query(Manager).filter(Manager.employee_id == manager_employee_id).first()
        if not manager_record:
            manager_record = Manager(employee_id=manager_employee_id)
            db.add(manager_record)
            db.flush()
        payload["manager_id"] = manager_record.id
    else:
        payload["manager_id"] = None
    if payload.get("salario_atual") and not payload.get("ultima_alteracao_salarial"):
        payload["ultima_alteracao_salarial"] = date.today()
    new_employee = Employee(
        **payload,
        data_admissao=employee_data.data_admissao or date.today(),
        status=employee_data.status or "ATIVO",
    )
    db.add(new_employee)
    db.flush()
    if tipo_cadastro != EmployeeTypeEnum.COLABORADOR and not new_employee.manager_profile:
        db.add(Manager(employee_id=new_employee.id))
    if new_employee.salario_atual:
        db.add(
            EmployeeSalaryHistory(
                employee_id=new_employee.id,
                amount=new_employee.salario_atual,
                effective_date=new_employee.ultima_alteracao_salarial or date.today(),
                reason="Cadastro inicial",
                created_by=current_user.id,
            )
        )
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
    tipo_value = update_data.get("tipo_cadastro")
    novo_tipo = EmployeeTypeEnum(tipo_value) if tipo_value else employee.tipo_cadastro
    manager_employee_id = update_data.pop("manager_id", None) if "manager_id" in update_data else None
    if manager_employee_id is not None:
        if manager_employee_id:
            manager_record = db.query(Manager).filter(Manager.employee_id == manager_employee_id).first()
            if not manager_record:
                manager_record = Manager(employee_id=manager_employee_id)
                db.add(manager_record)
                db.flush()
            employee.manager_id = manager_record.id
        else:
            employee.manager_id = None
    salario_atual = update_data.pop("salario_atual", None) if "salario_atual" in update_data else None
    ultima_alteracao = update_data.pop("ultima_alteracao_salarial", None) if "ultima_alteracao_salarial" in update_data else None
    for field, value in update_data.items():
        setattr(employee, field, value)
    if salario_atual is not None:
        if ultima_alteracao is None:
            ultima_alteracao = date.today()
        if employee.salario_atual != salario_atual:
            employee.salario_atual = salario_atual
            employee.ultima_alteracao_salarial = ultima_alteracao
            db.add(
                EmployeeSalaryHistory(
                    employee_id=employee.id,
                    amount=salario_atual,
                    effective_date=ultima_alteracao,
                    reason="Reajuste cadastrado manualmente",
                    created_by=current_user.id,
                )
            )
        else:
            employee.ultima_alteracao_salarial = ultima_alteracao or employee.ultima_alteracao_salarial
    elif ultima_alteracao:
        employee.ultima_alteracao_salarial = ultima_alteracao
    if novo_tipo != EmployeeTypeEnum.COLABORADOR:
        if not employee.manager_profile:
            db.add(Manager(employee_id=employee.id))
    else:
        if employee.manager_profile:
            db.delete(employee.manager_profile)
            employee.manager_profile = None
    if novo_tipo in (EmployeeTypeEnum.GERENTE, EmployeeTypeEnum.COORDENADOR, EmployeeTypeEnum.COLABORADOR) and employee.manager_id is None:
        raise HTTPException(status_code=400, detail="Defina um gestor responsável antes de salvar")
    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco de dados: {exc}")
    return employee

@router.get("/{employee_id}/notes", response_model=List[EmployeeNoteResponse])
async def list_employee_notes(employee_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    notes = (
        db.query(EmployeeNote)
        .filter(EmployeeNote.employee_id == employee_id)
        .order_by(EmployeeNote.created_at.desc())
        .all()
    )
    for note in notes:
        author_name = None
        if note.author:
            if getattr(note.author, 'employee', None) and note.author.employee:
                author_name = note.author.employee.nome_completo
            else:
                author_name = note.author.username
        setattr(note, 'author_name', author_name)
    return notes

@router.post("/{employee_id}/notes", response_model=EmployeeNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_employee_note(
    employee_id: UUID,
    note_data: EmployeeNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    if not note_data.note.strip():
        raise HTTPException(status_code=400, detail="A observação não pode ser vazia")
    note = EmployeeNote(
        employee_id=employee_id,
        author_id=current_user.id,
        note=note_data.note.strip(),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    author_name = None
    if note.author:
        if getattr(note.author, 'employee', None) and note.author.employee:
            author_name = note.author.employee.nome_completo
        else:
            author_name = note.author.username
    setattr(note, 'author_name', author_name)
    return note

@router.get("/{employee_id}/salary-history", response_model=List[EmployeeSalaryHistoryResponse])
async def list_salary_history(employee_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    history = (
        db.query(EmployeeSalaryHistory)
        .filter(EmployeeSalaryHistory.employee_id == employee_id)
        .order_by(EmployeeSalaryHistory.effective_date.desc())
        .all()
    )
    for entry in history:
        creator_name = None
        if entry.created_by_user:
            if getattr(entry.created_by_user, 'employee', None):
                creator_name = entry.created_by_user.employee.nome_completo
            else:
                creator_name = entry.created_by_user.username
        setattr(entry, 'created_by_name', creator_name)
    return history

@router.post("/{employee_id}/salary-history", response_model=EmployeeSalaryHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_salary_history(
    employee_id: UUID,
    entry_data: EmployeeSalaryHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    if entry_data.amount <= 0:
        raise HTTPException(status_code=400, detail="O valor do salário deve ser positivo")
    entry = EmployeeSalaryHistory(
        employee_id=employee_id,
        amount=entry_data.amount,
        effective_date=entry_data.effective_date,
        reason=entry_data.reason,
        created_by=current_user.id,
    )
    employee.salario_atual = entry_data.amount
    employee.ultima_alteracao_salarial = entry_data.effective_date
    db.add(entry)
    db.add(employee)
    db.commit()
    db.refresh(entry)
    creator_name = None
    if entry.created_by_user:
        if getattr(entry.created_by_user, 'employee', None):
            creator_name = entry.created_by_user.employee.nome_completo
        else:
            creator_name = entry.created_by_user.username
    setattr(entry, 'created_by_name', creator_name)
    return entry

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
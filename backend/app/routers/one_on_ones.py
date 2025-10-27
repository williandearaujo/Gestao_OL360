from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.employee import Employee
from app.models.one_on_one import EmployeeOneOnOne
from app.models.user import User
from app.schemas.agenda import (
    EmployeeOneOnOneCreate,
    EmployeeOneOnOneResponse,
    EmployeeOneOnOneUpdate,
    OneOnOneStatus,
)

router = APIRouter(prefix="/one-on-ones", tags=["1x1"])

ALLOWED_ROLES = {"admin", "diretoria", "gerente", "coordenador"}


def ensure_permissions(user: User):
    if user.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para administrar 1x1")


def ensure_employee(db: Session, employee_id: UUID) -> Employee:
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador não encontrado")
    return employee


@router.get("/", response_model=List[EmployeeOneOnOneResponse])
async def list_one_on_ones(
    employee_id: UUID = Query(..., description="ID do colaborador"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    ensure_employee(db, employee_id)
    return (
        db.query(EmployeeOneOnOne)
        .filter(EmployeeOneOnOne.employee_id == employee_id)
        .order_by(EmployeeOneOnOne.data_agendada.desc())
        .all()
    )


@router.post("/", response_model=EmployeeOneOnOneResponse, status_code=status.HTTP_201_CREATED)
async def create_one_on_one(
    payload: EmployeeOneOnOneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    ensure_employee(db, payload.employee_id)

    validate_interval(db, payload.employee_id, payload.data_agendada)

    if payload.status == OneOnOneStatus.CONCLUIDO and not payload.data_realizada:
        payload.data_realizada = payload.data_agendada

    record = EmployeeOneOnOne(
        employee_id=payload.employee_id,
        data_agendada=payload.data_agendada,
        data_realizada=payload.data_realizada,
        status=payload.status.value if isinstance(payload.status, OneOnOneStatus) else payload.status,
        notas=payload.notas,
        pdi_alinhado=payload.pdi_alinhado,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{one_on_one_id}", response_model=EmployeeOneOnOneResponse)
async def update_one_on_one(
    one_on_one_id: UUID,
    payload: EmployeeOneOnOneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    record = db.query(EmployeeOneOnOne).filter(EmployeeOneOnOne.id == one_on_one_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de 1x1 não encontrado")

    if payload.data_agendada:
        validate_interval(db, record.employee_id, payload.data_agendada, ignore_record_id=one_on_one_id)
        record.data_agendada = payload.data_agendada
    if payload.data_realizada is not None:
        if payload.data_agendada and payload.data_realizada < payload.data_agendada:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Data realizada não pode ser anterior à agendada")
        record.data_realizada = payload.data_realizada
    if payload.status:
        record.status = payload.status.value if isinstance(payload.status, OneOnOneStatus) else payload.status
        if record.status == OneOnOneStatus.CONCLUIDO and not record.data_realizada:
            record.data_realizada = payload.data_realizada or record.data_agendada
    if payload.notas is not None:
        record.notas = payload.notas
    if payload.pdi_alinhado is not None:
        record.pdi_alinhado = payload.pdi_alinhado

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{one_on_one_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_one_on_one(
    one_on_one_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    record = db.query(EmployeeOneOnOne).filter(EmployeeOneOnOne.id == one_on_one_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de 1x1 não encontrado")
    db.delete(record)
    db.commit()
    return None


def validate_interval(db: Session, employee_id: UUID, new_date: date, ignore_record_id: Optional[UUID] = None):
    last_record_query = (
        db.query(EmployeeOneOnOne)
        .filter(EmployeeOneOnOne.employee_id == employee_id)
        .order_by(EmployeeOneOnOne.data_agendada.desc())
    )
    if ignore_record_id:
        last_record_query = last_record_query.filter(EmployeeOneOnOne.id != ignore_record_id)

    last_record = last_record_query.first()
    if last_record:
        delta = (new_date - last_record.data_agendada).days
        if delta < 180:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reuniões 1x1 devem ter pelo menos 6 meses de intervalo.",
            )

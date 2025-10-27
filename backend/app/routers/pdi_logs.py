from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.employee import Employee
from app.models.pdi_log import EmployeePdiLog
from app.models.user import User
from app.schemas.agenda import (
    EmployeePdiCreate,
    EmployeePdiResponse,
    EmployeePdiUpdate,
    PdiStatus,
)

router = APIRouter(prefix="/pdi", tags=["PDI"])

ALLOWED_ROLES = {"admin", "diretoria", "gerente", "coordenador"}


def ensure_permissions(user: User):
    if user.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para administrar PDI")


def ensure_employee(db: Session, employee_id: UUID) -> Employee:
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador não encontrado")
    return employee


@router.get("/", response_model=List[EmployeePdiResponse])
async def list_pdi(
    employee_id: UUID = Query(..., description="ID do colaborador"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    ensure_employee(db, employee_id)
    return (
        db.query(EmployeePdiLog)
        .filter(EmployeePdiLog.employee_id == employee_id)
        .order_by(EmployeePdiLog.data_planejada.desc())
        .all()
    )


@router.post("/", response_model=EmployeePdiResponse, status_code=status.HTTP_201_CREATED)
async def create_pdi(
    payload: EmployeePdiCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    ensure_employee(db, payload.employee_id)

    validate_interval(db, payload.employee_id, payload.data_planejada)

    if payload.status == PdiStatus.CONCLUIDO and not payload.data_realizada:
        payload.data_realizada = payload.data_planejada

    record = EmployeePdiLog(
        employee_id=payload.employee_id,
        titulo=payload.titulo,
        descricao=payload.descricao,
        status=payload.status.value if isinstance(payload.status, PdiStatus) else payload.status,
        data_planejada=payload.data_planejada,
        data_realizada=payload.data_realizada,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{pdi_id}", response_model=EmployeePdiResponse)
async def update_pdi(
    pdi_id: UUID,
    payload: EmployeePdiUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    record = db.query(EmployeePdiLog).filter(EmployeePdiLog.id == pdi_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de PDI não encontrado")

    if payload.data_planejada:
        validate_interval(db, record.employee_id, payload.data_planejada, ignore_record_id=pdi_id)
        record.data_planejada = payload.data_planejada
    if payload.titulo is not None:
        record.titulo = payload.titulo
    if payload.descricao is not None:
        record.descricao = payload.descricao
    if payload.status:
        record.status = payload.status.value if isinstance(payload.status, PdiStatus) else payload.status
    if payload.data_realizada is not None:
        if payload.data_planejada and payload.data_realizada < payload.data_planejada:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Data realizada não pode ser anterior à planejada")
        record.data_realizada = payload.data_realizada

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{pdi_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pdi(
    pdi_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    record = db.query(EmployeePdiLog).filter(EmployeePdiLog.id == pdi_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de PDI não encontrado")
    db.delete(record)
    db.commit()
    return None


def validate_interval(db: Session, employee_id: UUID, new_date: date, ignore_record_id: Optional[UUID] = None):
    last_record_query = (
        db.query(EmployeePdiLog)
        .filter(EmployeePdiLog.employee_id == employee_id)
        .order_by(EmployeePdiLog.data_planejada.desc())
    )
    if ignore_record_id:
        last_record_query = last_record_query.filter(EmployeePdiLog.id != ignore_record_id)
    last_record = last_record_query.first()
    if last_record:
        delta = (new_date - last_record.data_planejada).days
        if delta < 120:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDIs devem ter pelo menos 4 meses de intervalo.",
            )

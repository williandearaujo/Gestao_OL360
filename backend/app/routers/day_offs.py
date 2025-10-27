from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.day_off import EmployeeDayOff
from app.models.employee import Employee
from app.models.user import User
from app.schemas.agenda import (
    DayOffStatus,
    EmployeeDayOffCreate,
    EmployeeDayOffResponse,
    EmployeeDayOffUpdate,
)

router = APIRouter(prefix="/day-offs", tags=["Day Off"])

ALLOWED_ROLES = {"admin", "diretoria", "gerente"}


def ensure_permissions(user: User):
    if user.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para administrar day off")


def ensure_employee(db: Session, employee_id: UUID) -> Employee:
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador não encontrado")
    return employee


@router.get("/", response_model=List[EmployeeDayOffResponse])
async def list_day_offs(
    employee_id: UUID = Query(..., description="ID do colaborador"),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    ensure_employee(db, employee_id)
    query = db.query(EmployeeDayOff).filter(EmployeeDayOff.employee_id == employee_id).order_by(EmployeeDayOff.data.desc())
    if year:
        query = query.filter(extract("year", EmployeeDayOff.data) == year)
    return query.all()


@router.post("/", response_model=EmployeeDayOffResponse, status_code=status.HTTP_201_CREATED)
async def create_day_off(
    day_off_data: EmployeeDayOffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    employee = ensure_employee(db, day_off_data.employee_id)

    validate_day_off_date(day_off_data.data, employee.data_nascimento)

    existing_same_year = (
        db.query(EmployeeDayOff)
        .filter(
            EmployeeDayOff.employee_id == employee.id,
            extract("year", EmployeeDayOff.data) == day_off_data.data.year,
        )
        .first()
    )
    if existing_same_year:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este colaborador já possui um day off cadastrado para o ano informado.",
        )

    record = EmployeeDayOff(
        employee_id=employee.id,
        data=day_off_data.data,
        status=day_off_data.status.value if isinstance(day_off_data.status, DayOffStatus) else day_off_data.status,
        motivo=day_off_data.motivo,
        observacoes=day_off_data.observacoes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{day_off_id}", response_model=EmployeeDayOffResponse)
async def update_day_off(
    day_off_id: UUID,
    update_data: EmployeeDayOffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    record = db.query(EmployeeDayOff).filter(EmployeeDayOff.id == day_off_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de day off não encontrado")

    if update_data.data:
        employee = ensure_employee(db, record.employee_id)
        validate_day_off_date(update_data.data, employee.data_nascimento)
        record.data = update_data.data
    if update_data.status:
        record.status = update_data.status.value if isinstance(update_data.status, DayOffStatus) else update_data.status
    if update_data.motivo is not None:
        record.motivo = update_data.motivo
    if update_data.observacoes is not None:
        record.observacoes = update_data.observacoes

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{day_off_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_day_off(
    day_off_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_permissions(current_user)
    record = db.query(EmployeeDayOff).filter(EmployeeDayOff.id == day_off_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de day off não encontrado")
    db.delete(record)
    db.commit()
    return None


def validate_day_off_date(day_off_date: date, birth_date: Optional[date]):
    if not birth_date:
        return
    if day_off_date.month != birth_date.month:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O day off deve ser agendado dentro do mês de aniversário do colaborador.",
        )

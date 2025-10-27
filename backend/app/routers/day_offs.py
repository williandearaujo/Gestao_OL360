from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.dependencies import get_db
from app.schemas.day_off import DayOff, DayOffCreate
from app.models.employee import Employee
from app.models.employee_day_off import EmployeeDayOff

router = APIRouter(
    prefix="/day-offs",
    tags=["Day Offs"],
)

@router.get("/", response_model=List[DayOff])
def get_day_offs_for_employee(employee_id: UUID = Query(...), db: Session = Depends(get_db)):
    """
    Retorna o histórico de Day Offs de um colaborador específico, buscando por query param.
    """
    day_offs = db.query(EmployeeDayOff).filter(EmployeeDayOff.employee_id == employee_id).order_by(EmployeeDayOff.date.desc()).all()
    return day_offs

@router.post("/", response_model=DayOff, status_code=status.HTTP_201_CREATED)
def create_day_off(day_off: DayOffCreate, db: Session = Depends(get_db)):
    """
    Agenda um novo Day Off para um colaborador.

    A regra de negócio principal é que o Day Off só pode ser agendado
    no mês de aniversário do colaborador.
    """
    # 1. Buscar o colaborador no banco de dados
    employee = db.query(Employee).filter(Employee.id == day_off.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Colaborador com id {day_off.employee_id} não encontrado."
        )

    # 2. Validar a regra de negócio (mês do aniversário)
    if not employee.data_nascimento:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O colaborador não possui data de nascimento cadastrada."
        )

    if day_off.date.month != employee.data_nascimento.month:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O Day Off só pode ser agendado no mês de aniversário do colaborador."
        )

    # 3. Criar e salvar o novo agendamento de Day Off
    db_day_off = EmployeeDayOff(
        employee_id=day_off.employee_id,
        date=day_off.date,
        status=day_off.status
    )
    db.add(db_day_off)
    db.commit()
    db.refresh(db_day_off)

    return db_day_off

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from uuid import UUID # MUDANÇA: Importar UUID

from app.database import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeVacation  # Este fica no módulo correto
# MUDANÇA: Removida importação de schema de vacation.py
# from app.schemas.vacation import VacationPeriod
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/vacations", tags=["Férias"])


@router.get("/{employee_id}", response_model=EmployeeVacation)
async def get_employee_vacations(
        employee_id: UUID, # MUDANÇA: de int para UUID
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    ferias_dados = employee.ferias_dados or {}
    return EmployeeVacation(
        inicio=ferias_dados.get("inicio"),
        fim=ferias_dados.get("fim"),
        dias=ferias_dados.get("dias_disponiveis", 0),
        status=ferias_dados.get("status", "ATIVO"),
        periodos=ferias_dados.get("periodos", [])
    )


@router.put("/{employee_id}", status_code=status.HTTP_200_OK)
async def update_employee_vacations(
        employee_id: UUID, # MUDANÇA: de int para UUID
        vacation_data: EmployeeVacation,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    if not employee.ferias_dados:
        employee.ferias_dados = {}

    # Atualizando campos básicos
    employee.ferias_dados['inicio'] = vacation_data.inicio
    employee.ferias_dados['fim'] = vacation_data.fim
    employee.ferias_dados['dias_disponiveis'] = vacation_data.dias
    employee.ferias_dados['status'] = vacation_data.status

    # Atualizando períodos: é uma lista de objetos com início e fim
    employee.ferias_dados['periodos'] = [period.dict() for period in vacation_data.periodos or []]

    db.commit()
    db.refresh(employee)
    return {"message": "Férias atualizadas com sucesso", "ferias_dados": employee.ferias_dados}


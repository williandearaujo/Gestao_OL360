from __future__ import annotations

from calendar import monthrange
from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user
from app.database import get_db
from app.models.employee_knowledge import EmployeeKnowledge, StatusEnum as KnowledgeLinkStatus
from app.models.knowledge import Knowledge
from app.models.user import User
from app.schemas.employee_knowledge import (
    EmployeeKnowledgeCreate,
    EmployeeKnowledgeResponse,
    EmployeeKnowledgeUpdate,
)

router = APIRouter(prefix="/employee-knowledge", tags=["Vinculos"])


def _add_months(base_date: date, months: int) -> date:
    year = base_date.year + (base_date.month - 1 + months) // 12
    month = (base_date.month - 1 + months) % 12 + 1
    day = min(base_date.day, monthrange(year, month)[1])
    return date(year, month, day)


def _compute_expiration(knowledge: Knowledge, data_obtencao: Optional[date]) -> Optional[date]:
    if not knowledge or not knowledge.validade_meses or not data_obtencao:
        return None
    return _add_months(data_obtencao, knowledge.validade_meses)


def _to_status_enum(value) -> KnowledgeLinkStatus:
    if isinstance(value, KnowledgeLinkStatus):
        return value
    return KnowledgeLinkStatus(value)


def _enrich_record(record: EmployeeKnowledge) -> None:
    if record.data_expiracao:
        delta = (record.data_expiracao - date.today()).days
        setattr(record, "dias_para_expirar", delta)
        setattr(record, "vencido", delta < 0)
    else:
        setattr(record, "dias_para_expirar", None)
        setattr(record, "vencido", False)

    if record.employee:
        setattr(record, "employee_nome", record.employee.nome_completo)
        setattr(record, "employee_cargo", record.employee.cargo)
    else:
        setattr(record, "employee_nome", None)
        setattr(record, "employee_cargo", None)

    if record.knowledge:
        knowledge_tipo = (
            record.knowledge.tipo.value
            if hasattr(record.knowledge.tipo, "value")
            else record.knowledge.tipo
        )
        setattr(record, "knowledge_nome", record.knowledge.nome)
        setattr(record, "knowledge_tipo", knowledge_tipo)
    else:
        setattr(record, "knowledge_nome", None)
        setattr(record, "knowledge_tipo", None)


@router.get("/", response_model=List[EmployeeKnowledgeResponse])
async def list_employee_knowledge(
    employee_id: Optional[UUID] = Query(None),
    knowledge_id: Optional[UUID] = Query(None),
    status_filter: Optional[KnowledgeLinkStatus] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(EmployeeKnowledge)
        .options(
            joinedload(EmployeeKnowledge.employee),
            joinedload(EmployeeKnowledge.knowledge),
        )
        .order_by(EmployeeKnowledge.created_at.desc())
    )
    if employee_id:
        query = query.filter(EmployeeKnowledge.employee_id == employee_id)
    if knowledge_id:
        query = query.filter(EmployeeKnowledge.knowledge_id == knowledge_id)
    if status_filter:
        query = query.filter(EmployeeKnowledge.status == status_filter)

    records = query.offset(skip).limit(limit).all()
    for record in records:
        _enrich_record(record)
    return records


@router.post("/", response_model=EmployeeKnowledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee_knowledge(
    vinculo_data: EmployeeKnowledgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not vinculo_data.employee_id or not vinculo_data.knowledge_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Colaborador e conhecimento sao obrigatorios.",
        )

    existing = (
        db.query(EmployeeKnowledge)
        .filter(
            EmployeeKnowledge.employee_id == vinculo_data.employee_id,
            EmployeeKnowledge.knowledge_id == vinculo_data.knowledge_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este vinculo ja esta cadastrado.",
        )

    knowledge = db.query(Knowledge).filter(Knowledge.id == vinculo_data.knowledge_id).first()
    if not knowledge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conhecimento nao encontrado.")

    payload = vinculo_data.model_dump(exclude_unset=True)
    status_enum = _to_status_enum(payload.get("status", KnowledgeLinkStatus.DESEJADO))
    payload["status"] = status_enum
    if "progresso" in payload and payload["progresso"] is not None:
        payload["progresso"] = float(payload["progresso"])

    data_obtencao = payload.get("data_obtencao") or date.today()
    if status_enum == KnowledgeLinkStatus.OBTIDO:
        payload["data_obtencao"] = data_obtencao
        payload["data_expiracao"] = payload.get("data_expiracao") or _compute_expiration(knowledge, data_obtencao)
        if payload.get("progresso") is None:
            payload["progresso"] = 100.0
    else:
        payload.setdefault("progresso", 0.0)
        payload["data_expiracao"] = payload.get("data_expiracao")

    vinculo = EmployeeKnowledge(**payload)
    db.add(vinculo)
    db.commit()
    db.refresh(vinculo)
    _enrich_record(vinculo)
    return vinculo


@router.put("/{vinculo_id}", response_model=EmployeeKnowledgeResponse)
async def update_employee_knowledge(
    vinculo_id: UUID,
    vinculo_data: EmployeeKnowledgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vinculo = (
        db.query(EmployeeKnowledge)
        .options(joinedload(EmployeeKnowledge.knowledge))
        .filter(EmployeeKnowledge.id == vinculo_id)
        .first()
    )
    if not vinculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vinculo nao encontrado.")

    update_payload = vinculo_data.model_dump(exclude_unset=True)
    knowledge = vinculo.knowledge or db.query(Knowledge).filter(Knowledge.id == vinculo.knowledge_id).first()

    for field, value in update_payload.items():
        if field == "status" and value is not None:
            value = _to_status_enum(value)
        if field == "progresso" and value is not None:
            value = float(value)
        setattr(vinculo, field, value)

    if vinculo.status == KnowledgeLinkStatus.OBTIDO:
        data_obtencao = vinculo.data_obtencao or date.today()
        vinculo.data_obtencao = data_obtencao
        vinculo.data_expiracao = update_payload.get("data_expiracao") or _compute_expiration(knowledge, data_obtencao)
        if vinculo.progresso is None or vinculo.progresso < 100.0:
            vinculo.progresso = 100.0
    else:
        if "data_expiracao" not in update_payload:
            vinculo.data_expiracao = None

    db.commit()
    db.refresh(vinculo)
    _enrich_record(vinculo)
    return vinculo


@router.delete("/{vinculo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee_knowledge(
    vinculo_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vinculo = db.query(EmployeeKnowledge).filter(EmployeeKnowledge.id == vinculo_id).first()
    if not vinculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vinculo nao encontrado.")
    db.delete(vinculo)
    db.commit()
    return None

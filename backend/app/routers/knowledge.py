from __future__ import annotations

from collections import Counter
from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
import sqlalchemy as sa
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user
from app.database import get_db
from app.models.knowledge import Knowledge, KnowledgeCategoryEnum
from app.models.employee_knowledge import EmployeeKnowledge, StatusEnum as KnowledgeLinkStatus
from app.models.user import User
from app.schemas.knowledge import (
    KnowledgeCreate,
    KnowledgeResponse,
    KnowledgeSummary,
    KnowledgeUpdate,
)

router = APIRouter(prefix="/knowledge", tags=["Conhecimentos"])


def _apply_aggregates(record: Knowledge) -> None:
    vinculos = record.vinculos or []
    total = len(vinculos)
    status_counter = Counter(v.status for v in vinculos)
    setattr(record, "total_vinculos", total)
    setattr(record, "total_obrigatorios", status_counter.get(KnowledgeLinkStatus.OBRIGATORIO, 0))
    setattr(record, "total_obtidos", status_counter.get(KnowledgeLinkStatus.OBTIDO, 0))
    setattr(record, "total_desejados", status_counter.get(KnowledgeLinkStatus.DESEJADO, 0))


def _normalize_tipo(value) -> KnowledgeCategoryEnum:
    if isinstance(value, KnowledgeCategoryEnum):
        return value
    return KnowledgeCategoryEnum(value)


@router.get("/", response_model=List[KnowledgeResponse])
async def list_knowledge(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tipo: Optional[KnowledgeCategoryEnum] = Query(None, description="Filtrar por categoria"),
    fornecedor: Optional[str] = Query(None, description="Filtrar por fornecedor"),
    area: Optional[str] = Query(None, description="Filtrar por área"),
    status_filter: Optional[str] = Query(None, description="Filtrar por status"),
    obrigatorio: Optional[bool] = Query(None, description="Apenas obrigatórios"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Knowledge)
        .options(joinedload(Knowledge.vinculos))
        .order_by(Knowledge.nome.asc())
    )
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Knowledge.nome.ilike(pattern)
            | Knowledge.descricao.ilike(pattern)
            | Knowledge.fornecedor.ilike(pattern)
        )
    if tipo:
        query = query.filter(Knowledge.tipo == tipo)
    if fornecedor:
        query = query.filter(Knowledge.fornecedor.ilike(f"%{fornecedor}%"))
    if area:
        query = query.filter(Knowledge.area.ilike(f"%{area}%"))
    if status_filter:
        query = query.filter(Knowledge.status == status_filter)
    if obrigatorio is not None:
        query = query.filter(Knowledge.obrigatorio == obrigatorio)

    records = query.offset(skip).limit(limit).all()
    for record in records:
        _apply_aggregates(record)
    return records


@router.get("/summary", response_model=KnowledgeSummary)
async def knowledge_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(sa.func.count(Knowledge.id)).scalar() or 0
    by_type = dict(
        db.query(Knowledge.tipo, sa.func.count(Knowledge.id))
        .group_by(Knowledge.tipo)
        .all()
    )
    obrigatorios = (
        db.query(sa.func.count(Knowledge.id))
        .filter(Knowledge.obrigatorio.is_(True))
        .scalar()
        or 0
    )
    expiring_records = (
        db.query(EmployeeKnowledge.data_expiracao)
        .filter(
            EmployeeKnowledge.status == KnowledgeLinkStatus.OBTIDO,
            EmployeeKnowledge.data_expiracao.isnot(None),
        )
        .all()
    )
    expiring_limit = date.today() + timedelta(days=60)
    expiring_soon = sum(1 for (exp_date,) in expiring_records if exp_date and exp_date <= expiring_limit)

    colaboradores_afetados = (
        db.query(sa.func.count(sa.func.distinct(EmployeeKnowledge.employee_id)))
        .filter(EmployeeKnowledge.status == KnowledgeLinkStatus.OBRIGATORIO)
        .scalar()
        or 0
    )

    return KnowledgeSummary(
        total=total,
        por_tipo={k.value if isinstance(k, KnowledgeCategoryEnum) else k: v for k, v in by_type.items()},
        obrigatorios=obrigatorios,
        expiram_ate_60_dias=int(expiring_soon),
        colaboradores_afetados=colaboradores_afetados,
    )


@router.get("/{knowledge_id}", response_model=KnowledgeResponse)
async def get_knowledge(
    knowledge_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    knowledge = (
        db.query(Knowledge)
        .options(joinedload(Knowledge.vinculos))
        .filter(Knowledge.id == knowledge_id)
        .first()
    )
    if not knowledge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conhecimento não encontrado")
    _apply_aggregates(knowledge)
    return knowledge


@router.post("/", response_model=KnowledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge(
    knowledge_data: KnowledgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "diretoria", "gerente"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para criar conhecimentos")
    existing = (
        db.query(Knowledge)
        .filter(
            Knowledge.nome == knowledge_data.nome,
            Knowledge.fornecedor == knowledge_data.fornecedor,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Já existe um conhecimento com este nome para o mesmo fornecedor.")

    payload = knowledge_data.model_dump(exclude_unset=True)
    payload["tipo"] = _normalize_tipo(payload.get("tipo", KnowledgeCategoryEnum.CURSO))
    new_knowledge = Knowledge(**payload)
    db.add(new_knowledge)
    db.commit()
    db.refresh(new_knowledge)
    _apply_aggregates(new_knowledge)
    return new_knowledge


@router.put("/{knowledge_id}", response_model=KnowledgeResponse)
async def update_knowledge(
    knowledge_id: UUID,
    knowledge_data: KnowledgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conhecimento não encontrado")
    if current_user.role not in ["admin", "diretoria", "gerente"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para atualizar conhecimentos")

    update_payload = knowledge_data.model_dump(exclude_unset=True)
    if "tipo" in update_payload and update_payload["tipo"]:
        update_payload["tipo"] = _normalize_tipo(update_payload["tipo"])
    for field, value in update_payload.items():
        setattr(knowledge, field, value)
    db.commit()
    db.refresh(knowledge)
    _apply_aggregates(knowledge)
    return knowledge


@router.delete("/{knowledge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge(
    knowledge_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "diretoria"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para remover conhecimentos")
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conhecimento não encontrado")
    db.delete(knowledge)
    db.commit()
    return None





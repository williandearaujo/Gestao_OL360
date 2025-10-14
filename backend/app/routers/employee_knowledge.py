# ===========================================================================
# Arquivo: backend/app/routers/employee_knowledge.py
# ===========================================================================
"""
Router de Vínculos Colaborador-Conhecimento
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.employee_knowledge import EmployeeKnowledge
from app.core.security import get_current_user
from app.schemas.employee_knowledge import (
    EmployeeKnowledgeCreate,
    EmployeeKnowledgeUpdate,
    EmployeeKnowledgeResponse
)

router = APIRouter(prefix="/employee-knowledge", tags=["Vínculos"])


@router.get("/", response_model=List[EmployeeKnowledgeResponse])
async def list_employee_knowledge(
        employee_id: Optional[int] = Query(None),
        knowledge_id: Optional[int] = Query(None),
        status: Optional[str] = Query(None),
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Lista vínculos entre colaboradores e conhecimentos"""
    query = db.query(EmployeeKnowledge)

    if employee_id:
        query = query.filter(EmployeeKnowledge.employee_id == employee_id)
    if knowledge_id:
        query = query.filter(EmployeeKnowledge.knowledge_id == knowledge_id)
    if status:
        query = query.filter(EmployeeKnowledge.status == status)

    vinculos = query.offset(skip).limit(limit).all()
    return vinculos


@router.post("/", response_model=EmployeeKnowledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee_knowledge(
        vinculo_data: EmployeeKnowledgeCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Cria um novo vínculo colaborador-conhecimento"""
    # Verificar se já existe
    existing = db.query(EmployeeKnowledge).filter(
        EmployeeKnowledge.employee_id == vinculo_data.employee_id,
        EmployeeKnowledge.knowledge_id == vinculo_data.knowledge_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vínculo já existe"
        )

    vinculo = EmployeeKnowledge(**vinculo_data.model_dump())
    db.add(vinculo)
    db.commit()
    db.refresh(vinculo)

    return vinculo


@router.put("/{vinculo_id}", response_model=EmployeeKnowledgeResponse)
async def update_employee_knowledge(
        vinculo_id: int,
        vinculo_data: EmployeeKnowledgeUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Atualiza um vínculo"""
    vinculo = db.query(EmployeeKnowledge).filter(EmployeeKnowledge.id == vinculo_id).first()

    if not vinculo:
        raise HTTPException(status_code=404, detail="Vínculo não encontrado")

    update_data = vinculo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vinculo, field, value)

    db.commit()
    db.refresh(vinculo)

    return vinculo


@router.delete("/{vinculo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee_knowledge(
        vinculo_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Remove um vínculo"""
    vinculo = db.query(EmployeeKnowledge).filter(EmployeeKnowledge.id == vinculo_id).first()

    if not vinculo:
        raise HTTPException(status_code=404, detail="Vínculo não encontrado")

    db.delete(vinculo)
    db.commit()

    return None
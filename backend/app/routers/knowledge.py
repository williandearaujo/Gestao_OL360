"""
Router de Conhecimentos/Certificações - COMPLETO
Gestão 360 - OL Tecnologia
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.knowledge import Knowledge
from app.models.employee_knowledge import EmployeeKnowledge
from app.core.security import get_current_user
from app.schemas.knowledge import KnowledgeCreate, KnowledgeUpdate, KnowledgeResponse

router = APIRouter(prefix="/knowledge", tags=["Conhecimentos"])


# ============================================================================
# LISTAR CONHECIMENTOS
# ============================================================================
@router.get("/", response_model=List[KnowledgeResponse])
async def list_knowledge(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    fornecedor: Optional[str] = Query(None, description="Filtrar por fornecedor"),
    area: Optional[str] = Query(None, description="Filtrar por área"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    obrigatorio: Optional[bool] = Query(None, description="Apenas obrigatórios"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todos os conhecimentos/certificações com filtros opcionais
    """
    query = db.query(Knowledge)

    # Aplicar filtros
    if search:
        query = query.filter(
            or_(
                Knowledge.nome.ilike(f"%{search}%"),
                Knowledge.descricao.ilike(f"%{search}%"),
                Knowledge.fornecedor.ilike(f"%{search}%")
            )
        )

    if tipo:
        query = query.filter(Knowledge.tipo == tipo)

    if fornecedor:
        query = query.filter(Knowledge.fornecedor.ilike(f"%{fornecedor}%"))

    if area:
        query = query.filter(Knowledge.area.ilike(f"%{area}%"))

    if status:
        query = query.filter(Knowledge.status == status)

    if obrigatorio is not None:
        query = query.filter(Knowledge.obrigatorio == obrigatorio)

    # Ordenar por nome
    query = query.order_by(Knowledge.nome)

    knowledge_list = query.offset(skip).limit(limit).all()
    return knowledge_list


# ============================================================================
# BUSCAR CONHECIMENTO POR ID
# ============================================================================
@router.get("/{knowledge_id}", response_model=KnowledgeResponse)
async def get_knowledge(
    knowledge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna um conhecimento específico por ID
    """
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()

    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conhecimento não encontrado"
        )

    return knowledge


# ============================================================================
# CRIAR CONHECIMENTO
# ============================================================================
@router.post("/", response_model=KnowledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge(
    knowledge_data: KnowledgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo conhecimento/certificação
    """
    # Verificar permissão
    if current_user.role not in ["ADMIN", "DIRETORIA", "GERENTE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para criar conhecimentos"
        )

    # Verificar se já existe conhecimento com mesmo nome
    existing = db.query(Knowledge).filter(
        Knowledge.nome == knowledge_data.nome,
        Knowledge.fornecedor == knowledge_data.fornecedor
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um conhecimento com este nome do mesmo fornecedor"
        )

    # Criar conhecimento
    new_knowledge = Knowledge(**knowledge_data.model_dump())

    db.add(new_knowledge)
    db.commit()
    db.refresh(new_knowledge)

    return new_knowledge


# ============================================================================
# ATUALIZAR CONHECIMENTO
# ============================================================================
@router.put("/{knowledge_id}", response_model=KnowledgeResponse)
async def update_knowledge(
    knowledge_id: int,
    knowledge_data: KnowledgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza dados de um conhecimento
    """
    # Buscar conhecimento
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()

    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conhecimento não encontrado"
        )

    # Verificar permissão
    if current_user.role not in ["ADMIN", "DIRETORIA", "GERENTE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar conhecimentos"
        )

    # Atualizar campos fornecidos
    update_data = knowledge_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(knowledge, field, value)

    db.commit()
    db.refresh(knowledge)

    return knowledge
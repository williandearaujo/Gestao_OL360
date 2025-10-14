# ===========================================================================
# Arquivo: backend/app/routers/areas.py
# ===========================================================================
"""
Router de Áreas Organizacionais
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.area import Area
from app.core.security import get_current_user
from app.schemas.organization import AreaCreate, AreaResponse

router = APIRouter(prefix="/areas", tags=["Áreas"])


@router.get("/", response_model=List[AreaResponse])
async def list_areas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todas as áreas"""
    areas = db.query(Area).filter(Area.ativa == True).all()
    return areas


@router.post("/", response_model=AreaResponse, status_code=status.HTTP_201_CREATED)
async def create_area(
    area_data: AreaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria uma nova área"""
    if current_user.role not in ["ADMIN", "DIRETORIA"]:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    area = Area(**area_data.model_dump())
    db.add(area)
    db.commit()
    db.refresh(area)
    
    return area
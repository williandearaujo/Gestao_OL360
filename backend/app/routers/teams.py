# ===========================================================================
# Arquivo: backend/app/routers/teams.py
# ===========================================================================
"""
Router de Times/Equipes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.team import Team
from app.core.security import get_current_user
from app.schemas.organization import TeamCreate, TeamResponse

router = APIRouter(prefix="/teams", tags=["Times"])


@router.get("/", response_model=List[TeamResponse])
async def list_teams(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Lista todos os times"""
    teams = db.query(Team).filter(Team.ativa == True).all()
    return teams


@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
        team_data: TeamCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Cria um novo time"""
    if current_user.role not in ["ADMIN", "DIRETORIA", "GERENTE"]:
        raise HTTPException(status_code=403, detail="Sem permissão")

    team = Team(**team_data.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)

    return team
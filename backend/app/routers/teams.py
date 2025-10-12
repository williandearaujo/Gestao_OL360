"""
Router de Teams
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/teams", tags=["Times"])


@router.get("/")
async def list_teams():
    """Listar todos os times"""
    try:
        teams = [
            {"id": 1, "nome": "Time Dev", "area_id": 1, "manager_id": 1},
            {"id": 2, "nome": "Time Comercial", "area_id": 2, "manager_id": 2}
        ]

        return {
            "success": True,
            "data": teams,
            "total": len(teams)
        }
    except Exception as e:
        logger.error(f"Erro ao listar times: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}")
async def get_team(team_id: int):
    """Obter detalhes de um time"""
    try:
        team = {"id": team_id, "nome": "Time Dev", "area_id": 1}
        return {"success": True, "data": team}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Time não encontrado")


@router.post("/")
async def create_team(data: Dict[str, Any]):
    """Criar novo time"""
    return {"success": True, "message": "Time criado com sucesso", "data": data}


@router.put("/{team_id}")
async def update_team(team_id: int, data: Dict[str, Any]):
    """Atualizar time"""
    return {"success": True, "message": "Time atualizado com sucesso"}


@router.delete("/{team_id}")
async def delete_team(team_id: int):
    """Deletar time"""
    return {"success": True, "message": "Time deletado com sucesso"}
"""
Router de Alertas - Sistema de notificações e alertas
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["Alertas"])

class AlertType(str, Enum):
    CERTIFICATION_EXPIRING = "certification_expiring"
    CERTIFICATION_EXPIRED = "certification_expired"
    VACATION_PENDING = "vacation_pending"
    BIRTHDAY = "birthday"
    PDI_DEADLINE = "pdi_deadline"
    ONE_ON_ONE_SCHEDULED = "one_on_one_scheduled"
    DOCUMENT_MISSING = "document_missing"
    SYSTEM = "system"

class AlertPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

@router.get("/")
async def get_alerts(
    alert_type: Optional[AlertType] = None,
    priority: Optional[AlertPriority] = None,
    is_read: Optional[bool] = None,
    employee_id: Optional[int] = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0
):
    """
    Listar todos os alertas com filtros
    """
    try:
        logger.info(f"📬 Buscando alertas (type={alert_type}, priority={priority})")

        # Mock de alertas - você vai conectar ao banco depois
        alerts = [
            {
                "id": 1,
                "type": "certification_expiring",
                "priority": "high",
                "title": "Certificação AWS vencendo em 7 dias",
                "message": "A certificação AWS Solutions Architect do colaborador João Silva vence em 7 dias",
                "employee_id": 1,
                "employee_name": "João Silva",
                "related_id": 10,  # ID da certificação
                "related_type": "certification",
                "is_read": False,
                "created_at": datetime.now().isoformat(),
                "expires_at": (datetime.now() + timedelta(days=7)).isoformat(),
                "action_url": "/dashboard/conhecimentos/10",
                "metadata": {
                    "certification_name": "AWS Solutions Architect",
                    "days_remaining": 7
                }
            },
            {
                "id": 2,
                "type": "birthday",
                "priority": "medium",
                "title": "Aniversário de Maria Santos",
                "message": "Maria Santos faz aniversário amanhã",
                "employee_id": 2,
                "employee_name": "Maria Santos",
                "is_read": False,
                "created_at": datetime.now().isoformat(),
                "action_url": "/dashboard/colaboradores/2",
                "metadata": {
                    "birthday_date": (datetime.now() + timedelta(days=1)).isoformat()
                }
            },
            {
                "id": 3,
                "type": "vacation_pending",
                "priority": "high",
                "title": "Solicitação de férias pendente",
                "message": "Carlos Oliveira solicitou férias de 15/11 a 29/11",
                "employee_id": 3,
                "employee_name": "Carlos Oliveira",
                "related_id": 5,
                "related_type": "vacation_request",
                "is_read": False,
                "created_at": datetime.now().isoformat(),
                "action_url": "/dashboard/colaboradores/3/ferias",
                "metadata": {
                    "start_date": "2025-11-15",
                    "end_date": "2025-11-29",
                    "days": 15
                }
            },
            {
                "id": 4,
                "type": "pdi_deadline",
                "priority": "medium",
                "title": "Ação do PDI vencendo",
                "message": "Ação 'Curso de Python' do PDI de Ana Costa vence em 3 dias",
                "employee_id": 4,
                "employee_name": "Ana Costa",
                "related_id": 8,
                "related_type": "pdi_action",
                "is_read": True,
                "created_at": (datetime.now() - timedelta(days=2)).isoformat(),
                "action_url": "/dashboard/colaboradores/4/pdi"
            },
            {
                "id": 5,
                "type": "certification_expired",
                "priority": "critical",
                "title": "Certificação vencida",
                "message": "Certificação ITIL do colaborador Pedro Lima venceu há 2 dias",
                "employee_id": 5,
                "employee_name": "Pedro Lima",
                "related_id": 15,
                "related_type": "certification",
                "is_read": False,
                "created_at": (datetime.now() - timedelta(days=2)).isoformat(),
                "action_url": "/dashboard/conhecimentos/15",
                "metadata": {
                    "certification_name": "ITIL Foundation",
                    "expired_days": 2
                }
            }
        ]

        # Aplicar filtros
        filtered_alerts = alerts

        if alert_type:
            filtered_alerts = [a for a in filtered_alerts if a['type'] == alert_type]

        if priority:
            filtered_alerts = [a for a in filtered_alerts if a['priority'] == priority]

        if is_read is not None:
            filtered_alerts = [a for a in filtered_alerts if a['is_read'] == is_read]

        if employee_id:
            filtered_alerts = [a for a in filtered_alerts if a.get('employee_id') == employee_id]

        # Paginação
        total = len(filtered_alerts)
        paginated_alerts = filtered_alerts[offset:offset+limit]

        return {
            "success": True,
            "data": paginated_alerts,
            "total": total,
            "unread_count": len([a for a in filtered_alerts if not a.get('is_read', False)]),
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"❌ Erro ao buscar alertas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
async def get_alerts_summary():
    """
    Obter resumo de alertas por tipo e prioridade
    """
    try:
        summary = {
            "total": 15,
            "unread": 8,
            "by_priority": {
                "critical": 3,
                "high": 5,
                "medium": 4,
                "low": 2,
                "info": 1
            },
            "by_type": {
                "certification_expiring": 4,
                "certification_expired": 2,
                "vacation_pending": 3,
                "birthday": 2,
                "pdi_deadline": 2,
                "one_on_one_scheduled": 1,
                "document_missing": 1
            },
            "urgent_actions_needed": 3
        }

        return {
            "success": True,
            "data": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{alert_id}")
async def get_alert(alert_id: int):
    """
    Obter detalhes de um alerta específico
    """
    try:
        # Mock - você vai buscar do banco
        alert = {
            "id": alert_id,
            "type": "certification_expiring",
            "priority": "high",
            "title": "Certificação AWS vencendo",
            "message": "Certificação vence em 7 dias",
            "employee_id": 1,
            "is_read": False,
            "created_at": datetime.now().isoformat()
        }

        return {
            "success": True,
            "data": alert
        }

    except Exception as e:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")

@router.patch("/{alert_id}/read")
async def mark_alert_as_read(alert_id: int):
    """
    Marcar alerta como lido
    """
    try:
        logger.info(f"✅ Marcando alerta {alert_id} como lido")

        return {
            "success": True,
            "message": "Alerta marcado como lido"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/read-all")
async def mark_all_as_read(
    alert_type: Optional[AlertType] = None,
    employee_id: Optional[int] = None
):
    """
    Marcar múltiplos alertas como lidos
    """
    try:
        logger.info("✅ Marcando múltiplos alertas como lidos")

        return {
            "success": True,
            "message": "Alertas marcados como lidos",
            "updated_count": 5
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{alert_id}")
async def delete_alert(alert_id: int):
    """
    Deletar um alerta
    """
    try:
        logger.info(f"🗑️ Deletando alerta {alert_id}")

        return {
            "success": True,
            "message": "Alerta deletado com sucesso"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_alert(alert_data: Dict[str, Any]):
    """
    Criar novo alerta (uso interno do sistema)
    """
    try:
        logger.info(f"➕ Criando novo alerta: {alert_data.get('title')}")

        # Validar dados necessários
        required_fields = ['type', 'priority', 'title', 'message']
        for field in required_fields:
            if field not in alert_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Campo obrigatório ausente: {field}"
                )

        # Aqui você vai salvar no banco
        new_alert = {
            "id": 999,  # Será gerado pelo banco
            **alert_data,
            "is_read": False,
            "created_at": datetime.now().isoformat()
        }

        return {
            "success": True,
            "message": "Alerta criado com sucesso",
            "data": new_alert
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro ao criar alerta: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/employee/{employee_id}")
async def get_employee_alerts(
    employee_id: int,
    is_read: Optional[bool] = None,
    limit: int = 20
):
    """
    Obter alertas específicos de um colaborador
    """
    try:
        # Usar a função principal com filtro de employee_id
        return await get_alerts(
            employee_id=employee_id,
            is_read=is_read,
            limit=limit
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
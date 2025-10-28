from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.alert import Alert, AlertTypeEnum, AlertPriorityEnum
from app.schemas.alert import AlertCreate, AlertUpdate, AlertResponse
from app.core.security import get_current_user
from app.models.user import User
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Alertas"])

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    alert_type: Optional[AlertTypeEnum] = Query(None),
    priority: Optional[AlertPriorityEnum] = Query(None),
    is_read: Optional[bool] = Query(None),
    employee_id: Optional[str] = Query(None),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    AlertService.refresh_alerts(db)
    query = db.query(Alert)

    if alert_type:
        query = query.filter(Alert.type == alert_type)
    if priority:
        query = query.filter(Alert.priority == priority)
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)
    if employee_id:
        query = query.filter(Alert.employee_id == employee_id)

    alerts = query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
    return alerts

@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return alert

@router.post("/", response_model=AlertResponse, status_code=201)
async def create_alert(alert_data: AlertCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payload = alert_data.model_dump(by_alias=True)
    alert = Alert(**payload, created_at=datetime.now())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.patch("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_as_read(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert

@router.patch("/read-all")
async def mark_all_as_read(
    alert_type: Optional[AlertTypeEnum] = Query(None),
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert).filter(Alert.is_read == False)
    if alert_type:
        query = query.filter(Alert.type == alert_type)
    if employee_id:
        query = query.filter(Alert.employee_id == employee_id)
    updated_count = query.update({Alert.is_read: True})
    db.commit()
    return {
        "success": True,
        "message": "Alertas marcados como lidos",
        "updated_count": updated_count
    }

@router.post("/refresh")
async def refresh_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = AlertService.refresh_alerts(db)
    return {"success": True, "total_alerts": total}

@router.delete("/{alert_id}")
async def delete_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    db.delete(alert)
    db.commit()
    return {"success": True, "message": "Alerta deletado com sucesso"}

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Iterable, Optional, Set, Tuple
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.alert import Alert, AlertPriorityEnum, AlertTypeEnum
from app.models.employee import Employee, EmployeeTypeEnum
from app.models.employee_knowledge import EmployeeKnowledge, StatusEnum as KnowledgeLinkStatus
from app.models.knowledge import Knowledge
from app.models.pdi_log import EmployeePdiLog
from app.models.one_on_one import EmployeeOneOnOne


@dataclass
class AlertPayload:
    type: AlertTypeEnum
    priority: AlertPriorityEnum
    title: str
    message: str
    employee_id: Optional[UUID]
    employee_name: Optional[str]
    meta_key: str
    meta_data: dict
    expires_at: Optional[datetime] = None
    action_url: Optional[str] = None


class AlertService:
    """Service responsável por gerar as notificações exibidas no painel."""

    MANAGED_TYPES: Set[AlertTypeEnum] = {
        AlertTypeEnum.BIRTHDAY,
        AlertTypeEnum.WORK_ANNIVERSARY,
        AlertTypeEnum.CERTIFICATION_EXPIRING,
        AlertTypeEnum.CERTIFICATION_EXPIRED,
        AlertTypeEnum.PDI_DEADLINE,
        AlertTypeEnum.ONE_ON_ONE_SCHEDULED,
    }

    @classmethod
    def refresh_alerts(cls, db: Session) -> int:
        """Recalcula os alertas dinâmicos e retorna o total ativo."""
        existing_alerts = (
            db.query(Alert)
            .filter(Alert.type.in_(tuple(cls.MANAGED_TYPES)))
            .all()
        )
        existing_by_key = {cls._key(a.type, a.employee_id, (a.meta_data or {}).get("unique_key")): a for a in existing_alerts}
        processed_keys: Set[Tuple[str, Optional[UUID], str]] = set()

        generators: Iterable[Iterable[AlertPayload]] = (
            cls._generate_birthdays(db),
            cls._generate_work_anniversaries(db),
            cls._generate_certification_expiring(db),
            cls._generate_certification_expired(db),
            cls._generate_pdi_alerts(db),
            cls._generate_one_on_one_alerts(db),
        )

        for payloads in generators:
            for payload in payloads:
                key = cls._key(payload.type, payload.employee_id, payload.meta_key)
                processed_keys.add(key)
                alert = existing_by_key.get(key)
                if alert:
                    alert.priority = payload.priority
                    alert.title = payload.title
                    alert.message = payload.message
                    alert.employee_name = payload.employee_name
                    alert.meta_data = {"unique_key": payload.meta_key, **payload.meta_data}
                    alert.expires_at = payload.expires_at
                    alert.action_url = payload.action_url
                    alert.is_read = False  # ao atualizar, exibir novamente no painel
                else:
                    db.add(
                        Alert(
                            type=payload.type,
                            priority=payload.priority,
                            title=payload.title,
                            message=payload.message,
                            employee_id=payload.employee_id,
                            employee_name=payload.employee_name,
                            meta_data={"unique_key": payload.meta_key, **payload.meta_data},
                            expires_at=payload.expires_at,
                            action_url=payload.action_url,
                        )
                    )

        # Remove alertas que não são mais necessários
        for key, alert in existing_by_key.items():
            if key not in processed_keys:
                db.delete(alert)

        db.commit()
        return len(processed_keys)

    # ------------------------------------------------------------------ #
    # Geradores individuais
    # ------------------------------------------------------------------ #

    @staticmethod
    def _generate_birthdays(db: Session) -> Iterable[AlertPayload]:
        today = date.today()
        limit = today + timedelta(days=30)
        employees = (
            db.query(Employee.id, Employee.nome_completo, Employee.data_nascimento)
            .filter(Employee.status == "ATIVO", Employee.data_nascimento.isnot(None))
            .all()
        )
        for emp_id, name, birth_date in employees:
            next_birthday = birth_date.replace(year=today.year)
            if next_birthday < today:
                next_birthday = next_birthday.replace(year=today.year + 1)
            if today <= next_birthday <= limit:
                days = (next_birthday - today).days
                yield AlertPayload(
                    type=AlertTypeEnum.BIRTHDAY,
                    priority=AlertPriorityEnum.HIGH if days <= 7 else AlertPriorityEnum.MEDIUM,
                    title=f"Aniversário de {name}",
                    message=f"O aniversário de {name} será em {next_birthday.strftime('%d/%m/%Y')} (falta(m) {days} dia(s)).",
                    employee_id=emp_id,
                    employee_name=name,
                    meta_key=f"birthday-{emp_id}-{next_birthday.isoformat()}",
                    meta_data={"target_date": next_birthday.isoformat(), "days_until": days},
                    expires_at=datetime.combine(next_birthday, datetime.min.time()),
                )

    @staticmethod
    def _generate_work_anniversaries(db: Session) -> Iterable[AlertPayload]:
        today = date.today()
        limit = today + timedelta(days=30)
        employees = (
            db.query(Employee.id, Employee.nome_completo, Employee.data_admissao)
            .filter(Employee.status == "ATIVO", Employee.data_admissao.isnot(None))
            .all()
        )
        for emp_id, name, hire_date in employees:
            if hire_date > today:
                continue
            years = today.year - hire_date.year
            anniversary = hire_date.replace(year=today.year)
            if anniversary < today:
                years += 1
                anniversary = hire_date.replace(year=today.year + 1)
            if today <= anniversary <= limit:
                days = (anniversary - today).days
                yield AlertPayload(
                    type=AlertTypeEnum.WORK_ANNIVERSARY,
                    priority=AlertPriorityEnum.MEDIUM,
                    title=f"Aniversário de empresa de {name}",
                    message=f"{name} completará {years} ano(s) de empresa em {anniversary.strftime('%d/%m/%Y')}.",
                    employee_id=emp_id,
                    employee_name=name,
                    meta_key=f"work-anniversary-{emp_id}-{anniversary.isoformat()}",
                    meta_data={"target_date": anniversary.isoformat(), "years": years, "days_until": days},
                    expires_at=datetime.combine(anniversary, datetime.min.time()),
                )

    @staticmethod
    def _generate_certification_expiring(db: Session) -> Iterable[AlertPayload]:
        today = date.today()
        limit = today + timedelta(days=60)
        records = (
            db.query(EmployeeKnowledge)
            .options(
                joinedload(EmployeeKnowledge.employee),
                joinedload(EmployeeKnowledge.knowledge),
            )
            .filter(
                EmployeeKnowledge.status == KnowledgeLinkStatus.OBTIDO,
                EmployeeKnowledge.data_expiracao.isnot(None),
            )
            .all()
        )
        for record in records:
            if not record.data_expiracao:
                continue
            if not (today <= record.data_expiracao <= limit):
                continue
            employee = record.employee
            knowledge = record.knowledge
            if not employee or not knowledge:
                continue
            days = (record.data_expiracao - today).days
            yield AlertPayload(
                type=AlertTypeEnum.CERTIFICATION_EXPIRING,
                priority=AlertPriorityEnum.HIGH if days <= 15 else AlertPriorityEnum.MEDIUM,
                title=f"Certificação '{knowledge.nome}' expirando",
                message=f"A certificação de {employee.nome_completo} expira em {record.data_expiracao.strftime('%d/%m/%Y')} (falta(m) {days} dia(s)).",
                employee_id=employee.id,
                employee_name=employee.nome_completo,
                meta_key=f"cert-expiring-{employee.id}-{knowledge.id}",
                meta_data={
                    "knowledge_id": str(knowledge.id),
                    "knowledge_nome": knowledge.nome,
                    "data_expiracao": record.data_expiracao.isoformat(),
                    "days_until": days,
                },
            )

    @staticmethod
    def _generate_certification_expired(db: Session) -> Iterable[AlertPayload]:
        today = date.today()
        records = (
            db.query(EmployeeKnowledge)
            .options(
                joinedload(EmployeeKnowledge.employee),
                joinedload(EmployeeKnowledge.knowledge),
            )
            .filter(
                EmployeeKnowledge.status == KnowledgeLinkStatus.OBTIDO,
                EmployeeKnowledge.data_expiracao.isnot(None),
                EmployeeKnowledge.data_expiracao < today,
            )
            .all()
        )
        for record in records:
            employee = record.employee
            knowledge = record.knowledge
            if not employee or not knowledge:
                continue
            days_expired = (today - record.data_expiracao).days
            yield AlertPayload(
                type=AlertTypeEnum.CERTIFICATION_EXPIRED,
                priority=AlertPriorityEnum.CRITICAL,
                title=f"Certificação '{knowledge.nome}' expirada",
                message=f"A certificação de {employee.nome_completo} expirou em {record.data_expiracao.strftime('%d/%m/%Y')} (há {days_expired} dia(s)).",
                employee_id=employee.id,
                employee_name=employee.nome_completo,
                meta_key=f"cert-expired-{employee.id}-{knowledge.id}",
                meta_data={
                    "knowledge_id": str(knowledge.id),
                    "knowledge_nome": knowledge.nome,
                    "data_expiracao": record.data_expiracao.isoformat(),
                    "days_expired": days_expired,
                },
            )

    @staticmethod
    def _generate_pdi_alerts(db: Session) -> Iterable[AlertPayload]:
        today = date.today()
        upcoming_limit = today + timedelta(days=15)

        records = (
            db.query(EmployeePdiLog)
            .options(joinedload(EmployeePdiLog.employee))
            .filter(EmployeePdiLog.status != "CONCLUIDO")
            .all()
        )
        for record in records:
            employee = record.employee
            if not employee:
                continue
            target_date = record.data_planejada
            if not target_date:
                continue
            if target_date < today:
                status = "atrasado"
                priority = AlertPriorityEnum.HIGH
                message = f"O PDI '{record.titulo}' de {employee.nome_completo} está atrasado desde {target_date.strftime('%d/%m/%Y')}."
            elif target_date <= upcoming_limit:
                days = (target_date - today).days
                status = "proximo"
                priority = AlertPriorityEnum.MEDIUM
                message = f"O PDI '{record.titulo}' de {employee.nome_completo} vence em {days} dia(s) ({target_date.strftime('%d/%m/%Y')})."
            else:
                continue
            yield AlertPayload(
                type=AlertTypeEnum.PDI_DEADLINE,
                priority=priority,
                title=f"PDI {status} - {employee.nome_completo}",
                message=message,
                employee_id=employee.id,
                employee_name=employee.nome_completo,
                meta_key=f"pdi-{record.id}",
                meta_data={
                    "pdi_id": str(record.id),
                    "status": status,
                    "data_planejada": target_date.isoformat(),
                },
            )

    @staticmethod
    def _generate_one_on_one_alerts(db: Session) -> Iterable[AlertPayload]:
        today = date.today()
        upcoming_limit = today + timedelta(days=7)

        latest_records = (
            db.query(EmployeeOneOnOne)
            .options(joinedload(EmployeeOneOnOne.employee))
            .order_by(EmployeeOneOnOne.employee_id, EmployeeOneOnOne.data_agendada.desc())
            .all()
        )

        seen_employees: Set[UUID] = set()
        for record in latest_records:
            employee = record.employee
            if not employee:
                continue
            if record.employee_id in seen_employees:
                continue
            seen_employees.add(record.employee_id)
            target_date = record.data_agendada
            if target_date is None:
                continue
            if target_date < today and record.status != "CONCLUIDO":
                yield AlertPayload(
                    type=AlertTypeEnum.ONE_ON_ONE_SCHEDULED,
                    priority=AlertPriorityEnum.HIGH,
                    title=f"1:1 atrasada - {employee.nome_completo}",
                    message=f"A última 1:1 agendada para {employee.nome_completo} deveria ter ocorrido em {target_date.strftime('%d/%m/%Y')}.",
                    employee_id=employee.id,
                    employee_name=employee.nome_completo,
                    meta_key=f"oneonone-{record.id}",
                    meta_data={
                        "one_on_one_id": str(record.id),
                        "status": "atrasado",
                        "data_agendada": target_date.isoformat(),
                    },
                )
            elif today <= target_date <= upcoming_limit and record.status != "CONCLUIDO":
                days = (target_date - today).days
                yield AlertPayload(
                    type=AlertTypeEnum.ONE_ON_ONE_SCHEDULED,
                    priority=AlertPriorityEnum.MEDIUM,
                    title=f"1:1 próxima - {employee.nome_completo}",
                    message=f"Há uma 1:1 agendada com {employee.nome_completo} para {target_date.strftime('%d/%m/%Y')} (em {days} dia(s)).",
                    employee_id=employee.id,
                    employee_name=employee.nome_completo,
                    meta_key=f"oneonone-{record.id}",
                    meta_data={
                        "one_on_one_id": str(record.id),
                        "status": "proximo",
                        "data_agendada": target_date.isoformat(),
                        "days_until": days,
                    },
                )

        # Funcionários sem registro de 1:1
        employees_without_one_on_one = (
            db.query(Employee.id, Employee.nome_completo)
            .filter(
                Employee.status == "ATIVO",
                ~Employee.id.in_(seen_employees),
                Employee.tipo_cadastro != EmployeeTypeEnum.COLABORADOR,  # 1:1 obrigatória para lideranças
            )
            .all()
        )
        for emp_id, name in employees_without_one_on_one:
            yield AlertPayload(
                type=AlertTypeEnum.ONE_ON_ONE_SCHEDULED,
                priority=AlertPriorityEnum.MEDIUM,
                title=f"1:1 pendente - {name}",
                message=f"{name} ainda não possui uma 1:1 agendada no sistema.",
                employee_id=emp_id,
                employee_name=name,
                meta_key=f"oneonone-pendente-{emp_id}",
                meta_data={"status": "nao_agendado"},
            )

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _key(alert_type: AlertTypeEnum, employee_id: Optional[UUID], meta_key: Optional[str]) -> Tuple[str, Optional[UUID], str]:
        return (alert_type.value, employee_id, meta_key or "")
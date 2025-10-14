"""
PDI Records Router - Plano de Desenvolvimento Individual
"""
from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user
from app.database import get_db
from typing import Optional
import json
from uuid import UUID

router = APIRouter(prefix="/pdi", tags=["PDI"])


@router.get("")
async def list_pdi_records(
        employee_id: Optional[str] = None,
        current_user=Depends(get_current_user)
):
    """Lista registros de PDI"""
    db = get_db()
    try:
        cursor = db.cursor()

        if employee_id:
            query = """
                    SELECT p.*, e.nome_completo as employee_nome
                    FROM pdi_records p
                             LEFT JOIN employees e ON p.employee_id = e.id
                    WHERE p.employee_id = %s
                    ORDER BY p.data DESC \
                    """
            cursor.execute(query, (UUID(employee_id),))
        else:
            query = """
                    SELECT p.*, e.nome_completo as employee_nome
                    FROM pdi_records p
                             LEFT JOIN employees e ON p.employee_id = e.id
                    ORDER BY p.data DESC LIMIT 100 \
                    """
            cursor.execute(query)

        columns = [desc[0] for desc in cursor.description]
        results = []

        for row in cursor.fetchall():
            record = dict(zip(columns, row))

            for key in ['id', 'employee_id', 'created_by']:
                if record.get(key):
                    record[key] = str(record[key])

            if record.get('notas'):
                try:
                    record['acoes'] = json.loads(record['notas']) if isinstance(record['notas'], str) else record[
                        'notas']
                except:
                    record['acoes'] = []

            results.append(record)

        return {"data": results, "total": len(results)}
    finally:
        db.close()


@router.post("")
async def create_pdi_record(
        data: dict,
        current_user=Depends(get_current_user)
):
    """Cria registro de PDI"""
    db = get_db()
    try:
        import uuid as uuid_lib
        cursor = db.cursor()

        record_id = uuid_lib.uuid4()
        employee_uuid = UUID(data['employee_id'])
        user_id = UUID(current_user['id']) if 'id' in current_user else None

        acoes_json = json.dumps(data.get('acoes', []))

        cursor.execute("""
                       INSERT INTO pdi_records (id, employee_id, data, tipo, realizado,
                                                notas, created_by, created_at)
                       VALUES (%s, %s, CURRENT_DATE, %s, FALSE, %s, %s, NOW()) RETURNING *
                       """, (
                           record_id,
                           employee_uuid,
                           data.get('tipo', 'PDI'),
                           acoes_json,
                           user_id
                       ))

        db.commit()
        new_record = cursor.fetchone()
        columns = [desc[0] for desc in cursor.description]
        record = dict(zip(columns, new_record))

        for key in ['id', 'employee_id', 'created_by']:
            if record.get(key):
                record[key] = str(record[key])

        return {"data": record}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.put("/{record_id}")
async def update_pdi_record(
        record_id: str,
        data: dict,
        current_user=Depends(get_current_user)
):
    """Atualiza registro de PDI"""
    db = get_db()
    try:
        cursor = db.cursor()

        acoes_json = json.dumps(data.get('acoes', []))

        cursor.execute("""
                       UPDATE pdi_records
                       SET notas = %s,
                           tipo  = %s
                       WHERE id = %s RETURNING *
                       """, (acoes_json, data.get('tipo', 'PDI'), UUID(record_id)))

        db.commit()
        updated = cursor.fetchone()

        if not updated:
            raise HTTPException(status_code=404, detail="PDI não encontrado")

        columns = [desc[0] for desc in cursor.description]
        record = dict(zip(columns, updated))

        for key in ['id', 'employee_id']:
            if record.get(key):
                record[key] = str(record[key])

        return {"data": record}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.delete("/{record_id}")
async def delete_pdi_record(
        record_id: str,
        current_user=Depends(get_current_user)
):
    """Exclui registro de PDI"""
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("DELETE FROM pdi_records WHERE id = %s RETURNING id", (UUID(record_id),))
        deleted = cursor.fetchone()

        if not deleted:
            raise HTTPException(status_code=404, detail="PDI não encontrado")

        db.commit()
        return {"message": "PDI excluído com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
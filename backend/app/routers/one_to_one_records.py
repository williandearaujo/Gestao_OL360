"""
One-to-One Records Router - Reuniões 1:1
"""
from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user
from app.database import get_db
from typing import Optional
import json
from uuid import UUID

router = APIRouter(prefix="/one-to-one", tags=["1x1"])

@router.get("")
async def list_one_to_one_records(
    employee_id: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    """Lista registros de 1:1"""
    db = get_db()
    try:
        cursor = db.cursor()

        if employee_id:
            query = """
                SELECT o.*, e.nome_completo as employee_nome
                FROM one_to_one_records o
                LEFT JOIN employees e ON o.employee_id = e.id
                WHERE o.employee_id = %s
                ORDER BY o.data DESC
            """
            cursor.execute(query, (UUID(employee_id),))
        else:
            query = """
                SELECT o.*, e.nome_completo as employee_nome
                FROM one_to_one_records o
                LEFT JOIN employees e ON o.employee_id = e.id
                ORDER BY o.data DESC LIMIT 100
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
                    detalhes = json.loads(record['notas']) if isinstance(record['notas'], str) else record['notas']
                    record.update(detalhes)
                except:
                    pass

            results.append(record)

        return {"data": results, "total": len(results)}
    finally:
        db.close()

@router.post("")
async def create_one_to_one_record(
    data: dict,
    current_user=Depends(get_current_user)
):
    """Cria registro de 1:1"""
    db = get_db()
    try:
        import uuid as uuid_lib
        cursor = db.cursor()

        record_id = uuid_lib.uuid4()
        employee_uuid = UUID(data['employee_id'])
        user_id = UUID(current_user['id']) if 'id' in current_user else None

        detalhes = {
            "hora": data.get('hora'),
            "duracao": data.get('duracao', 60),
            "local": data.get('local'),
            "topicos": data.get('topicos', []),
            "observacoes": data.get('observacoes')
        }
        notas_json = json.dumps(detalhes)

        cursor.execute("""
            INSERT INTO one_to_one_records (id, employee_id, data, tipo, realizado,
                                           notas, created_by, created_at)
            VALUES (%s, %s, %s, %s, FALSE, %s, %s, NOW()) 
            RETURNING *
        """, (
            record_id,
            employee_uuid,
            data.get('data'),
            data.get('tipo', 'PRESENCIAL'),
            notas_json,
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
async def update_one_to_one_record(
    record_id: str,
    data: dict,
    current_user=Depends(get_current_user)
):
    """Atualiza registro de 1:1"""
    db = get_db()
    try:
        cursor = db.cursor()

        detalhes = {
            "hora": data.get('hora'),
            "duracao": data.get('duracao'),
            "local": data.get('local'),
            "topicos": data.get('topicos', []),
            "observacoes": data.get('observacoes')
        }
        notas_json = json.dumps(detalhes)

        cursor.execute("""
            UPDATE one_to_one_records
            SET notas = %s, tipo = %s, realizado = %s
            WHERE id = %s 
            RETURNING *
        """, (notas_json, data.get('tipo'), data.get('realizado', False), UUID(record_id)))

        db.commit()
        updated = cursor.fetchone()

        if not updated:
            raise HTTPException(status_code=404, detail="Reunião não encontrada")

        columns = [desc[0] for desc in cursor.description]
        record = dict(zip(columns, updated))

        for key in ['id', 'employee_id']:
            if record.get(key):
                record[key] = str(record[key])

        return {"data": record}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.delete("/{record_id}")
async def delete_one_to_one_record(
    record_id: str,
    current_user=Depends(get_current_user)
):
    """Exclui registro de 1:1"""
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("DELETE FROM one_to_one_records WHERE id = %s RETURNING id", (UUID(record_id),))
        deleted = cursor.fetchone()

        if not deleted:
            raise HTTPException(status_code=404, detail="Reunião não encontrada")

        db.commit()
        return {"message": "Reunião excluída com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
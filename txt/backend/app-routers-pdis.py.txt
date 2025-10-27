from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/pdis", tags=["pdis"])


@router.get("")
async def get_pdis(employee_id: int = None, current_user: dict = Depends(get_current_user)):
    """Lista PDIs"""
    db = get_db()
    try:
        cursor = db.cursor()

        if employee_id:
            cursor.execute("SELECT * FROM pdis WHERE employee_id = %s ORDER BY data_limite", (employee_id,))
        else:
            cursor.execute("SELECT * FROM pdis ORDER BY data_limite")

        columns = [desc[0] for desc in cursor.description]
        pdis = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return {"data": pdis}
    finally:
        db.close()


@router.post("")
async def create_pdi(pdi_data: dict, current_user: dict = Depends(get_current_user)):
    """Cria ação de PDI"""
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("""
                       INSERT INTO pdis (employee_id, titulo, descricao, categoria, prioridade,
                                         data_inicio, data_limite, status, responsavel, progresso)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *
                       """, (
                           pdi_data.get('employee_id'),
                           pdi_data.get('titulo'),
                           pdi_data.get('descricao'),
                           pdi_data.get('categoria'),
                           pdi_data.get('prioridade'),
                           pdi_data.get('data_inicio'),
                           pdi_data.get('data_limite'),
                           pdi_data.get('status', 'PENDENTE'),
                           pdi_data.get('responsavel'),
                           pdi_data.get('progresso', 0)
                       ))

        db.commit()
        new_pdi = cursor.fetchone()
        columns = [desc[0] for desc in cursor.description]

        return {"data": dict(zip(columns, new_pdi))}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.put("/{pdi_id}")
async def update_pdi(pdi_id: int, pdi_data: dict, current_user: dict = Depends(get_current_user)):
    """Atualiza ação de PDI"""
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("""
                       UPDATE pdis
                       SET titulo        = %s,
                           descricao     = %s,
                           categoria     = %s,
                           prioridade    = %s,
                           data_limite   = %s,
                           status        = %s,
                           progresso     = %s,
                           atualizado_em = CURRENT_TIMESTAMP
                       WHERE id = %s RETURNING *
                       """, (
                           pdi_data.get('titulo'),
                           pdi_data.get('descricao'),
                           pdi_data.get('categoria'),
                           pdi_data.get('prioridade'),
                           pdi_data.get('data_limite'),
                           pdi_data.get('status'),
                           pdi_data.get('progresso'),
                           pdi_id
                       ))

        db.commit()
        updated = cursor.fetchone()

        if not updated:
            raise HTTPException(status_code=404, detail="PDI não encontrado")

        columns = [desc[0] for desc in cursor.description]
        return {"data": dict(zip(columns, updated))}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.delete("/{pdi_id}")
async def delete_pdi(pdi_id: int, current_user: dict = Depends(get_current_user)):
    """Exclui ação de PDI"""
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("DELETE FROM pdis WHERE id = %s RETURNING id", (pdi_id,))
        deleted = cursor.fetchone()

        if not deleted:
            raise HTTPException(status_code=404, detail="PDI não encontrado")

        db.commit()
        return {"message": "PDI excluído com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

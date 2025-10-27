"""add area_id to employees (safe)

Revision ID: 186657bcc8c3
Revises: de423289a0c8
Create Date: 2025-10-14 12:42:27.334499
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '186657bcc8c3'
down_revision: Union[str, Sequence[str], None] = 'de423289a0c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Verifica se a coluna já existe
    result = conn.execute(sa.text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='employees' AND column_name='area_id'
    """)).fetchone()

    if not result:
        op.add_column('employees', sa.Column('area_id', sa.Integer(), nullable=True))

    # Verifica se já há constraint com esse nome
    fk_exists = conn.execute(sa.text("""
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name='employees' AND constraint_name='fk_employees_area_id'
    """)).fetchone()

    if not fk_exists:
        op.create_foreign_key(
            'fk_employees_area_id',
            'employees',
            'areas',
            ['area_id'],
            ['id'],
            ondelete='SET NULL'
        )

    # Cria índice apenas se não existir
    idx_exists = conn.execute(sa.text("""
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename='employees' AND indexname='idx_employees_area_id'
    """)).fetchone()

    if not idx_exists:
        op.create_index('idx_employees_area_id', 'employees', ['area_id'])


def downgrade() -> None:
    op.drop_index('idx_employees_area_id', table_name='employees')
    op.drop_constraint('fk_employees_area_id', 'employees', type_='foreignkey')
    op.drop_column('employees', 'area_id')

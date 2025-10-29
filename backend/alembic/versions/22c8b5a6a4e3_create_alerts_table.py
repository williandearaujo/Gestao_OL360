"""create_alerts_table

Revision ID: 22c8b5a6a4e3
Revises: 3b0f3380a87a
Create Date: 2025-10-28 15:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '22c8b5a6a4e3'
down_revision: Union[str, None] = '3b0f3380a87a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('alerts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('type', sa.Enum('CERTIFICATION_EXPIRING', 'CERTIFICATION_EXPIRED', 'VACATION_PENDING', 'BIRTHDAY', 'WORK_ANNIVERSARY', 'PDI_DEADLINE', 'ONE_ON_ONE_SCHEDULED', 'DOCUMENT_MISSING', 'SYSTEM', name='alerttypeenum'), nullable=False),
    sa.Column('priority', sa.Enum('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', name='alertpriorityenum'), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('message', sa.String(), nullable=False),
    sa.Column('employee_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('employee_name', sa.String(), nullable=True),
    sa.Column('related_id', sa.Integer(), nullable=True),
    sa.Column('related_type', sa.String(), nullable=True),
    sa.Column('is_read', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('expires_at', sa.DateTime(), nullable=True),
    sa.Column('action_url', sa.String(), nullable=True),
    sa.Column('meta_data', sa.JSON(), nullable=True),
    sa.ForeignKeyConstraint(['employee_id'], ['employees.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_id'), 'alerts', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_alerts_id'), table_name='alerts')
    op.drop_table('alerts')
    op.execute('DROP TYPE alerttypeenum;')
    op.execute('DROP TYPE alertpriorityenum;')

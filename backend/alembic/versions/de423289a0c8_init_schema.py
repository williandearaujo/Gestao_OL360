"""
init schema
Revision ID: de423289a0c8
Revises:
Create Date: 2025-10-14 12:37:21.246998
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# Identificadores de revisão
revision: str = 'de423289a0c8'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Sincroniza estado atual do banco sem alterar estrutura."""
    # Nenhuma alteração de schema necessária
    pass


def downgrade() -> None:
    """Rollback não necessário (estado inicial)."""
    pass

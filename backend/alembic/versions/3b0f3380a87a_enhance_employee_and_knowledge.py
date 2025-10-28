"""Enhance employee and knowledge domain models

Revision ID: 3b0f3380a87a
Revises: 693df14f24cf
Create Date: 2025-10-28 09:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "3b0f3380a87a"
down_revision: Union[str, Sequence[str], None] = "693df14f24cf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


employee_type_enum = sa.Enum(
    "DIRETOR",
    "GERENTE",
    "COORDENADOR",
    "COLABORADOR",
    name="employee_type_enum",
)

knowledge_category_enum = sa.Enum(
    "CERTIFICACAO",
    "CURSO",
    "IDIOMA",
    "FORMACAO",
    name="knowledge_category_enum",
)


def upgrade() -> None:
    bind = op.get_bind()

    # ENUM types
    employee_type_enum.create(bind, checkfirst=True)
    knowledge_category_enum.create(bind, checkfirst=True)

    # Employees table enhancements
    op.add_column(
        "employees",
        sa.Column(
            "tipo_cadastro",
            employee_type_enum,
            nullable=False,
            server_default="COLABORADOR",
        ),
    )
    op.add_column(
        "employees",
        sa.Column("salario_atual", sa.Numeric(12, 2), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("ultima_alteracao_salarial", sa.Date(), nullable=True),
    )
    op.add_column(
        "employees",
        sa.Column("observacoes_internas", sa.Text(), nullable=True),
    )
    op.execute(
        "UPDATE employees SET tipo_cadastro = 'COLABORADOR' WHERE tipo_cadastro IS NULL"
    )
    op.alter_column("employees", "tipo_cadastro", server_default=None)

    # Employee salary history table
    op.create_table(
        "employee_salary_history",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("effective_date", sa.Date(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column(
            "created_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_employee_salary_history_employee_id",
        "employee_salary_history",
        ["employee_id"],
    )

    # Employee notes table
    op.create_table(
        "employee_notes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "employee_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "author_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_employee_notes_employee_id",
        "employee_notes",
        ["employee_id"],
    )

    # Knowledge table additions
    op.add_column(
        "knowledge",
        sa.Column("codigo_certificacao", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "knowledge",
        sa.Column("orgao_certificador", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "knowledge",
        sa.Column("tipo_formacao", sa.String(length=80), nullable=True),
    )

    op.alter_column(
        "knowledge",
        "tipo",
        existing_type=sa.String(length=50),
        type_=knowledge_category_enum,
        existing_nullable=False,
        postgresql_using="tipo::knowledge_category_enum",
    )
    op.alter_column(
        "knowledge",
        "tipo",
        server_default="CURSO",
    )


def downgrade() -> None:
    # Knowledge table revert
    op.alter_column(
        "knowledge",
        "tipo",
        existing_type=knowledge_category_enum,
        type_=sa.String(length=50),
        existing_nullable=False,
        postgresql_using="tipo::text",
    )
    op.alter_column("knowledge", "tipo", server_default=None)
    op.drop_column("knowledge", "tipo_formacao")
    op.drop_column("knowledge", "orgao_certificador")
    op.drop_column("knowledge", "codigo_certificacao")

    # Employee notes/history tables
    op.drop_index("ix_employee_notes_employee_id", table_name="employee_notes")
    op.drop_table("employee_notes")
    op.drop_index(
        "ix_employee_salary_history_employee_id",
        table_name="employee_salary_history",
    )
    op.drop_table("employee_salary_history")

    # Employee table columns
    op.drop_column("employees", "observacoes_internas")
    op.drop_column("employees", "ultima_alteracao_salarial")
    op.drop_column("employees", "salario_atual")
    op.drop_column("employees", "tipo_cadastro")

    # Drop enums
    knowledge_category_enum.drop(op.get_bind(), checkfirst=True)
    employee_type_enum.drop(op.get_bind(), checkfirst=True)

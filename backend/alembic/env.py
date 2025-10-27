import os
import sys
from logging.config import fileConfig
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool
from alembic import context

# =====================================================================
# Caminhos e variáveis de ambiente
# =====================================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
load_dotenv(os.path.join(BASE_DIR, ".env"))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importa Base e models
from app.database import engine
from app.models import Base

# Configurações do Alembic
config = context.config
fileConfig(config.config_file_name)

# Usa DATABASE_URL do .env se disponível
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)

# Define metadados
target_metadata = Base.metadata


# =====================================================================
# Função de filtro para proteger estrutura existente
# =====================================================================
def include_object(object, name, type_, reflected, compare_to):
    """
    Controla o que o Alembic deve incluir na comparação automática.
    Evita gerar DROP TABLE, DROP COLUMN e recriações desnecessárias.
    """
    # Ignora tabelas existentes
    if type_ == "table" and reflected and compare_to is None:
        return False

    # Ignora colunas removidas
    if type_ == "column" and compare_to is None:
        return False

    # Ignora índices e constraints duplicadas
    if type_ in {"index", "unique_constraint", "foreign_key_constraint"} and reflected:
        return False

    return True


# =====================================================================
# Execução das migrations
# =====================================================================
def run_migrations_offline():
    """Executa migrations no modo offline."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
        include_object=include_object
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Executa migrations com conexão ativa."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            include_object=include_object,
        )

        with context.begin_transaction():
            context.run_migrations()


# =====================================================================
# Execução
# =====================================================================
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

"""
Módulo de conexão com banco de dados
Supabase PostgreSQL via SQLAlchemy
"""

from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from contextlib import contextmanager
from typing import Generator
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Engine
DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool if settings.ENVIRONMENT == "test" else None,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    echo=settings.DEBUG,
    future=True,
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

# Base para models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency para FastAPI obter sessão do banco"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        db.close()


def check_database_connection() -> dict:
    """Verifica saúde da conexão com banco"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as health"))
            result.fetchone()
            
            version_result = conn.execute(text("SELECT version()"))
            version = version_result.fetchone()[0]
            
            tables_result = conn.execute(text("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            table_count = tables_result.fetchone()[0]
            
            return {
                "status": "healthy",
                "database": "PostgreSQL",
                "version": version.split(",")[0],
                "tables": table_count,
            }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


def init_database():
    """Inicializa o banco de dados"""
    try:
        logger.info("🔄 Inicializando banco de dados...")
        
        # Importar models
        try:
            from app.models import user
        except:
            pass
        
        # Criar tabelas (se não existirem)
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ Banco de dados inicializado com sucesso")
        
        # Health check
        health = check_database_connection()
        if health["status"] == "healthy":
            logger.info(f"✅ Conexão OK - {health['tables']} tabelas encontradas")
        else:
            logger.error(f"❌ Problema na conexão: {health.get('error')}")
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco: {e}")
        return False


def paginate_query(query, page: int = 1, page_size: int = 50):
    """Aplica paginação em query SQLAlchemy"""
    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    return items, total


from typing import TypeVar, Generic
from pydantic import BaseModel

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """Response paginado genérico"""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    @classmethod
    def create(cls, items: list[T], total: int, page: int, page_size: int):
        total_pages = (total + page_size - 1) // page_size
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

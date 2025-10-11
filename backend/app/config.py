"""
Configurações do Sistema Gestão 360 OL
Integração com Supabase PostgreSQL
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import os


class Settings(BaseSettings):
    """
    Configurações da aplicação
    Carregadas de variáveis de ambiente (.env)
    """

    # ============================================================================
    # APLICAÇÃO
    # ============================================================================
    APP_NAME: str = "Gestão 360 OL"
    APP_VERSION: str = "3.0.0"
    APP_DESCRIPTION: str = "Sistema de Gestão de Colaboradores, Certificações e Relacionamento"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"  # development, staging, production

    # ============================================================================
    # SUPABASE
    # ============================================================================
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Connection String PostgreSQL direto (opcional)
    DATABASE_URL: Optional[str] = None

    @property
    def postgres_url(self) -> str:
        """URL do PostgreSQL extraída do Supabase"""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # Construir a partir do Supabase URL
        project_ref = self.SUPABASE_URL.split("//")[1].split(".")[0]
        return f"postgresql://postgres:[password]@db.{project_ref}.supabase.co:5432/postgres"

    # ============================================================================
    # JWT / AUTENTICAÇÃO
    # ============================================================================
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 horas
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Senha mínima
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_DIGIT: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True

    # ============================================================================
    # CORS
    # ============================================================================
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]

    # ============================================================================
    # SERVIDOR
    # ============================================================================
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    RELOAD: bool = False  # Apenas em desenvolvimento

    # ============================================================================
    # SEGURANÇA
    # ============================================================================
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000

    # Session
    SESSION_SECRET: str
    SESSION_MAX_AGE: int = 3600  # 1 hora

    # HTTPS
    USE_HTTPS: bool = False

    # ============================================================================
    # UPLOADS / ARQUIVOS
    # ============================================================================
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list[str] = [
        ".pdf", ".doc", ".docx", ".xls", ".xlsx",
        ".jpg", ".jpeg", ".png", ".gif",
        ".zip", ".rar"
    ]

    # ============================================================================
    # ALERTAS E NOTIFICAÇÕES
    # ============================================================================
    ALERT_CHECK_INTERVAL_MINUTES: int = 60  # Rodar job a cada 1 hora

    # Dias de antecedência para alertas
    ALERT_PDI_DAYS: int = 30
    ALERT_ONE_TO_ONE_DAYS: int = 7
    ALERT_CERTIFICATION_EXPIRY_DAYS: int = 30
    ALERT_BIRTHDAY_DAYOFF_DAYS: int = 30
    ALERT_VACATION_EXPIRY_DAYS: int = 60

    # SLA para solicitações (em horas)
    REQUEST_SLA_FERIAS: int = 72
    REQUEST_SLA_DAYOFF: int = 24
    REQUEST_SLA_PDI: int = 48
    REQUEST_SLA_O2O: int = 48

    # ============================================================================
    # BUSINESS RULES
    # ============================================================================
    # PDI
    PDI_MAX_INTERVAL_MONTHS: int = 4

    # 1:1
    ONE_TO_ONE_DEFAULT_FREQUENCY_DAYS: int = 30

    # Férias
    VACATION_MIN_DAYS_PERIOD: int = 5
    VACATION_MAX_DAYS_PERIOD: int = 30
    VACATION_MAX_SELL_DAYS: int = 10
    VACATION_MAX_PERIODS: int = 3
    VACATION_MIN_FIRST_PERIOD_DAYS: int = 14
    VACATION_MAX_TEAM_CONFLICTS: int = 2

    # Visitas a clientes (periodicidade em meses)
    CLIENT_VISIT_FREQUENCY: dict = {
        "DIAMANTE": 3,
        "OURO": 4,
        "PRATA": 6,
        "BRONZE": 12
    }

    # ============================================================================
    # LOGGING
    # ============================================================================
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    LOG_FORMAT: str = "json"  # json ou text
    LOG_FILE: Optional[str] = None

    # ============================================================================
    # EMAIL (Futuro)
    # ============================================================================
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None
    SMTP_TLS: bool = True

    # ============================================================================
    # AUDITORIA / LGPD
    # ============================================================================
    AUDIT_ENABLED: bool = True
    AUDIT_LOG_READS: bool = True  # Logar até leituras de dados sensíveis
    AUDIT_RETENTION_DAYS: int = 365 * 5  # 5 anos

    # PII Masking
    MASK_CPF: bool = True
    MASK_SALARY: bool = True

    # ============================================================================
    # CACHE
    # ============================================================================
    CACHE_ENABLED: bool = True
    CACHE_TTL_SECONDS: int = 300  # 5 minutos

    # ============================================================================
    # DEVELOPMENT / DEBUG
    # ============================================================================
    SHOW_SQL_QUERIES: bool = False
    ENABLE_PROFILER: bool = False
    MOCK_DATA: bool = False  # Nunca em produção!

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Singleton para configurações
    Cached para evitar recarregar do .env
    """
    return Settings()


# Instância global (facilita importação)
settings = get_settings()


# ============================================================================
# VALIDAÇÕES DE AMBIENTE
# ============================================================================

def validate_settings():
    """
    Valida configurações críticas na inicialização
    """
    errors = []

    # Supabase obrigatório
    if not settings.SUPABASE_URL:
        errors.append("SUPABASE_URL não configurado")
    if not settings.SUPABASE_ANON_KEY:
        errors.append("SUPABASE_ANON_KEY não configurado")
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        errors.append("SUPABASE_SERVICE_ROLE_KEY não configurado")

    # JWT obrigatório
    if not settings.JWT_SECRET or len(settings.JWT_SECRET) < 32:
        errors.append("JWT_SECRET deve ter pelo menos 32 caracteres")

    # Frontend URL
    if not settings.FRONTEND_URL:
        errors.append("FRONTEND_URL não configurado")

    # Diretório de uploads
    if not os.path.exists(settings.UPLOAD_DIR):
        try:
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        except Exception as e:
            errors.append(f"Não foi possível criar UPLOAD_DIR: {e}")

    if errors:
        error_msg = "\n".join([f"  - {e}" for e in errors])
        raise ValueError(f"❌ Erros de configuração:\n{error_msg}")

    return True


# ============================================================================
# HELPERS
# ============================================================================

def is_development() -> bool:
    """Verifica se está em modo desenvolvimento"""
    return settings.ENVIRONMENT == "development"


def is_production() -> bool:
    """Verifica se está em modo produção"""
    return settings.ENVIRONMENT == "production"


def get_cors_origins() -> list[str]:
    """Retorna lista de origins permitidos para CORS"""
    origins = settings.CORS_ORIGINS.copy()

    # Adicionar FRONTEND_URL se não estiver na lista
    if settings.FRONTEND_URL not in origins:
        origins.append(settings.FRONTEND_URL)

    # Em desenvolvimento, permitir localhost em várias portas
    if is_development():
        dev_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ]
        origins.extend([o for o in dev_origins if o not in origins])

    return origins


# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

import logging
from logging.handlers import RotatingFileHandler


def configure_logging():
    """Configura o sistema de logging"""

    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Formato
    if settings.LOG_FORMAT == "json":
        import json
        import datetime

        class JsonFormatter(logging.Formatter):
            def format(self, record):
                log_data = {
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "level": record.levelname,
                    "logger": record.name,
                    "message": record.getMessage(),
                }
                if record.exc_info:
                    log_data["exception"] = self.formatException(record.exc_info)
                return json.dumps(log_data)

        formatter = JsonFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )

    # Handler console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    # Handler arquivo (se configurado)
    handlers = [console_handler]
    if settings.LOG_FILE:
        file_handler = RotatingFileHandler(
            settings.LOG_FILE,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)

    # Configurar root logger
    logging.basicConfig(
        level=log_level,
        handlers=handlers
    )

    # Silenciar logs verbosos de bibliotecas
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)


# ============================================================================
# INICIALIZAÇÃO
# ============================================================================

# Validar na importação (se não estiver em testes)
if os.environ.get("TESTING") != "true":
    try:
        validate_settings()
        configure_logging()
    except Exception as e:
        print(f"⚠️ Aviso ao carregar configurações: {e}")
        if is_production():
            raise
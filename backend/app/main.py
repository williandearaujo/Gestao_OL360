import sys
import os
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy.exc import SQLAlchemyError # Import para erro de DB
from sqlalchemy.sql import func # Importar func para timestamp
# Import para o novo health_check
try:
    from app.database import check_database_connection
except ImportError:
    # Fallback se a função ainda não existir
    def check_database_connection():
        return {"status": "error", "message": "check_database_connection not found"}

# ============================================================
# 🧠 CONFIGURAÇÃO BASE
# ============================================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Gestão 360 - OL Tecnologia",
    description="Sistema completo de gestão de colaboradores, conhecimentos e relacionamento empresarial",
    version="2.0.0",
    docs_url="/docs",
    redoc_url=None, # Usaremos o customizado abaixo
)

# ============================================================
# 🌐 MIDDLEWARES - CORS CONFIGURADO
# ============================================================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Adicionar outros domínios de frontend se houver (ex: produção)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info(f"CORS configurado para permitir origens: {origins if origins else '*'}")

app.add_middleware(GZipMiddleware, minimum_size=1000)

# ============================================================
# 📦 IMPORTAÇÃO DOS ROUTERS
# ============================================================
# Importando os módulos de rota e renomeando a variável 'router' de cada um
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.employees import router as employees_router
from app.routers.employee_knowledge import router as employee_knowledge_router
from app.routers.knowledge import router as knowledge_router
from app.routers.areas import router as areas_router
from app.routers.teams import router as teams_router
from app.routers.managers import router as manager_router
from app.routers.alerts import router as alerts_router
from app.routers.vacations import router as vacations_router
from app.routers.day_offs import router as day_offs_router
from app.routers.one_on_ones import router as one_on_ones_router
from app.routers.pdi_logs import router as pdi_router
# Linhas incorretas removidas

# ============================================================
# 📎 INCLUSÃO DOS ROUTERS (Estilo novo, sem prefixo)
# ============================================================
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(employees_router)
app.include_router(employee_knowledge_router)
app.include_router(knowledge_router)
app.include_router(areas_router)
app.include_router(teams_router)
app.include_router(manager_router)
app.include_router(alerts_router)
app.include_router(vacations_router)
app.include_router(day_offs_router)
app.include_router(one_on_ones_router)
app.include_router(pdi_router)
# Linhas incorretas removidas

logger.info("✅ Todos os routers incluídos com sucesso.")

# ============================================================
# 📁 ARQUIVOS ESTÁTICOS
# ============================================================
# Mantendo a versão robusta que verifica o path
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"📁 Servindo arquivos estáticos de: {static_dir}")
else:
    # Se 'app/static' for o caminho correto, ajuste
    static_dir_fallback = "app/static"
    if os.path.exists(static_dir_fallback):
         app.mount("/static", StaticFiles(directory=static_dir_fallback), name="static")
         logger.info(f"📁 Servindo arquivos estáticos de: {static_dir_fallback}")
    else:
        logger.warning(f"⚠️ Diretório de estáticos não encontrado em: {static_dir} ou {static_dir_fallback}")


# ============================================================
# 🌍 ROTAS BÁSICAS / HEALTH CHECK (Sua nova versão)
# ============================================================
@app.get("/", tags=["Sistema"], summary="Rota Raiz", description="Verifica se a API está online.")
async def root():
    return {
        "message": "🚀 Gestão 360 - Sistema de Gestão Completo",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }

@app.get("/health", tags=["Sistema"], summary="Verificação de Saúde", description="Verifica o status da API e do banco de dados.")
async def health_check():
    try:
        db_status = check_database_connection() # Usando sua nova função
        api_status = "healthy" if db_status.get("status") == "healthy" else "unhealthy"
        return {
            "status": api_status,
            "version": "2.0.0",
            "database": db_status,
            "timestamp": datetime.now(timezone.utc).isoformat() # Timestamp dinâmico
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e), "database": "check failed"},
        )

# ============================================================
# ⚠️ TRATAMENTO DE EXCEÇÕES GLOBAIS (Versão robusta)
# ============================================================
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail} for URL: {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database Error: {exc} for URL: {request.url}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Database operation failed", "detail": "Ocorreu um erro ao processar sua solicitação no banco de dados."},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc} for URL: {request.url}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "Ocorreu um erro inesperado no servidor."},
    )

# ============================================================
# 🎨 RE-DOC PERSONALIZADO (Sua nova versão)
# ============================================================
@app.get("/redoc", include_in_schema=False)
async def custom_redoc():
    html_content = """
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Gestão 360 API Docs</title>
        <!-- favicon da OL -->
        <link rel="icon" href="https://ol-tecnologia.com.br/favicon.ico" />
        <style>
          body { margin:0; padding:0; font-family:'Inter',sans-serif; }
          #redoc-container {
            /* Cor de fundo pode ser ajustada */
          }
          .header-bar {
            background:#f1f1f1; /* Um cinza claro para o cabeçalho */
            text-align:center;
            padding:10px;
            border-bottom: 1px solid #ddd;
          }
          .header-bar img {
            height:60px;
          }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <!-- Usando o static que você montou -->
          <img src="/static/lg_t_white.png" alt="Gestão 360 - OL Tecnologia">
        </div>

        <redoc id="redoc-container"
              spec-url="/openapi.json"
              lazy-rendering
              hide-download-button
              theme='{
                "colors": {
                  "primary": { "main": "#e63946" },
                  "text": { "primary": "#1d3557", "secondary": "#457b9d" },
                  "responses": {
                    "success": { "color": "#06d6a0" },
                    "error": { "color": "#ef476f" }
                  }
                },
                "typography": {
                  "fontSize": "15px",
                  "fontFamily": "Inter, sans-serif",
                  "headings": { "fontFamily": "Inter, sans-serif", "fontWeight": "600" }
                }
              }'>
        </redoc>

        <!-- Usando o seu arquivo estático local -->
        <script src="/static/redoc.standalone.js"></script>
      </body>
    </html>
    """
    return HTMLResponse(content=html_content)


# ============================================================
# 🚀 PONTO DE ENTRADA (se rodar diretamente python app/main.py)
# ============================================================
if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("DEBUG", "true").lower() == "true"

    logger.info(f"Iniciando Uvicorn diretamente (host={host}, port={port}, reload={reload})...")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)

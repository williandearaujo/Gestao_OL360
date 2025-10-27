import sys
import os
# --- DEBUG REMOVIDO ---

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
import logging
from sqlalchemy.sql import func # Importar func para timestamp

# ============================================================
# 🧠 CONFIGURAÇÃO BASE
# ============================================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Tenta carregar config antes de criar o app, se necessário
# from app.config import settings # Exemplo

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
# Idealmente, viria de app.config ou .env
# origins = settings.ALLOWED_ORIGINS.split(',') if settings.ALLOWED_ORIGINS else []
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Adicionar outros domínios de frontend se houver (ex: produção)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"], # Permitir tudo se não especificado (CUIDADO em produção)
    allow_credentials=True,
    allow_methods=["*"], # Ou especificar métodos: ["GET", "POST", ...]
    allow_headers=["*"], # Ou especificar headers
)
logger.info(f"CORS configurado para permitir origens: {origins if origins else '*'}")

app.add_middleware(GZipMiddleware, minimum_size=1000)

# ============================================================
# 📦 IMPORTAÇÃO E INCLUSÃO DOS ROUTERS
# ============================================================
# Usar um loop ou import explícito
from app.routers import (
    auth_router, admin_router, employees_router, employee_knowledge_router,
    knowledge_router, areas_router, teams_router, manager_router,
    alerts_router, vacations_router # Adicionar outros conforme criados
)

# Lista de routers para incluir
routers_to_include = [
    (auth_router, "/auth"), # Adicionando prefixo aqui
    (admin_router, "/admin"),
    (employees_router, "/employees"),
    (employee_knowledge_router, "/employee-knowledge"),
    (knowledge_router, "/knowledge"),
    (areas_router, "/areas"),
    (teams_router, "/teams"),
    (manager_router, "/managers"),
    (alerts_router, "/alerts"),
    (vacations_router, "/vacations"),
    # Adicionar outros aqui
]

for router, prefix in routers_to_include:
    app.include_router(router, prefix=prefix) # Incluindo prefixo aqui
    # Log para confirmar
    logger.info(f"✅ Router incluído: {prefix}")


logger.info("✅ Todos os routers incluídos com sucesso.")

# ============================================================
# 📁 ARQUIVOS ESTÁTICOS
# ============================================================
# O diretório 'static' deve estar dentro da pasta 'app'
# Corrigindo path relativo ao arquivo main.py
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"📁 Servindo arquivos estáticos de: {static_dir}")
else:
     logger.warning(f"⚠️ Diretório de estáticos não encontrado em: {static_dir}")


# ============================================================
# 🌍 ROTAS BÁSICAS / HEALTH CHECK
# ============================================================
@app.get("/", tags=["Sistema"], summary="Rota Raiz", description="Verifica se a API está online.")
async def root():
    return {
        "message": "🚀 Gestão 360 - API Online!",
        "version": app.version,
        "docs": app.docs_url,
        "redoc": "/redoc", # Rota customizada abaixo
    }

@app.get("/health", tags=["Sistema"], summary="Verificação de Saúde", description="Verifica o status da API e do banco de dados.")
async def health_check():
    db_status = {"status": "unknown", "message": "DB check not implemented yet"}
    # Implementar verificação real do banco aqui
    # Exemplo:
    # try:
    #     from app.database import get_db_session
    #     async with get_db_session() as db: # Usar async se engine for async
    #          await db.execute(text("SELECT 1")) # Usar await se async
    #     db_status = {"status": "healthy"}
    # except Exception as e:
    #     logger.error(f"Health check - DB connection failed: {e}")
    #     db_status = {"status": "unhealthy", "message": str(e)}
    #     # Retornar 503 se o DB estiver fora?
    #     # return JSONResponse(status_code=503, content={"status": "unhealthy", "database": db_status})

    return {
        "status": "healthy", # API está rodando
        "version": app.version,
        "database": db_status,
        # Usar datetime em vez de func.now() que pode não ser serializável direto
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ============================================================
# ⚠️ TRATAMENTO DE EXCEÇÕES GLOBAIS
# ============================================================
from datetime import datetime, timezone # Importar datetime/timezone

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP Exception: {exc.status_code} - {exc.detail} for URL: {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

# Captura de erro SQLAlchemy (exemplo, refinar)
from sqlalchemy.exc import SQLAlchemyError
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    # Logar o erro real para debug interno
    logger.error(f"Database Error: {exc} for URL: {request.url}", exc_info=True)
    # Retornar mensagem genérica para o cliente
    return JSONResponse(
        status_code=500, # Ou 400 dependendo do erro (ex: constraint violation)
        content={"error": "Database operation failed", "detail": "Ocorreu um erro ao processar sua solicitação no banco de dados."},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc} for URL: {request.url}", exc_info=True) # Log completo
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "Ocorreu um erro inesperado no servidor."},
    )

# ============================================================
# 🎨 RE-DOC PERSONALIZADO (Alternativa ao /docs)
# ============================================================
# Tentar carregar o HTML de um arquivo, com fallback
redoc_html_fallback = """
<!DOCTYPE html>
<html>
<head>
    <title>Gestão 360 API - ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <link rel="icon" type="image/png" href="/static/favicon.png"> <!-- Ajustar path se necessário -->
    <style> body {{ margin: 0; padding: 0; }} </style>
</head>
<body>
    <div id="redoc-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"> </script>
    <script>
        var specUrl = '/openapi.json'; // Pega da configuração do app automaticamente
        Redoc.init(specUrl, { scrollYOffset: 0 }, document.getElementById('redoc-container'))
    </script>
</body>
</html>
"""

redoc_html_path = os.path.join(static_dir, "redoc.html")

@app.get("/redoc", include_in_schema=False)
async def custom_redoc():
    html_content = redoc_html_fallback # Começa com o fallback
    try:
        if os.path.exists(redoc_html_path):
             with open(redoc_html_path, "r", encoding="utf-8") as f:
                # Sobrescreve se o arquivo customizado existir
                html_content = f.read().replace("{openapi_url}", app.openapi_url or "/openapi.json")
        else:
            # Ajusta o fallback com a URL correta do OpenAPI
             html_content = html_content.replace("'/openapi.json'", f"'{app.openapi_url or '/openapi.json'}'")

        return HTMLResponse(content=html_content)

    except Exception as e:
        logger.error(f"Erro ao gerar Redoc customizado: {e}", exc_info=True)
        # Se TUDO falhar, retorna o fallback básico SEM A URL DINÂMICA
        # (Nesse caso extremo, o JS do Redoc pode falhar ao buscar o spec)
        openapi_url = app.openapi_url or "/openapi.json"
        html_basic = f"""
        <!DOCTYPE html><html><head><title>API Docs</title></head>
        <body>Failed to load custom ReDoc. Trying basic fallback.
        <div id="redoc-container"></div>
        <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
        <script>Redoc.init('{openapi_url}', {{}}, document.getElementById('redoc-container'))</script>
        </body></html>"""
        return HTMLResponse(content=html_basic, status_code=500)


# ============================================================
# 🚀 PONTO DE ENTRADA (se rodar diretamente python app/main.py)
# ============================================================
if __name__ == "__main__":
    import uvicorn
    # Carregar configurações de forma mais robusta (ex: Pydantic Settings)
    # from app.config import settings
    # host = settings.HOST
    # port = settings.PORT

    # Valores default para execução direta
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("DEBUG", "true").lower() == "true" # Usar DEBUG para reload

    logger.info(f"Iniciando Uvicorn diretamente (host={host}, port={port}, reload={reload})...")

    uvicorn.run("app.main:app", host=host, port=port, reload=reload)


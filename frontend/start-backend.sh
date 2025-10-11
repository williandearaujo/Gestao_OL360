#!/bin/bash
cd backend
source venv/bin/activate
echo "🚀 Iniciando Backend FastAPI em http://localhost:8000"
echo "📖 Documentação: http://localhost:8000/docs"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

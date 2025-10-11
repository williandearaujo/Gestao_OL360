# 🚀 Sistema Gestão 360 OL

Sistema completo de gestão de colaboradores, certificações e relacionamento com clientes.

## 📋 Tecnologias

- **Backend**: Python 3.13+ / FastAPI / PostgreSQL (Supabase)
- **Frontend**: Next.js 14+ / React / TypeScript / Tailwind CSS
- **Auth**: JWT / RBAC field-level
- **Database**: PostgreSQL com Row Level Security (RLS)

## 🎯 Funcionalidades

- ✅ Gestão completa de colaboradores
- ✅ PDI e reuniões 1:1
- ✅ Férias com regras CLT
- ✅ Day-off de aniversário
- ✅ Catálogo de certificações
- ✅ Gestão de clientes e visitas
- ✅ Sistema de alertas inteligente
- ✅ Workflow de solicitações
- ✅ Auditoria completa (LGPD)
- ✅ Dashboard e relatórios

## 🚀 Quick Start

### 1. Configure o banco de dados
```bash
# Acesse: https://supabase.com/dashboard
# Vá no SQL Editor e execute o schema SQL fornecido
```

### 2. Configure as variáveis de ambiente
```bash
# Edite backend/.env e substitua:
# - [PASSWORD] pela senha do Supabase
# - JWT_SECRET por um valor seguro (32+ caracteres)
```

### 3. Inicie os serviços
```bash
# Opção 1: Ambos de uma vez (requer tmux)
./start-all.sh

# Opção 2: Em terminais separados
./start-backend.sh   # Terminal 1
./start-frontend.sh  # Terminal 2
```

### 4. Acesse o sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs

### 5. Login padrão
```
Email: admin@ol360.com
Senha: Admin@123456
```

## 📁 Estrutura do Projeto

```
Gestao_OL_360/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── core/        # Security, config
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── routers/     # API endpoints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helpers
│   ├── migrations/      # SQL migrations
│   └── tests/          # Testes
│
└── frontend/            # App Next.js
    └── src/
        ├── app/         # Pages (App Router)
        ├── components/  # React components
        ├── lib/         # Utilities, API client
        └── hooks/       # Custom hooks
```

## 🔧 Comandos Úteis

### Backend
```bash
cd backend
source venv/bin/activate

# Iniciar servidor
uvicorn app.main:app --reload

# Rodar testes
pytest

# Criar migração
alembic revision --autogenerate -m "description"

# Aplicar migrações
alembic upgrade head
```

### Frontend
```bash
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

## 📚 Documentação

- [Guia Completo de Setup](docs/SETUP.md)
- [Documentação da API](docs/API.md)
- [Schema do Banco](docs/DATABASE.md)
- [Guia do Usuário](docs/USER_GUIDE.md)

## 🔐 Roles de Acesso

- **DIRETORIA**: Acesso total a todos os dados
- **GERENTE**: Gerencia seus subordinados diretos
- **COLABORADOR**: Visualiza dados não sensíveis, gerencia próprios dados
- **ADMIN_GESTAO**: Administra usuários e configurações (sem acesso a dados sensíveis)

## 🛡️ Segurança

- ✅ Autenticação JWT
- ✅ RBAC com controle field-level
- ✅ Row Level Security (RLS) no PostgreSQL
- ✅ Auditoria completa de ações
- ✅ Rate limiting
- ✅ LGPD compliance

## 📊 Banco de Dados

O sistema usa PostgreSQL via Supabase com:
- 20+ tabelas relacionadas
- Row Level Security (RLS)
- Triggers de auditoria
- Views otimizadas
- Funções SQL para cálculos

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📝 License

Propriedade de OL Tecnologia

## 👥 Autores

- **Desenvolvimento**: Sistema Gestão 360 OL
- **Empresa**: OL Tecnologia

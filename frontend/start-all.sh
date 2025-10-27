#!/bin/bash

echo "🚀 Iniciando Gestão 360 OL..."

# Verificar se tmux está instalado
if command -v tmux &> /dev/null; then
    echo "   Usando tmux para gerenciar sessões"
    tmux new-session -d -s gestao360-backend './start-backend.sh'
    tmux new-session -d -s gestao360-frontend './start-frontend.sh'
    
    echo ""
    echo "✅ Serviços iniciados em sessões tmux separadas!"
    echo ""
    echo "   Para acessar o backend:  tmux attach -t gestao360-backend"
    echo "   Para acessar o frontend: tmux attach -t gestao360-frontend"
    echo ""
    echo "   Para sair do tmux: Ctrl+B, depois D"
    echo "   Para parar tudo: tmux kill-session -t gestao360-backend && tmux kill-session -t gestao360-frontend"
    
else
    echo "   Iniciando em terminais separados..."
    echo ""
    echo "⚠️  Abra 2 terminais e execute:"
    echo "   Terminal 1: ./start-backend.sh"
    echo "   Terminal 2: ./start-frontend.sh"
fi

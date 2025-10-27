#!/bin/bash

# Script de correção de encoding UTF-8
# Corrige caracteres corrompidos em arquivos Python

echo "🔧 Iniciando correção de encoding UTF-8..."

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de arquivos corrigidos
count=0

# Função para corrigir um arquivo
fix_file() {
    local file=$1

    echo -n "Processando: $file ... "

    # Criar backup
    cp "$file" "$file.bak"

    # Aplicar correções
    sed -i 's/Ã§/ç/g' "$file"
    sed -i 's/Ã£/ã/g' "$file"
    sed -i 's/Ã©/é/g' "$file"
    sed -i 's/Ã¡/á/g' "$file"
    sed -i 's/Ã­/í/g' "$file"
    sed -i 's/Ã³/ó/g' "$file"
    sed -i 's/Ãº/ú/g' "$file"
    sed -i 's/Ã¢/â/g' "$file"
    sed -i 's/Ãª/ê/g' "$file"
    sed -i 's/Ã´/ô/g' "$file"
    sed -i 's/Ã/à/g' "$file"
    sed -i 's/Ãµ/õ/g' "$file"
    sed -i 's/â€¢/•/g' "$file"
    sed -i 's/â†'/→/g' "$file"
    sed -i 's/ðŸ/🔥/g' "$file"
    sed -i 's/âœ…/✅/g' "$file"
    sed -i 's/â�'/✅/g' "$file"
    sed -i 's/ðŸ"š/📚/g' "$file"
    sed -i 's/ðŸš€/🚀/g' "$file"

    ((count++))
    echo -e "${GREEN}✓${NC}"
}

# Encontrar e corrigir todos os arquivos Python
echo "Buscando arquivos Python..."
while IFS= read -r -d '' file; do
    if grep -q "Ã§\|Ã£\|Ã©\|â€¢\|ðŸ" "$file"; then
        fix_file "$file"
    fi
done < <(find backend/app -name "*.py" -type f -print0)

echo ""
echo -e "${GREEN}✅ Correção concluída!${NC}"
echo -e "Arquivos corrigidos: ${YELLOW}$count${NC}"
echo ""
echo "Os arquivos originais foram salvos com extensão .bak"
echo "Para remover os backups: rm backend/app/**/*.bak"
#!/bin/bash

# Script para criar releases com Git tags
# Uso: ./scripts/release.sh [patch|minor|major]

set -e

# Verificar se o argumento foi fornecido
if [ $# -eq 0 ]; then
    echo "Uso: $0 [patch|minor|major]"
    echo "  patch: 0.1.0 -> 0.1.1 (correções)"
    echo "  minor: 0.1.0 -> 0.2.0 (novas funcionalidades)"
    echo "  major: 0.1.0 -> 1.0.0 (mudanças quebram compatibilidade)"
    exit 1
fi

TYPE=$1

# Verificar se o tipo é válido
if [[ ! "$TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Erro: Tipo deve ser patch, minor ou major"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "Erro: Há mudanças não commitadas. Faça commit antes de criar um release."
    exit 1
fi

# Obter a versão atual do package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Calcular nova versão
if [ "$TYPE" = "patch" ]; then
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2"."$3+1}')
elif [ "$TYPE" = "minor" ]; then
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2+1".0"}')
elif [ "$TYPE" = "major" ]; then
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1+1".0.0"}')
fi

echo "Versão atual: $CURRENT_VERSION"
echo "Nova versão: $NEW_VERSION"
echo "Tipo de release: $TYPE"

# Confirmar com o usuário
read -p "Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelado."
    exit 1
fi

# Atualizar versão no package.json
npm version $NEW_VERSION --no-git-tag-version

# Fazer commit das mudanças
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Criar tag
git tag -a "v$NEW_VERSION" -m "Release $NEW_VERSION"

# Fazer push das mudanças e tags
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Release $NEW_VERSION criado com sucesso!"
echo "📝 Tag: v$NEW_VERSION"
echo "🚀 Deploy automático iniciado..." 
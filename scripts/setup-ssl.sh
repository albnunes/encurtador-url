#!/bin/bash

# Script para configurar SSL para alberto-api.xyz
# Autor: albnunes

set -e

echo "🔐 Configurando SSL para alberto-api.xyz..."

# Criar diretórios necessários
echo "📁 Criando diretórios para certificados SSL..."
mkdir -p ssl
mkdir -p ssl-logs

# Verificar se o domínio está apontando para o servidor
echo "🌐 Verificando se o domínio alberto-api.xyz está configurado..."
if ! nslookup alberto-api.xyz > /dev/null 2>&1; then
    echo "❌ Erro: Não foi possível resolver o domínio alberto-api.xyz"
    echo "Certifique-se de que o DNS está configurado corretamente."
    exit 1
fi

echo "✅ Domínio resolvido com sucesso!"

# Iniciar serviços básicos primeiro
echo "🚀 Iniciando serviços básicos..."
docker-compose -f docker-compose.prod.yml up -d db backend

# Aguardar um pouco para os serviços iniciarem
sleep 10

# Iniciar nginx
echo "🌐 Iniciando nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Aguardar nginx estar pronto
sleep 5

# Obter certificados SSL
echo "🔒 Obtendo certificados SSL do Let's Encrypt..."
docker-compose -f docker-compose.prod.yml run --rm certbot

# Verificar se os certificados foram obtidos
if [ -f "ssl/live/alberto-api.xyz/fullchain.pem" ]; then
    echo "✅ Certificados SSL obtidos com sucesso!"
else
    echo "❌ Erro ao obter certificados SSL"
    echo "Verifique se:"
    echo "1. O domínio alberto-api.xyz está apontando para este servidor"
    echo "2. A porta 80 está acessível externamente"
    echo "3. O email admin@alberto-api.xyz é válido"
    exit 1
fi


echo "🔄 Reiniciando nginx com SSL..."
docker-compose -f docker-compose.prod.yml restart nginx

echo "🎉 SSL configurado com sucesso!"
echo "🌐 Seu site agora está disponível em: https://alberto-api.xyz"

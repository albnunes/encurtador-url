echo "Configurando variáveis de ambiente..."

if [ ! -f .env ]; then
    echo "Criando .env para backend..."
    cat > .env << EOF
# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=encurtador

# JWT Configuration
JWT_SECRET=devsecret
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Frontend Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Encurtaador
VITE_APP_VERSION=1.0.0
FRONTEND_PORT=8080
EOF
    echo "✅ Arquivo .env criado para backend"
else
    echo "⚠️  Arquivo .env já existe para backend"
fi

if [ ! -f frontend/.env ]; then
    echo "Criando .env para frontend..."
    cat > frontend/.env << EOF
# URL da API backend
VITE_API_URL=http://localhost:3000

# Configurações do ambiente
VITE_APP_NAME=Encurtaador
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ Arquivo .env criado para frontend"
else
    echo "⚠️  Arquivo .env já existe para frontend"
fi

echo "Configuração de ambiente concluída!"
echo ""
echo "Para usar com Docker Compose:"
echo "  docker-compose up"
echo ""
echo "Para desenvolvimento local:"
echo "  npm run start:dev" 
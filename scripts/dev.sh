echo "Iniciando backend"

# Iniciar PostgreSQL
echo "🐳 Iniciando PostgreSQL..."
docker-compose up -d db

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL estar pronto..."
sleep 5

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build e executar migrations
echo "🔨 Fazendo build..."
npm run build

echo "🗄️ Executando migrations..."
npm run migration:run

# Iniciar backend
echo "🚀 Iniciando backend em http://localhost:3000"
npm run dev 
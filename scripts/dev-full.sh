

echo "🚀 Iniciando backend e frontend..."


if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi


echo "🐳 Iniciando PostgreSQL..."
docker-compose up -d db


echo "⏳ Aguardando PostgreSQL estar pronto..."
sleep 5


if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi


echo "🔨 Fazendo build do backend..."
npm run build

echo "🗄️ Executando migrations..."
npm run migration:run


echo "🔨 Fazendo build do frontend..."
cd frontend && npm run build && cd ..


echo "🚀 Iniciando aplicação completa..."
echo "🌐 Backend: http://localhost:3000"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Para parar: Ctrl+C"

npm run dev:full 
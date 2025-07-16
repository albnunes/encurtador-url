


cp env.dev .env
cp env.dev frontend/.env


docker compose -f docker-compose.dev.yml up -d

echo "🚀 Aplicação rodando em modo desenvolvimento!"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend: http://localhost:3000"
echo "📚 Swagger: http://localhost:3000/api" 
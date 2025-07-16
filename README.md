# Encurtador - Sistema de Encurtamento de URLs

## Resumo

Sistema completo de encurtamento de URLs desenvolvido com **Node.js/NestJS** e **Svelte**, seguindo arquitetura limpa e boas práticas. Permite encurtar URLs com ou sem autenticação, contabiliza acessos e oferece dashboard para gestão.



## Como Rodar

### Clonar o Projeto

**Importante:** Este projeto usa Git Submodules. Para clonar tudo de uma vez:

```bash
# Clonar com submodules (RECOMENDADO)
git clone --recursive https://github.com/albnunes/encurtador-url.git
cd encurtador-url

# OU se já clonou sem submodules, execute:
git submodule update --init --recursive
```

### Docker (Recomendado)

```bash
git clone --recursive https://github.com/albnunes/encurtador-url.git
cd encurtador-url
chmod +x scripts/setup-env.sh  
docker-compose up --build
```

**Nota:** Se encontrar erro de permissão ao executar `npm run docker:build`, execute primeiro:

```bash
chmod +x scripts/setup-env.sh
```

**Acessos:**

- Frontend: http://localhost:8080
- API: http://localhost:3000
- Swagger: http://localhost:3000/api

### Desenvolvimento Local

```bash
# Backend
npm install
cp env.example .env
npm run migration:run
npm run dev

# Frontend (após clonar com submodules)
cd frontend
npm install
cp env.example .env
npm run dev
```

### Migrations

Para gerenciar o banco de dados, use os comandos:

```bash
# Gerar migration baseada nas mudanças das entities
npm run migration:generate -- src/database/migrations/NomeDaMigration

# Executar migrations
npm run migration:run

# Ver status das migrations
npm run migration:show

# Reverter última migration
npm run migration:revert


### Gerenciando Submodules

Para atualizar o frontend para a versão mais recente:

```bash
# Atualizar todos os submodules
git submodule update --remote

# OU atualizar apenas o frontend
git submodule update --remote frontend
```



## Funcionalidades

### 🔐 Autenticação

- Cadastro/login com email e senha
- JWT para autenticação
- Proteção de rotas

### 🔗 Encurtador

- Endpoint público para URLs anônimas
- URLs vinculadas ao usuário quando autenticado
- Slugs únicos (máx 6 caracteres)
- Contabilização de cliques
- CRUD completo para usuários autenticados

### 📊 Dashboard

- Estatísticas de acessos
- Geração de QR Codes
- Gestão de URLs

## Stack

- **Backend**: Node.js, NestJS, TypeScript, PostgreSQL, TypeORM
- **Frontend**: Svelte, Vite
- **Infra**: Docker, Docker Compose, Nginx
- **Testes**: Jest
- **Docs**: Swagger/OpenAPI

## Arquitetura

- **Clean Architecture** com separação de responsabilidades
- **Domain-Driven Design**
- **Repository Pattern**
- **RESTful API** (Maturidade 2)
- **Monorepo** com backend e frontend como submodules

## Deploy

Sistema pronto para deploy em cloud providers com Docker Compose. Inclui health checks, logs estruturados e configurações de segurança (CORS, rate limiting, JWT).

## Melhorias Futuras

- Escalabilidade horizontal com microserviços
- Cache com Redis
- CDN para assets
- Comunicação entre serviços via REST ou mensageria
- Implementação de WebSockets para atualizações em tempo real
- Sistema de notificações para usuários
- Analytics avançados com métricas detalhadas

## 📋 Releases

### Histórico de Releases:

- **v0.4.0** - Contabilização de acessos e analytics
- **v0.3.0** - Edição/remoção/listagem de URLs por usuário
- **v0.2.0** - Sistema de autenticação
- **v0.1.0** - Encurtador funcional básico

Veja o [CHANGELOG.md](./CHANGELOG.md) para detalhes completos.

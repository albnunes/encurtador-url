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
chmod +x scripts/setup-env.sh

scripts/setup-env.sh

docker-compose -f docker-compose.dev.yml up --build -d 
```

**Para usuários Windows:**

Se estiver no Windows, copie os arquivos de ambiente manualmente:

```bash
# Na raiz do projeto
copy env.dev .env

# Na pasta frontend
cd frontend

copy env.example .env

cd ..

docker-compose -f docker-compose.dev.yml up --build -d 

**Acessos:**

- Frontend: http://localhost:8080
- API: http://localhost:3000
- Swagger: http://localhost:3000/api

### Links para acesso

- **API**: https://alberto-api.xyz
- **Frontend**: https://encurtaador.vercel.app



### Gerenciando Submodules

Para atualizar o frontend para a versão mais recente:

```bash
# Atualizar todos os submodules
git submodule update --remote

# OU atualizar apenas o frontend
git submodule update --remote frontend
````

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

## Melhorias Futuras

- Escalabilidade horizontal com microserviços
- Implementação de WebSockets para atualizações em tempo real
- Analytics avançados com métricas detalhadas

## 📋 Releases

### Histórico de Releases:

- **v0.4.0** - Contabilização de acessos
- **v0.3.0** - Edição/remoção/listagem de URLs por usuário
- **v0.2.0** - Sistema de autenticação
- **v0.1.0** - Encurtador funcional básico

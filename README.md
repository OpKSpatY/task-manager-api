# Task Manager API

API REST para gerenciamento de tarefas em equipe: usuários, organizações, times, projetos, sprints e tarefas com checklists. Desenvolvida com [NestJS](https://nestjs.com) e TypeScript.

## O que esta API faz

- **Autenticação**: registro, login e verificação de token JWT.
- **Usuários**: CRUD de usuários e perfil do usuário autenticado.
- **Organizações**: criar organizações, adicionar/remover usuários e gerenciar permissões (admin/membro).
- **Times**: criar times, adicionar/remover membros (dono do time).
- **Projetos**: projetos vinculados a organizações e times, com sprints, tarefas, dependências entre tarefas, checklists e itens de checklist.

A maior parte dos endpoints exige autenticação via Bearer JWT. A documentação interativa fica em `/api` (Swagger).

## Tecnologias

| Área            | Stack                          |
|-----------------|--------------------------------|
| Backend         | NestJS, TypeScript, Node.js    |
| Banco de dados  | PostgreSQL, Sequelize         |
| Autenticação    | JWT, Passport                 |
| Validação       | class-validator, class-transformer |
| Documentação   | Swagger/OpenAPI               |
| Infra           | Docker, Docker Compose        |

## Pré-requisitos

- **Node.js** 18+ e npm
- **PostgreSQL** 15 (recomendado via Docker)
- **Docker** e **Docker Compose** (para subir o banco)

## Como inicializar

### 1. Instalar dependências

```bash
npm install
```

### 2. Subir o banco de dados

Com Docker Compose (Linux/macOS ou Git Bash no Windows):

```bash
docker-compose up -d
```

No Windows (PowerShell/CMD), use diretamente:

```bash
docker-compose up -d
```

O PostgreSQL sobe na porta **5432** com usuário `admin`, senha `root` e banco `task_manager_db`.

### 3. Configurar variáveis de ambiente

```bash
cp env.example .env
```

Edite o `.env` se precisar (host, porta, usuário, senha, `JWT_SECRET`, `PORT`). Os valores padrão do `env.example` batem com o `docker-compose.yml`.

### 4. Rodar as migrations

```bash
npm run db:migrate
```

### 5. Iniciar a aplicação

```bash
npm run start:dev
```

A API fica em **http://localhost:3000** (ou na `PORT` do `.env`).
Documentação Swagger: **http://localhost:3000/api**.

---

## Comandos úteis

### Aplicação

```bash
npm run start          # Produção (build + node)
npm run start:dev      # Desenvolvimento com watch
npm run start:debug    # Debug com watch
npm run build          # Build para produção
```

### Migrations (Sequelize)

```bash
npm run db:migrate         # Executa migrations
npm run db:migrate:undo    # Desfaz a última migration
npm run db:migrate:reset   # Desfaz todas as migrations
npm run db:status          # Status das migrations
```

### Docker (banco)

Se você usar o `docker-scripts.sh` (bash):

```bash
./docker-scripts.sh start    # Inicia o PostgreSQL
./docker-scripts.sh stop     # Para
./docker-scripts.sh restart  # Reinicia
./docker-scripts.sh status   # Status dos containers
./docker-scripts.sh logs     # Logs do PostgreSQL
./docker-scripts.sh reset    # Reseta o banco (apaga dados)
```

Ou use diretamente:

```bash
docker-compose up -d    # Subir
docker-compose down     # Parar
docker-compose ps       # Status
```

### Testes

```bash
npm run test        # Testes unitários
npm run test:e2e    # Testes e2e
npm run test:cov    # Cobertura
```

### Lint e formatação

```bash
npm run lint        # ESLint
npm run format      # Prettier
```

## Documentação da API (Swagger)

Com a aplicação rodando, acesse:

**http://localhost:3000/api**

Fluxo sugerido:

1. **Registrar**: `POST /users/register` (nome, email, senha).
2. **Login**: `POST /auth/login` (email, senha) → recebe `accessToken`.
3. **Autorizar**: no Swagger, clique em **Authorize** e informe `Bearer <accessToken>`.
4. Testar os demais endpoints (organizations, teams, projects, etc.).

Guia detalhado: [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md).
Resumo de rotas em texto: [src/docs/API_ROUTES.md](src/docs/API_ROUTES.md).

## Estrutura dos módulos

- **auth** – login, registro, verificação de token, perfil.
- **users** – CRUD de usuários e perfil (`/users/me/profile`).
- **organizations** – CRUD de organizações e gestão de usuários (roles).
- **teams** – CRUD de times e membros.
- **projects** – projetos, sprints, tarefas, checklists e itens de checklist.

Permissões são verificadas por organização/time/projeto conforme regras de negócio (criador, admin, membro).

## Documentação adicional

- [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md) – uso do Swagger.
- [src/docs/API_ROUTES.md](src/docs/API_ROUTES.md) – rotas de usuários e auth (exemplos).
- [src/docs/EXEMPLO_API_PROJETOS.md](src/docs/EXEMPLO_API_PROJETOS.md) – exemplos de uso da API de projetos.
- [src/database/init/](src/database/init/) – notas sobre Docker e configuração do banco.

## Licença

MIT.

# Configuração do DBeaver para PostgreSQL

## Credenciais de Conexão

### Configurações de Conexão:
- **Tipo de Banco**: PostgreSQL
- **Host**: `localhost`
- **Porta**: `5432`
- **Database**: `task_manager_db`
- **Username**: `admin`
- **Password**: `root`

## Passo a Passo no DBeaver

### 1. Criar Nova Conexão
1. Clique em "Nova Conexão" (ícone de plug)
2. Selecione "PostgreSQL"

### 2. Configurar Conexão
- **Server Host**: `localhost`
- **Port**: `5432`
- **Database**: `task_manager_db`
- **Username**: `admin`
- **Password**: `root`

### 3. Testar Conexão
- Clique em "Test Connection" para verificar se está funcionando

### 4. Salvar e Conectar
- Clique em "Finish" para salvar a conexão

## Configurações Avançadas (opcional)

**Driver Properties:**
- `ssl`: `false` (para desenvolvimento local)
- `sslmode`: `disable`

**Connection Properties:**
- `ApplicationName`: `DBeaver - Task Manager`

## Estrutura que você verá

Após conectar, você encontrará:
- **Databases**: `task_manager_db`
- **Schemas**: `public`
- **Extensions**: `uuid-ossp`

## Comandos úteis para verificar

Se quiser testar via linha de comando:
```bash
# Conectar diretamente ao container
docker exec -it task-manager-postgres psql -U admin -d task_manager_db

# Comandos úteis:
\dt          # Listar tabelas
\du          # Listar usuários
\dx          # Listar extensões
\q           # Sair
```

## Troubleshooting

### Se não conseguir conectar:
1. Verifique se o banco está rodando: `./docker-scripts.sh status`
2. Verifique os logs: `./docker-scripts.sh logs`
3. Reinicie o banco: `./docker-scripts.sh restart`
4. Limpe o cache: `./docker-scripts.sh cleanup`

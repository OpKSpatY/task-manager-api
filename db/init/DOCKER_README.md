# Configuração do Banco de Dados PostgreSQL com Docker

## Pré-requisitos
- Docker instalado
- Docker Compose instalado

## Como usar

### 1. Iniciar o banco de dados
```bash
docker-compose up -d
```

### 2. Verificar se os containers estão rodando
```bash
docker-compose ps
```

### 3. Parar os containers
```bash
docker-compose down
```

### 4. Parar e remover volumes (cuidado: isso apaga os dados)
```bash
docker-compose down -v
```

## Configurações do Banco

- **Host**: localhost
- **Porta**: 5432
- **Database**: task_manager_db
- **Usuário**: admin
- **Senha**: root
- **Dialect**: postgres

## Scripts de Gerenciamento

Use o script `docker-scripts.sh` para facilitar o gerenciamento:

```bash
# Iniciar banco
./docker-scripts.sh start

# Parar banco
./docker-scripts.sh stop

# Reiniciar banco
./docker-scripts.sh restart

# Ver status
./docker-scripts.sh status

# Ver logs
./docker-scripts.sh logs

# Resetar banco (cuidado!)
./docker-scripts.sh reset

# Limpar cache do Docker
./docker-scripts.sh cleanup
```

## Estrutura de Pastas
```
db/
├── init/          # Scripts de inicialização do banco
└── migrations/    # Migrations do Sequelize (será criada)
```

## Próximos Passos
1. Copie o arquivo `env.example` para `.env`
2. Instale as dependências do Sequelize
3. Configure as migrations
4. Execute as migrations

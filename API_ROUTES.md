# API Routes - Task Manager

## Base URL
```
http://localhost:3000
```

## Rotas de Usuários

### 1. Registrar Usuário
**POST** `/users/register`

**Body:**
```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "password": "123456"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "uuid-gerado",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@example.com",
    "lastLoginAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "fullName": "João Silva"
  }
}
```

### 2. Listar Todos os Usuários
**GET** `/users`

**Resposta (200):**
```json
{
  "message": "Usuários listados com sucesso",
  "users": [
    {
      "id": "uuid",
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao@example.com",
      "lastLoginAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "fullName": "João Silva"
    }
  ],
  "count": 1
}
```

### 3. Buscar Usuário por ID
**GET** `/users/:id`

**Resposta (200):**
```json
{
  "message": "Usuário encontrado com sucesso",
  "user": {
    "id": "uuid",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@example.com",
    "lastLoginAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "fullName": "João Silva"
  }
}
```

## Validações

### CreateUserDto
- `firstName`: string obrigatório, máximo 255 caracteres
- `lastName`: string obrigatório, máximo 255 caracteres
- `email`: email válido obrigatório, máximo 255 caracteres, único
- `password`: string obrigatório, mínimo 6 caracteres, máximo 255 caracteres

## Códigos de Erro

- **400**: Dados inválidos (validação falhou)
- **409**: Email já está em uso
- **404**: Usuário não encontrado
- **500**: Erro interno do servidor

## Testando com curl

```bash
# Registrar usuário
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@example.com",
    "password": "123456"
  }'

# Listar usuários
curl http://localhost:3000/users

# Buscar usuário por ID
curl http://localhost:3000/users/UUID_DO_USUARIO
```


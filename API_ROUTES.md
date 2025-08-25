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

**Headers:**
```
Authorization: Bearer <token>
```

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

**Headers:**
```
Authorization: Bearer <token>
```

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

### 4. Obter Meu Perfil
**GET** `/users/me/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "message": "Seu perfil",
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

## Rotas de Autenticação

### 1. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "joao@example.com",
  "password": "123456"
}
```

**Resposta (200):**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "uuid",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@example.com",
    "lastLoginAt": "2024-01-01T12:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "fullName": "João Silva"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 2. Verificar Token
**GET** `/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "message": "Token válido",
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "firstName": "João",
    "lastName": "Silva"
  }
}
```

### 3. Obter Perfil
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "message": "Perfil do usuário",
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "firstName": "João",
    "lastName": "Silva"
  }
}
```

## Códigos de Erro

- **400**: Dados inválidos (validação falhou)
- **401**: Não autorizado (credenciais inválidas ou token inválido)
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


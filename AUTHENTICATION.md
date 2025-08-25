# Autenticação JWT - Task Manager API

## Visão Geral

Esta API utiliza autenticação JWT (JSON Web Token) para proteger rotas e gerenciar sessões de usuários.

## Como Funciona

### 1. Registro de Usuário
Primeiro, o usuário precisa se registrar:
```bash
POST /users/register
{
  "firstName": "João",
  "lastName": "Silva", 
  "email": "joao@example.com",
  "password": "123456"
}
```

### 2. Login
Após o registro, o usuário pode fazer login:
```bash
POST /auth/login
{
  "email": "joao@example.com",
  "password": "123456"
}
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 3. Usar o Token
Para acessar rotas protegidas, inclua o token no header:
```bash
GET /users/me/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rotas Protegidas

As seguintes rotas requerem autenticação JWT:

- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `GET /users/me/profile` - Obter meu perfil
- `GET /auth/profile` - Obter perfil do usuário autenticado
- `GET /auth/verify` - Verificar se o token é válido

## Rotas Públicas

- `POST /users/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login

## Configuração JWT

As configurações JWT estão no arquivo `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

## Estrutura do Token

O JWT contém as seguintes informações:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Tratamento de Erros

### 401 Unauthorized
- Token não fornecido
- Token inválido
- Token expirado
- Credenciais inválidas no login

### 403 Forbidden
- Usuário não tem permissão para acessar o recurso

## Exemplo de Uso Completo

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"João","lastName":"Silva","email":"joao@example.com","password":"123456"}'

# 2. Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"123456"}'

# 3. Usar token para acessar rota protegida
curl -X GET http://localhost:3000/users/me/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Segurança

- Senhas são criptografadas com bcrypt
- Tokens expiram em 24 horas
- Use HTTPS em produção
- Altere o JWT_SECRET em produção
- Implemente rate limiting para endpoints de autenticação

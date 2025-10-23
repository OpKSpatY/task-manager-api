# Exemplo de Requisições para API de Projetos

## 1. Criar Projeto

### Endpoint
```
POST http://localhost:3000/projects/create
```

### Headers
```
Content-Type: application/json
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### Body da Requisição
```json
{
  "name": "Meu Projeto de Teste",
  "description": "Descrição do projeto de teste",
  "isProjectVisible": true,
  "organizationId": "934b48c3-bef5-4f21-8d41-9a3260cf1055",
  "dueTime": "2024-12-31T23:59:59.000Z",
  "teamAssignmentId": "123e4567-e89b-12d3-a456-426614174001",
  "userId": "66118f12-f91b-437b-92c6-d3e493a918ca"
}
```

## 2. Listar Todos os Projetos

### Endpoint
```
GET http://localhost:3000/projects?userId=66118f12-f91b-437b-92c6-d3e493a918ca
```

### Headers
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### Parâmetros de Query
- `userId`: ID do usuário (obrigatório)

## 3. Buscar Projeto Específico

### Endpoint
```
GET http://localhost:3000/projects/753d6ff5-51fb-4b49-ba79-c8fd70fdd0f2?userId=66118f12-f91b-437b-92c6-d3e493a918ca
```

### Headers
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### Parâmetros
- `id`: ID do projeto (na URL)
- `userId`: ID do usuário (query parameter)

## 4. Atualizar Projeto

### Endpoint
```
PUT http://localhost:3000/projects/753d6ff5-51fb-4b49-ba79-c8fd70fdd0f2?userId=66118f12-f91b-437b-92c6-d3e493a918ca
```

### Headers
```
Content-Type: application/json
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### Body da Requisição
```json
{
  "name": "Nome Atualizado do Projeto",
  "description": "Nova descrição",
  "isProjectVisible": false,
  "dueTime": "2024-12-31T23:59:59.000Z"
}
```

### Parâmetros
- `id`: ID do projeto (na URL)
- `userId`: ID do usuário (query parameter)

## 5. Excluir Projeto

### Endpoint
```
DELETE http://localhost:3000/projects/753d6ff5-51fb-4b49-ba79-c8fd70fdd0f2?userId=66118f12-f91b-437b-92c6-d3e493a918ca
```

### Headers
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

### Parâmetros
- `id`: ID do projeto (na URL)
- `userId`: ID do usuário (query parameter)

## Campos Obrigatórios por Operação

### Criar Projeto
- `name`: Nome do projeto
- `organizationId`: ID da organização
- `userId`: ID do usuário (no body)

### Listar Projetos
- `userId`: ID do usuário (query parameter)

### Buscar/Atualizar/Excluir Projeto
- `id`: ID do projeto (na URL)
- `userId`: ID do usuário (query parameter)

## Campos Opcionais (Apenas para Criar/Atualizar)
- `description`: Descrição do projeto
- `isProjectVisible`: Visibilidade (padrão: true)
- `dueTime`: Data limite para conclusão
- `teamAssignmentId`: ID do time atribuído

## Resposta de Sucesso (201) - Criar Projeto
```json
{
  "id": "novo-uuid-do-projeto",
  "name": "Meu Projeto de Teste",
  "description": "Descrição do projeto de teste",
  "isProjectVisible": true,
  "organizationId": "934b48c3-bef5-4f21-8d41-9a3260cf1055",
  "dueTime": "2024-12-31T23:59:59.000Z",
  "teamAssignmentId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2025-10-23T13:00:00.000Z",
  "updatedAt": "2025-10-23T13:00:00.000Z",
  "organization": {
    "id": "934b48c3-bef5-4f21-8d41-9a3260cf1055",
    "name": "Nome da Organização",
    "description": "Descrição da organização"
  },
  "teamAssignment": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "name": "Nome do Time",
    "description": "Descrição do time"
  }
}
```

## Resposta de Sucesso (200) - Listar Projetos
```json
[
  {
    "id": "753d6ff5-51fb-4b49-ba79-c8fd70fdd0f2",
    "name": "Projeto 1",
    "description": "Descrição do projeto 1",
    "isProjectVisible": true,
    "organizationId": "934b48c3-bef5-4f21-8d41-9a3260cf1055",
    "dueTime": "2024-12-31T23:59:59.000Z",
    "teamAssignmentId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2025-10-23T13:00:00.000Z",
    "updatedAt": "2025-10-23T13:00:00.000Z",
    "organization": {
      "id": "934b48c3-bef5-4f21-8d41-9a3260cf1055",
      "name": "Nome da Organização",
      "description": "Descrição da organização"
    },
    "teamAssignment": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Nome do Time",
      "description": "Descrição do time"
    }
  }
]
```

## Possíveis Erros

### 400 - Bad Request
```json
{
  "statusCode": 400,
  "message": "Dados inválidos fornecidos",
  "error": "Bad Request"
}
```

### 401 - Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "UnauthorizedException"
}
```

### 403 - Forbidden
```json
{
  "statusCode": 403,
  "message": "Você não tem acesso a esta organização",
  "error": "Forbidden"
}
```

### 404 - Not Found
```json
{
  "statusCode": 404,
  "message": "Organização não encontrada",
  "error": "Not Found"
}
```

### 409 - Conflict
```json
{
  "statusCode": 409,
  "message": "Já existe um projeto com este nome nesta organização",
  "error": "Conflict"
}
```

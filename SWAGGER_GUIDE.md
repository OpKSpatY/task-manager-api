# 🚀 Guia do Swagger - Task Manager API

## O que é o Swagger?

O Swagger (OpenAPI) é uma ferramenta que gera automaticamente uma documentação interativa da sua API. Ele permite:

- 📖 Visualizar todas as rotas disponíveis
- 🧪 Testar endpoints diretamente no navegador
- 📋 Ver exemplos de requisições e respostas
- 🔐 Testar autenticação JWT
- 📱 Gerar código para diferentes linguagens

## 🎯 Como Acessar

Após iniciar a aplicação, acesse:

```
http://localhost:3000/api
```

## 🔐 Autenticação JWT

### 1. Fazer Login
1. Vá para o endpoint `POST /auth/login`
2. Clique em "Try it out"
3. Preencha os dados:
   ```json
   {
     "email": "joao@example.com",
     "password": "123456"
   }
   ```
4. Execute e copie o `accessToken` da resposta

### 2. Autorizar no Swagger
1. Clique no botão "Authorize" (🔒) no topo da página
2. No campo "Value", digite: `Bearer SEU_TOKEN_AQUI`
3. Clique em "Authorize"
4. Agora você pode testar todas as rotas protegidas

## 📋 Endpoints Disponíveis

### 🔓 Rotas Públicas
- `POST /users/register` - Registrar usuário
- `POST /auth/login` - Fazer login

### 🔒 Rotas Protegidas (requerem JWT)
- `GET /users` - Listar todos os usuários
- `GET /users/{id}` - Buscar usuário por ID
- `GET /users/me/profile` - Obter meu perfil
- `GET /auth/profile` - Obter perfil do usuário autenticado
- `GET /auth/verify` - Verificar token JWT

## 🧪 Como Testar

### Exemplo: Registrar Usuário
1. Vá para `POST /users/register`
2. Clique em "Try it out"
3. Preencha o body:
   ```json
   {
     "firstName": "Maria",
     "lastName": "Santos",
     "email": "maria@example.com",
     "password": "123456"
   }
   ```
4. Clique em "Execute"
5. Veja a resposta com status 201

### Exemplo: Fazer Login
1. Vá para `POST /auth/login`
2. Clique em "Try it out"
3. Preencha o body:
   ```json
   {
     "email": "maria@example.com",
     "password": "123456"
   }
   ```
4. Clique em "Execute"
5. Copie o `accessToken` da resposta

### Exemplo: Acessar Rota Protegida
1. Autorize com o token (passo 2 da seção de autenticação)
2. Vá para `GET /users/me/profile`
3. Clique em "Try it out"
4. Clique em "Execute"
5. Veja os dados do usuário autenticado

## 📊 Códigos de Status

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Dados inválidos
- **401** - Não autorizado
- **404** - Não encontrado
- **409** - Conflito (ex: email já existe)
- **422** - Erro de validação
- **500** - Erro interno do servidor

## 🔧 Recursos do Swagger

### Schemas
- Visualize a estrutura de todos os DTOs
- Veja exemplos de dados
- Entenda validações e tipos

### Responses
- Cada endpoint mostra possíveis respostas
- Inclui exemplos de sucesso e erro
- Documenta códigos de status

### Try it Out
- Teste endpoints diretamente
- Preencha parâmetros e body
- Execute requisições reais

## 📱 Integração com Frontend

### Gerar Código
1. No Swagger, clique em "Generate Client"
2. Escolha a linguagem (JavaScript, TypeScript, etc.)
3. Baixe o código gerado
4. Use no seu projeto frontend

### Exemplo de Uso no JavaScript
```javascript
// Após fazer login e obter o token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Fazer requisição para rota protegida
fetch('http://localhost:3000/users/me/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🚨 Troubleshooting

### Erro 401 (Unauthorized)
- Verifique se o token está correto
- Certifique-se de usar o formato `Bearer TOKEN`
- Verifique se o token não expirou

### Erro 400 (Bad Request)
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique se os tipos de dados estão corretos
- Veja as mensagens de validação na resposta

### Erro 422 (Unprocessable Entity)
- Verifique as validações dos campos
- Senha deve ter pelo menos 6 caracteres
- Email deve ser válido

## 📚 Benefícios para Desenvolvimento

1. **Documentação Sempre Atualizada** - Automática
2. **Testes Rápidos** - Sem precisar de Postman/Insomnia
3. **Integração Frontend** - Código gerado automaticamente
4. **Validação Visual** - Veja exatamente o que a API espera
5. **Colaboração** - Desenvolvedores podem entender a API facilmente

## 🎉 Pronto!

Agora você tem uma documentação profissional e interativa da sua API! Use o Swagger para:

- Testar endpoints durante o desenvolvimento
- Mostrar a API para outros desenvolvedores
- Gerar código para o frontend
- Documentar mudanças na API

Acesse: **http://localhost:3000/api** 🚀

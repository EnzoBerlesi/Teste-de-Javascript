# 📦 Order API — Jitterbit

API RESTful para gerenciamento de pedidos, desenvolvida com **Next.js**, **Node.js**, **PostgreSQL (Neon)** e autenticação via **JWT**. Documentação interativa com **Swagger**.

---

## 🚀 Tecnologias

| Tecnologia | Descrição |
|---|---|
| [Next.js 14](https://nextjs.org/) | Framework React com API Routes nativas |
| [Node.js](https://nodejs.org/) | Runtime JavaScript |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional |
| [Neon](https://neon.tech/) | PostgreSQL serverless na nuvem |
| [JWT](https://jwt.io/) | Autenticação via token |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Criptografia de senhas |
| [Swagger UI](https://swagger.io/) | Documentação interativa da API |
| [Nodemon](https://nodemon.io/) | Hot reload em desenvolvimento |

---

## 📁 Estrutura do Projeto

```
order-app/
│
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login.js          # POST /api/auth/login
│   │   └── order/
│   │       ├── index.js          # POST /api/order | GET /api/order
│   │       └── [id].js           # GET | PUT | DELETE /api/order/:id
│   ├── _app.js
│   └── index.js
│
├── src/
│   ├── config/
│   │   └── database.js           # Conexão com PostgreSQL (Neon)
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Validação do token JWT
│   │   └── tokenHandler.js      # Renovação automática de token
│   └── swagger/
│       └── swagger.js            # Configuração do Swagger
│
├── .env.local                    # Variáveis de ambiente (não sobe pro Git)
├── .env.example                  # Modelo das variáveis
├── .gitignore
├── next.config.js
├── package.json
└── server.js                     # Ponto de entrada
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- Conta no [Neon](https://neon.tech/) (PostgreSQL gratuito)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/teste-de-javascript.git
cd teste-de-javascript
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL=sua_url_do_neon_aqui
JWT_SECRET=sua_chave_secreta_aqui
PORT=3000
```

> 💡 Para gerar um JWT_SECRET seguro, rode:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Crie as tabelas no banco

Acesse o **SQL Editor** do Neon e execute:

```sql
CREATE TABLE IF NOT EXISTS orders (
  "orderId" VARCHAR PRIMARY KEY,
  value NUMERIC,
  "creationDate" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  "orderId" VARCHAR REFERENCES orders("orderId") ON DELETE CASCADE,
  "productId" INTEGER,
  quantity INTEGER,
  price NUMERIC
);
```

### 5. Inicie o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🔐 Autenticação

A API utiliza **JWT** com suporte a cookies httpOnly. O fluxo é:

1. Faça login em `POST /api/auth/login`
2. O token é retornado no body **e** salvo automaticamente em cookie httpOnly
3. Todas as requisições seguintes são autenticadas automaticamente via cookie
4. Alternativamente, envie o token no header: `Authorization: Bearer <token>`

> Credenciais padrão: `username: admin` / `password: admin123`

---

## 📡 Endpoints

### Auth

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Autenticar e obter token JWT | ❌ |

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Orders

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/api/order` | Criar novo pedido | ✅ |
| GET | `/api/order` | Listar todos os pedidos | ✅ |
| GET | `/api/order/:id` | Buscar pedido por ID | ✅ |
| PUT | `/api/order/:id` | Atualizar pedido | ✅ |
| DELETE | `/api/order/:id` | Deletar pedido | ✅ |

---

### Criar Pedido — `POST /api/order`

**Body recebido:**
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

**Mapping aplicado e salvo no banco:**
```json
{
  "orderId": "v10089015vdb-01",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}
```

---

### Atualizar Pedido — `PUT /api/order/:id`

```json
{
  "valorTotal": 99999,
  "items": [
    {
      "idItem": "9999",
      "quantidadeItem": 5,
      "valorItem": 500
    }
  ]
}
```

---

## 🗄️ Banco de Dados

### Tabela: `orders`

| Coluna | Tipo | Descrição |
|---|---|---|
| orderId | VARCHAR | Chave primária |
| value | NUMERIC | Valor total do pedido |
| creationDate | TIMESTAMP | Data de criação |

### Tabela: `items`

| Coluna | Tipo | Descrição |
|---|---|---|
| id | SERIAL | Chave primária auto-incremento |
| orderId | VARCHAR | FK referenciando orders |
| productId | INTEGER | ID do produto |
| quantity | INTEGER | Quantidade |
| price | NUMERIC | Preço unitário |

---

## 📝 Códigos de Status HTTP

| Código | Descrição |
|---|---|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado (token ausente ou inválido) |
| 404 | Recurso não encontrado |
| 405 | Método não permitido |
| 500 | Erro interno do servidor |

---

## 🧪 Testando com Postman

1. **Login** — `POST http://localhost:3000/api/auth/login`
2. Copie o token retornado
3. Nas próximas requisições, vá em **Authorization → Bearer Token** e cole o token
4. Ou deixe o Postman usar o cookie automaticamente após o login

---

## ☁️ Deploy

A aplicação está configurada para deploy na **Vercel** com banco **Neon**.

1. Faça push pro GitHub
2. Importe o repositório na [Vercel](https://vercel.com/)
3. Configure as variáveis de ambiente no painel da Vercel:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Deploy automático a cada push na branch `main`

---

## 📄 Licença

MIT
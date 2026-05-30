# 🍽️ Simple Order System

Sistema de gerenciamento de pedidos para restaurantes, desenvolvido com Node.js, Express e MySQL.

## 🚀 Tecnologias

- **Node.js** + **Express 5**
- **Sequelize** + **MySQL**
- **Docker** + **Docker Compose**
- **Zod** — validação de dados
- **JWT** — autenticação
- **Vitest** — testes unitários

## 📁 Estrutura

```
src/
  controllers/    # recebe req, devolve res
  services/       # regras de negócio
  models/         # definição das tabelas
  routes/         # definição das rotas
  middleware/     # asyncHandler, errorHandler, validate, authenticate
  schemas/        # schemas Zod
  config/         # configuração do banco
  db/             # conexão Sequelize
  util/           # funções auxiliares
```

## ⚙️ Configuração

### Pré-requisitos
- Node.js 20+
- Docker

### Instalação

```bash
# clone o repositório
git clone https://github.com/Leomaan/simple-order-system
cd simple-order-system

# instale as dependências
npm install

# configure as variáveis de ambiente
cp .env.example .env
```

### Variáveis de ambiente

```dotenv
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=simple_order_system
DB_PORT=3307

ADMIN_CODE=seu_codigo_admin
WAITER_CODE=seu_codigo_garcom
JWT_SECRET=sua_chave_secreta
```

### Subindo o banco com Docker

```bash
docker compose up -d db
```

### Rodando o servidor

```bash
npm start
```

## 🔐 Autenticação

O sistema possui dois perfis de acesso:

| Perfil | Acesso |
|---|---|
| **Admin** | Cadastrar/editar/deletar produtos, ver todos os pedidos, deletar pedidos |
| **Garçom** | Abrir pedidos, adicionar itens, fechar pedidos, listar pedidos |

Para autenticar, faça login e use o token retornado no header `Authorization: Bearer <token>`:

```
POST /auth/login
{ "code": "seu_codigo" }
```

## 📌 Rotas

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login e geração do token |

### Produtos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/product` | Garçom+ | Listar produtos |
| GET | `/product/:id` | Garçom+ | Buscar produto |
| POST | `/product` | Admin | Criar produto |
| PUT | `/product/:id` | Admin | Editar produto |
| DELETE | `/product/:id` | Admin | Deletar produto |

### Pedidos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/order` | Garçom+ | Listar pedidos |
| GET | `/order/:id` | Garçom+ | Buscar pedido |
| POST | `/order` | Garçom+ | Criar pedido |
| PUT | `/order/:id` | Garçom+ | Editar pedido |
| PATCH | `/order/:id/close` | Garçom+ | Fechar pedido |
| DELETE | `/order/:id` | Admin | Deletar pedido |

### Itens do pedido
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/order-item` | Garçom+ | Adicionar item |
| PATCH | `/order-item/:id` | Garçom+ | Alterar quantidade |
| DELETE | `/order-item/:id` | Garçom+ | Remover item |

## 🧪 Testes

```bash
npm test
```

37 testes unitários cobrindo os services de produto, pedido e itens.

## 🗺️ Roadmap

- [ ] Categorias de produto (bebidas, petiscos, pratos...)
- [ ] Integração com API de pagamento PIX (Mercado Pago / PagSeguro)
- [ ] Geração de notas fiscais em PDF
- [ ] Relatórios gerenciais (vendas por dia, produtos mais vendidos)
- [ ] Deploy em produção

## 📄 Licença

MIT © [Leomaan](https://github.com/Leomaan)
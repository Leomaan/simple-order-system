# 🍽️ Simple Order System

> **Sistema de Alto Desempenho para Gestão de Pedidos e PDV Comercial em Tempo Real**  
> Desenvolvido em arquitetura **Monorepo (Turborepo)**, com foco em segurança rigorosa, sincronização via WebSockets, resiliência de rede e integridade de dados.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias & Arquitetura](#-tecnologias--arquitetura)
- [Diagrama da Arquitetura](#-diagrama-da-arquitetura)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Estrutura do Monorepo](#-estrutura-do-monorepo)
- [Guia de Instalação e Execução](#-guia-de-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API & Documentação](#-endpoints-da-api--documentação)
- [Testes Automatizados](#-testes-automatizados)
- [Diretrizes de Deploy em Produção](#-diretrizes-de-deploy-em-produção)

---

## 🎯 Visão Geral

O **Simple Order System** é uma solução completa de Ponto de Venda (PDV) e gerenciamento de pedidos para restaurantes, bares e cafeterias. O sistema conecta garçons, caixas, cozinha e administração em tempo real, permitindo:

- Abertura, gerenciamento e fechamento de pedidos por mesa com atualização instantânea.
- Pagamentos automatizados via **Pix do Mercado Pago** (QR Code dinâmico, código Copia e Cola e Webhooks assinados) e pagamentos manuais (Dinheiro / Cartão).
- Painel analítico de relatórios com faturamento, vendas do dia e histórico detalhado.
- Trilha de auditoria imutável (*Audit Logs*) para rastreamento de ações operacionais e de segurança.
- Gestão completa de produtos, categorias, usuários e lixeira com restauração lógica (*Soft Delete*).

---

## 🛠️ Tecnologias & Arquitetura

O ecossistema é organizado em um **Monorepo gerenciado pelo Turborepo e NPM Workspaces**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SIMPLE ORDER SYSTEM                              │
├───────────────────────┬──────────────────────────┬───────────────────────┤
│   apps/web (Front)    │     apps/api (Back)      │   packages/schemas    │
│   React 19 + Vite 6   │  Node.js 20 + Express 5  │  Validações Zod       │
└───────────────────────┴──────────────────────────┴───────────────────────┘
```

### 💻 Frontend (`apps/web`)
* **Core:** [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/), [React Router DOM 7](https://reactrouter.com/).
* **Gerenciamento de Estado & Cache Assíncrono:** [TanStack React Query v5](https://tanstack.com/query) (invalidação reativa, revalidação em background e cache otimizado).
* **Estilização & UI:** [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (ícones modernos), design responsivo e Dark Theme nativo.
* **Comunicação HTTP & Realtime:** [Axios](https://axios-http.com/) (com interceptors para injeção de CSRF token e cookies JWT) e [Socket.IO Client](https://socket.io/) para sincronização em tempo real.

### ⚙️ Backend & API (`apps/api`)
* **Core Runtime:** [Node.js 20+](https://nodejs.org/), [Express 5](https://expressjs.com/).
* **Banco de Dados & ORM:** [MySQL 8](https://www.mysql.com/), [Sequelize 6](https://sequelize.org/) + `mysql2` com pool de conexões resiliente, migrações versionadas e modelos *paranoid* (soft delete).
* **Sincronização em Tempo Real:** [Socket.IO](https://socket.io/) integrado ao servidor HTTP com suporte a broadcast e salas.
* **Segurança e Criptografia:**
  * **JWT Stateful:** Pares de Access Token (cookie HTTP-only) e Refresh Token (armazenado e monitorado no banco com expurgo automático).
  * **Proteção CSRF:** Padrão *Double Submit Cookie* com middleware de validação estrita.
  * **Rate Limiting:** `express-rate-limit` aplicado a rotas críticas e login contra ataques de força bruta.
  * **Criptografia AES-256-GCM:** Criptografia reversível para dados sensíveis (tokens de pagamento) no banco de dados.
  * **Helmet & CSP:** Proteção de cabeçalhos HTTP e políticas de segurança de conteúdo (*Content Security Policy*).
  * **CORS Dinâmico:** Validação dinâmica de origens permitidas (Vercel, Render e Localhost).
* **Auditoria & Logs:** [Winston Logger](https://github.com/winstonjs/winston) com logs estruturados em console e arquivos rotativos (`logs/combined.log` e `logs/error.log`).
* **Documentação Interativa:** [Swagger / OpenAPI 3.0](https://swagger.io/) (`swagger-jsdoc` e `swagger-ui-express`) na rota `/api-docs`.

### 📦 Pacotes Compartilhados (`packages/schemas`)
* **Validação Universal:** Schemas [Zod](https://zod.dev/) compartilhados entre backend e frontend para garantir consistência de tipos e validação estrita de dados (Autenticação, Pedidos, Itens, Produtos, Usuários e Configurações).

---

## 📐 Diagrama da Arquitetura

```mermaid
flowchart TD
    subgraph Client["Cliente / Navegador"]
        UI["React 19 SPA (Vite + Tailwind)"]
        QueryCache["TanStack Query Cache"]
        SocketClient["Socket.IO Client"]
    end

    subgraph Backend["API Backend (Node.js + Express 5)"]
        Middlewares["Middlewares: Helmet, CORS, CSRF, RateLimit, Auth JWT"]
        Controllers["Controllers & Services"]
        SocketServer["Socket.IO Server (Broadcast)"]
        Winston["Winston Logger"]
    end

    subgraph Database["Camada de Dados"]
        Sequelize["Sequelize ORM"]
        MySQL[("MySQL 8 (Docker / Aiven)")]
    end

    subgraph External["Serviços Externos"]
        MercadoPago["Mercado Pago API (Pix & Webhooks)"]
    end

    UI -->|HTTP / REST com Cookies| Middlewares
    Middlewares --> Controllers
    Controllers --> Sequelize
    Sequelize --> MySQL
    Controllers --> Winston

    Controllers -->|Gera Pix & Consulta Status| MercadoPago
    MercadoPago -->|Webhook Notificação| Middlewares

    Controllers -->|Emite Eventos (order:updated)| SocketServer
    SocketServer -.->|WebSocket Real-time| SocketClient
    SocketClient --> QueryCache
    QueryCache --> UI
```

---

## ✨ Funcionalidades Principais

### 1. 🔐 Autenticação Segura & RBAC (Controle por Perfil)
- **Perfis de Acesso:** Garçom (`WAITER`) e Administrador (`ADMIN`).
- **Sessão Segura:** Tokens JWT trafegados em cookies seguros (`httpOnly`, `sameSite`, `secure`).
- **Invalidação Stateful de Refresh Tokens:** Refresh tokens são registrados no MySQL e revogados imediatamente no logout. Limpeza assíncrona automática de tokens expirados no boot da API.

### 2. ⚡ Sincronização em Tempo Real (WebSockets)
- Qualquer alteração de pedido (criação, inclusão de itens, fechamento ou pagamento) emite eventos WebSocket (`order:created`, `order:updated`, `order:deleted`).
- Atualiza simultaneamente as telas do caixa, garçons e painel administrativo sem necessidade de recarregar a página.

### 3. 🍽️ Gestão de Pedidos e Mesas
- Abertura de comandas/pedidos associados a mesas.
- Adição e remoção rápida de produtos com cálculo automático de subtotal e total.
- Ciclo de vida completo do pedido: `OPEN` (Aberto) ➔ `CLOSED` (Fechado/Aguardando Pagamento) ➔ `PAID` (Pago) ou `CANCELED` (Cancelado).
- Reabertura de pedidos fechados mediante autorização.

### 4. 💳 Pagamentos Múltiplos & Integração Mercado Pago
- **PIX Automatizado:** Criação de cobranças Pix via API oficial do Mercado Pago com retorno do QR Code Base64 e Copia e Cola instantâneos.
- **Estratégia Dupla de Confirmação:**
  1. *Polling Ativo:* O frontend verifica o status a cada 3 segundos enquanto o modal de pagamento está aberto.
  2. *Webhooks com Assinatura HMAC:* O Mercado Pago notifica o backend de forma assíncrona caso o pagamento seja concluído em segundo plano.
- **Pagamentos Manuais:** Registro de recebimentos em Dinheiro (`CASH`) ou Cartão (`CARD`).
- **Modo Mock Integrado:** Permite simular aprovações de pagamento instantâneas em ambiente de desenvolvimento sem credenciais externas.

### 5. 📊 Relatórios & Métricas Administrativas
- Faturamento do dia em tempo real com contadores de pedidos abertos, fechados e pagos.
- Relatórios customizados por intervalo de datas (Receita total, ticket médio e distribuição por forma de pagamento).

### 6. 🛡️ Trilha de Auditoria Imutável (Audit Logs)
- Registro detalhado e imutável de todas as ações sensíveis no sistema (`PAY_ORDER`, `CREATE_ORDER`, `UPDATE_PRODUCT`, `DELETE_USER`, etc.), incluindo usuário responsável, timestamp, entidade e payload das alterações.

### 7. 🗑️ Lixeira com Restauração (Soft Delete)
- Implementação de exclusão lógica (*Paranoid*) para Produtos, Usuários e Pedidos.
- Registros deletados podem ser visualizados na Lixeira e restaurados com um clique, ou expurgados permanentemente apenas por Administradores.

### 8. ⚙️ Painel de Configurações Dinâmicas
- Interface no frontend para salvar dados do restaurante e credenciais do Mercado Pago (*Access Token* e *Webhook Secret*).
- As chaves são criptografadas com **AES-256-GCM** antes de serem persistidas no banco, protegendo-as contra vazamentos de dados.

---

## 📁 Estrutura do Monorepo

```text
simple-order-system/
├── apps/
│   ├── api/                              # Backend RESTful & WebSocket
│   │   ├── src/
│   │   │   ├── config/                   # Configurações (CORS, Sequelize CLI, Swagger)
│   │   │   ├── controllers/              # Controladores de requisições HTTP
│   │   │   ├── db/                       # Inicialização e conexão Sequelize
│   │   │   ├── docs/                     # Especificações OpenAPI / Swagger (YAML)
│   │   │   ├── middleware/               # Middlewares (Auth, CSRF, RateLimit, Zod, Error)
│   │   │   ├── migrations/               # Migrações versionadas do banco MySQL
│   │   │   ├── models/                   # Modelos Sequelize (User, Product, Order, etc.)
│   │   │   ├── routes/                   # Definição das rotas do Express
│   │   │   ├── scripts/                  # Scripts utilitários (seed.js, reset.js)
│   │   │   ├── services/                 # Regras de negócio e integrações externas
│   │   │   └── util/                     # Utilitários (Logger, Crypto, Socket.io)
│   │   ├── Dockerfile                    # Containerização da API
│   │   ├── docker-compose.yml            # Orquestração do MySQL e API para desenvolvimento
│   │   └── server.js                     # Ponto de entrada do servidor HTTP + WebSocket
│   │
│   └── web/                              # Frontend React SPA
│       ├── src/
│       │   ├── components/               # Componentes React modularizados por domínio
│       │   │   ├── auth/                 # Login e formulários de autenticação
│       │   │   ├── order/                # Cards de mesa, detalhe e modal de pagamento Pix
│       │   │   ├── product/              # Catálogo, listagem e formulários de produtos
│       │   │   ├── report/               # Dashboards, gráficos e métricas de vendas
│       │   │   ├── settings/             # Painel de configurações e chaves de API
│       │   │   ├── trash/                # Lixeira e restauração de dados
│       │   │   ├── user/                 # Gerenciamento de usuários e garçons
│       │   │   └── ui/                   # Componentes base reutilizáveis (Modais, Inputs)
│       │   ├── context/                  # Context API do React (AuthContext, SocketContext)
│       │   ├── hooks/                    # Custom React Hooks
│       │   ├── pages/                    # Páginas principais (Admin, Waiter, Login)
│       │   ├── config/                   # Instância do Axios e Socket.io
│       │   └── routes.jsx                # Roteamento e proteção de rotas privadas
│       └── vite.config.js                # Configuração do Vite e Tailwind CSS
│
├── packages/
│   └── schemas/                          # Schemas universais Zod (Compartilhados)
│
├── .env.example                          # Modelo mestre de variáveis de ambiente
├── package.json                          # Configuração do Workspace raiz
└── turbo.json                            # Pipelines de build, dev e testes do Turborepo
```

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos
* **Node.js**: Versão `20.x` ou superior instalada.
* **Docker & Docker Compose**: Para execução do container MySQL local.

---

### Passo a Passo:

#### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/Leomaan/simple-order-system.git
cd simple-order-system
npm install
```

#### 2. Configurar os arquivos de ambiente
Copie o modelo de variáveis de ambiente para a API e para o Frontend:

```bash
# Na raiz:
cp .env.example apps/api/.env
cp .env.example apps/web/.env
```
*(Edite os arquivos `.env` com suas credenciais conforme a seção de [Variáveis de Ambiente](#-variáveis-de-ambiente)).*

#### 3. Iniciar o Banco de Dados MySQL (Docker)
Suba o container do MySQL 8 pré-configurado:
```bash
docker compose -f apps/api/docker-compose.yml up -d db
```

#### 4. Executar Migrações e Carga Inicial (Seeds)
Execute as migrações para criar as tabelas e popular o banco com produtos de exemplo e o usuário Administrador padrão:
```bash
npm run db:seed --workspace=@simple-order/api
```
> **Credenciais Padrão do Administrador Inicial:**
> - **E-mail:** `admin@restaurant.com`
> - **Senha:** `admin123`

#### 5. Iniciar o ecossistema em desenvolvimento
Inicie tanto a API quanto o Frontend simultaneamente via Turborepo:
```bash
npm run dev
```

* 🌐 **Frontend Web:** [http://localhost:5173](http://localhost:5173)
* 🔌 **API Backend:** [http://localhost:3000](http://localhost:3000)
* 📖 **Documentação Swagger (OpenAPI):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🔐 Variáveis de Ambiente

### Backend (`apps/api/.env`)

| Variável | Obrigatória | Padrão / Exemplo | Descrição |
| :--- | :---: | :--- | :--- |
| `PORT` | Sim | `3000` | Porta onde a API Express será executada. |
| `NODE_ENV` | Sim | `development` | Ambiente de execução (`development`, `production`, `test`). |
| `DB_HOST` | Sim | `localhost` | Endereço do host do banco MySQL. |
| `DB_PORT` | Sim | `3307` | Porta do banco MySQL (`3307` no Docker local, `3306` em nuvem). |
| `DB_USER` | Sim | `root` | Usuário do banco de dados. |
| `DB_PASS` | Sim | `123456` | Senha do banco de dados. |
| `DB_NAME` | Sim | `simple_order_system` | Nome do banco de dados principal. |
| `JWT_SECRET` | Sim | *(string segura)* | Chave secreta para assinatura dos tokens JWT. |
| `FRONTEND_URL` | Sim | `http://localhost:5173` | Origem(ns) permitida(s) no CORS (separadas por vírgula). |
| `API_BASE_URL` / `BACKEND_URL` | Opcional | `https://sua-api.onrender.com` | URL pública da API enviada ao Mercado Pago para Webhooks. |
| `ENCRYPTION_KEY` | Opcional | *(string de 32 chars)* | Chave AES-256 para criptografia de tokens no banco (usa `JWT_SECRET` como fallback). |
| `COOKIE_SAME_SITE` | Opcional | `lax` | Política de cookies em produção (`lax` ou `none` para cross-origin). |
| `LOG_LEVEL` | Opcional | `info` | Nível de detalhamento do Winston (`debug`, `info`, `warn`, `error`). |
| `ENABLE_SWAGGER` | Opcional | `true` | Habilita a rota `/api-docs` em produção se `true`. |

### Frontend (`apps/web/.env`)

| Variável | Obrigatória | Exemplo | Descrição |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Sim | `http://localhost:3000` | URL base do backend utilizada pelo Axios e Socket.IO. |

---

## 📡 Endpoints da API & Documentação

A documentação interativa completa pode ser acessada em `http://localhost:3000/api-docs`. Abaixo está o resumo dos principais recursos:

### 🔐 Autenticação (`/auth`)
- `POST /auth/login` - Autenticação com e-mail/senha (Gera cookies `accessToken` e `refreshToken`).
- `POST /auth/refresh` - Renovação de sessão via refresh token.
- `POST /auth/logout` - Encerramento de sessão e invalidação de token no banco.

### 🍔 Produtos (`/products`)
- `GET /products` - Listagem de produtos ativos com paginação e filtros.
- `GET /products/:id` - Detalhes de um produto específico.
- `POST /products` - Criação de novo produto *(Requer Admin)*.
- `PUT /products/:id` - Atualização de produto *(Requer Admin)*.
- `DELETE /products/:id` - Exclusão lógica do produto (*Soft Delete*).
- `PATCH /products/:id/restore` - Restauração de produto excluído.
- `DELETE /products/:id/permanent` - Exclusão definitiva do banco *(Requer Admin)*.

### 📝 Pedidos (`/orders`)
- `GET /orders` - Listagem de pedidos com filtros de mesa e status (`OPEN`, `CLOSED`, `PAID`).
- `GET /orders/:id` - Detalhes completos do pedido e itens associados.
- `POST /orders` - Abertura de novo pedido para uma mesa.
- `PUT /orders/:id` - Atualização de mesa ou dados do pedido.
- `PATCH /orders/:id/close` - Fechamento de comanda para aguardar pagamento.
- `PATCH /orders/:id/reopen` - Reabertura de pedido fechado.
- `DELETE /orders/:id` - Exclusão lógica de pedido *(Requer Admin)*.
- `PATCH /orders/:id/restore` - Restauração de pedido da lixeira.
- `DELETE /orders/:id/permanent` - Exclusão física permanente *(Requer Admin)*.

### 🛒 Itens do Pedido (`/order-items`)
- `POST /order-items` - Adição de item ao pedido.
- `PATCH /order-items/:id` - Alteração da quantidade de um item.
- `DELETE /order-items/:id` - Remoção de item do pedido.

### 💳 Pagamentos (`/payment`)
- `POST /payment/pix` - Geração de cobrança Pix oficial no Mercado Pago com QR Code.
- `GET /payment/check-status/:id` - Consulta ativa do status do pagamento no Mercado Pago.
- `POST /payment/webhook` - Receptor assíncrono de notificações de pagamento do Mercado Pago.
- `POST /payment/manual` - Confirmação manual de pagamento em Dinheiro ou Cartão.
- `POST /payment/simulate-confirm` - Simulação de confirmação imediata (Modo Dev).

### 👥 Usuários (`/users`) *(Apenas Administrador)*
- `GET /users` - Listagem de usuários do sistema.
- `POST /users` - Cadastro de novos garçons ou administradores.
- `PATCH /users/:id` - Atualização de dados ou permissões.
- `DELETE /users/:id` - Desativação lógica de usuário.
- `PATCH /users/:id/restore` - Reativação de usuário.

### 📊 Relatórios & Auditoria
- `GET /reports/today` - Métricas consolidadas de vendas do dia atual *(Admin)*.
- `GET /reports/revenue` - Faturamento e ticket médio por período *(Admin)*.
- `GET /reports/orders` - Quantitativo de pedidos e distribuição por forma de pagamento *(Admin)*.
- `GET /audit-logs` - Histórico imutável de logs de auditoria *(Admin)*.

### ⚙️ Configurações & Saúde
- `GET /settings` - Obtenção das configurações do restaurante e status de chaves *(Admin)*.
- `PUT /settings` - Atualização das configurações e credenciais criptografadas do Mercado Pago *(Admin)*.
- `GET /health` - Healthcheck de integridade do servidor e conexão com o banco de dados.

---

## 🧪 Testes Automatizados

O projeto utiliza **Vitest** com uma suíte abrangente de testes unitários e de integração (testando autenticação, regras de pedidos, produtos, usuários e middlewares):

```bash
# Executar todos os testes via Turborepo:
npm run test

# Executar testes da API individualmente:
npm run test --workspace=@simple-order/api
```

---

## 🚢 Diretrizes de Deploy em Produção

| Camada | Plataforma Sugerida | Diretrizes |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | Configure `apps/web` como Root Directory. Defina `VITE_API_URL` com o endereço HTTPS da sua API no Render. |
| **Backend API** | [Render](https://render.com/) / Railway | Execute o comando de inicialização com migrações automáticas: `npx sequelize-cli db:migrate && node server.js`. Configure as variáveis de ambiente (`FRONTEND_URL`, `JWT_SECRET`, `DB_*`). |
| **Banco de Dados** | [Aiven](https://aiven.io/) / AWS RDS | Banco MySQL 8 gerenciado com suporte a conexões SSL seguras. |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](file:///C:/Users/Leoman/Documents/GitHub/simple%20order%20system/LICENSE) para mais informações.
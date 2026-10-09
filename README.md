# 🍽️ Simple Order System

> **Sistema de Alto Desempenho para Gestão de Pedidos, Cardápio Digital e PDV Comercial em Tempo Real**  
> Desenvolvido em arquitetura **Monorepo (Turborepo)**, com foco em segurança rigorosa, sincronização via WebSockets, resiliência de rede e integridade de dados.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias & Arquitetura](#-tecnologias--arquitetura)
- [Diagrama da Arquitetura](#-diagrama-da-arquitetura)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Estrutura do Monorepo](#-estrutura-do-monorepo)
- [Rotas da Aplicação Web](#-rotas-da-aplicação-web)
- [Guia de Instalação e Execução](#-guia-de-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API & Documentação](#-endpoints-da-api--documentação)
- [Testes Automatizados](#-testes-automatizados)
- [Diretrizes de Deploy em Produção](#-diretrizes-de-deploy-em-produção)
- [Licença](#-licença)

---

## 🎯 Visão Geral

O **Simple Order System** é uma solução completa de Ponto de Venda (PDV), cardápio digital interativo e gerenciamento de pedidos para restaurantes, bares e cafeterias. O sistema conecta clientes, garçons, caixas e administração em tempo real:

- **Cardápio Digital Público & QR Code:** Clientes visualizam o cardápio em seus celulares por mesa (`/cardapio/:slug`), com design responsivo estilo delivery, navegação inteligente com Scrollspy e atualização em tempo real via WebSockets.
- **Operação de Salão (Garçom):** Abertura, gerenciamento e fechamento de comandas por mesa com atualização instantânea.
- **Pagamentos Automatizados:** Integração oficial com **Pix do Mercado Pago** (QR Code dinâmico, código Copia e Cola e Webhooks assinados HMAC) e pagamentos manuais (Dinheiro / Cartão).
- **Painel Administrativo:** Dashboards de faturamento e vendas em tempo real, gestão de produtos, categorias, colaboradores e lixeira com restauração lógica (*Soft Delete*).
- **Trilha de Auditoria Imutável (*Audit Logs*):** Rastreamento completo de ações operacionais e financeiras para máxima conformidade.

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
* **Estilização & UI:** [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (ícones modernos), tema escuro (*Dark Theme*) nativo e animações fluidas.
* **Comunicação HTTP & Realtime:** [Axios](https://axios-http.com/) (com interceptors para injeção de CSRF token e cookies JWT) e [Socket.IO Client](https://socket.io/) para sincronização em tempo real de pedidos e atualizações de cardápio.

### ⚙️ Backend & API (`apps/api`)
* **Core Runtime:** [Node.js 20+](https://nodejs.org/), [Express 5](https://expressjs.com/).
* **Banco de Dados & ORM:** [MySQL 8](https://www.mysql.com/), [Sequelize 6](https://sequelize.org/) + `mysql2` com pool de conexões resiliente, migrações versionadas e modelos *paranoid* (soft delete).
* **Sincronização em Tempo Real:** [Socket.IO](https://socket.io/) integrado ao servidor HTTP com suporte a broadcast para garçons, caixas e clientes públicos.
* **Segurança e Criptografia:**
  * **JWT Stateful:** Pares de Access Token (cookie HTTP-only) e Refresh Token (armazenado e monitorado no banco com expurgo automático).
  * **Proteção CSRF:** Padrão *Double Submit Cookie* com middleware de validação estrita.
  * **Rate Limiting:** `express-rate-limit` aplicado a rotas críticas, login e cardápio público contra abusos e ataques de força bruta.
  * **Criptografia AES-256-GCM:** Criptografia reversível para dados sensíveis (tokens do Mercado Pago) no banco de dados.
  * **Helmet & CSP:** Proteção de cabeçalhos HTTP e políticas de segurança de conteúdo (*Content Security Policy*).
  * **CORS Dinâmico:** Validação de origens permitidas em desenvolvimento e produção.
* **Auditoria & Logs:** [Winston Logger](https://github.com/winstonjs/winston) com logs estruturados em console e arquivos rotativos (`logs/combined.log` e `logs/error.log`).
* **Documentação Interativa:** [Swagger / OpenAPI 3.0](https://swagger.io/) (`swagger-jsdoc` e `swagger-ui-express`) na rota `/api-docs`.

### 📦 Pacotes Compartilhados (`packages/schemas`)
* **Validação Universal:** Schemas [Zod](https://zod.dev/) compartilhados entre backend e frontend garantindo consistência de tipos e validação estrita de dados (Autenticação, Pedidos, Itens, Produtos, Usuários e Configurações).

---

## 📐 Diagrama da Arquitetura

```mermaid
flowchart TD
    subgraph Clients["Clientes & Interfaces"]
        ClientPublic["Cliente (Cardápio Digital /cardapio)"]
        ClientWaiter["Garçom (PDV Móvel /waiter)"]
        ClientAdmin["Administrador (Dashboard /admin)"]
    end

    subgraph Frontend["Frontend SPA (React 19 + Vite 6)"]
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
        MySQL[("MySQL 8 (Docker / Nuvem)")]
    end

    subgraph External["Serviços Externos"]
        MercadoPago["Mercado Pago API (Pix & Webhooks)"]
    end

    ClientPublic --> Frontend
    ClientWaiter --> Frontend
    ClientAdmin --> Frontend

    Frontend -->|HTTP / REST com Cookies & CSRF| Middlewares
    Middlewares --> Controllers
    Controllers --> Sequelize
    Sequelize --> MySQL
    Controllers --> Winston

    Controllers -->|Gera Pix & Consulta Status| MercadoPago
    MercadoPago -->|Webhook Notificação| Middlewares

    Controllers -->|Emite Eventos (order:updated, menu:updated)| SocketServer
    SocketServer -.->|WebSocket Real-time| SocketClient
    SocketClient --> QueryCache
```

---

## ✨ Funcionalidades Principais

### 1. 📱 Cardápio Digital Público & QR Code por Mesa
- **Acesso Direto Sem Login:** Rota pública em `/cardapio` ou `/cardapio/:slug` (ex.: `/cardapio/mesa-05`).
- **Cabeçalho Centralizado do Restaurante:** Informações completas do estabelecimento no topo com nome, descrição, foto/logo à direita, badge dinâmico de status (*Aberto agora* / *Fechado*), horários de funcionamento, endereço com link para Maps, contatos telefônicos/WhatsApp e botão de compartilhamento.
- **Navegação Sticky com ScrollSpy:** Menu de categorias fixo no topo que acompanha a rolagem da página, destacando automaticamente a categoria visível em tempo real.
- **Cards de Produto Horizontais:** Foto à esquerda, nome e descrição/detalhes no centro ocupando 100% da largura, e preço destacado na extremidade direita.
- **Configurações 100% Personalizáveis:** Arquivo central de configurações (`apps/web/src/config/restaurantInfo.js`) permitindo customizar dados, horários, fotos e contatos do restaurante.
- **Modal de QR Code:** Permite gerar QR Codes instantâneos da mesa para impressão ou compartilhamento com clientes.
- **Sincronização em Tempo Real:** Escuta o evento `menu:updated` via WebSocket público para atualizar preços e produtos instantaneamente na tela do cliente.

### 2. 🔐 Autenticação Segura & RBAC (Controle por Perfil)
- **Perfis de Acesso:** Garçom (`WAITER`) e Administrador (`ADMIN`).
- **Sessão Segura:** Tokens JWT trafegados em cookies seguros (`httpOnly`, `sameSite`, `secure`).
- **Invalidação Stateful de Refresh Tokens:** Refresh tokens são registrados no MySQL e revogados imediatamente no logout, com limpeza assíncrona automática na inicialização da API.

### 3. ⚡ Sincronização em Tempo Real (WebSockets)
- Qualquer alteração de pedido (criação, inclusão de itens, fechamento ou pagamento) emite eventos WebSocket (`order:created`, `order:updated`, `order:deleted`).
- Atualiza simultaneamente as telas do caixa, garçons e painel administrativo sem necessidade de recarregar a página.

### 4. 🍽️ Gestão de Pedidos e Mesas (PDV)
- Abertura de comandas/pedidos associados a mesas.
- Adição e remoção rápida de produtos com cálculo automático de subtotal e total.
- Ciclo de vida completo do pedido: `OPEN` (Aberto) ➔ `CLOSED` (Fechado/Aguardando Pagamento) ➔ `PAID` (Pago) ou `CANCELED` (Cancelado).
- Reabertura de pedidos fechados mediante autorização.

### 5. 💳 Pagamentos Múltiplos & Integração Mercado Pago
- **PIX Automatizado:** Criação de cobranças Pix via API oficial do Mercado Pago com QR Code Base64 e Copia e Cola instantâneos.
- **Estratégia Dupla de Confirmação:**
  1. *Polling Ativo:* O frontend verifica o status a cada 3 segundos enquanto o modal de pagamento está aberto.
  2. *Webhooks com Assinatura HMAC:* O Mercado Pago notifica o backend de forma assíncrona caso o pagamento seja concluído em segundo plano.
- **Pagamentos Manuais:** Registro de recebimentos em Dinheiro (`CASH`) ou Cartão (`CARD`).
- **Modo Simulação Integrado:** Permite simular aprovações imediatas em ambiente de desenvolvimento sem credenciais externas.

### 6. 📊 Relatórios & Métricas Administrativas
- Faturamento do dia em tempo real com contadores de pedidos abertos, fechados e pagos.
- Relatórios customizados por intervalo de datas (Receita total, ticket médio e distribuição por forma de pagamento).

### 7. 🛡️ Trilha de Auditoria Imutável (*Audit Logs*)
- Registro detalhado e imutável de todas as ações sensíveis no sistema (`PAY_ORDER`, `CREATE_ORDER`, `UPDATE_PRODUCT`, `DELETE_USER`, etc.), incluindo usuário responsável, timestamp, entidade e payload das alterações.

### 8. 🗑️ Lixeira com Restauração (*Soft Delete*)
- Implementação de exclusão lógica (*Paranoid*) para Produtos, Usuários e Pedidos.
- Registros deletados podem ser visualizados na Lixeira e restaurados com um clique, ou expurgados permanentemente por Administradores.

### 9. ⚙️ Painel de Configurações Dinâmicas
- Interface no frontend para salvar dados do restaurante e credenciais do Mercado Pago (*Access Token* e *Webhook Secret*).
- As chaves são criptografadas com **AES-256-GCM** antes de serem persistidas no banco.

---

## 📁 Estrutura do Monorepo

```text
simple-order-system/
├── apps/
│   ├── api/                              # Backend RESTful & WebSocket
│   │   ├── src/
│   │   │   ├── config/                   # Configurações (CORS, Sequelize, Swagger)
│   │   │   ├── controllers/              # Controladores HTTP (Auth, Order, Product, PublicMenu, etc.)
│   │   │   ├── db/                       # Inicialização e conexão Sequelize
│   │   │   ├── docs/                     # Especificações OpenAPI / Swagger (YAML)
│   │   │   ├── dto/                      # Data Transfer Objects (Formatação pública)
│   │   │   ├── middleware/               # Middlewares (Auth, CSRF, RateLimit, Cache, Zod, Error)
│   │   │   ├── migrations/               # Migrações versionadas do banco MySQL
│   │   │   ├── models/                   # Modelos Sequelize (User, Product, Order, Settings, etc.)
│   │   │   ├── routes/                   # Rotas da API (Singular: /product, /order, /public/menu, etc.)
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
│       │   │   ├── menu/                 # Cardápio público (RestaurantHeader, CategoryNav, ProductCard, etc.)
│       │   │   ├── order/                # Cards de mesa, detalhe e modal de pagamento Pix
│       │   │   ├── product/              # Catálogo, listagem e formulários de produtos
│       │   │   ├── report/               # Dashboards, gráficos e métricas de vendas
│       │   │   ├── settings/             # Painel de configurações e chaves de API
│       │   │   ├── trash/                # Lixeira e restauração de dados
│       │   │   ├── user/                 # Gerenciamento de colaboradores
│       │   │   └── ui/                   # Componentes base reutilizáveis (Modais, Inputs, Banners)
│       │   ├── context/                  # Context API (AuthContext, SocketContext)
│       │   ├── hooks/                    # Custom Hooks (usePublicMenu, useScrollSpy, useOrders, etc.)
│       │   ├── pages/                    # Páginas (menu.jsx, Admin.jsx, Waiter.jsx, Login.jsx)
│       │   ├── config/                   # Configurações do Axios, Sockets e restaurantInfo.js
│       │   ├── util/                     # Utilitários (QR Code, formatadores de moeda)
│       │   └── routes.jsx                # Roteamento e proteção de rotas públicas e privadas
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

## 🌐 Rotas da Aplicação Web

| Rota | Tipo | Descrição |
| :--- | :---: | :--- |
| `/cardapio` | **Pública** | Cardápio Digital completo com informações do restaurante e categorias. |
| `/cardapio/:slug` | **Pública** | Cardápio Digital personalizado para mesa específica (ex.: `/cardapio/01`). |
| `/login` | **Pública** | Formulário de autenticação de garçons e administradores. |
| `/waiter` | **Protegida (WAITER / ADMIN)** | Ponto de Venda de mesas, inclusão de itens e fechamento de pedidos. |
| `/admin` | **Protegida (ADMIN)** | Painel administrativo (Relatórios, Produtos, Usuários, Lixeira, Configurações). |

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
# Na raiz do projeto:
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

* 📱 **Cardápio Digital Público:** [http://localhost:5173/cardapio](http://localhost:5173/cardapio)
* 🌐 **Frontend Web (Login):** [http://localhost:5173](http://localhost:5173)
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
| `API_BASE_URL` | Opcional | `http://localhost:3000` | URL pública da API enviada ao Mercado Pago para Webhooks. |
| `ENCRYPTION_KEY` | Opcional | *(string de 32 chars)* | Chave AES-256 para criptografia no banco (usa `JWT_SECRET` como fallback). |
| `COOKIE_SAME_SITE` | Opcional | `lax` | Política de cookies (`lax` ou `none` para cross-origin). |
| `LOG_LEVEL` | Opcional | `info` | Nível de detalhamento do Winston (`debug`, `info`, `warn`, `error`). |
| `ENABLE_SWAGGER` | Opcional | `true` | Habilita a rota `/api-docs` em produção se `true`. |

### Frontend (`apps/web/.env`)

| Variável | Obrigatória | Exemplo | Descrição |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Sim | `http://localhost:3000` | URL base do backend utilizada pelo Axios e Socket.IO. |

---

## 📡 Endpoints da API & Documentação

A documentação interativa completa pode ser acessada em `http://localhost:3000/api-docs`.

> ⚠️ **Padrão de Rotas:** Os recursos REST da API seguem o padrão no **singular** (`/product`, `/order`, `/order-item`, `/user`, `/report`, `/audit`, `/payment`, `/settings`, `/public/menu`).

### 📱 Cardápio Público (`/public/menu`) *(Acesso Livre com Rate Limit & Cache)*
- `GET /public/menu` - Retorna a lista de produtos ativos formatados para exibição pública. Suporta parâmetro de consulta `?category=FOOD`.

### 🔐 Autenticação (`/auth`)
- `POST /auth/login` - Autenticação com e-mail/senha (Gera cookies `accessToken` e `refreshToken`).
- `POST /auth/refresh` - Renovação de sessão via refresh token.
- `POST /auth/logout` - Encerramento de sessão e invalidação do token no banco.

### 🍔 Produtos (`/product`)
- `GET /product` - Listagem de produtos ativos com filtros *(Requer Garçom/Admin)*.
- `GET /product/:id` - Detalhes de um produto específico.
- `POST /product` - Criação de novo produto *(Requer Admin)*.
- `PUT /product/:id` - Atualização de produto *(Requer Admin)*.
- `DELETE /product/:id` - Exclusão lógica do produto (*Soft Delete*) *(Requer Admin)*.
- `PATCH /product/:id/restore` - Restauração de produto excluído *(Requer Admin)*.
- `DELETE /product/:id/permanent` - Exclusão definitiva do banco *(Requer Admin)*.

### 📝 Pedidos (`/order`)
- `GET /order` - Listagem de pedidos com filtros de mesa e status (`OPEN`, `CLOSED`, `PAID`) *(Requer Garçom/Admin)*.
- `GET /order/:id` - Detalhes completos do pedido e itens associados.
- `POST /order` - Abertura de novo pedido para uma mesa.
- `PUT /order/:id` - Atualização de mesa ou dados do pedido.
- `PATCH /order/:id/close` - Fechamento de comanda para aguardar pagamento.
- `PATCH /order/:id/reopen` - Reabertura de pedido fechado.
- `DELETE /order/:id` - Exclusão lógica de pedido *(Requer Admin)*.
- `PATCH /order/:id/restore` - Restauração de pedido da lixeira *(Requer Admin)*.
- `DELETE /order/:id/permanent` - Exclusão física permanente *(Requer Admin)*.

### 🛒 Itens do Pedido (`/order-item`)
- `POST /order-item` - Adição de item ao pedido *(Requer Garçom/Admin)*.
- `PATCH /order-item/:id` - Alteração da quantidade de um item.
- `DELETE /order-item/:id` - Remoção de item do pedido.

### 💳 Pagamentos (`/payment`)
- `POST /payment/pix` - Geração de cobrança Pix oficial no Mercado Pago com QR Code e Copia e Cola.
- `GET /payment/check-status/:id` - Consulta ativa do status do pagamento no Mercado Pago.
- `POST /payment/webhook` - Receptor assíncrono de notificações do Mercado Pago com validação de assinatura.
- `POST /payment/manual` ou `POST /payment/manual/:id` - Confirmação manual de pagamento em Dinheiro ou Cartão.
- `POST /payment/simulate-confirm` - Simulação de confirmação imediata (Modo Dev).

### 👥 Usuários (`/user`) *(Apenas Administrador)*
- `GET /user` - Listagem de colaboradores do sistema.
- `GET /user/:id` - Detalhes de um colaborador.
- `POST /user` - Cadastro de novos garçons ou administradores.
- `PATCH /user/:id` - Atualização de dados ou permissões.
- `DELETE /user/:id` - Desativação lógica de colaborador (*Soft Delete*).
- `PATCH /user/:id/restore` - Reativação de colaborador.
- `DELETE /user/:id/permanent` - Exclusão definitiva do banco de dados.

### 📊 Relatórios & Auditoria (`/report` & `/audit`) *(Apenas Administrador)*
- `GET /report/today` - Métricas consolidadas de vendas do dia atual.
- `GET /report/revenue` - Faturamento e ticket médio por período.
- `GET /report/orders` - Quantitativo de pedidos e distribuição por forma de pagamento.
- `GET /audit` - Histórico imutável de logs de auditoria.

### ⚙️ Configurações & Saúde (`/settings` & `/health`)
- `GET /settings` - Obtenção das configurações do restaurante e status de chaves *(Admin)*.
- `PUT /settings` - Atualização das configurações e credenciais criptografadas do Mercado Pago *(Admin)*.
- `GET /health` - Healthcheck de integridade da API e conexão com o banco MySQL.

---

## 🧪 Testes Automatizados

O projeto utiliza **Vitest** com testes unitários e de integração:

```bash
# Executar todos os testes via Turborepo:
npm run test

# Executar testes da API individualmente:
npm run test --workspace=@simple-order/api
```

> **Nota:** Certifique-se de que o container do MySQL esteja em execução (`docker compose -f apps/api/docker-compose.yml up -d db`) para executar os testes de integração do banco de dados.

---

## 🚢 Diretrizes de Deploy em Produção

| Camada | Plataforma Sugerida | Diretrizes |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | Configure `apps/web` como Root Directory. Defina `VITE_API_URL` com o endereço HTTPS da sua API no Render/Railway. |
| **Backend API** | [Render](https://render.com/) / Railway | Execute o comando de inicialização com migrações automáticas: `npx sequelize-cli db:migrate && node server.js`. Configure as variáveis de ambiente (`FRONTEND_URL`, `JWT_SECRET`, `DB_*`). |
| **Banco de Dados** | [Aiven](https://aiven.io/) / AWS RDS | Banco MySQL 8 gerenciado com suporte a conexões SSL seguras. |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](file:///C:/Users/Leoman/Documents/GitHub/simple%20order%20system/LICENSE) para mais informações.
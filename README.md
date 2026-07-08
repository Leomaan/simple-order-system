# Simple Order System

Sistema de alto desempenho para gerenciamento de pedidos e PDV comercial, desenvolvido em arquitetura monorepo com foco em segurança de dados, resiliência de rede e conformidade com padrões de desenvolvimento modernos.

---

## Recursos Técnicos e Engenharia de Software

### 1. Autenticação Segura e Controle de Sessão (JWT & Stateful Refresh Tokens)
* **Fluxo de Tokens**: Autenticação stateless baseada em pares de Access Token (curta duração) e Refresh Token (longa duração).
* **Armazenamento de Cookies**: Para mitigar ataques de Cross-Site Scripting (XSS), os tokens de sessão são transmitidos e armazenados em cookies HTTP-only estruturados com flags de segurança configuráveis em produção (`secure`, `httpOnly`, `sameSite`).
* **Invalidação Stateful**: Refresh tokens são armazenados e monitorados em banco de dados relacional. Ao efetuar logout, os tokens são expurgados do banco para impedir qualquer tipo de reutilização.
* **Limpeza Automática de Tokens**: O servidor executa uma rotina automática e assíncrona ao inicializar para expurgar refresh tokens vencidos (`expiresAt < NOW()`), prevenindo o acúmulo desnecessário de linhas e degradação de performance nas queries de indexação do banco.

### 2. Camada de Segurança e Defesa Contra Ataques comuns
* **Prevenção de CSRF**: Proteção de endpoints de mutação (POST, PUT, DELETE, PATCH) utilizando o padrão *Double Submit Cookie* via middleware exclusivo. O frontend e a API validam tokens XSRF sincronizados para prevenir chamadas cross-origin maliciosas.
* **Rate Limiting**: Limitação de taxa de requisições (`express-rate-limit`) ativa em rotas críticas (como login e criação de pagamentos) para bloquear ataques de força bruta, spam de requisições e tentativas de negação de serviço (DoS).
* **CORS e Cookies Dinâmicos**: Acesso seletivo de origens via cabeçalho CORS dinâmico com suporte a `credentials: true`. Configuração nativa de variáveis de ambiente (`COOKIE_SAME_SITE`) que possibilita alternar o escopo do cookie entre domínios cruzados (`none` para ambientes de hospedagem livre) ou subdomínios alinhados (`lax` / `strict`).

### 3. Gerenciamento de Estado e Sincronização de Cache (React Query)
* **Camada de Dados**: Integração do TanStack React Query (`@tanstack/react-query`) no frontend para manipulação de estado assíncrono.
* **Políticas de Cache**: Implementação de revalidação inteligente em segundo plano, invalidação explícita de chaves de consulta após mutações com sucesso e tratamento de erros de forma declarativa nas requisições da API.
* **Redução de Payload**: Evita requisições repetitivas ao servidor mantendo estados em cache com expiração controlada e revalidação de foco na tela.

### 4. Arquitetura de Banco de Dados (Sequelize ORM & MySQL 8)
* **Migrations e Versionamento**: Modelagem e evolução do schema do banco controladas exclusivamente por arquivos de migração sequenciais em NodeJS.
* **Soft Delete (Paranoid Models)**: Implementação de exclusão lógica para entidades principais (Usuários, Produtos, Pedidos). Os registros deletados são mantidos com timestamp `deletedAt` e podem ser restaurados sem perda de integridade relacional, restando apenas a exclusão física aos usuários de nível administrador.
* **Paginação e Filtros Server-side**: Endpoints estruturados para paginação de registros de forma nativa no banco de dados (usando limit e offset) para garantir a eficiência no tráfego de rede.

### 5. Integração com Provedores de Pagamento (Mercado Pago API)
* **Configurações Dinâmicas no Banco**: Armazenamento seguro de chaves de integração do Mercado Pago no banco de dados com isolamento por tenant. Os segredos são mascarados na API antes de serem retornados ao cliente administrativo.
* **Fluxo Assíncrono de Webhooks**: Endpoint público preparado para processar notificações do Mercado Pago de forma assíncrona, atualizando o status interno do pedido em background.
* **Simulação Local (Dev Bypass)**: Endpoint dedicado para ambientes de desenvolvimento local, contornando a comunicação externa para simular aprovação imediata do pagamento e transição de estado da ordem sem requisições reais.

---

## Estrutura do Monorepo

O projeto adota a arquitetura de monorepo gerenciada pelo Turborepo para compartilhamento de código estático e otimização de builds:

```text
simple-order-system/
├── apps/
│   ├── api/                          # Backend RESTful (Express, Sequelize, MySQL)
│   └── web/                          # Frontend React SPA (Vite, React Query)
├── packages/
│   └── schemas/                      # Schemas de validação Zod compartilhados
├── package.json                      # Orquestrador de dependências do workspace
└── turbo.json                        # Pipeline de cache de build e teste do Turborepo
```

---

## Configuração do Ambiente e Inicialização

### Pré-requisitos
* Node.js v20+
* Docker e Docker Compose

### Instalação e Configurações Iniciais
1. Instale as dependências da raiz do workspace:
   ```bash
   npm install
   ```
2. Crie as variáveis de ambiente baseadas nos templates:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   ```
3. Suba o banco de dados MySQL de desenvolvimento via Docker:
   ```bash
   docker compose -f apps/api/docker-compose.yml up -d db
   ```
4. Execute as migrations e popule o banco de dados com as seeds padrões:
   ```bash
   npm run db:seed --workspace=@simple-order/api
   ```
5. Inicie o ecossistema no modo de desenvolvimento:
   ```bash
   npm run dev
   ```

* **Frontend SPA**: `http://localhost:5173`
* **API REST**: `http://localhost:3000`
* **Swagger UI (Documentação OpenAPI)**: `http://localhost:3000/api-docs`

---

## Execução de Testes Automatizados

A suite de testes utiliza Vitest e roda tanto testes de lógica unitária quanto testes de integração reais contra o contêiner do MySQL:

```bash
npm run test
```

---

## Diretrizes de Deploy

Para subir os servidores de forma resiliente, certifique-se de:
1. Executar as migrations no processo de inicialização do contêiner: `npx sequelize-cli db:migrate && node server.js`.
2. Mapear o domínio do frontend na variável `FRONTEND_URL` para o correto funcionamento do CORS e cookies de sessão.
3. Definir a variável `API_BASE_URL` para o registro correto dos webhooks de confirmação de pagamento.
4. Consulte as especificações de deploy no documento de planejamento: **[Guia de Deploy (Aiven + Render + Vercel)](file:///C:/Users/CLIENTE/.gemini/antigravity-cli/brain/2eed2ae3-0eb3-4c81-a89a-3ce31424ffbe/deployment_plan.md)**.
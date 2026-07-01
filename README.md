# Simple Order System

Sistema de gerenciamento de pedidos para restaurantes e estabelecimentos comerciais, desenvolvido em arquitetura de monorepo utilizando Turborepo, Node.js (Express), React (Vite, TailwindCSS) e MySQL.

---

## Tecnologias e Ferramentas

* **Orquestração de Monorepo:** Turborepo
* **Backend:** Node.js (v20+) com Express 5
* **Frontend:** React (v19) com Vite e TailwindCSS
* **Banco de Dados & ORM:** MySQL 8 e Sequelize ORM
* **Validação de Dados:** Zod
* **Autenticação:** JSON Web Tokens (JWT) com controle de sessões e Refresh Tokens
* **Suíte de Testes:** Vitest (Testes unitários e de integração com banco real)
* **Ambientes Isolados:** Docker e Docker Compose (para banco de dados local)

---

## Estrutura do Monorepo

O projeto está dividido em aplicações (`apps`) e pacotes compartilhados (`packages`):

```text
simple-order-system/
├── apps/
│   ├── api/          # API RESTful (Express, Sequelize, MySQL)
│   └── web/          # Interface Web (React, Vite, TailwindCSS)
├── packages/
│   └── schemas/      # Validações Zod compartilhadas entre API e Frontend
├── package.json      # Dependências globais e scripts de orquestração
└── turbo.json        # Configurações de pipeline e cache do Turborepo
```

---

## Configuração e Instalação

### Pré-requisitos

* Node.js v20 ou superior instalado.
* Docker e Docker Compose ativos na máquina.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Leomaan/simple-order-system.git
   cd simple-order-system
   ```

2. **Instalar dependências (executado na raiz):**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Copie os exemplos de ambiente tanto para a raiz quanto para as pastas internas.
   
   Na raiz do projeto:
   ```bash
   cp .env.example .env
   ```
   
   Na pasta da API (`apps/api`):
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

---

## Variáveis de Ambiente

As principais variáveis necessárias para a execução estão descritas abaixo:

```dotenv
PORT=3000

# Conexão com o banco de dados principal
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASS=123456
DB_NAME=simple_order_system

# Banco de dados de testes
TEST_DB_NAME=simple_order_system_test

# Autenticação
JWT_SECRET=sua_chave_secreta_de_32_caracteres
FRONTEND_URL=http://localhost:5173
```

---

## Inicialização do Banco de Dados (Docker)

Os testes de integração e o servidor de desenvolvimento necessitam de uma instância ativa do MySQL. Para subir o banco via contêiner Docker:

```bash
docker compose -f apps/api/docker-compose.yml up -d db
```

> **Nota:** O script `apps/api/src/scripts/init.sql` inicializará automaticamente o contêiner criando tanto a base de dados principal (`simple_order_system`) quanto a de testes (`simple_order_system_test`).

---

## Execução em Desenvolvimento

Para rodar todos os serviços do monorepo (API e Frontend) simultaneamente no modo de desenvolvimento:

```bash
npm run dev
```

* **Frontend:** Disponível em `http://localhost:5173`
* **Backend API:** Disponível em `http://localhost:3000`
* **Documentação Swagger:** Disponível em `http://localhost:3000/api-docs`

---

## Executando Testes

Os testes são escritos utilizando Vitest e cobrem as camadas de serviços, controllers e integração da API.

Para rodar toda a suíte de testes:
```bash
npm run test
```

> **Atenção:** Certifique-se de que o contêiner do Docker (`mysql_db`) esteja em execução, pois os testes de integração realizam chamadas reais ao banco mapeado em `localhost:3307`.

---

## Compilação para Produção (Build)

Para compilar todos os aplicativos e pacotes para o formato de produção:

```bash
npm run build
```

---

## Controle de Acesso e Perfis

O sistema dispõe de rotas e funcionalidades protegidas baseadas em funções de usuário (RBAC):

| Perfil | Nível de Acesso | Funcionalidades Principais |
| :--- | :--- | :--- |
| **Admin** | Total | Gerenciamento de usuários, exclusão física de registros, relatórios financeiros e de auditoria, além de gerenciamento de produtos. |
| **Garçom (Waiter)** | Operacional | Abertura de pedidos, adição e edição de itens de pedidos, fechamento de pedidos e emissão de cobrança PIX. |

---

## Rotas da API

### Autenticação (`/auth`)
* `POST /auth/login` - Autenticação com controle de limite de taxa.
* `POST /auth/refresh` - Atualização do token de sessão.
* `POST /auth/logout` - Encerramento de sessão e invalidação de tokens.

### Usuários (`/user`) - *Apenas Administradores*
* `GET /user` - Listagem de usuários.
* `GET /user/:id` - Detalhes do usuário.
* `POST /user` - Cadastro de novos funcionários.
* `PATCH /user/:id` - Atualização de dados cadastrais.
* `DELETE /user/:id` - Exclusão lógica (soft delete).
* `PATCH /user/:id/restore` - Restauração de usuário deletado.
* `DELETE /user/:id/permanent` - Remoção definitiva.

### Produtos (`/product`)
* `GET /product` - Listagem de produtos (Garçom+).
* `GET /product/:id` - Busca de produto por ID (Garçom+).
* `POST /product` - Criação de produto (Admin).
* `PUT /product/:id` - Edição de produto (Admin).
* `DELETE /product/:id` - Exclusão lógica de produto (Admin).
* `PATCH /product/:id/restore` - Restauração de produto (Admin).
* `DELETE /product/:id/permanent` - Exclusão definitiva (Admin).

### Pedidos (`/order`)
* `POST /order` - Abertura de novos pedidos (Garçom+).
* `GET /order` - Listagem geral (Garçom+).
* `GET /order/:id` - Busca de pedido por ID (Garçom+).
* `PUT /order/:id` - Atualização do pedido (Garçom+).
* `PATCH /order/:id/close` - Fechamento e encerramento de pedido (Garçom+).
* `DELETE /order/:id` - Exclusão lógica de pedido (Admin).
* `PATCH /order/:id/restore` - Restauração de pedido deletado (Admin).
* `DELETE /order/:id/permanent` - Exclusão definitiva (Admin).

### Itens de Pedido (`/order-item`)
* `POST /order-item` - Adiciona item a um pedido aberto (Garçom+).
* `PATCH /order-item/:id` - Altera a quantidade de um item (Garçom+).
* `DELETE /order-item/:id` - Remove item do pedido (Garçom+).

### Relatórios (`/report`) - *Apenas Administradores*
* `GET /report/today` - Faturamento e vendas do dia corrente.
* `GET /report/revenue` - Gráfico de faturamento por período.
* `GET /report/orders` - Estatísticas de pedidos por período.

### Pagamentos (`/payment`)
* `POST /payment/pix` - Geração do payload e QR Code de pagamento via PIX (Garçom+).
* `POST /payment/webhook` - Recepção de confirmação de pagamento do provedor (Público).
* `POST /payment/simulate-confirm` - Simulação de confirmação de pagamento (Garçom+ / Apenas Dev).

### Auditoria (`/audit`) - *Apenas Administradores*
* `GET /audit` - Acesso aos logs de ações sensíveis do sistema.

---

## Integração Contínua (CI)

O projeto conta com automação via **GitHub Actions** ([ci.yml](file:///C:/Users/CLIENTE/Documents/GitHub/simple-order-system/.github/workflows/ci.yml)). Toda alteração enviada ao repositório passa pelas seguintes etapas automáticas de validação:

1. Execução do Docker com banco de dados MySQL 8.
2. Instalação limpa de dependências.
3. Análise estática de código (Linter).
4. Execução de testes de unidade e integração.
5. Verificação do processo de Build de todas as aplicações.

As variáveis necessárias para o pipeline são repassadas ao ambiente do Turborepo via declaração explícita no arquivo [turbo.json](file:///C:/Users/CLIENTE/Documents/GitHub/simple-order-system/turbo.json).
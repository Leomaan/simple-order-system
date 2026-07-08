# Simple Order System 🍽️

Sistema completo de gerenciamento de pedidos e PDV para restaurantes e estabelecimentos comerciais. Desenvolvido em arquitetura monorepo utilizando **Turborepo**, **Node.js (Express)**, **React (Vite, TailwindCSS)**, **Sequelize** e **MySQL 8**.

O projeto conta com controle de perfis (Admin e Garçom), relatórios financeiros em tempo real, auditoria interna de ações sensíveis e **integração nativa de pagamentos via PIX (Mercado Pago)**.

---

## 🚀 Funcionalidades Principais & O que Implementamos

Durante o desenvolvimento recente, o sistema foi evoluído com recursos robustos para rodar tanto como um portfólio interativo quanto como um sistema real pronto para negócios:

* **⚙️ Painel de Configurações Dinâmicas (Multi-Tenant)**: As configurações do restaurante (nome do estabelecimento e credenciais de pagamento) são salvas diretamente no banco de dados. Isso possibilita alterar o nome e chaves do PIX dinamicamente em tempo de execução, sem necessidade de editar arquivos de código ou reiniciar servidores.
* **💳 Integração Real Mercado Pago (PIX)**: Geração automatizada de payloads Copia e Cola e imagem de QR Code dinâmico do PIX via API oficial do Mercado Pago.
* **⚡ Simulador de Confirmação (Dev Mode)**: Botão inteligente no painel do garçom para simular instantaneamente o pagamento do PIX, facilitando testes sem gastar dinheiro real e dispensando configurações complexas de túneis (como Ngrok) em ambiente local.
* **🔐 Segurança e Máscara de Credenciais**: Tokens de acesso confidenciais são armazenados no banco e retornados de forma mascarada (`TEST-...******abcd`) no painel administrativo, além de possuir proteção contra preenchimento automático indesejado (`autoComplete="new-password"`).
* **🧹 Limpeza Automática de Sessões**: Rotina inteligente que roda na inicialização do servidor backend, destruindo automaticamente registros de tokens de login expirados para manter o banco leve.
* **⏱️ Auditoria com Tempo Real**: Painel de auditoria do administrador com cálculos relativos dinâmicos de timestamps e exibição da data/hora completa ao passar o mouse.
* **👥 Acesso Rápido para Portfólio (Admin & Garçom Demo)**: Botões de login instantâneo na tela inicial para demonstração pública fluida de privilégios e layouts.

---

## 📁 Estrutura do Monorepo & Onde fica cada coisa?

Abaixo está o mapa de arquivos principais para guiar desenvolvedores ou proprietários de negócios que queiram customizar o sistema:

```text
simple-order-system/
├── apps/
│   ├── api/                          # BACKEND (API RESTful)
│   │   ├── server.js                 # Inicialização do servidor e limpeza de tokens
│   │   └── src/
│   │       ├── app.js                # Configuração do Express, CORS, CSRF e rotas
│   │       ├── config/
│   │       │   ├── database-cli.cjs  # Configuração de credenciais MySQL
│   │       │   └── swagger.js        # Configuração do Swagger UI (com caminhos dinâmicos)
│   │       ├── controllers/
│   │       │   ├── authController.js # Login, refresh, logout e controle de cookies/CSRF
│   │       │   ├── paymentController.js # Webhook e rotas de simulação de PIX
│   │       │   └── settingsController.js # GET/PUT de configurações do restaurante
│   │       ├── docs/                 # Arquivos de documentação OpenAPI (Swagger)
│   │       │   └── settings.doc.yaml # Docs das rotas de configurações
│   │       ├── migrations/           # Scripts de migração de tabelas Sequelize
│   │       ├── models/               # Modelos das tabelas do banco de dados (Sequelize)
│   │       │   └── settings.js       # Tabela de configurações gerais do restaurante
│   │       ├── routes/               # Definição de endpoints da API
│   │       └── services/
│   │           ├── paymentService.js # Integração de PIX (Mercado Pago / Simulação)
│   │           └── settingsService.js# Lógica de atualização e mascaramento de chaves
│   │
│   └── web/                          # FRONTEND (Interface do Usuário - React)
│       └── src/
│           ├── components/
│           │   ├── auth/
│           │   │   └── LoginForm.jsx # Login com botões de atalho Admin/Garçom Demo
│           │   ├── layout/
│           │   │   └── Sidebar.jsx   # Menu lateral (inclui o link de configurações)
│           │   └── settings/
│           │       └── SettingsSection.jsx # Painel administrativo de configurações
│           ├── hooks/
│           │   └── useSettings.jsx   # Hook para requisição e cache de dados de settings
│           └── pages/
│               ├── Admin.jsx         # Dashboard administrativo (relatórios, produtos, logs)
│               └── Waiter.jsx        # Painel do garçom (pedidos e pagamentos)
│
└── packages/
    └── schemas/                      # VALIDAÇÕES ZOD COMPARTILHADAS (API e Web)
        ├── index.js                  # Exportação central de validações
        └── settingsSchema.js         # Validações Zod para nome do restaurante e chaves MP
```

---

## 🛠️ Tecnologias e Ferramentas

* **Orquestração de Monorepo:** Turborepo
* **Backend:** Node.js (v20+) com Express 5
* **Frontend:** React (v19) com Vite e TailwindCSS
* **Banco de Dados & ORM:** MySQL 8 e Sequelize ORM
* **Validação de Dados:** Zod
* **Autenticação:** JSON Web Tokens (JWT) armazenados em Cookies HttpOnly (`sameSite` configurável em produção) com controle de sessões e Refresh Tokens
* **Suíte de Testes:** Vitest (Testes unitários e de integração com banco real)
* **Ambientes Isolados:** Docker e Docker Compose (para banco de dados local)

---

## ⚙️ Configuração para o seu Negócio (Customização)

Se você deseja adotar esta aplicação para o seu próprio estabelecimento, siga estes passos para customizar a identidade visual e os dados operacionais:

### 1. Customizar Nome e Identidade Visual (Branding)
* **Nome do Restaurante (Padrão)**: O nome padrão do restaurante exibido na barra superior e nos relatórios é definido na inicialização por meio do banco. Você pode alterá-lo diretamente no Painel Administrativo (`/admin` -> Configurações) ou editar a semente padrão em `apps/api/src/scripts/seed.js`.
* **Cores e Temas**: O layout utiliza Tailwind CSS com tons neutros escuros e detalhes em Laranja/Laranja-Escuro. Para mudar a cor de destaque (ex: mudar de Laranja para Azul):
  1. Vá até o arquivo CSS global `apps/web/src/index.css`.
  2. Altere os valores de cores padrão ou substitua as classes de cores de destaque Tailwind (como `bg-orange-500` e `text-orange-500`) nos componentes de Sidebar ([Sidebar.jsx](file:///C:/Users/CLIENTE/Documents/GitHub/simple-order-system/apps/web/src/components/layout/Sidebar.jsx)) e Páginas principais.

### 2. Configurar a Integração de PIX (Mercado Pago)
Para receber pagamentos diretamente na sua conta bancária pelo sistema:
1. Acesse o portal de desenvolvedores do [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel).
2. Crie uma aplicação para o seu negócio.
3. No menu lateral, acesse **Credenciais**:
   * **Para Testes**: Use as credenciais da aba "Credenciais de teste" (Access Token começando com `TEST-`).
   * **Para Produção (Dinheiro Real)**: Faça a ativação da conta preenchendo o formulário de cadastro no painel. Depois, copie o Access Token da aba "Credenciais de produção" (começando com `APP_USR-`).
4. Abra o painel de administrador do seu sistema (`/admin` -> Configurações).
5. Cole o seu **Access Token** no campo respectivo e salve. 

### 3. Remover os Botões de Acesso Rápido (Demo)
Quando colocar o site no ar para os funcionários de verdade usarem, remova os botões que preenchem as senhas automaticamente:
1. Abra o arquivo [LoginForm.jsx](file:///C:/Users/CLIENTE/Documents/GitHub/simple-order-system/apps/web/src/components/auth/LoginForm.jsx).
2. Remova ou comente a div que renderiza os botões de demo (linhas correspondentes à renderização de "Admin Demo" e "Garçom Demo" no final do formulário).

---

## 💻 Instalação e Execução Local

### Pré-requisitos
* Node.js v20 ou superior instalado.
* Docker e Docker Compose ativos.

### Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/Leomaan/simple-order-system.git
   cd simple-order-system
   ```
2. Instale as dependências na raiz:
   ```bash
   npm install
   ```
3. Crie os arquivos `.env` baseados nos exemplos:
   ```bash
   # Na raiz
   cp .env.example .env
   # Na API
   cp apps/api/.env.example apps/api/.env
   ```

### Rodar Banco de Dados (Local)
Para iniciar o MySQL local através de container Docker:
```bash
docker compose -f apps/api/docker-compose.yml up -d db
```

### Inicializar Banco com Dados Iniciais (Seeds)
Para popular o banco com os produtos iniciais, usuários padrões e as configurações padrão do restaurante:
```bash
npm run db:seed --workspace=@simple-order/api
```

### Executar em Desenvolvimento
Para rodar a API e o Frontend React ao mesmo tempo em modo hot-reload:
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **API Backend:** `http://localhost:3000`
* **Docs Swagger:** `http://localhost:3000/api-docs`

---

## 🧪 Rodando os Testes

Os testes automatizados cobrem rotas, permissões, serviços e integrações:
```bash
npm run test
```

---

## 📦 Deploy em Produção

Consulte o nosso guia passo a passo completo para hospedar o frontend, backend e o banco de dados em servidores online de forma 100% gratuita no arquivo:
* **[Guia de Deploy Gratuito (Aiven + Render + Vercel)](file:///C:/Users/CLIENTE/.gemini/antigravity-cli/brain/2eed2ae3-0eb3-4c81-a89a-3ce31424ffbe/deployment_plan.md)**
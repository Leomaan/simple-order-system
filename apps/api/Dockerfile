# Estágio de build temporário
FROM node:20-alpine AS builder
WORKDIR /app

# Copia os arquivos de pacotes para cacheamento de camadas
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/schemas/package*.json ./packages/schemas/

# Instala todas as dependências (incluindo devDependencies) para validação se necessário
RUN npm ci

# Copia o código-fonte dos pacotes internos e da API
COPY packages/schemas ./packages/schemas
COPY apps/api ./apps/api

# Estágio final de execução (imagem de produção leve com usuário não-privilegiado)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia arquivos necessários e fontes com propriedade do usuário não-privilegiado node
COPY --chown=node:node package*.json ./
COPY --chown=node:node apps/api/package*.json ./apps/api/
COPY --chown=node:node packages/schemas/package*.json ./packages/schemas/
COPY --chown=node:node --from=builder /app/packages/schemas ./packages/schemas
COPY --chown=node:node --from=builder /app/apps/api ./apps/api

# Instala apenas as dependências de produção para o workspace do backend API e schemas
RUN npm ci --omit=dev --workspace=@simple-order/api --workspace=@simple-order/schemas

EXPOSE 3000

# Executa a API de dentro da pasta correspondente usando o usuário padrão 'node' (sem root)
WORKDIR /app/apps/api
USER node
CMD ["node", "server.js"]

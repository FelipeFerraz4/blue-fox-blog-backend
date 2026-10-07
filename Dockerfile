# Stage 1: Base
FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json tsconfig*.json nest-cli.json ./
COPY prisma ./prisma/

# Stage 2: Development (used by docker compose dev with hot-reload)
FROM base AS development

ENV NODE_ENV=development

RUN npm install
COPY src ./src/
RUN npx prisma generate

EXPOSE 8081

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && npm run start:dev"]

# Stage 3: Builder (compilation for production)
FROM base AS builder

RUN npm install
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# Stage 4: Production Runtime (lean minimal image)
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

COPY package*.json tsconfig*.json ./
RUN npm install --omit=dev && npm install -g prisma

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/logs && chown -R node:node /app/logs

USER node

EXPOSE 8081

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && node dist/src/main"]

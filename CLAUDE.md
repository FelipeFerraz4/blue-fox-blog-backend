# Blue Fox Blog Backend — Contexto para IA

API REST multi-tenant que serve os blogs do ecossistema (hoje o principal consumidor é o **blue-fox-aquarismo**). Substitui um backend legado em Spring Boot, por isso alguns comentários citam classes Java.

- **Stack**: NestJS 10, Prisma 5 (Postgres 16), Passport JWT + `jwks-rsa` (Keycloak), Swagger, Terminus, Winston com rotação diária.
- **Porta**: 8081 · prefixo global `/api` · Swagger em `/api/docs` (desligado em prod via `SWAGGER_ENABLED=false`) · health em `/api/health`.
- **Produção**: `https://blog-api.bluefoxglobalgroup.com` · containers `blue-fox-blog-back-api` / `blue-fox-blog-back-db`.

## Estrutura

```
src/
├── main.ts                 # bootstrap: cookie-parser, CORS (origin: true), ValidationPipe, Swagger, polyfill BigInt→JSON
├── app.module.ts           # guards/filtros/interceptors globais + TenantMiddleware em todas as rotas
├── config/env.config.ts    # validação de env e montagem do DATABASE_URL
├── common/                 # http-exception.filter, action-audit-log.interceptor, logger Winston, DTOs de erro/status
├── prisma/                 # PrismaService/PrismaModule (global)
└── modules/
    ├── auth/               # jwt.strategy, jwt-auth.guard, roles.guard, @Public, @Roles, @CurrentUser
    ├── tenant/             # TenantContext (AsyncLocalStorage) + TenantMiddleware
    ├── blogs/ authors/ categories/ posts/ comments/   # domínio (controller, service, module, dto/)
    └── health/
prisma/schema/*.prisma      # base, blog, author, category, post, comment (prismaSchemaFolder)
prisma/seeds/*.ts + seed.ts # seeds de blogs, autores, categorias e posts
logs/YYYY-MM-DD/            # app.log, error.log, actions.log (gerado em runtime)
```

## Regras que a IA precisa respeitar

1. **Multi-tenancy é obrigatório.** O tenant vem do header `X-Blog-ID` (ou do cookie `blog_id`), precisa ser UUID e cai em `DEFAULT_TENANT_ID` (`77e2c400-…5566`) quando ausente. **Toda** query Prisma de domínio deve filtrar por `blogId: TenantContext.getTenantId()` e toda criação deve gravar esse `blogId`. Siga o padrão de `categories.service.ts`.
2. **Auth fechada por padrão.** `JwtAuthGuard` e `RolesGuard` são `APP_GUARD`. Leitura pública usa `@Public()`; escrita usa `@Roles(...)` + `@ApiBearerAuth('JWT-auth')`.
3. **Roles**: use só as constantes de `modules/auth/roles.constants.ts` (`KeycloakRole`), que espelham o realm do [blue-fox-iam](../blue-fox-iam/CLAUDE.md). Padrão: escrita → `ADMIN, AQUARIUM_ADMIN, AQUARIUM_EDITOR`; exclusão (soft/hard) → `ADMIN, AQUARIUM_ADMIN`. O `jwt.strategy` também aceita a forma sem `ROLE_`, para compatibilidade.
4. **Soft delete via `Status`** (`ACTIVE | INACTIVE | SUSPENDED | PENDING | DELETED`): `DELETE /:id` muda o status e `DELETE /hard/:id` remove de fato (só `ROLE_ADMIN` / `ROLE_AQUARIUM_ADMIN`). `PATCH /:id/status` usa o `UpdateStatusDto` comum.
5. **Rotas versionadas**: controllers em `v1/<recurso>`. Declare rotas estáticas (`latest`, `slug/:slug`, `all`) **antes** de `:id`, porque o `ParseUUIDPipe` rejeita as outras.
6. **Swagger em inglês**: todo endpoint novo leva `@ApiTags`, `@ApiOperation` e `@ApiResponse`.
7. `views`/`likes` são `BigInt` no Prisma; o polyfill do `main.ts` os serializa como number.
8. Mudou um schema? Gere uma migration (`npx prisma migrate dev --name <nome>`) e versione a pasta em `prisma/migrations/`.
9. **Rascunhos nunca são públicos.** Visitante anônimo (ou usuário sem papel de conteúdo) só recebe posts `published = true` **e** `status = ACTIVE`; o resto responde 404 (por slug/id/recomendados) ou não é listado (`/posts`, `/posts/all`, `/posts/status/:status`). Quem tem `ROLE_ADMIN`, `ROLE_AQUARIUM_ADMIN` ou `ROLE_AQUARIUM_EDITOR` enxerga tudo nessas mesmas rotas: elas aceitam token opcional e o controller repassa `canSeeUnpublished(user)` (`modules/auth/content-visibility.ts`) ao serviço. Operações internas (criar, atualizar, status, remover) chamam `findById(id, true)`. Contagem de views ignora rascunhos. Categorias e autores seguem a regra com `canSeeInactive` (anônimo só vê `ACTIVE`).
10. **Publicar um post**: `PUT /api/v1/posts/:id` com `{"published": true}` (papel de editor/admin); isso preenche `publishedAt`. O seed usa `update: {}`, então **nunca** altera posts já existentes no banco.
11. **Rotas fixas antes de `:id`** no mesmo controller (`all`, `status/:status`...), senão o `ParseUUIDPipe` as captura e responde 400. Há testes HTTP em `posts.controller.spec.ts` cobrindo isso.

## Algoritmos de posts

- **Relevância**: `views*0.5 + likes*2 + comments*3 - diasDesdePublicacao*0.1` (`GET v1/posts/most-relevance`).
- **Próximos posts**: até 6, por categoria e cronologia, com fallback (`GET v1/posts/next-posts/:slug`).
- **Recomendados**: relação M:N manual em `post_recommendations` (`GET v1/posts/recommended-posts/:slug`).
- Contagem de views pública: `PATCH v1/posts/views/:slug`.

## Comandos

```bash
npm run start:dev                 # watch, porta 8081
npm run prisma:generate           # gera o client
npx prisma migrate dev --name x   # nova migration (dev)
npm run prisma:migrate            # migrate deploy (prod)
npm run prisma:seed
npm test                          # unit (src/**/*.spec.ts)
npm run test:e2e

# Docker (requer: docker network create infra-net)
docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Env principais: `DATABASE_URL`, `KEYCLOAK_ISSUER_URI`, `PORT`, `SWAGGER_ENABLED`, `LOG_LEVEL`.

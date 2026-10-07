# 🦊 Blue Fox Blog Backend - Migração NestJS + Prisma

Esta pasta isolada (`nest-migration/`) contém a nova arquitetura do backend em **Nest.js + Prisma**, construída para substituir a versão legado em Spring Boot sem riscos de perda ou interferência no código original.

---

## 📁 Estrutura de Arquivos

```text
nest-migration/
├── backend/                  # Aplicação NestJS modular
│   ├── Dockerfile            # Multi-stage build otimizado com Node 22 Alpine
│   ├── package.json          # Dependências e scripts
│   ├── tsconfig.json         # Configuração estrita do TypeScript
│   ├── nest-cli.json
│   ├── prisma/               # Modelagem modular de schema e seeds
│   ├── logs/                 # Diretório de logs particionados por data (YYYY-MM-DD)
│   └── src/
│       ├── config/           # Configuração de ambiente e fallback de DATABASE_URL
│       ├── app.module.ts     # Módulo raiz
│       └── main.ts           # Bootstrap com Swagger (/api/docs), CORS, Cookies
├── docker-compose.yml        # Definição base (PostgreSQL + API NestJS)
├── docker-compose.dev.yaml   # Override de desenvolvimento (hot-reload e portas)
├── docker-compose.prod.yml   # Override de produção (restart policies e redes)
├── .env.dev                  # Variáveis de ambiente prontas para Dev
├── .env.dev.example
├── .env.prod                 # Variáveis de ambiente para Prod
└── .env.prod.example
```

---

## 🚀 Como Executar

### Modo Desenvolvimento Local:
```bash
cd backend
npm install
npm run start:dev
```
A API estará disponível em: `http://localhost:8081/api`  
Documentação Swagger em: `http://localhost:8081/api/docs`

### Modo Docker Compose (Dev):
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yaml --env-file .env.dev up --build
```

### Modo Docker Compose (Prod):
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

---

## 📌 Status das Fases de Migração

- [x] **Fase 1: Setup do Ambiente e Base do Projeto Nest.js**
  - Scaffold NestJS criado e compilando com sucesso (`npm run build`).
  - Dockerfile multi-stage configurado.
  - `docker-compose.yml`, `docker-compose.dev.yaml` e `docker-compose.prod.yml` estruturados.
  - `.env.dev` e `.env.prod` configurados.
- [x] **Fase 2: Modelagem Prisma e Migrations Multi-Schema**
  - Prisma multi-schema configurado em `prisma/schema/` (`base.prisma`, `blog.prisma`, `author.prisma`, `category.prisma`, `post.prisma`, `comment.prisma`).
  - `PrismaService` e `PrismaModule` criados com ciclo de vida OnModuleInit e OnModuleDestroy.
  - Seeds modulares implementados (`seedBlogs`, `seedAuthors`, `seedCategories`, `seedPosts` com recomendações M:N).
  - Polyfill global de serialização de BigInt para JSON.
  - Prisma Client gerado e build compilado com sucesso.
- [x] **Fase 3: Logs Locais em Subpastas por Data e Health Check**
  - Módulo de Health Check (`@nestjs/terminus`) com checagem ativa do Prisma (`PrismaHealthIndicator`) e limites de memória (Heap/RSS).
  - Winston Logger configurado com `winston-daily-rotate-file` particionando logs em subpastas por data (`logs/YYYY-MM-DD/app.log`, `logs/YYYY-MM-DD/error.log` e `logs/YYYY-MM-DD/actions.log`).
  - `ActionAuditLogInterceptor` global gravando método, rota, tenant, IP, latência e usuário em `actions.log`.
  - Health check HTTP configurado no `docker-compose.yml`.
- [x] **Fase 4: Multi-tenancy Híbrido (Header + Cookie) e Segurança Keycloak**
  - `TenantContext` com `AsyncLocalStorage` garantindo isolamento concorrente do `blogId`.
  - `TenantMiddleware` híbrido com suporte ao header `X-Blog-ID` e cookie `blog_id`, validação de UUID e fallback para o blog padrão.
  - Decorator `@CurrentTenant()` para injeção limpa nos controllers.
  - `JwtStrategy` com `jwks-rsa` validando tokens emitidos pelo Keycloak (`KEYCLOAK_ISSUER_URI`) e extraindo roles do `realm_access.roles`.
  - `JwtAuthGuard` global com suporte ao decorator `@Public()` e autenticação opcional.
  - `RolesGuard` global com suporte ao decorator `@Roles('ADMIN', 'AQUARISM_EDITORS')`.
  - Decorator `@CurrentUser()` para acesso ao payload do usuário autenticado.
- [x] **Fase 5: Migração dos Módulos de Domínio (Categories, Authors, Posts, Comments, Blogs)**
  - Módulo **Categories**: CRUD completo, endpoints de busca por slug/nome/status, soft/hard delete, DTOs e validação de slugify.
  - Módulo **Authors**: CRUD completo, busca por slug/email/nome/status, soft/hard delete, DTOs e validação de unicidade de email/slug.
  - Módulo **Posts**: CRUD completo, busca de `last-post`, `latest`, `most-relevance` (cálculo de score ponderado por views, likes, comentários e tempo), `recommended-posts` e `next-posts` (algoritmo sequencial inteligente), incrementadores de visualização (incluindo público por slug).
  - Módulo **Comments**: Criação pública por leitores, listagem por post e endpoints protegidos de moderação de status e exclusão.
  - Módulo **Blogs**: Consulta pública do blog corrente via multi-tenant e listagem por slug.
- [x] **Fase 6: Documentação OpenAPI / Swagger Interativo**
  - Configuração oficial do Swagger OpenAPI 100% em inglês com persistência de token e filtragem rápida.
  - Agrupamento por tags descritivas (`Health`, `Category`, `Author`, `Post`, `Comment`, `Blog`).
  - `ErrorResponseDto` e `GlobalHttpExceptionFilter` padronizando respostas de erro 400, 401, 403, 404, 409 e 500 no mesmo formato do Spring Boot.
  - Decorators compostos `@DefaultApiResponses()` e `@DefaultReadApiResponses()`.
  - Parâmetro global `X-Blog-ID` e autenticação Bearer JWT documentados interativamente em `/api/docs`.
- [ ] **Fase 7: Validação, Testes Automatizados e Cutover**

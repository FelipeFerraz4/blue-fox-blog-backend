# 🦊 Blue Fox Blog Backend (NestJS + Prisma)

Enterprise REST API with Prisma ORM for the Blue Fox Blog ecosystem, replacing legacy Spring Boot. Features modular multi-schema database architecture, multi-tenancy isolation via `X-Blog-ID` (with cookie fallback), stateless OAuth2 Keycloak JWT authentication, structured Winston logging with daily rotation, and interactive OpenAPI documentation.

---

## 📁 Repository Structure

```text
.
├── Dockerfile              # Multi-stage production build (Node 22 Alpine)
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # Strict TypeScript configuration
├── nest-cli.json
├── docker-compose.yml      # Base orchestration (PostgreSQL + NestJS API)
├── docker-compose.dev.yaml # Development override (hot-reload & ports)
├── docker-compose.prod.yml # Production override (restart policies & networks)
├── .env.dev.example        # Development environment template
├── .env.prod.example       # Production environment template
├── prisma/
│   ├── schema/             # Modular Prisma schemas (base, blog, author, category, post, comment)
│   ├── seed.ts             # Orchestrator seed runner
│   └── seeds/              # Seed fixtures (blogs, authors, categories, posts)
├── logs/                   # Daily rotating log folders (YYYY-MM-DD)
├── src/
│   ├── config/             # Environment validation and dynamic DATABASE_URL
│   ├── common/             # Interceptors, Winston logger, global filters, Swagger decorators
│   ├── modules/
│   │   ├── auth/           # Keycloak JWT strategy, roles guard, decorators
│   │   ├── authors/        # Author profile management
│   │   ├── blogs/          # Multi-tenant blog discovery
│   │   ├── categories/     # Category taxonomy and hierarchy
│   │   ├── comments/       # Reader comments and moderation
│   │   ├── health/         # Terminus health probes (database + memory)
│   │   ├── posts/          # Articles, smart recommendation and relevance algorithm
│   │   └── tenant/         # AsyncLocalStorage tenant isolation
│   ├── app.module.ts       # Application root module
│   └── main.ts             # Application entrypoint (Swagger /api/docs, CORS, Cookies)
└── test/
    ├── app.e2e-spec.ts     # End-to-end integration tests (health, tenancy, security, errors)
    └── jest-e2e.json       # Jest E2E test configuration
```

---

## 🚀 Getting Started

### Local Development:
```bash
# Install dependencies
npm install

# Run database migrations and generate Prisma client
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Start in watch mode
npm run start:dev
```
API endpoints: `http://localhost:8081/api`  
Swagger OpenAPI: `http://localhost:8081/api/docs`  
Health Probes: `http://localhost:8081/api/health`

### Automated Tests:
```bash
# Unit tests
npm test

# E2E integration tests
npm run test:e2e
```

### Docker Compose (Dev):
```bash
cp .env.dev.example .env.dev
docker compose -f docker-compose.yml -f docker-compose.dev.yaml --env-file .env.dev up --build
```

### Docker Compose (Prod):
```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

---

## 📌 Architecture Highlights

- **Multi-Tenancy:** Automated request context scoping via `AsyncLocalStorage`. Resolves tenant ID from `X-Blog-ID` header or `blog_id` cookie.
- **Keycloak JWT Auth:** Stateless Bearer token verification with JWKS public keys. Extract roles from `realm_access.roles` and enforces RBAC via `@Roles()`. Public endpoints marked with `@Public()`.
- **Engagement Algorithm:** Posts relevance formula `(views * 0.5) + (likes * 2.0) + (comments * 3.0) - (daysSincePublication * 0.1)` for trending content.
- **Sequential Reading:** Next post algorithm sequentially selects upcoming articles within the active category and tenant.
- **Health Probes:** Kubernetes/Docker ready on `/api/health` checking database connectivity and heap/RSS memory thresholds.
- **Structured Audit Logging:** Logs automatically stored by calendar date in `logs/YYYY-MM-DD/{app,error,actions}.log` tracking tenant ID, route latency, HTTP status and client IP.

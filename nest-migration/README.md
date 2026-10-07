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
- [ ] **Fase 3: Logs Locais em Subpastas por Data e Health Check**
- [ ] **Fase 4: Multi-tenancy Híbrido (Header + Cookie) e Segurança Keycloak**
- [ ] **Fase 5: Migração dos Módulos de Domínio (Categories, Authors, Posts, Comments, Blogs)**
- [ ] **Fase 6: Documentação OpenAPI / Swagger Interativo**
- [ ] **Fase 7: Validação, Testes Automatizados e Cutover**

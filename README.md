# TrackFlow API

API REST em [NestJS](https://nestjs.com/) para **ingestão de eventos** de produto e **métricas agregadas**, com autenticação JWT, limitação de taxa (rate limiting), observabilidade por **correlation ID**, cache opcional em **Redis** para analytics, e health checks prontos para **Render**, **Railway** ou qualquer orquestrador com Docker.

## Funcionalidades

| Área | Detalhe |
|------|---------|
| **API versionada** | Rotas em `/v1/*`; OpenAPI em `/docs` |
| **Auth** | Registro, login, JWT |
| **Events** | Criação e listagem paginada |
| **Users** | CRUD organizado: perfil `me`, operações admin, permissões por papel (`USER` / `ADMIN`) |
| **Analytics** | Contagens e agrupamentos com filtro por período (`24h`, `7d`, `30d`) ou intervalo ISO `from`/`to` |
| **Cache** | Respostas de analytics cacheadas; Redis via `REDIS_URL` ou memória no processo |
| **Health** | `GET /health`, `/health/live`, `/health/ready` (Postgres + heap) |
| **Segurança** | Helmet, validação global de DTOs (whitelist), rate limiting configurável |
| **Erros** | `HttpExceptionFilter` global com `correlationId` e payload consistente |

## Stack

- Node.js 20+, TypeScript  
- PostgreSQL + [Prisma](https://www.prisma.io/) (driver adapter `pg`)  
- JWT (`@nestjs/jwt` + Passport)  
- Logs HTTP: `pino` + `pino-http`  
- Documentação: Swagger (`/docs`)

## Pré-requisitos

- Node 20+  
- PostgreSQL acessível via `DATABASE_URL`  
- Opcional: Redis para cache de analytics  

## Configuração

Copie o exemplo de variáveis:

```bash
cp .env.example .env
```

Principais variáveis (ver `.env.example`):

- `DATABASE_URL` — connection string PostgreSQL  
- `JWT_SECRET` — obrigatório em produção  
- `REDIS_URL` — opcional; sem isto o cache de analytics é em memória  
- `THROTTLE_TTL_MS` / `THROTTLE_LIMIT` — rate limiting global  
- `CORS_ORIGIN` — lista separada por vírgula (padrão `*`)  

## Banco e seed

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

O seed cria usuários de demonstração (incluindo `admin@trackflow.com` com papel **ADMIN**) e eventos de exemplo. Senha de demo documentada na saída do comando.

## Executar

```bash
npm run start:dev
```

- API: `http://localhost:3000/v1`  
- Swagger: `http://localhost:3000/docs`  
- Liveness: `http://localhost:3000/health/live`  

## Docker

Build e execução com migrações na subida:

```bash
docker build -t trackflow-api .
docker run --rm -p 3000:3000 --env-file .env trackflow-api
```

O `.dockerignore` reduz contexto de build (testes, artefatos locais, etc.).

## Deploy (Render / Railway)

- **Render**: blueprint em [`render.yaml`](./render.yaml) — define serviço web Docker e health check em `/health/live`. Configure `DATABASE_URL` e opcionalmente `REDIS_URL` nos secrets do dashboard.  
- **Railway**: [`railway.toml`](./railway.toml) aponta para o `Dockerfile` e healthcheck.  

### Vercel

Este projeto é uma **API Node stateful** (servidor HTTP long-lived). A Vercel é otimizada para frontends e funções serverless; hospedar Nest aqui exige adaptação (serverless wrapper, cold starts, timeouts). **Recomendação:** rode a API em Render/Railway/Fly/Kubernetes e use a Vercel apenas para o frontend ou para proxies leves. O arquivo [`vercel.json`](./vercel.json) mantém apenas metadados de build para referência em monorepos; não substitui um runtime HTTP dedicado.

## Testes

```bash
npm run test
npm run test:e2e
```

Os e2e sobrescrevem `PrismaService` com mocks para não exigir Postgres na CI leve.

## Como vender

TrackFlow API é um **backend pronto para produto digital** que coleta eventos de uso (page views, cliques, funil) e expõe **analytics cacheável** para dashboards e operações. Use este pacote como:

1. **Produto SaaS de analytics** — vendido por volume de eventos, usuários ativos ou workspaces; destaque SLA, Redis opcional e rate limiting contra abuso.  
2. **Camada de dados para agências** — ingestão padronizada para vários clientes (`userId` + `metadata` JSON); papers com export CSV ou BI via Postgres.  
3. **Add-on de compliance-ready logging** — correlation ID ponta a ponta, erros padronizados e health checks facilitam auditoria e contratos enterprise.  
4. **API white-label** — versionamento `/v1`, OpenAPI publicável e Docker único simplificam integração para parceiros.

**Argumentos de valor:** tempo de implantação (Docker + migrações automáticas), segurança base (JWT, helmet, throttle), escalabilidade horizontal (stateless + Redis compartilhado), e documentação interativa para reduzir custo de suporte.

## Licença

UNLICENSED — ajuste conforme o modelo do seu negócio.

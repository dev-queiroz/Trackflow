# TrackFlow API

**API moderna de ingestão de eventos e analytics em tempo real.**

Uma solução backend completa para rastrear comportamento de usuários, medir engajamento e gerar métricas agregadas — inspirada em Segment, Mixpanel e Amplitude, mas com arquitetura simples, performática e pronta para produção.

## ✨ Funcionalidades

- **Versionamento**: Todas as rotas em `/v1`
- **Autenticação**: Registro, Login com JWT + Refresh Token pronto
- **Eventos**: Ingestão robusta com validação, metadata flexível (JSON) e paginação
- **Analytics**: Contagens, agrupamentos por evento, filtro por período (`24h`, `7d`, `30d`) ou intervalo customizado
- **Users**: Perfil (`/me`), CRUD completo e controle de papéis (`USER` / `ADMIN`)
- **Observabilidade**: Correlation ID, logs estruturados (Pino), Health Checks avançados
- **Segurança**: Rate Limiting, validação global de DTOs, CORS configurável, Helmet
- **Performance**: Cache de analytics (Redis ou in-memory), índices otimizados no PostgreSQL
- **Deploy**: Docker-first, blueprints para Render e Railway

## Tecnologias

- **Framework**: NestJS 11 + TypeScript
- **Banco**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Passport
- **Logging**: Pino + pino-http
- **Documentação**: Swagger/OpenAPI
- **Cache**: Redis (opcional)
- **Infra**: Docker, Render, Railway

## Pré-requisitos

- Node.js 20+
- PostgreSQL (local ou Neon)
- (Opcional) Redis

## Instalação Rápida

```bash
# 1. Clone e instale
git clone <url>
cd trackflow-api
npm install

# 2. Configure ambiente
cp .env.example .env

# 3. Banco de dados
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Execute
npm run start:dev
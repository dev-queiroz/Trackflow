# Tracked API

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7?style=for-the-badge&logo=render&logoColor=white)

**Modern event ingestion and real-time analytics API.**

A robust backend for tracking user behavior, measuring engagement, and generating aggregated metrics. Inspired by tools like Segment, Mixpanel, and Amplitude, **Tracked API** provides a clean, performant, production-ready architecture.

---

## Core Features

- **Event Ingestion**: Robust pipeline with strict validation, flexible JSON metadata support, and optimized processing.
- **Intelligent Analytics**: Aggregate data instantly. Supports counts, grouping by event name, and temporal filters (`24h`, `7d`, `30d`) or custom date ranges.
- **Enterprise Security**:
  - JWT authentication with refresh tokens.
  - Role-based access control (`RBAC`).
  - Rate limiting and common-attack protection via Helmet.
- **Observability**: Structured logs with Pino, correlation IDs on every request, and detailed health checks (liveness/readiness).
- **Performance**: Smart caching (Redis or in-memory) for analytics endpoints and database-friendly indexing.
- **DX (Developer Experience)**: Interactive Swagger/OpenAPI docs and a fully configured Docker environment.

---

## Tech Stack

- **Core**: [NestJS 11](https://nestjs.com/) + TypeScript
- **ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Auth**: JWT + Passport
- **Logging**: Pino + pino-http
- **Docs**: Swagger (OpenAPI 3.0)
- **Cache**: Redis / Cache Manager
- **Infra**: Docker, GitHub Actions (CI/CD), Render

---

## Installation and Setup

### Prerequisites

- Node.js 20+
- Docker (optional, recommended)
- PostgreSQL (local or cloud)

### Step by Step

```bash
# 1. Clone the repository
git clone https://github.com/dev-queiroz/Trackflow.git
cd tracked-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Prepare the database
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Start the server
npm run start:dev
```

The API will be available at `http://localhost:3000/v1`.
The interactive documentation will be available at `http://localhost:3000/docs`.

---

## Docker

To run the full environment with PostgreSQL and Redis:

```bash
docker-compose up -d
```

---

## Tests

The project includes a complete test suite (unit and e2e) with high coverage.

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## CI/CD

Continuous integration is configured through **GitHub Actions**:

- **CI**: Lint, build, and automated tests on every push and pull request.
- **CD**: Automatic deployment to **Render** after a successful pipeline.
- **Keep-alive**: Mechanism that prevents the free Render instance from sleeping.

---

## License

This project is licensed under MIT. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with love by <a href="https://github.com/dev-queiroz">dev-queiroz</a>
</p>

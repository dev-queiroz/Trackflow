# 📊 Tracked API

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7?style=for-the-badge&logo=render&logoColor=white)

**API moderna de ingestão de eventos e analytics em tempo real.**

Uma solução backend robusta para rastrear comportamento de usuários, medir engajamento e gerar métricas agregadas. Inspirada em líderes como Segment, Mixpanel e Amplitude, o **Tracked** oferece uma arquitetura limpa, performática e pronta para produção.

---

## 🚀 Funcionalidades Principais

- **📦 Ingestão de Eventos**: Pipeline robusto com validação rigorosa, suporte a metadata flexível (JSON) e processamento otimizado.
- **📈 Analytics Inteligente**: Agregue dados instantaneamente. Suporte a contagens, agrupamentos por tipo de evento e filtros temporais (`24h`, `7d`, `30d`) ou intervalos customizados.
- **🛡️ Segurança Enterprise**:
  - Autenticação JWT com Refresh Tokens.
  - Controle de Acesso Baseado em Roles (`RBAC`).
  - Rate Limiting e proteção contra ataques comuns via Helmet.
- **🔍 Observabilidade**: Logs estruturados com Pino, Correlation ID em todas as requisições e Health Checks detalhados (Liveness/Readiness).
- **⚡ Performance**: Sistema de cache inteligente (Redis ou In-memory) para endpoints de analytics e índices otimizados no banco de dados.
- **🛠️ DX (Developer Experience)**: Documentação interativa via Swagger/OpenAPI e ambiente Docker totalmente configurado.

---

## 🛠️ Stack Tecnológica

- **Core**: [NestJS 11](https://nestjs.com/) + TypeScript
- **ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Auth**: JWT + Passport
- **Logs**: Pino + pino-http
- **Docs**: Swagger (OpenAPI 3.0)
- **Cache**: Redis / Cache Manager
- **Infra**: Docker, GitHub Actions (CI/CD), Render

---

## ⚙️ Instalação e Setup

### Pré-requisitos
- Node.js 20+
- Docker (opcional, recomendado)
- PostgreSQL (Local ou Cloud)

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/dev-queiroz/tracked.git
cd tracked-api

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Prepare o Banco de Dados
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Inicie o servidor
npm run start:dev
```

A API estará disponível em `http://localhost:3000/v1`
A documentação interativa em `http://localhost:3000/docs`

---

## 🐳 Docker

Para rodar o ambiente completo com PostgreSQL e Redis:

```bash
docker-compose up -d
```

---

## 🧪 Testes

O projeto conta com uma suíte de testes completa (Unitários e E2E) com alta cobertura.

```bash
# Testes unitários
npm run test

# Testes E2E (End-to-End)
npm run test:e2e

# Cobertura
npm run test:cov
```

---

## 🛰️ CI/CD

O projeto possui integração contínua configurada via **GitHub Actions**:
- **CI**: Lint, Build e Testes automatizados em cada Push/PR.
- **CD**: Deploy automático para o **Render** após sucesso no pipeline.
- **Keep-Alive**: Mecanismo que evita o suspensão da instância gratuita do Render.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/dev-queiroz">dev-queiroz</a>
</p>

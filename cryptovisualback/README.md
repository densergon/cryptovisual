# CryptoVisual Backend

NestJS 11 backend — signaling, telemetry, and public key directory for the CryptoVisual hybrid encryption educational tool.

## Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Runtime**: Node 22
- **Database**: PostgreSQL via Prisma 7
- **Real-time**: Native WebSockets (`@nestjs/platform-ws` — Sprint 6)
- **Validation**: `class-validator` + `class-transformer`

## Quick Start

```bash
pnpm install
pnpm run start:dev
```

Opens at [http://localhost:4000](http://localhost:4000) (frontend at port 3000)

## Environment

Copy `.env.example` to `.env` and adjust:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | Server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `DATABASE_URL` | — | PostgreSQL connection string (use port 5433 for host, 5432 for Docker internal) |

## Database

```bash
# Start PostgreSQL
docker compose up -d

# Run initial migration
npx prisma migrate dev --name init

# Generate Prisma client (after schema changes)
npx prisma generate
```

## Architecture

This backend follows a **Zero-Knowledge Architecture** — no message contents, private keys, or encrypted payloads touch the server. The backend is strictly a signaling and telemetry plane.

### Module Design (DDD)

| Module | Responsibility | Status |
|---|---|---|---|
| `/config` | Environment variable parsing & validation | ✅ Complete |
| `/database` | Prisma connection lifecycle | ✅ Complete |
| `/common` | Global guards, interceptors, decorators | ✅ Complete |
| `/auth` | API key validation, route guards | ❌ Sprint 7 |
| `/session` | Ephemeral session token management | ✅ Complete Sprint 3 |
| `/handshake` | Metadata exchange & verification | ✅ Complete Sprint 6 |
| `/public-key-directory` | Public key registration & retrieval | ✅ Complete Sprint 4 |
| `/audit` | Append-only security event logging | ✅ Complete Sprint 5 |
| `/metrics` | Client-reported performance telemetry | ✅ Complete Sprint 5 |
| `/websocket` | Real-time peer simulation (native ws) | ✅ Complete Sprint 6 |

## Scripts

| Command | Purpose |
|---|---|
| `pnpm run start:dev` | Dev server with watch (port 4000) |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (Jest) |
| `pnpm test:e2e` | End-to-end tests |
| `pnpm lint` | ESLint |
| `pnpm pipeline` | CI gate: `pnpm build && pnpm test` |

## Sprint Status

| Sprint | Status | Notes |
|---|---|---|
| Sprint 1 — Stabilization | ✅ | pnpm, CORS, CI, Docker, env config, boilerplate cleanup |
| Sprint 2 — Core Foundation | ✅ | Prisma schema + client, database module, exception filter, logging interceptor |
| Sprint 3 — Session Management | ✅ | SessionModule, SessionController, SessionService, CreateSessionDto/SessionResponseDto/ValidateSessionDto, ioredis client, 5 unit tests, all pipelines passing |
| Sprint 4 — Public Key Directory | ✅ | PublicKeyDirectoryModule, 5 endpoints (register, get, get-by-user, fingerprint, revoke), SHA-256 fingerprint calculation, 11 unit tests, 19 total tests passing |
| Sprint 5 — Audit & Metrics | ✅ | AuditModule (append-only logging, 4 endpoints, 8 tests), MetricsModule (telemetry with p50/p95/p99 stats, 4 endpoints, 8 tests), 35 total tests passing |
| Sprint 6 — WebSocket / Handshake | ✅ | WebSocketModule (ws gateway, peer management, 5 message types), HandshakeModule (7 endpoints, metadata exchange, 14 tests), 49 total tests passing |
| Sprint 7 — Security Hardening | ✅ | |
| Sprint 8 — Production Readiness | ✅ | |
| Sprint 9 — Performance Core | ✅ | |
| Sprint 10 — Interaction Polish | ✅ | |
| Sprint 11 — Observability, Test Coverage & Education | ✅ | Redis Pub/Sub, Docker Compose, K6 load test |
| Sprint 12 — Production Deployment & Portfolio Polish | ❌ | |

## Documentation

- [AGENTS.md](./AGENTS.md) — Backend architecture, modules, DB schema, WebSocket rules
- [Architecture Decisions](../docs/adr/) — Key technical decisions

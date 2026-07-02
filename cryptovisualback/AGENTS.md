# AGENTS.md — Backend

Project: Backend

Stack:

* NestJS 10+
* TypeScript 5+
* Prisma ORM
* PostgreSQL 16+
* Native WebSocket (`ws` 8.x) — separate port 4001
* @nestjs/event-emitter for cross-module events
* Prometheus metrics (`@nestjs/terminus`, `prom-client`)

---

# Purpose

Backend exists to provide:

* APIs (REST)
* Domain orchestration
* Persistence
* Security
* Observability
* **WebSocket signaling** for peer-to-peer handshake coordination (zero-knowledge — no crypto on backend)

Agents must prioritize:

correctness
traceability
stability

---

# Operating Rules

Before coding:

Read:

package.json

README

docs

src

prisma

env examples

Understand:

modules

entities

ownership

Do not implement blindly.

---

# Architecture Principles

Dependency direction:

controllers
→ services
→ domain
→ persistence

Never reverse.

Avoid:

controller-to-controller calls.
feature-module-to-feature-module imports (use `@nestjs/event-emitter`)

---

# Module Map

```
src/
├── main.ts
├── app.module.ts
├── config/              ← @nestjs/config wrapper, env validation (class-validator)
├── database/            ← PrismaClient lifecycle (singleton)
├── common/              ← Guards, interceptors, decorators, shared interfaces
├── auth/                ← API key validation, route guards
├── session/             ← Ephemeral session tokens
├── handshake/           ← Metadata exchange (POST /api/v1/handshake/*)
├── public-key-directory/ ← Key registration & retrieval
├── audit/               ← Append-only event logging
├── metrics/             ← Performance telemetry ingestion
└── websocket/           ← Native ws gateway, room management
```

# Module Rules

Each module owns:

DTO
service
controller
tests

Avoid cross-module leaks.

Shared code belongs in:

common/

**Core Modules** (available to all features):

* `config/` — `@nestjs/config` wrapper, env validation
* `database/` — PrismaClient singleton lifecycle
* `common/` — Guards, interceptors, decorators, shared interfaces
* `auth/` — API key validation, route guards

**Feature Modules** (isolated, no direct deps):

* `session/` — Ephemeral session tokens
* `handshake/` — Metadata exchange, handshake session CRUD
* `public-key-directory/` — Key registration & retrieval
* `audit/` — Append-only event logging
* `metrics/` — Performance telemetry ingestion
* `websocket/` — Native `ws` gateway, room management, peer signaling

---

# API Rules

Controllers:

thin.

Services:

orchestration.

Domain:

business rules.

Repositories:

data only.

Do not mix concerns.

**REST Endpoints**: Versioned under `/v1`. OpenAPI spec generated from DTOs.

**WebSocket Protocol**: Separate port (4001). Message types: `handshake_init`, `handshake_response`, `key_exchange`, `metadata`, `error`. Payloads are opaque — backend never decrypts.

---

# DTO Rules

Required:

validation
explicit types
serialization

Never expose entities.

Use `class-validator` + `class-transformer`. Discriminated unions for WebSocket messages.

---

# Database (PostgreSQL via Prisma)

| Table | Purpose | Retention |
|---|---|---|
| HandshakeSession | Ephemeral negotiation state | 24h TTL |
| PublicKey | Public key material only | 24h TTL |
| AuditLog | Append-only security events | 1 year |
| PerformanceMetric | Crypto operation timings | 1 year |
| PeerConnection | Simulated network topology | Session-bound |
| HistoricalSession | Completed handshake archive | 1 year |

# Database Rules

All schema changes:

migration required.

Never:

modify production assumptions.

Prefer:

backward compatibility.

Avoid:

breaking changes.

**Prisma**: Singleton `PrismaClient` in `database/`. Use `$extends` for soft-delete, audit timestamps. JSON fields for flexible metadata (handshake metadata, audit payloads).

---

# Error Handling

Never swallow errors.

Return:

predictable responses.

Log:

context.

Never expose internals.

**Global Filter**: `HttpExceptionFilter` maps to RFC 7807 problem details. WebSocket errors send `error` message type with code + message.

---

# Security Rules

Mandatory:

input validation
auth enforcement
authorization
rate limiting
secret isolation

Never:

store secrets in code.

**Rate Limiting**: `@nestjs/throttler` on REST; custom token-bucket on WebSocket (per-peer, configurable). Sprint 7 deliverable.

**API Keys**: Header `X-API-Key` validated by `ApiKeyGuard`. Admin endpoints require `admin` scope.

**WebSocket Origin Validation**: Check `Origin` header on upgrade. Allowlist via `WS_ALLOWED_ORIGINS` env.

**Zero-Knowledge**: NEVER implement crypto on backend. No private keys, no message contents, no encrypted payloads. Backend only signals metadata.

---

# Observability

Required:

structured logs
error tracking
health checks
metrics

No silent failures.

**Logging**: Pino JSON. Correlation IDs via `request-id` header / WebSocket `requestId`.

**Metrics**: Prometheus `/metrics` endpoint. Custom metrics: `ws_connections_active`, `handshake_duration_ms`, `peer_message_latency_ms`.

**Health**: `/health` (liveness), `/health/ready` (readiness — DB + WS port).

**Audit Log**: Append-only. Events: `handshake_created`, `key_exchanged`, `metadata_exchanged`, `peer_connected`, `peer_disconnected`. Actor-scoped.

---

# Testing Rules

Minimum:

unit
integration
critical paths

Do not disable tests.

**WebSocket**: Integration test with `ws` client. Mock peer scenarios.

**Contract Tests**: Pact or similar for REST + WS message schemas.

**Load Test**: K6 script for 10k concurrent WS connections (Sprint 8).

---

# Background Jobs

Jobs must be:

idempotent
retryable
observable

---

# Performance Rules

Measure:

query count
latency
memory

Avoid:

N+1
unbounded pagination

**WebSocket**: Heartbeat interval 30s (`ping`/`pong`). Cleanup stale connections. Max message size 64KB.

**Connection Pool**: Prisma pool sized to CPU cores. Monitor `pool_checkout_duration_ms`.

**Caching**: Redis optional — only for public key directory lookups if latency > 50ms.

---

# Refactor Rules

Allowed:

extract
rename
modularize

Forbidden:

rewriting architecture
changing contracts silently

---

# Definition of Done

Complete only if:

build passes
lint passes
tests pass
migrations valid
docs updated
breaking changes documented
**OpenAPI spec updated**
**WebSocket message schema documented**
**Load test baseline recorded**

---

# Documentation Rules

Update:

README
OpenAPI
docs
AGENTS.md

when contracts change.

---

# Pull Request Expectations

Include:

goal
approach
risks
rollback
validation

---

# Agent Failure Recovery

If confidence is low:

stop.
report findings.
propose alternatives.

Do not guess.

---

# WebSocket Gateway Rules

* Native `ws` via `@nestjs/platform-ws` (no Socket.IO) on separate port 4001.
* Single gateway instance (per process). Scale via separate processes behind load balancer.
* Rooms map to "simulation networks" for peer-to-peer handshake coordination.
* Aggressive ping/pong (15s) with forceful disconnect of stale connections.
* Clients own reconnection with exponential backoff.
* Peer map: `Map<peerId, { ws: WebSocket; connectedAt: Date; metadata: Record<string, unknown> }>`
* Event emissions: `peer.connected`, `peer.disconnected`, `peer.key_exchange`, `peer.metadata_exchanged`.
* Message routing: `sendTo(peerId, message)`, `broadcast(message)`.
* Graceful shutdown: `onModuleDestroy` → close all sockets, emit `peer.disconnected`.
* No persistent state in gateway — handshake state in `handshake` module (DB).
* Redis Pub/Sub for horizontal scaling across processes (optional).
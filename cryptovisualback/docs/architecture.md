# Backend Architecture

## Domain-Driven Design Module Map

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

## Dependency Rules

```
controllers → services → domain → persistence
```

- Feature modules may depend on Core modules (config, database, common)
- Feature modules must NOT depend on each other directly
- Cross-domain communication via `@nestjs/event-emitter`

## Security Model (Zero-Knowledge)

- **No private keys** stored or transmitted
- **No message contents** persisted
- **No encrypted payloads** logged
- All cryptography executes client-side in Web Workers
- Backend is signaling + telemetry only

## Database (Postgres via Prisma)

| Table | Purpose | Retention |
|---|---|---|
| HandshakeSession | Ephemeral negotiation state | 24h TTL |
| PublicKey | Public key material only | 24h TTL |
| AuditLog | Append-only security events | 1 year |
| PerformanceMetric | Crypto operation timings | 1 year |
| PeerConnection | Simulated network topology | Session-bound |
| HistoricalSession | Completed handshake archive | 1 year |

## WebSocket Layer

- Native `ws` via `@nestjs/platform-ws` (no Socket.IO)
- Rooms map to "simulation networks"
- Aggressive ping/pong (15s) with forceful disconnect
- Redis Pub/Sub for horizontal scaling
- Clients own reconnection with exponential backoff

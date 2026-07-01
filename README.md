# CryptoVisual

Interactive hybrid encryption educational tool. Visualize RSA, AES, and the TLS handshake through a 6-step wizard with Canvas-based animations. Built for portfolio and learning.

## Quick Start

```bash
# One command — starts PostgreSQL, Redis, and the backend
docker compose up --build -d

# Start the frontend
cd cryptovisualfull && pnpm install && pnpm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)
- WebSocket: `ws://localhost:4001`

> **Demo mode**: Append `?demo=true` to the wizard URL to auto-generate sample data and walk through all 6 steps.

## Stack

| Layer | Technology |
|---|---|
| Frontend | TanStack Start + React 19 + TypeScript |
| Backend | NestJS 11 + Prisma ORM + PostgreSQL 17 |
| Visualization | PixiJS v8 (WebGL/WebGPU) + GSAP 3.12+ |
| DOM Animation | Motion 12+ (Framer Motion) |
| State Machine | XState v5 |
| Crypto | Web Crypto API (client-side, Web Workers) |
| Real-time | Native WebSockets (`ws` 8.x, port 4001) |
| Caching / Pub/Sub | Redis 7 (optional, via ioredis) |
| Observability | Prometheus + Pino + Grafana |

## Architecture

```
[Browser]
  ├── React 19 + XState v5  ←─ UI orchestration
  ├── PixiJS v8 + GSAP      ←─ Canvas animations
  └── Web Worker (Web Crypto) ←─ All crypto, off main thread
        │
        │ REST (4000) + WebSocket (4001)
        ▼
[NestJS 11 Backend]    ─── Zero-knowledge: no crypto on server
  ├── Handshake API    ─── Session CRUD + metadata exchange
  ├── Public Key Dir   ─── Register / lookup RSA public keys
  ├── WebSocket GW     ─── Peer signaling + room management
  │     └── Redis Pub/Sub ─── Cross-process message relay
  ├── Audit Log        ─── Append-only event tracking
  └── Metrics          ─── Prometheus + HDR histograms
        │
        ▼
[PostgreSQL 17]  ←─ Metadata, audit logs, public keys only
[Redis 7]        ←─ Optional: Pub/Sub, session cache
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **XState as source of truth** | Router reflects machine state, not the reverse. Handles 6-step wizard complexity reliably. |
| **Dual animation (Motion + GSAP)** | Motion for DOM transitions (buttons, tooltips), GSAP for Canvas (keygen, AES matrix, wire packets). Strict boundary — never mixed. |
| **Web Workers for crypto** | RSA keygen at 2048+ bits blocks the main thread. All crypto runs in a singleton `CryptoWorkerClient`. |
| **Zero-knowledge backend** | No private keys, no message contents, no encrypted payloads on the server. The backend only signals metadata. |
| **Separate WS port (4001)** | WebSocket scales independently of HTTP. Nginx routes `wss://` to port 4001. |
| **Redis optional** | Pub/Sub only activates when `REDIS_URL` is set. Single-instance mode works with zero configuration. |

## Project Structure

```
crypto/
├── cryptovisualback/        ← NestJS backend (DDD modules)
│   ├── docker-compose.yml   ← PostgreSQL + Redis + backend
│   ├── k6/                  ← Load test scripts
│   └── src/                 ← config, database, websocket, handshake, ...
├── cryptovisualfull/        ← TanStack Start frontend
│   └── src/                 ← routes, features, visualization, workers, state
└── docs/
    ├── adr/                 ← 13 Architecture Decision Records
    ├── archive/             ← Sprint completion reports (1–11)
    ├── deployment/          ← Production deployment guide
    └── development/         ← Implementation plan
```

## Pipeline

| Project | Status |
|---|---|
| Frontend build + typecheck | ✅ Passes |
| Frontend tests (Vitest) | **63/63 pass** (11 suites) |
| Backend build | ✅ Passes |
| Backend tests (Jest) | **56/56 pass** (9 suites) |
| Bundle budget | < 250KB main JS / < 800KB PixiJS |

## Sprint Status

| Sprint | Status |
|---|---|
| 1 — Stabilization | ✅ |
| 2 — Wizard + Navigation | ✅ |
| 3 — Feature Implementation | ✅ |
| 4 — AES Viz / Key Directory | ✅ |
| 5 — AES Pipeline / Audit & Metrics | ✅ |
| 6 — Wire Sim / WebSocket | ✅ |
| 7 — Real Integration & Core Infrastructure | ✅ |
| 8 — Hardening, Sandbox & Security | ✅ |
| 9 — Performance Core (Silky Runtime) | ✅ |
| 10 — Interaction Polish (Responsive & Delightful) | ✅ |
| 11 — Observability, Test Coverage & Education | ✅ |
| 12 — Production Deployment & Portfolio Polish | ⬅️ In progress |
| 13 — Visual Regression & Offline Support | ⬜ |
| 14 — Portfolio Showcase & Case Study | ⬜ |

## Documentation

| Resource | Location |
|---|---|
| Implementation Plan | [docs/development/implementation-plan.md](docs/development/implementation-plan.md) |
| Architecture Decisions | [docs/adr/](docs/adr/) |
| Deployment Guide | [docs/deployment/production.md](docs/deployment/production.md) |
| Backend Architecture | [cryptovisualback/docs/architecture.md](cryptovisualback/docs/architecture.md) |
| Frontend Architecture | [cryptovisualfull/docs/architecture.md](cryptovisualfull/docs/architecture.md) |
| Visual Inspection Report | [docs/visual-inspection/visual-inspection-report.md](docs/visual-inspection/visual-inspection-report.md) |

## Visual Inspection

A complete Playwright-based visual inspection of all 6 wizard steps is documented in [`docs/visual-inspection/`](docs/visual-inspection/). It includes full-page screenshots of every step (including animation frames), an animation architecture breakdown, and a list of discovered issues. See the [Visual Inspection Report](docs/visual-inspection/visual-inspection-report.md) for details.

## License

MIT

# AGENTS.md — CryptoVisual Monorepo

## Project Overview

CryptoVisual is an interactive educational tool for hybrid encryption (RSA + AES + TLS handshake). It uses a 6-step wizard with Canvas-based animations.

## Critical Constraints

1. **Zero-Knowledge Backend**: NEVER implement cryptographic encryption on the backend. No private keys, no message contents, no encrypted payloads on the server.
2. **Crypto in Workers**: All crypto operations (RSA, AES) MUST run in Web Workers, never on the main thread.
3. **XState is Source of Truth**: The wizard state machine owns navigation logic. The router reflects machine state — never drives it independently.
4. **No Cross-Feature Imports**: Feature modules must not import from other feature modules. Use shared/ or event-emitter for cross-cutting concerns.
5. **Imperative PixiJS**: Canvas rendering runs imperatively via VisualizationEngine. React components never touch PixiJS internals directly.

## Repository Layout

| Directory | Responsibility |
|---|---|
| `cryptovisualfull/` | Frontend: React, XState, PixiJS, Web Workers |
| `cryptovisualback/` | Backend: NestJS, Prisma, WebSocket signaling |
| `docs/adr/` | Architecture Decision Records |
| `docs/deployment/` | Production deployment guides |
| `docs/development/` | Implementation plan and specifications |
| `docs/archive/` | Historical sprint completion reports |
| `docs/visual-inspection/` | Playwright visual audit report + screenshots of all wizard steps |

## Before Modifying Code

1. Read the relevant `AGENTS.md` (frontend or backend)
2. Read `docs/adr/` for applicable architectural decisions
3. Understand the dependency flow (never invert it)
4. Explain planned changes before implementing

## Pipeline Commands

| Project | Commands |
|---|---|
| Frontend | `pnpm run pipeline` (typecheck + lint + test) |
| Backend | `pnpm run pipeline` (build + test) |

## Cross-Project References

- **Frontend agent rules**: [cryptovisualfull/AGENTS.md](cryptovisualfull/AGENTS.md)
- **Backend agent rules**: [cryptovisualback/AGENTS.md](cryptovisualback/AGENTS.md)
- **Implementation plan**: [docs/development/implementation-plan.md](docs/development/implementation-plan.md)
- **Deployment guide**: [docs/deployment/production.md](docs/deployment/production.md)
- **Visual inspection report**: [docs/visual-inspection/visual-inspection-report.md](docs/visual-inspection/visual-inspection-report.md)

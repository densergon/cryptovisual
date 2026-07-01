# AGENTS.md — CryptoVisual Monorepo

## Project Overview

CryptoVisual is an interactive educational tool for hybrid encryption (RSA + AES + TLS handshake). It uses a 6-step wizard with Canvas-based animations.

## Critical Constraints

1. **Zero-Knowledge Backend**: NEVER implement cryptographic encryption on the backend. No private keys, no message contents, no encrypted payloads on the server.
2. **Crypto in Workers**: All crypto operations (RSA, AES) MUST run in Web Workers, never on the main thread.
3. **XState is Source of Truth**: The wizard state machine owns navigation logic. The router reflects machine state — never drives it independently.
4. **No Cross-Feature Imports**: Feature modules must not import from other feature modules. Use shared/ or event-emitter for cross-cutting concerns.
5. **Imperative PixiJS**: Canvas rendering runs imperatively via VisualizationEngine. React components never touch PixiJS internals directly.

## Repository Map

```
crypto/
├── AGENTS.md                 ← THIS FILE — central reference
├── README.md                 ← Project overview, setup, sprint status
│
├── cryptovisualfull/         ← Frontend: TanStack Start + React 19 + PixiJS
│   ├── AGENTS.md              ← Frontend-specific agent rules
│   ├── README.md              ← Frontend setup guide
│   └── docs/
│       ├── README.md          ← Frontend doc index
│       └── architecture.md    ← Frontend architecture detail
│
├── cryptovisualback/         ← Backend: NestJS + Prisma + WebSocket
│   ├── AGENTS.md              ← Backend-specific agent rules
│   ├── README.md              ← Backend setup guide
│   ├── k6/README.md           ← WebSocket load testing
│   └── docs/
│       ├── README.md          ← Backend doc index
│       └── architecture.md    ← Backend architecture detail
│
└── docs/                     ← Cross-project documentation
    ├── README.md              ← Central doc index (sprint status, links)
    ├── adr/                   ← Architecture Decision Records (13 total)
    │   ├── 0001-*.md to 0013-*.md
    ├── archive/               ← Historical sprint reports & planning
    ├── deployment/production.md
    ├── development/implementation-plan.md
    ├── portfolio/             ← Case study, benchmarks, architecture review
    └── visual-inspection/     ← Playwright visual audit report
```

## Before Modifying Code

1. Read the relevant subproject `AGENTS.md` (frontend or backend)
2. Read `docs/adr/` for applicable architectural decisions
3. Read `docs/portfolio/` for architecture review findings if making UX/UI changes
4. Read `docs/visual-inspection/visual-inspection-report.md` if making animation or visual changes
5. Understand the dependency flow (never invert it): `routes → features → services → shared`
6. Explain planned changes before implementing

## Quick Reference

| Need | Open |
|---|---|
| Frontend agent rules | `cryptovisualfull/AGENTS.md` |
| Backend agent rules | `cryptovisualback/AGENTS.md` |
| Full implementation plan | `docs/development/implementation-plan.md` |
| Architecture decisions | `docs/adr/` |
| Deployment guide | `docs/deployment/production.md` |
| Visual audit report | `docs/visual-inspection/visual-inspection-report.md` |
| Portfolio benchmarks | `docs/portfolio/benchmarks.md` |
| Architecture review findings | `docs/portfolio/architecture-review.md` |
| Case study | `docs/portfolio/case-study.md` |
| Sprint history | `docs/archive/` |
| Load testing | `cryptovisualback/k6/README.md` |

## Pipeline Commands

| Project | Commands |
|---|---|
| Frontend | `pnpm run pipeline` (typecheck + lint + test), `pnpm run dev` |
| Backend | `pnpm run pipeline` (build + test) |

## Documentation Conventions

- **Prose docs**: Markdown in `docs/`. Cross-reference with relative paths.
- **ADRs**: Numbered sequentially in `docs/adr/`. One decision per file.
- **Sprint reports**: Archived in `docs/archive/`. Read-only historical reference.
- **Transient artifacts**: Never commit Playwright DOM dumps, scratch notes, or generated step snapshots to the repository.
- **Portfolio docs**: Live in `docs/portfolio/` — authored marketing materials, not operational specs.

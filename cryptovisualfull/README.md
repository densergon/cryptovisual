# CryptoVisual Frontend

TanStack Start + React 19 frontend — interactive 6-step hybrid encryption wizard with Canvas-based cryptographic visualizations.

## Stack

- **Framework**: TanStack Start (SSR)
- **UI**: React 19
- **Routing**: TanStack Router (file-based)
- **Styling**: Tailwind CSS v4
- **Lint/Format**: Biome
- **Testing**: Vitest + Testing Library
- **Animation**: Motion (DOM) + PixiJS/GSAP (Canvas — TBD)
- **State**: XState v5
- **Crypto**: Web Crypto API via Web Workers
- **Icons**: lucide-react

## Quick Start

```bash
pnpm install
pnpm run dev
```

Opens at [http://localhost:3000](http://localhost:3000) (backend at port 4000)

## Project Structure

```
src/
├── app/              ← Routing, providers, app shell
├── routes/           ← File-based TanStack routes
├── features/         ← Feature modules (wizard, keygen, aes...)
├── shared/           ← Reusable components, hooks, utils
├── crypto-engine/    ← Pure crypto logic (no DOM, no React)
├── visualization/    ← Canvas/PixiJS rendering engine (TBD)
├── workers/          ← Web Worker entry points
├── state/            ← XState machines + providers
├── services/         ← API clients, socket, telemetry
└── styles/           ← Design tokens, global styles
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm run dev` | Dev server on port 3000 |
| `pnpm run build` | Production build |
| `pnpm run test` | Vitest (14 tests passing) |
| `pnpm run lint` | Biome lint |
| `pnpm run format` | Biome format |
| `pnpm run check` | Biome lint + format + typecheck |
| `pnpm run typecheck` | `tsc --noEmit` (passing) |
| `pnpm run pipeline` | CI gate: typecheck + check + test (passing) |
| `pnpm run generate-routes` | Regenerate `routeTree.gen.ts` |

## Sprint Status

| Sprint | Status | Notes |
|---|---|---|
| Sprint 1 — Stabilization | ✅ Complete | pnpm, design system, landing page, route stubs, CI |
| Sprint 2 — Wizard + Nav | ✅ Complete | XState machine, WizardProvider, sidebar, navigation, transitions, keyboard, 13 tests |
| Sprint 3 — Feature Impl | ✅ Complete | PixiJS v8, GSAP, visualization engine, Keygen/BitStream scenes, crypto-engine (RSA-OAEP + AES-GCM), Web Worker with typed protocol, worker client, Step 1 & 2 integration |
| Sprint 4 — AES Visualization | ✅ Complete | StateMatrixScene (4x4 grid), SubBytes, ShiftRows, MixColumns, AddRoundKey animations, Avalanche Effect demo |
| Sprint 5 — AES Pipeline / Audit | ✅ Complete | Step 3 integration with StateMatrixVisualizer, interactive AES animation controls |
| Sprint 6 — Wire Simulation | ✅ Complete | WireScene with packet animation, connection status UI, Step 5 integration |
| Sprint 7 — Sandbox | ❌ | Bit Flipper + perf slider |
| Sprint 8 — Polish | ❌ | A11y audit, i18n, final hardening |

## Documentation

- [Architecture](./docs/architecture.md) — Component tree, state flow, folder ownership
- [Root Docs](../docs/README.md) — Cross-project documentation index
- [Architecture Decisions](../docs/adr/) — Key technical decisions

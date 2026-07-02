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
├── README.md                 ← Project overview & quick start
│
├── cryptovisualfull/         ← Frontend: TanStack Start + React 19 + PixiJS
│   ├── AGENTS.md              ← Frontend agent rules (incl. architecture, routes, state)
│   └── README.md              ← Frontend setup guide
│
├── cryptovisualback/         ← Backend: NestJS + Prisma + WebSocket
│   ├── AGENTS.md              ← Backend agent rules (incl. modules, DB, WS)
│   ├── README.md              ← Backend setup guide
│   └── k6/README.md           ← WebSocket load testing
│
└── docs/                     ← Cross-project documentation
    ├── adr/                   ← Architecture Decision Records (13 total: 0001-0013)
    ├── archive/               ← Historical sprint reports & archived plans
    ├── deployment/production.md
    ├── development/           ← Active sprint plans (sprint-15)
    ├── portfolio/             ← Case study, benchmarks, architecture review
    └── visual-inspection/     ← Playwright visual audit report + screenshots
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
| Sprint 15 plan | `docs/development/sprint-15-pedagogical-enhancements.md` |
| Architecture decisions | `docs/adr/` |
| Deployment guide | `docs/deployment/production.md` |
| Visual audit report | `docs/visual-inspection/visual-inspection-report.md` |
| Portfolio benchmarks | `docs/portfolio/benchmarks.md` |
| Architecture review findings | `docs/portfolio/architecture-review.md` |
| Case study | `docs/portfolio/case-study.md` |
| Sprint history & archived plans | `docs/archive/` |
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
- **Subproject docs**: Architecture and module details live in each subproject's `AGENTS.md` (not separate doc files).

## Pedagogic Mode (2026-07)

- **Pedagogic mode is always ON** — the `PedagogyToggle` was removed (`PedagogyModeProvider` hardcodes `isPedagogyMode: true`). All pedagogy components (PadlockMetaphor, ConfusionDiffusionLegend, KEMEnvelopeAnimation, etc.) render unconditionally.
- **Sprint 15 plan** for pedagogical enhancements is at `docs/development/sprint-15-pedagogical-enhancements.md`.

## Canvas Animation Fixes (2026-07)

### Root Cause: `resizeTo: window`
PixiJS `Application` was initialized with `resizeTo: window`, making the canvas match the window instead of its container (`#viz-container`). The canvas rendered at window size but lived inside a smaller flex layout, causing all animations to render outside the visible area. Fixed in `visualization-engine.ts` by passing explicit `width`/`height` from the container's `getBoundingClientRect()`.

### Resize Handler Guard
Added `rect.width > 0 && rect.height > 0` guard in the `ResizeObserver` callback to prevent zero-dimension resizes during initialization.

### AES Avalanche Effect Crash
`resetCellHighlight` was missing the bounds guard (`if (!this.cells[row]?.[col]) return`) that `highlightCell` already had. Caused `Cannot read properties of undefined` during the avalanche effect phase. Fixed in `state-matrix-scene.ts:257`.

## UI Polish (2026-07)

- **Animation containers** (steps 1-5): Replaced plain `bg-transparent` borders with `bg-surface-950/40` + themed borders, icon placeholders with dashed rings, and loading indicators with pulsing dots.
- **Step 3 AES container**: Cyan-themed border matching symmetric color scheme, responsive button wrapping, operation status with pulsing indicator.
- **Step 5 wire sim**: Added placeholder state matching other steps, packet status with colored indicator dot.
- **All steps**: Consistent `h-64` animation areas with themed border colors.

## Recent UX Improvements (2026-07)

### Landing Page
- **Animation timing**: Reduced `intro` phase from 180→120 frames, `particles` from 280→180 frames. Title/subtitle/CTA now visible after ~3s instead of ~6.7s.
- **Stats/metrics section**: "By the Numbers" row showing RSA-2048 (~250ms), AES-256-GCM (~0.5ms), Hybrid (6 steps) with icon badges.
- **How It Works**: 6-step visual timeline with staggered scroll animations and a gradient connector line between steps.
- **Footer links**: GitHub points to `https://github.com/anomalyco/cryptovisual` (no dead `#` links). Removed "Docs" and "Contact" — only GitHub and "Start Tutorial" remain.
- **Particle animation**: Reduced trail opacity from 0.15→0.08 for cleaner visuals. Particle convergence speed increased 1.75x (0.02→0.035 per frame).

### Wizard Micro-Interactions
- **Step 1 (Keygen)**: Error banner on crypto failure (red border). Canvas shows placeholder with icon. Key size dropdown (2048/4096) preserved.
- **Step 2 (Session Key)**: Error banner on failure. `maxLength={256}` + character counter on plaintext input. Loading text: "Generating 256-bit session key..." Canvas placeholder with icon.
- **Step 3 (AES Cipher)**: `gsap.delayedCall` for animation pacing (ADR-0006 compliance). Reset button destroys + recreates scene cleanly.
- **Step 6 (Decrypt)**: Explicit `shouldDecrypt` state. `Celebration` mounts conditionally. Success glow ring. "Start Over" navigates to step 1. Tampered state shows red "Integrity Check Failed" panel.
- **Handshake layout**: AnimatePresence with `position: absolute; inset: 0` prevents layout shift. Speed label shows "OFF" on reduced motion.

### Bug Fixes
- **Animation rendering pipeline** (commit `5f1c51e`): GSAP ticker synced to PixiJS render loop, `masterTimeline.clear()` replaces `kill()`, `cancelled` flag for async init race in Strict Mode.
- **Documentation audit** — 26 transient artifacts deleted, docs reduced from ~74→47 files (36% reduction).
- **Canvas sizing** (commit `d3cc4ff`): `resizeTo: window` → explicit container dimensions so animations render in the visible viewport.

### Cryptographic Audit (Playwright, 2026-07)
- **RSA-2048 OAEP/SHA-256** — 25.90ms keygen, JWK format, 65537 exponent.
- **AES-256-GCM** — 32B key, 12B IV (NIST SP 800-38D), 16B auth tag.
- **Hybrid envelope** — RSA-wrapped key (256B) + AES ciphertext (20B).
- **Full round-trip** — "Hello, CryptoVisual!" decrypted successfully. RSA unwrap 0.5ms, AES decrypt 0.1ms.
- **Tamper detection** — GCM auth tag rejects modified ciphertext.
- **No secret leaks** — Private key JWK never logged. Zero-knowledge maintained.
- **All 63 tests pass**, lint clean, typecheck clean.

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

## Recent UX Improvements (2026-07)

### Landing Page
- **Animation timing**: Reduced `intro` phase from 180→120 frames, `particles` from 280→180 frames. Title/subtitle/CTA now visible after ~3s instead of ~6.7s.
- **Stats/metrics section**: "By the Numbers" row showing RSA-2048 (~250ms), AES-256-GCM (~0.5ms), Hybrid (6 steps) with icon badges.
- **How It Works**: 6-step visual timeline with staggered scroll animations and a gradient connector line between steps.
- **Footer links**: GitHub points to `https://github.com/anomalyco/cryptovisual` (no dead `#` links). Removed "Docs" and "Contact" — only GitHub and "Start Tutorial" remain.
- **Particle animation**: Reduced trail opacity from 0.15→0.08 for cleaner visuals. Particle convergence speed increased 1.75x (0.02→0.035 per frame).

### Wizard Micro-Interactions
- **Step 1 (Keygen)**: Error banner on crypto failure (red border). Canvas shows "Click 'Generate Keys' to start the animation" placeholder text. Key size dropdown (2048/4096) preserved.
- **Step 2 (Session Key)**: Error banner on failure. `maxLength={256}` + character counter on plaintext input. Loading text: "Generating 256-bit session key..." (was generic "Generating..."). Canvas placeholder text added.
- **Step 3 (AES Cipher)**: Replaced `setTimeout` with `gsap.delayedCall` for animation pacing (ADR-0006 compliance). Reset button always visible after animation completes, clears state on click.
- **Step 6 (Decrypt)**: Replaced fragile `attemptedRef` with explicit `shouldDecrypt` state. `Celebration` mounts conditionally (only on success). Success glow ring animation on decrypted text. "Start Over" button navigates to step 1. Tampered state shows red "Integrity Check Failed" panel.
- **Handshake layout**: AnimatePresence child now uses `position: absolute; inset: 0` to prevent layout shift during exit animation. Speed label shows "OFF" (not "0x") when reduced motion is active.

### Bug Fixes
- **Animation rendering pipeline** — 3 root causes resolved (see commit `5f1c51e`): GSAP ticker synced to PixiJS render loop, `masterTimeline.clear()` replaces `kill()`, `cancelled` flag for async init race in Strict Mode.
- **Documentation audit** — 26 transient artifacts deleted, docs reduced from ~74→47 files (36% reduction). Sprint7_planning.md moved to archive.
- **Null canvas guard in `StateMatrixVisualizer.updateCenterPoint`** — `this.app.canvas` can be null when scroll/resize events fire during app teardown or before full PixiJS initialization. Added early return guard in `state-matrix-scene.ts:58`.

### Cryptographic Audit (Playwright, 2026-07)
- **RSA-2048 OAEP/SHA-256** — Verified correct: 34.70ms keygen, JWK format, 65537 exponent. Step 1.
- **AES-256-GCM** — Verified correct: 32B key, 12B IV (NIST SP 800-38D), 16B auth tag. Step 2-3.
- **Hybrid envelope** — RSA-wrapped key (256B=2048-bit) + AES ciphertext (20B). Step 4.
- **Full round-trip** — "Hello, CryptoVisual!" decrypted successfully. RSA unwrap 0.5ms, AES decrypt 0.1ms. Step 6.
- **Tamper detection** — GCM auth tag correctly rejects modified ciphertext with "Integrity Check Failed". Step 6.
- **No secret leaks** — Private key JWK never logged to console. Zero-knowledge architecture maintained.
- **Web Worker isolation** — All crypto ops run in worker, main thread never touches key material.

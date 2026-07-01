# Current Status — CryptoVisual

**Updated**: 2026-07-01

## Sprint Progress

| Sprint | Frontend | Backend |
|--------|----------|---------|
| 1 — Stabilization | ✅ | ✅ |
| 2 — Wizard + Navigation | ✅ | ✅ |
| 3 — Feature Implementation | ✅ | ✅ |
| 4 — AES Viz / Key Directory | ✅ | ✅ |
| 5 — AES Pipeline / Audit & Metrics | ✅ | ✅ |
| 6 — Wire Sim / WebSocket | ✅ | ✅ |
| 7 — Real Integration & Core Infrastructure | ✅ | ✅ |
| 8 — Hardening, Sandbox & Security | ✅ | ✅ |
| 9 — Performance Core (Silky Runtime) | ✅ | ✅ |
| 10 — Interaction Polish (Responsive & Delightful) | ✅ | ✅ |
| 11 — Observability, Test Coverage & Education | ✅ | ✅ |
| 12 — Production Deployment & Portfolio Polish | ⬜ | ⬜ |
| 13 — Visual Regression & Offline Support | ⬜ | ⬜ |
| 14 — Portfolio Showcase & Case Study | ⬜ | ⬜ |

## Pipeline Status

### Frontend (`cryptovisualfull`)
- `pnpm typecheck` — ✅ Passes
- `pnpm check` (Biome) — ⚠️ 120 pre-existing errors (unchanged)
- `pnpm test` (Vitest) — ✅ 63/63 pass (11 suites)

### Backend (`cryptovisualback`)
- `pnpm build` — ✅ Passes
- `pnpm test` (Jest) — ✅ 56/56 pass (9 suites)

## Sprint 11 Summary

All Sprint 11 deliverables complete. See [sprint-11-completion.md](./sprint-11-completion.md) for full details.

### Frontend (F-22 through F-25)
- **F-22 Pure-JS AES Verification**: 5 tests comparing state-matrix-scene round outputs against Web Crypto AES-CBC for random keys
- **F-23 XState Hydration Hardening**: WizardProvider reads/writes `sessionStorage`; `canGoTo` guard uses hydrated context; 6 hydration tests
- **F-24 Educational Step Guides**: StepGuide component with info panel (toggleable, collapsed by default, `i` icon in header) integrated into all 6 wizard steps; 6 tests
- **F-25 Integration Test Expansion**: CanvasFallback (5), ErrorBoundary (4), StepGuide (6), useWebAudio (8), Wizard E2E (4), WebSocket reconnect (9) — **63 total frontend tests** (from 16 → 63, beating the 40+ target)

### Backend (B-12, B-15, B-16)
- **B-12 Redis Pub/Sub**: Cross-process message forwarding via `ws:message` channel; processId echo prevention; subscription in `onModuleInit`; graceful fallback when Redis disabled
- **B-15 Docker Compose**: Added Redis 7-alpine, WS port 4001, backend + Redis health checks, bridge network, comprehensive env vars
- **B-16 K6 Load Test**: `k6/websocket-load-test.js` — ramp to 10k concurrent VUs, measures connection time + handshake latency + success rate; thresholds for p95 < 2s/5s, 99% rate

### Handshake Machine Fix
- Added event handlers for `SET_RSA_KEYPAIR`, `SET_AES_KEY`, `SET_CIPHERTEXT`, `SET_WRAPPED_KEY` to allow XState actor.send-based crypto state progression (were defined as actions but never wired to transitions)

## Key Architecture Principles

- **Zero-Knowledge Backend**: All crypto in Web Workers, never on backend
- **XState is Source of Truth**: Router reflects machine state
- **Imperative PixiJS**: React never touches PixiJS internals
- **No Cross-Feature Imports**: Use shared/ or event-emitter
- **Dependency Direction**: routes → features → services → shared (never invert)
- **Redis Optional**: Pub/Sub only activates when `REDIS_URL` set; single-instance mode works without Redis

## Sprint 12 Fixes

### WizardProvider Duplication Fix
- Removed root-level `WizardProvider` from `providers.tsx` — was causing landing page auto-redirect to `/handshake/step-1` and step navigation failures
- `WizardProvider` now only wraps handshake routes via `HandshakeWrapper` in `handshake.tsx`
- Landing page (`/`) no longer auto-redirects; step transitions work correctly
- Verified: fresh session navigation, session restoration, and landing page all work with 0 console errors

## What's Next (Sprint 12)

- **F-27**: Landing page + onboarding hero animation (entropy background, RSA/AES icon convergence)
- **F-28**: Production build + deploy to public URL; CSP `enforce`
- **F-29**: Project README with Mermaid system diagram, stack badges, one-command quick-start, ADR summaries, screenshots
- **B-17**: Health alerts in Grafana (WS drop > 50%, p99 latency > 500ms)
- **B-18**: Run K6 load test baseline; record as CI artifact
- **B-20**: Docker Compose + demo seed script; `pnpm run demo` for instant walkthrough
- **B-21**: Production runbook (backup/restore, rolling restart, feature flags, rollback)

## Planned (Sprint 13)

- Landing page animation suite — GSAP-timed hero particle reveal (F-31)
- Service Worker for offline support (B-22)
- Visual regression suite with Playwright + pixelmatch (B-23)
- Bundle analyzer CI gate (B-24)
- Chaos engineering: worker crash, WS disconnect, WebGL loss (B-25)

## Planned (Sprint 14)

- Case study document — engineering narrative with architecture diagram (F-32)
- Demo recording script — Playwright screenshots + screencast (F-33)
- Performance benchmark report (F-34)
- Live demo URL on custom domain (B-26)

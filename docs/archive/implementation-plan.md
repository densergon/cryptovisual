# CryptoVisual — Engineering Plan

> **Purpose**: Technical reference for architecture, execution plan, specifications, and risk review.
>
> **Scope**: Both frontend (`cryptovisualfull`) and backend (`cryptovisualback`).
>
> **ADRs**: Key decisions are documented in [docs/adr/](../adr/).

---

# Architecture

## Repository Tree

```
crypto/
├── cryptovisualback/        ← NestJS backend (signaling, telemetry)
│   ├── AGENTS.md
│   ├── docs/
│   └── src/                 ← DDD modules
├── cryptovisualfull/        ← TanStack Start frontend
│   ├── AGENTS.md
│   ├── docs/
│   └── src/                 ← Routes, features, workers, visualization
└── docs/                    ← Cross-project documentation
    ├── adr/                 ← Architecture Decision Records
    ├── archive/             ← Historical sprint reports
    ├── deployment/          ← Deployment guides
    └── development/         ← Implementation plans
```

## Frontend Target Structure

```
src/
├── app/                    ← Routing, providers, app shell
├── features/               ← Vertical slice feature modules
│   ├── wizard/             ← 6-step navigation + XState orchestration
│   ├── keygen/             ← Step 1: RSA key generation
│   ├── session-key/        ← Step 2: AES key creation
│   ├── aes-cipher/         ← Step 3: AES state matrix
│   ├── hybrid-envelope/    ← Step 4: RSA wrapping
│   ├── wire-simulation/    ← Step 5: Network simulation
│   ├── decrypt/            ← Step 6: Unwrapping
│   └── sandbox/            ← Bit Flipper + Performance Slider
├── shared/                 ← Reusable UI, hooks, utils, types
├── crypto-engine/          ← Pure Web Crypto wrappers (RSA, AES)
├── workers/                ← Web Worker entry + typed protocol
├── visualization/          ← PixiJS engine, scenes, primitives
├── state/                  ← XState machines + React providers
├── services/               ← API, socket, telemetry clients
└── styles/                 ← Design tokens, globals
```

## Dependency Flow

```
routes → features → shared
  ↓          ↓
state    visualization
  ↓          ↓
services   animations
  ↓
workers → crypto-engine
```

**Golden rule**: `crypto-engine/` and `workers/` have ZERO React imports — pure TypeScript runnable in any JS environment.

## Backend Module Map

```
src/
├── config/              ← @nestjs/config wrapper, env validation
├── database/            ← PrismaClient lifecycle (singleton)
├── common/              ← Guards, interceptors, decorators, shared interfaces
├── auth/                ← API key validation, route guards
├── session/             ← Ephemeral session tokens
├── handshake/           ← Metadata exchange
├── public-key-directory/ ← Key registration & retrieval
├── audit/               ← Append-only event logging
├── metrics/             ← Performance telemetry ingestion
└── websocket/           ← Native ws gateway, room management
```

## Backend Dependency Rules

```
controllers → services → domain → persistence
```

- Feature modules may depend on Core modules (config, database, common)
- Feature modules must NOT depend on each other directly
- Cross-domain communication via `@nestjs/event-emitter`

---

# Sprint Progress Summary

| Sprint | Frontend | Backend |
|---|---|---|
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

---

# Sprint 7: Real Integration & Core Infrastructure

## Goal

Close the frontend↔backend integration gap. Establish shared infrastructure (singleton worker, shared canvas, unified animation timing) that all subsequent sprints depend on. **No new UI features** — only plumbing that makes the existing 6-step wizard actually work end-to-end.

## Frontend Deliverables

- **F-01 Real WebSocket in Step 5**: Replace simulation in `handshake.step-5.tsx` with `websocketService.connect()`; subscribe to `handshake_response`, `key_exchange`, `metadata`; drive `WireScene.sendPacket()` with real handshake data from XState context.
- **F-02 CryptoWorkerProvider Singleton**: `shared/providers/CryptoWorkerProvider.tsx` — one `CryptoWorkerClient` per session; `ping()` health check on init; `terminate()` on `beforeunload`; hook `useCryptoWorker()` for Steps 1–4 + Sandbox.
- **F-03 Shared Canvas Context**: `WizardProvider` creates **single** `VisualizationEngine` + `Application` on `/handshake` entry; exposes via React context; scenes receive `engine.getApplication().stage` via `SceneManager`; cleanup on wizard exit.
- **F-04 Unified Animation Timing**: `VisualizationEngine.masterTimeline` (GSAP) drives all scenes; single `speedMultiplier` (0.5–3x) propagated globally; replace `setTimeout` delays in `StateMatrixVisualizer` with `gsap.delayedCall()`.
- **F-05 Route-Level Code Splitting + Budget Gate**: `React.lazy` + `<Suspense fallback={<SkeletonCanvas/>}>` for all 6 steps; Vite `manualChunks` for `pixi-vendor`, `gsap-vendor`, `motion-vendor`, `crypto-engine`; CI gate `pnpm run budget` (< 250KB gzipped excl. PixiJS).
- **F-06 AES State Matrix ↔ Crypto Worker Integration**: Connect `StateMatrixVisualizer` to real worker-computed round keys and states; replace hardcoded example data.

## Backend Deliverables

- **B-01 WebSocket Auth + Origin Validation**: `handleConnection` validates `Origin` header against `WS_ALLOWED_ORIGINS`; requires `X-API-Key` query param (or header); rejects unauthenticated upgrades.
- **B-02 Heartbeat & Stale Cleanup**: 30s ping/pong; force disconnect on 2 missed pongs; max message size 64KB; config via `WS_PING_INTERVAL_MS`, `WS_MAX_MISSED_PONGS`.
- **B-03 Token-Bucket Rate Limiting (per-peer)**: In-memory bucket (Redis-ready interface); configurable `WS_RATE_LIMIT_RPS`, `WS_RATE_LIMIT_BURST`; emits `peer.rate_limited` event for observability.
- **B-04 Redis Pub/Sub Foundation**: `RedisModule` (ioredis); `EventEmitter` bridge for `peer.connected`, `peer.disconnected`, `peer.key_exchange`, `peer.metadata_exchanged` — enables horizontal scaling later.

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Shared Canvas breaks scene isolation | Medium | High | `SceneManager` owns container children; scenes only draw to their container. |
| Singleton worker contention | Low | Medium | Async requests queued via `requestId` correlation; worker is non-blocking. |
| XState ↔ Router race on reload | Medium | High | `WizardProvider` hydrates `completedSteps` from `sessionStorage` snapshot before machine starts; `canGoTo` guard reads hydrated context. |
| CSP nonce strategy for TanStack Start | High | High | Start `report-only`; collect violations; implement per-route nonce via Nitro middleware before `enforce`. |

## Definition of Done

- [ ] Step 5 drives real WebSocket handshake (init → key_exchange → metadata) with live packet animation
- [ ] Single `CryptoWorkerClient` reused across Steps 1–4 + Sandbox; zero cold-starts after first use
- [ ] One `Application` instance per wizard session; canvas init < 200ms desktop / < 400ms mobile
- [ ] All scenes respect `engine.speedMultiplier`; `gsap.delayedCall()` only; no loose `setTimeout`
- [ ] Bundle budget passes CI: initial JS < 250KB gzipped (excl. PixiJS chunk)
- [ ] WebSocket rejects connections without valid Origin + API key; heartbeat cleans stale peers
- [ ] Redis Pub/Sub emits lifecycle events; local `Map` peer tracking still works (single-instance compat)
- [ ] `sessionStorage` hydrates `completedSteps` on reload; no guard mismatch
- [ ] AES State Matrix uses real worker-computed states; no hardcoded example data

---

# Sprint 8: Hardening, Sandbox & Security

## Goal

Complete the originally planned Sprint 7 scope (Sandbox Bit Flipper, CSP, accessibility) now that integration plumbing exists. Harden error handling, add rate limiting to REST, and verify WCAG 2.1 AA compliance.

## Frontend Deliverables

- **F-06 Sandbox Bit Flipper**: Full `BitFlipper.tsx` integration with real AES decryption via worker; Hamming distance + avalanche visualization on `StateMatrixVisualizer`; persists ciphertext in `sessionStorage` for reload survival.
- **F-07 Performance Slider Universal**: `AnimationSpeedContext` provider wraps wizard; single `speedMultiplier` in `VisualizationEngine`; persists to `localStorage`; all 6 steps + Sandbox respect it.
- **F-08 CSP Headers + Nonce Strategy**: TanStack Start/Nitro middleware injects per-request nonce; `script-src 'nonce-{nonce}'`; `style-src 'self' 'unsafe-inline'` (Tailwind JIT); `report-only` → `enforce` after violation-free staging.
- **F-09 Error Boundaries**: Route-level (`routes/__root.tsx`) + feature-level (each step wrapper); fallback UI with `LiveRegion` announcement; "Try Again" triggers `WizardProvider` retry logic.
- **F-10 WebGL Graceful Degradation**: `CanvasFallback` CSS-only replicas for AES matrix, wire, keygen; auto-swap on `app.init()` failure; telemetry event `webgl_fallback`.
- **F-11 Accessibility Audit (WCAG 2.1 AA)**: `axe-core` in CI; live region announcements for all canvas state changes; focus visible on all interactive elements; color contrast audit on design tokens; reduced-motion respected (see Sprint 9).
- **F-12 Key Expansion Visualization**: Implement the animation for the AES key schedule (10 round keys) in `StateMatrixVisualizer`.

## Backend Deliverables

- **B-05 REST Rate Limiting**: `@nestjs/throttler` on all `/v1/*` routes; stricter limits on auth/admin; burst allowance for handshake initiation.
- **B-06 API Key Guards**: `ApiKeyGuard` on admin endpoints (`/metrics`, `/audit`, `/public-key-directory/admin`); `X-API-Key` header validation; `admin` scope for destructive ops.
- **B-07 Audit Log Retention Job**: Nightly cron (nestjs-schedule) purges `AuditLog` > 1 year; `PerformanceMetric` > 1 year; logs purge count to audit log itself.
- **B-08 Metrics Percentile Fix**: Streaming percentile algorithm (t-digest or HDR histogram) in `MetricsService` — O(1) memory, no full-array sort; exposes p50/p95/p99 via `/metrics/summary`.

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Bit Flipper re-decryption > 50ms on mobile | Medium | Medium | Web Worker already off-thread; cache last key; debounce bit flips. |
| CSP `enforce` breaks hydration | High | High | Staged rollout: `report-only` 1 week staging → `enforce` after 0 violations. |
| Rate limiting false positives on handshake | Medium | Medium | Separate limit tier for `/handshake` POST (higher burst); monitor `peer.rate_limited`. |
| t-digest dependency adds bundle weight | Low | Low | Use lightweight `hdr-histogram-js` (~15KB) or native approximation. |

## Definition of Done

- [x] Bit Flipper flips bits → shows avalanche → re-decrypts in < 50ms (worker)
- [x] Performance slider controls all 7 scenes; persists across sessions
- [ ] CSP `enforce` mode active in staging with zero violations ⚠️ report-only (no SSR)
- [x] All routes have error boundary; error UI announces via `LiveRegion`
- [x] WebGL failure shows CSS fallback; telemetry emits `webgl_fallback`
- [x] `axe-core` CI passes; live regions announce canvas changes; focus visible; contrast AA
- [x] REST rate limiting active; admin endpoints guarded by API key
- [x] Audit log retention job runs nightly; metrics percentiles use streaming algorithm
- [x] Key expansion animation implemented and verified; shows 15 round keys

---

# Sprint 9: Performance Core (Silky Runtime)

## Goal

Eliminate runtime jank. Unified animation timing, global speed control, reduced-motion compliance, bundle budgets enforced in CI. No new features — only infrastructure that makes every existing animation buttery-smooth.

## Frontend Deliverables

- **F-12 Reduced Motion Support**: `useReducedMotion()` hook; Motion `duration: 0` when reduced; GSAP `timeScale(0)`; Canvas auto-play disabled, step-through controls shown.
- **F-13 FPS HUD (Dev)**: `FPSCounter` component toggle via `Ctrl+Shift+F`; reads `engine.getFPS()`; target ≥ 55fps.
- **F-14 DevicePixelRatio Cap**: `VisualizationEngine` caps `renderer.resolution = Math.min(window.devicePixelRatio, 2)`; prevents 4x overdraw on retina mobile.
- **F-15 Bundle Budget Enforcement**: `vite-bundle-analyzer` artifact; PR comment with size diff; CI fails on regression > 5%.

## Backend Deliverables

- **B-09 Observability Baseline**: Prometheus metrics for `ws_connections_active`, `handshake_duration_ms`, `peer_message_latency_ms`; `/health/ready` checks DB + WS port; structured Pino JSON logs with correlation IDs.

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Reduced motion breaks educational flow | Medium | Medium | Step-through controls replace auto-play; live region still announces. |
| DPR cap reduces visual quality on 3x displays | Low | Low | 2x is indistinguishable for educational canvas; saves GPU memory. |

## Definition of Done

- [x] `prefers-reduced-motion` respected everywhere (axe-core CI)
- [x] FPS HUD shows ≥ 55fps during all animations on mid-tier device
- [x] DevicePixelRatio capped at 2x; canvas init < 400ms mobile
- [x] Bundle budget gate passes CI; PR comment shows size diff
- [x] Prometheus metrics exposed; `/health/ready` returns 200 only when DB + WS healthy

---

# Sprint 10: Interaction Polish (Responsive & Delightful)

## Goal

Elevate interactivity to "portfolio-grade." Universal speed control, touch/pointer gestures, skeleton loading, WebGL fallback, responsive canvas configs, micro-delight. Every touchpoint feels intentional.

## Frontend Deliverables

- **F-16 Universal Performance Slider**: `AnimationSpeedContext` provider; single `speedMultiplier` in `VisualizationEngine`; persists to `localStorage`; all scenes (keygen, AES matrix, wire, bit flipper) respect it.
- **F-17 Touch/Pointer Interactions**: Pan/zoom on `StateMatrixVisualizer` and `WireScene` via `interactionManager`; pinch-zoom, drag-pan, double-tap reset; desktop wheel zoom.
- **F-18 Skeleton Loaders + Preload**: TanStack Router `routeLoader` preloads next step during idle; `SkeletonCanvas` component (shimmer + aspect-ratio) prevents CLS; zero flash on transition.
- **F-19 WebGL Progressive Enhancement**: `CanvasFallback` CSS-only replicas (AES matrix grid, wire packets, keygen particles); auto-swap on `app.init()` failure; telemetry event `webgl_fallback`.
- **F-20 Responsive Canvas Breakpoints**: `ResizeObserver` in `VisualizationEngine` switches config at Tailwind breakpoints (`sm`/`md`/`lg`/`xl`): cell size, wire length, font size, particle density.
- **F-21 Micro-Interactions Delight**: Byte button hover/active ripple (BitFlipper); Play/Reset button press scale; optional Web Audio API "packet arrival" tone (opt-in, respects reduced motion); completion confetti burst (Step 6).

## Backend Deliverables

- **B-10 WebSocket Message Compression**: `permessage-deflate` extension enabled; payload size reduction for high-frequency signaling.
- **B-11 Connection Metrics Enrichment**: Per-peer latency histogram; export to Prometheus; Grafana dashboard template.

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Touch gestures conflict with scroll | Medium | Medium | `touch-action: none` on canvas; passive listeners where possible. |
| Fallback diverges from Canvas visually | Medium | Medium | Snapshot tests compare fallback vs Canvas key frames. |
| Audio annoyance | Low | Medium | Opt-in only; default off; respects reduced motion. |

## Definition of Done

- [x] Performance slider controls all 6 wizard steps + sandbox
- [x] Touch pan/zoom works on iOS Safari / Chrome Android
- [x] Route transitions: zero CLS, skeleton visible < 100ms
- [x] WebGL failure shows animated fallback, not error message
- [x] Canvas layouts correct at 375px, 768px, 1024px, 1440px, 1920px
- [x] Micro-interactions feel responsive (< 50ms visual feedback)
- [x] `localStorage` speed persists across sessions
- [x] Accessibility audit passes (including new interactions)

---

# Sprint 11: Observability, Test Coverage & Education

## Goal

Harden for production traffic while filling two gaps: educational depth (info panels explaining crypto concepts in each wizard step) and test coverage (integration tests for wizard flow, WS scenarios, error paths). Metrics streaming percentiles and audit retention cron are already complete (Sprint 8).

## Frontend Deliverables

- **F-22 Pure-JS AES Verification**: Automated test comparing `state-matrix-scene.ts` round outputs (SubBytes, ShiftRows, MixColumns, AddRoundKey) against Web Crypto `crypto.subtle` for 100 random keys; fails CI on divergence.
- **F-23 XState Hydration Hardening**: `WizardProvider` reads `sessionStorage['cv_wizard_state']` on init; writes on every transition; `canGoTo` guard uses hydrated context; unit test for reload-at-step-3 scenario.
- **F-24 Educational Step Guides**: Each wizard step (1–6) gets an info panel explaining the crypto concept in plain language:
  - Step 1: RSA key structure, modulus size, why we need public/private pairs
  - Step 2: AES symmetric encryption, IV purpose, authenticated encryption
  - Step 3: SubBytes, ShiftRows, MixColumns, AddRoundKey — visual legend on the matrix
  - Step 4: Hybrid envelope — RSA wraps the AES key, not the message
  - Step 5: TLS handshake narrative — the actual protocol flow this simulates
  - Step 6: Decryption verification, integrity check
  - Toggleable tooltip overlay system; expandable detail panel per step
  - Collapsed by default; `i` icon in step header opens the guide
- **F-25 Integration Test Expansion**:
  - Wizard E2E flow: navigate step 1 → step 6 with mocked worker responses
  - WebSocket reconnect: disconnect mid-handshake, verify recovery UI
  - WebGL fallback: mock `app.init()` failure, verify `CanvasFallback` renders
  - Reduced motion + audio: verify `useWebAudio` returns null when reduced
  - Error boundary: trigger render crash, verify "Try Again" flow
  - Target: frontend test count from 16 → 40+ passing

## Backend Deliverables

- **B-12 Redis Pub/Sub for WS Horizontal Scaling**: `WebSocketGateway` emits lifecycle events to Redis channel; multiple gateway instances receive `peer.key_exchange`, `peer.metadata_exchanged` and forward to local peers; sticky sessions via `peerId` affinity.
- **B-15 Deploy Config for Dual-Port + Sticky Sessions**: `docker-compose.yml` defines `backend:4000`, `ws-gateway:4001`; Nginx/Traefik config with `proxy_protocol` for WS; health checks on `/health/ready`; `peerId` cookie affinity for WS.
- **B-16 K6 Load Test Script**: `k6/ws-handshake.js` simulating 10k concurrent peers; measures connection time, handshake duration, message latency; outputs p50/p95/p99; stored as CI artifact.

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Redis adds operational complexity | Medium | Medium | Single-instance mode works without Redis; Pub/Sub only activates when `REDIS_URL` set. |
| Pure-JS AES test flakiness | Low | High | Test uses fixed seed for reproducibility; only runs on CI. |
| Info panels overwhelm the UI | Low | Medium | Collapsed by default; toggleable; prose kept under 100 words per step. |
| Sticky sessions limit WS scaling | Medium | Medium | Document limitation; plan for stateless WS (JWT in message) in v2. |

## Definition of Done

- [ ] Pure-JS AES round outputs match Web Crypto for 100 random keys (CI)
- [ ] XState hydrates from `sessionStorage` on reload; `canGoTo` works correctly
- [ ] Multiple WS gateway instances share peer events via Redis Pub/Sub
- [ ] `docker-compose up` starts backend (4000) + WS gateway (4001); Nginx routes WS with sticky sessions
- [ ] Each wizard step has a toggleable info panel explaining the crypto concept
- [ ] Frontend tests ≥ 40 passing; WS reconnect + fallback + reduced-motion scenarios covered
- [ ] K6 baseline: 10k WS connections, p99 handshake < 200ms, zero errors

---

# Sprint 12: Pedagogical Layer - Mental Models & Metaphors

## Goal
Shift the UX from "what" to "why" by introducing intuitive mental models and refining the instructional narrative to bridge the gap between math and intuition.

## Frontend Deliverables
- **F-26 RSA "Open Padlock" Metaphor**: Implement visual/textual guide in Step 1 explaining Public Key as a padlock anyone can snap shut, and Private Key as the only key that opens it.
- **F-27 "Hybrid Necessity" Narrative**: Add explicit "Why AES?" explanation in Step 2: "RSA is too slow for big files. We use AES for the heavy lifting and RSA only to protect the AES key."
- **F-28 "Digital Blender" Analogy**: In Step 3, describe AES matrix operations as creating "Confusion" (hiding key/ciphertext relationship) and "Diffusion" (spreading bit influence).
- **F-29 "Envelope" Metaphor**: In Step 4, visualize the RSA-encrypted session key as an "Envelope" taped to the "Box" (ciphertext).
- **F-30 "Lock-to-Key" Transition**: In Step 6, implement animation where RSA Private Key "unlocks" the envelope to reveal the AES key, which then "unlocks" the message.
- **F-31 Terminology Standardization**: Audit and update all labels to consistently use "Wrapped Key" (Asymmetric) and "Session Key" (Symmetric).

## Definition of Done
- [ ] RSA padlock metaphor integrated into Step 1 flow
- [ ] "Why AES" explanation visible and concise in Step 2
- [ ] Confusion/Diffusion terminology added to Step 3
- [ ] "Envelope" visual/copy implemented in Step 4
- [ ] Decryption "Unlock" animation verified in Step 6
- [ ] Consistent nomenclature (Wrapped vs Session Key) applied globally

---

# Sprint 13: Interactive Education - Deep Dive & Feedback

## Goal
Provide a multi-layered information architecture that caters to both casual learners and technical recruiters through "Deep Dive" overlays and high-fidelity feedback.

## Frontend Deliverables
- **F-32 "Pedagogy Mode" Toggle**: Implement global switch that overlays "Academic Notes" (footnotes) explaining the underlying math (e.g., Euler's Totient Theorem, GCM mode).
- **F-33 RSA "Prime Search" Ticker**: In Step 1, replace simple timer with a ticker showing randomly sampled numbers being tested for primality.
- **F-34 AES "Speed Comparison" Stat**: In Step 2, add a micro-stat: "AES is ~1,000x faster than RSA for this message."
- **F-35 Real-time "Operation Legend"**: In Step 3, add a panel that updates during animation: "SubBytes: Swapping values to break linear patterns."
- **F-36 "Packet Anatomy" Tooltips**: In Step 5, allow users to hover over moving packets to see internal payload: `[RSA-Wrapped Key | IV | Ciphertext]`.
- **F-37 "Handshake Narrative" Ticker**: In Step 5, add status updates: "Negotiating Cipher Suites..." $\rightarrow$ "Verifying Server Certificate..." $\rightarrow$ "Establishing Secure Channel."
- **F-38 "Haptic Visuals"**: Implement subtle scale-up and glow effects when a cryptographic match is found (e.g., decrypted AES key matches original).

## Definition of Done
- [ ] Pedagogy Mode toggle switches academic footnotes on/off
- [ ] Prime Search ticker adds visual "work" to Step 1
- [ ] Speed comparison stat visible in Step 2
- [ ] Matrix legend updates in sync with AES animations
- [ ] Packet tooltips show correct internal structure
- [ ] Handshake status ticker follows protocol flow
- [ ] Glow effects trigger on successful decryption/verification

---

# Sprint 14: Crypto Literacy - Myth-Busting & Integrity

## Goal
Prove technical mastery by addressing common misconceptions and highlighting critical security nuances that distinguish an expert implementation from a basic demo.

## Frontend Deliverables
- **F-39 "RSA Size Constraint" Warning**: In Step 1, add a clarifier: "RSA cannot encrypt data larger than its key size. This is why the Hybrid approach is mandatory, not optional."
- **F-40 "Confidentiality vs Integrity" Clarifier**: In Step 6, explain the role of the Auth Tag (GCM/MAC): "The key was recovered, but we also check the Auth Tag to ensure the ciphertext wasn't tampered with."
- **F-41 High-Fidelity Copy Polish**: Refine all instructional text: "Searching for massive primes" (Step 1), "Wrapping the Session Key" (Step 4), "Integrity Verified: Message Authentic" (Step 6).
- **F-42 Sandbox "Avalanche Effect" Viz**: In Bit Flipper, color-code all changed cells in the matrix a distinct "mutation" color when a bit is flipped.

## Definition of Done
- [ ] RSA size constraint warning visible in Step 1
- [ ] Integrity/Auth Tag explanation implemented in Step 6
- [ ] All copy updated to "expert-level" instructional phrasing
- [ ] Avalanche effect color-coding verified in Sandbox

---

# Sprint 15: Visual Regression & Offline Support

## Goal
Operational excellence — visual regression testing, offline support via service worker, bundle analysis gate, and chaos engineering.

## Frontend Deliverables
- **F-43 Landing Page Animation Suite**: The hero particle animation gets full GSAP timeline orchestration: key particles converging into the RSA + AES icon pair, text reveals synchronized with animation phases, speed slider integration.
- **F-44 Service Worker (Workbox)**: Cache-first for static assets; network-first for API; offline wizard support (read-only steps).
- **F-45 Visual Regression Suite**: Playwright + `pixelmatch` for each Canvas scene (key frames: initial, mid-animation, final); baseline images in repo; CI fails on > 0.1% pixel diff.
- **F-46 Bundle Analyzer CI Gate**: `vite-bundle-analyzer` artifact upload; PR comment with size diff; fail on regression > 5%.
- **F-47 Chaos Engineering**: Simulate worker crash, WS disconnect, WebGL loss; verify recovery; document in runbook.

## Definition of Done
- [ ] Landing hero animation plays at 55fps; text reveals sync with canvas
- [ ] SW caches all static assets; wizard works offline (read-only steps)
- [ ] Visual regression suite catches Canvas diff > 0.1% pixels
- [ ] CI fails on bundle regression > 5%
- [ ] Chaos scenarios documented and verified in staging

---

# Sprint 16: Production Deployment & Portfolio Polish

## Goal
Make the project runnable and presentable for portfolio reviewers. One-command bootstrap via Docker Compose, a compelling project README, seeded demo data, and production deployment.

## Frontend Deliverables
- **F-48 Landing Page + Onboarding**: Hero animation visually explains hybrid encryption (RSA padlock + AES key icons converging); first-visit tooltip overlay ("Start the wizard to see how TLS handshakes work"); dark mode with entropy background.
- **F-49 Production Build + Deploy**: TanStack Start on Vercel/Netlify/Node; CSP `enforce` with nonces; bundle budget < 250KB; automated redeploy from `main`.
- **F-50 Project README** (`/crypto/README.md`): Architecture overview with Mermaid system diagram, stack badges, quick-start, ADR summaries, and "What was I thinking?" section.

## Backend Deliverables
- **B-17 Health Alerts**: `/health` (liveness), `/health/ready` (readiness); alerts on WS connection drop > 50%, p99 latency > 500ms.
- **B-18 Load Test Baseline**: Run K6 script from Sprint 11; record p50/p95/p99 as CI artifact.
- **B-19 Docker Compose + Bootstrap**: `docker-compose.yml` with all services; `pnpm run demo` script creates pre-generated RSA keys + AES ciphertext for instant walkthrough.
- **B-20 Production Runbook** (`docs/deployment/runbook.md`): DB restore, WS gateway rolling restart, Canvas/WebGL feature flag.

## Definition of Done
- [ ] `README.md` at repo root explains architecture, stack, and one-command run
- [ ] `docker compose up` starts full stack; `pnpm run demo` seeds sample data
- [ ] Landing page loads < 2s; OG cards render correctly
- [ ] Deployed to public URL; CSP `enforce` active; bundle budget passes
- [ ] Grafana dashboards live; alerts configured for WS drop + p99 latency

---

# Sprint 17: Portfolio Showcase & Case Study

## Goal
No new features. Tell the engineering story: case study document, demo recording, performance benchmarks, and a live public URL. This sprint turns code into a portfolio centerpiece.

## Frontend Deliverables
- **F-51 Case Study Document** (`docs/portfolio/case-study.md`): Problem/Solution/Architecture/Key Decisions/Trade-offs/Testing Strategy/Outcomes.
- **F-52 Demo Recording Script** (`scripts/demo-recording.mjs`): Playwright script capturing 6 key-frame screenshots and a 30s WebM screencast.
- **F-53 Performance Benchmark Report**: CI step outputs summary table: initial JS, PixiJS chunk, canvas init time, FPS range, WCAG AA status.

## Backend Deliverables
- **B-21 Live Demo URL**: Deploy frontend to Vercel/Netlify and backend to Railway/Fly.io with PostgreSQL + Redis.
- **B-22 Final Review**: Verify full wizard flow end-to-end from public internet.

## Definition of Done
- [ ] `docs/portfolio/case-study.md` published — tells complete engineering story
- [ ] `pnpm run demo:recording` produces 6 screenshots + 30s WebM screencast
- [ ] Performance benchmark page published with bundle, FPS, and load test data
- [ ] Live URL accessible and documented in `README.md`

---

# Feature Specifications

## RSA Key Generation (Step 1)

| Dimension | Specification |
|---|---|
| **Inputs** | Key size (1024 / 2048 / 4096 bits, default 2048), user trigger |
| **Outputs** | Public key (JWK), Private key (JWK), Generation time (ms), Key fingerprint (SHA-256 of spki) |
| **State** | `handshake.machine.ts` context: `rsaKeyPair`, `rsaKeySize`, `rsaGenTime` |
| **Perf Budget** | 2048-bit: < 500ms. 4096-bit: < 5s. Worker must not block main thread. |

## AES Session Key + Encryption (Step 2)

| Dimension | Specification |
|---|---|
| **Inputs** | User plaintext message (string, max 10KB) |
| **Outputs** | AES-256 key (raw bytes), IV (12 bytes), ciphertext (ArrayBuffer), auth tag |
| **State** | `handshake.machine.ts` context: `aesKey`, `iv`, `ciphertext`, `plaintext` |
| **Perf Budget** | < 10ms for messages up to 10KB |

## AES State Matrix Visualization (Step 3)

| Dimension | Specification |
|---|---|
| **Inputs** | AES key, plaintext block (16 bytes), round number (0-14) |
| **Outputs** | 4×4 state grid per sub-operation per round, color-mapped cells |
| **Perf Budget** | ≥ 55fps during animation. Pre-computed round states: < 50ms for 14 rounds. |

## Hybrid Envelope (Step 4)

| Dimension | Specification |
|---|---|
| **Inputs** | AES session key, RSA public key |
| **Outputs** | RSA-encrypted session key (ArrayBuffer) |
| **Perf Budget** | RSA-OAEP wrap: < 50ms for 2048-bit key |

## Wire Simulation (Step 5)

| Dimension | Specification |
|---|---|
| **Inputs** | Wrapped session key + ciphertext bundle, peer connection state |
| **Outputs** | Transmission status, packet visualization, MITM detection result |
| **Perf Budget** | Wire animation: ≥ 55fps. WebSocket round-trip: < 100ms on localhost. |

## Decryption (Step 6)

| Dimension | Specification |
|---|---|
| **Inputs** | RSA private key, wrapped session key, ciphertext + IV |
| **Outputs** | Recovered AES session key, decrypted plaintext, verification result |
| **Perf Budget** | RSA unwrap: < 50ms. AES decrypt: < 10ms. |

## Bit Flipper Sandbox

| Dimension | Specification |
|---|---|
| **Inputs** | Ciphertext bits (clickable), key bits (toggleable) |
| **Outputs** | Modified decryption result, Hamming distance, visual diff |
| **State** | Local component state (not in handshake machine — sandbox is independent) |
| **Perf Budget** | Re-decryption after bit flip: < 50ms |

---

# Developer Experience

## Folder Conventions

```
src/
├── features/<name>/
│   ├── components/           ← React components (PascalCase.tsx)
│   ├── hooks/                ← Custom hooks (camelCase.ts)
│   ├── types.ts              ← Feature-specific types
│   └── index.ts              ← Public API barrel export
├── shared/components/ui/     ← Atomic components (Button, Input, etc.)
├── state/machines/           ← XState machines
├── workers/                  ← Worker entry points
└── visualization/scenes/     ← PixiJS scenes
```

## Naming Rules

- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils, `kebab-case.ts` for routes
- **Types**: `PascalCase` for interfaces/types, `UPPER_SNAKE_CASE` for constants
- **Tests**: colocated as `FeatureName.test.ts` next to implementation
- **No default exports** except for route files (TanStack Router convention)

## Commit Conventions

Conventional Commits with scope:

```
<type>(<scope>): <description>

Types: feat, fix, refactor, perf, test, docs, chore, ci
Scopes: wizard, keygen, aes, hybrid, wire, decrypt, sandbox, viz, crypto, state, infra
```

## Branch Strategy

Trunk-based development with short-lived feature branches:
- Feature branches live ≤ 3 days
- Merge via squash merge to `main`
- No long-lived `develop` branch
- Tags for sprint milestones: `v0.1.0`, `v0.2.0`, etc.

---

# Risk Review

## Top Technical Risks

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Web Crypto API doesn't expose AES round internals | Certain | High | Pure-JS AES for visualization. `crypto.subtle` for actual encryption. |
| 2 | PixiJS v8 instability (WebGPU renderer is new) | Medium | High | Use WebGL renderer explicitly. WebGPU is opt-in. |
| 3 | XState ↔ TanStack Router state sync race conditions | Medium | High | XState is the source of truth. Router reflects state. |
| 4 | Canvas memory leaks on scene transitions | Medium | High | Enforce `destroy()` on every scene. Monitor with DevTools. |
| 5 | CSP headers break TanStack Start's hydration | High | Medium | Start with `report-only`. May need nonce integration. |
| 6 | RSA 4096-bit keygen freezes on low-end mobile | Medium | Medium | Run in Worker (off-thread). Cap at 2048-bit on mobile. |

## Top Architecture Mistakes to Avoid

| Mistake | Why It's Wrong |
|---|---|
| Using React state for animation frame data | Re-rendering React at 60fps is catastrophic. Canvas state lives outside React. |
| Importing `crypto-engine` directly in React components | Blocks main thread. Always go through the Worker. |
| Making the router the source of truth for wizard state | XState has richer semantics. Router should reflect XState. |
| Using `@pixi/react` for Canvas integration | Leaky abstraction. Imperative Canvas control is more reliable. |
| Storing crypto keys in `localStorage` | Security anti-pattern. Keys live in memory only. |

---

> **Guiding Principle**: This project demonstrates Architectural Thinking — concurrency (Workers), state complexity (XState), UI performance (Canvas), security (Web Crypto & CSP), and user education (UX storytelling). Every technical decision should serve this narrative.

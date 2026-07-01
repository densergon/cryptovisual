# Sprint 7-13 Readiness & Carryover Report

**Date**: June 28, 2026
**Status**: 📋 PLANNED — Post-Sprint 6 Integration Phase
**Source**: Critical Audit performed June 28, 2026 (see `docs/adr/` for architectural context)

---

## Executive Summary

Following Sprint 6 completion (Wire Sim / WebSocket), a comprehensive audit identified **performance bottlenecks**, **integration gaps**, and **interaction deficits** that prevent the "extreme smoothness" and "responsive delight" quality bar. This document captures carryover items from the originally planned Sprints 7-8, formalizes them into **Sprints 7-13**, and provides implementation-ready specifications for AI agent development.

**No architectural changes required** — all work elevates existing infrastructure.

**Sprint Mapping (Old → New)**:
| Original Plan | New Plan |
|---|---|
| Sprint 7 (Sandbox/Hardening) | Sprint 7 (Real Integration) + Sprint 8 (Hardening/Sandbox) |
| Sprint 8 (Polish/Production) | Sprint 12 (Production Deployment) |
| Sprint 9 (Silky Runtime) | Sprint 9 (Performance Core) |
| Sprint 10 (Responsive & Delightful) | Sprint 10 (Interaction Polish) |
| Sprint 11 (Production Hardening) | Sprint 11 (Observability/Scaling) + Sprint 12 (Deployment) + Sprint 13 (Visual Regression) |

---

## Carryover from Original Sprints 7-8 (Audit Findings)

| Original Deliverable | Status | Carryover Action |
|---|---|---|
| Performance optimization pass (bundle size, code splitting, lazy loading) | ⚠️ Partial | **Sprint 9 F-01**: Full route-level code splitting + Vite `manualChunks` |
| Graceful degradation for missing Web Crypto / WebGL | ⚠️ Partial | **Sprint 10 F-10**: `CanvasFallback` CSS-only replicas + auto-swap |
| Accessibility audit (WCAG 2.1 AA) including live regions | ⚠️ Partial | **Sprint 9 F-05**: `useReducedMotion` hook + global compliance |
| CSP headers in `report-only` mode | ✅ Done | Continue to `enforce` in Sprint 11 |
| Bundle size < 250KB gzipped | ❌ Not measured | **Sprint 9**: CI budget gate (`pnpm run budget`) |

### Sprint 8 Deliverables — Gaps Identified

| Original Deliverable | Status | Carryover Action |
|---|---|---|
| Polished responsive design across all breakpoints | ⚠️ Partial | **Sprint 10 F-11**: Responsive canvas configs per breakpoint |
| Performance Slider as standalone "try it now" section | ⚠️ Partial | **Sprint 10 F-07**: Universal slider controlling ALL scenes |
| Smooth onboarding flow | ✅ Done | No carryover |
| Dark mode with entropy background | ✅ Done | No carryover |

### Newly Discovered Gaps (Not in Original Sprints)

| Gap | Impact | Sprint |
|---|---|---|
| Multiple `Application` instances per route (WebGL context proliferation) | 200-400ms init latency, memory pressure | 9 F-02 |
| `CryptoWorkerClient` recreated per interaction (cold starts) | 50-100ms per crypto op | 9 F-03 |
| `setTimeout`-based animation pacing (jitter, drift) | < 55fps, inconsistent timing | 9 F-04 |
| Performance Slider only affects WireScene | Inconsistent UX, "placebo" control | 10 F-07 |
| No touch/pointer interaction on Canvas | Mobile feels broken | 10 F-08 |
| Route transitions show flash/CLS | Poor perceived performance | 10 F-09 |
| DevicePixelRatio unbounded (4x on retina mobile) | GPU overdraw, battery drain | 9 F-02 config |
| No FPS visibility for debugging | Blind to regressions | 9 F-06 |

---

## Sprint 7: Real Integration & Core Infrastructure (3-4 days)

**Theme**: Close the frontend↔backend integration gap. Establish shared infrastructure (singleton worker, shared canvas, unified animation timing) that all subsequent sprints depend on. **No new UI features** — only plumbing that makes the existing 6-step wizard actually work end-to-end.

### Frontend Tickets

| ID | Title | Files to Touch | Est. |
|---|---|---|---|
| F-01 | Real WebSocket in Step 5 | `handshake.step-5.tsx`, `websocket.service.ts` | M |
| F-02 | CryptoWorkerProvider Singleton | `shared/providers/CryptoWorkerProvider.tsx` (new), `workers/worker-client.ts`, all feature components using crypto | M |
| F-03 | Shared Canvas Context (Single Application) | `app/providers.tsx` (WizardProvider), `visualization-engine.ts`, `scene-manager.ts`, all `handshake.step-*.tsx` | M |
| F-04 | Unified Animation Timing (GSAP Master Timeline) | `visualization-engine.ts` (add `masterTimeline`), `state-matrix-scene.ts`, `wire-scene.ts`, `keygen-scene.ts`, `bit-flipper-scene.ts` | M |
| F-05 | Route-Level Code Splitting + Budget Gate | `router.tsx`, `vite.config.ts`, `routeTree.gen.ts`, `scripts/bundle-budget.js` (new) | S |

### Backend Tickets

| ID | Title | Files to Touch | Est. |
|---|---|---|---|
| B-01 | WebSocket Auth + Origin Validation | `src/websocket/websocket.gateway.ts` | M |
| B-02 | Heartbeat & Stale Cleanup | `src/websocket/websocket.gateway.ts` | S |
| B-03 | Token-Bucket Rate Limiting (per-peer) | `src/common/guards/ws-rate-limit.guard.ts` (new), `src/app.module.ts` | M |
| B-04 | Redis Pub/Sub Foundation | `src/redis/redis.module.ts` (new), `src/websocket/websocket.gateway.ts` | M |

### Definition of Done (Sprint 7)

- [ ] Step 5 drives real WebSocket handshake (init → key_exchange → metadata) with live packet animation
- [ ] Single `CryptoWorkerClient` reused across Steps 1–4 + Sandbox; zero cold-starts after first use
- [ ] One `Application` instance per wizard session; canvas init < 200ms desktop / < 400ms mobile
- [ ] All scenes respect `engine.speedMultiplier`; `gsap.delayedCall()` only; no loose `setTimeout`
- [ ] Bundle budget passes CI: initial JS < 250KB gzipped (excl. PixiJS chunk)
- [ ] WebSocket rejects connections without valid Origin + API key; heartbeat cleans stale peers
- [ ] Redis Pub/Sub emits lifecycle events; local `Map` peer tracking still works (single-instance compat)
- [ ] `sessionStorage` hydrates `completedSteps` on reload; no guard mismatch

---

## Sprint 8: Hardening, Sandbox & Security (3-4 days)

**Theme**: Complete the originally planned Sprint 7 scope (Sandbox Bit Flipper, CSP, accessibility) now that integration plumbing exists. Harden error handling, add rate limiting to REST, and verify WCAG 2.1 AA compliance.

### Frontend Tickets

| ID | Title | Files to Touch | Est. |
|---|---|---|---|
| F-06 | Sandbox Bit Flipper (real AES) | `BitFlipper.tsx`, `shared/providers/CryptoWorkerProvider.tsx`, `state-matrix-scene.ts` | M |
| F-07 | Performance Slider Universal | `state/context/AnimationSpeedContext.tsx` (new), `visualization-engine.ts`, all scenes, `features/sandbox/performance-slider.tsx` | M |
| F-08 | CSP Headers + Nonce Strategy | `nitro.config.ts` (middleware), `app/providers.tsx`, CSP violation reporter | M |
| F-09 | Error Boundaries (route + feature) | `routes/__root.tsx`, each step wrapper, `shared/components/LiveRegion.tsx` | S |
| F-10 | WebGL Graceful Degradation | `shared/components/CanvasFallback.tsx` (new), `visualization-engine.ts` | M |
| F-11 | Accessibility Audit (WCAG 2.1 AA) | `axe-core` CI, `shared/hooks/useReducedMotion.ts`, all Motion/GSAP sites | S |

### Backend Tickets

| ID | Title | Files to Touch | Est. |
|---|---|---|---|
| B-05 | REST Rate Limiting (@nestjs/throttler) | `src/app.module.ts`, `src/common/guards/rate-limit.guard.ts` | S |
| B-06 | API Key Guards (admin endpoints) | `src/auth/guards/api-key.guard.ts`, `src/metrics`, `src/audit`, `src/public-key-directory` | S |
| B-07 | Audit Log Retention Job | `src/audit/audit.service.ts`, `src/common/cron/retention.cron.ts` (new) | S |
| B-08 | Metrics Percentile Fix (streaming) | `src/metrics/metrics.service.ts`, `hdr-histogram-js` | M |

### Definition of Done (Sprint 8)

- [ ] Bit Flipper flips bits → shows avalanche → re-decrypts in < 50ms (worker)
- [ ] Performance slider controls all 7 scenes; persists across sessions
- [ ] CSP `enforce` mode active in staging with zero violations
- [ ] All routes have error boundary; error UI announces via `LiveRegion`
- [ ] WebGL failure → CSS fallback renders identically (visual regression)
- [ ] `axe-core` CI passes; live regions announce canvas changes; focus visible; contrast AA
- [ ] REST rate limiting active; admin endpoints guarded by API key
- [ ] Audit log retention job runs nightly; metrics percentiles use streaming algorithm

---

## Sprint 9: Performance Core (Silky Runtime) (2-3 days)

**Theme**: Eliminate runtime jank. Unified animation timing, global speed control, reduced-motion compliance, bundle budgets enforced in CI. No new features — only infrastructure that makes every existing animation buttery-smooth.

| ID | Title | Files to Touch |
|---|---|---|
| B-06 | Service Worker (Workbox) | `vite.config.ts` (PWA plugin), `public/sw.js` |
| B-07 | Bundle Analyzer CI Gate | `.github/workflows/ci.yml`, `scripts/bundle-budget.js` |
| B-08 | Visual Regression Suite | `playwright.config.ts`, `tests/visual/*.spec.ts`, baseline images |
| B-09 | Load Test Final (10k WS) | `k6/load-test.js`, `k6/summary.json` |
| B-10 | Disaster Recovery Runbook | `docs/deployment/runbook.md` |

---

## Technical Specifications for AI Agents

### 1. Shared Canvas Context Pattern

```typescript
// app/providers.tsx — create ONCE per wizard session
const wizardMachine = createMachine(...);
const canvasRef = useRef<HTMLCanvasElement>(null);
const engineRef = useRef<VisualizationEngine>(null);

useEffect(() => {
  if (!canvasRef.current) return;
  const engine = new VisualizationEngine(canvasRef.current);
  await engine.init(); // single WebGL context
  engineRef.current = engine;
  return () => engine.destroy(); // cleanup on wizard exit
}, []);
```

**Scenes receive**: `engine.getApplication().stage` via `SceneManager` — never create own `Application`.

### 2. Worker Singleton Pattern

```typescript
// shared/providers/CryptoWorkerProvider.tsx
const workerRef = useRef<CryptoWorkerClient>(null);

function getWorker(): CryptoWorkerClient {
  if (!workerRef.current) workerRef.current = new CryptoWorkerClient();
  return workerRef.current;
}

// Features use: const crypto = useCryptoWorker(); // hook returns singleton
```

### 3. GSAP Master Timeline Pattern

```typescript
// visualization-engine.ts
export class VisualizationEngine {
  public readonly masterTimeline = gsap.timeline({ paused: true });
  public speedMultiplier = 1;

  setSpeed(mult: number) {
    this.speedMultiplier = mult;
    this.masterTimeline.timeScale(mult);
  }

  // Scenes register via:
  // engine.masterTimeline.to(cell.graphics.scale, { x: 1.1, duration: 0.15 });
}
```

### 4. Reduced Motion Hook

```typescript
// shared/hooks/useReducedMotion.ts
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
```

### 5. Responsive Canvas Config

```typescript
// visualization-engine.ts
private readonly breakpointConfigs = {
  sm:  { cellSize: 40, wireLength: 300, fontSize: 10, maxDPR: 2 },
  md:  { cellSize: 50, wireLength: 450, fontSize: 12, maxDPR: 2 },
  lg:  { cellSize: 60, wireLength: 600, fontSize: 14, maxDPR: 2 },
  xl:  { cellSize: 70, wireLength: 800, fontSize: 16, maxDPR: 2 },
};

private applyResponsiveConfig(): void {
  const width = this.canvas.clientWidth;
  const bp = width < 640 ? 'sm' : width < 1024 ? 'md' : width < 1280 ? 'lg' : 'xl';
  this.config = { ...this.config, ...this.breakpointConfigs[bp] };
  this.app.renderer.resolution = Math.min(window.devicePixelRatio, this.config.maxDPR);
  this.rebuildScene();
}
```

### 6. Canvas Fallback Pattern

```tsx
// shared/components/CanvasFallback.tsx
export function AESMatrixFallback({ state, highlightCell }: FallbackProps) {
  return (
    <div className="grid grid-cols-4 gap-2 p-4" role="img" aria-label="AES state matrix">
      {state.map((byte, i) => (
        <div key={i} className={cn(
          'aspect-square rounded border-2 font-mono text-xs flex items-center justify-center transition-all duration-300',
          i === highlightCell
            ? 'bg-amber-500/30 border-amber-500 scale-110'
            : 'bg-surface-800 border-surface-600'
        )}>
          {byte.toString(16).padStart(2, '0').toUpperCase()}
        </div>
      ))}
    </div>
  );
}
```

---

## Risk Register (Updated)

| # | Risk | Probability | Impact | Mitigation | Sprint |
|---|---|---|---|---|---|
| 1 | Shared Canvas breaks scene isolation | Medium | High | SceneManager owns container; scenes draw only to their container | 9 |
| 2 | Singleton worker contention | Low | Medium | Async requests queued via `requestId` correlation | 9 |
| 3 | Reduced motion breaks educational flow | Medium | Medium | Step-through controls replace auto-play; live region announces | 9 |
| 4 | Touch gestures conflict with scroll | Medium | Medium | `touch-action: none` on canvas; passive listeners | 10 |
| 5 | Fallback diverges from Canvas visually | Medium | Medium | Snapshot tests compare fallback vs Canvas key frames | 10 |
| 6 | Audio annoyance | Low | Medium | Opt-in only; default off; respects reduced motion | 10 |
| 7 | Bundle regression goes undetected | Low | High | CI gate fails on > 5% increase; PR comment with diff | 11 |

---

## Dependencies & Prerequisites

| Prerequisite | Status | Notes |
|---|---|---|
| Sprint 8 complete (Polish/Production) | ✅ | Landing page, onboarding, dark mode, deploy pipeline |
| TanStack Router `routeLoader` API stable | ✅ | v1.170+ |
| PixiJS v8 WebGL renderer stable | ✅ | WebGPU opt-in only |
| GSAP 3.12+ `timeScale` on globalTimeline | ✅ | Used in Sprint 9 |
| `prefers-reduced-motion` browser support | ✅ | All targets |
| Workbox PWA plugin compatible with TanStack Start | ⚠️ Verify | Sprint 11 only |

---

## File Map for Implementation

```
cryptovisualfull/
├── app/providers.tsx                    ← NEW: WizardProvider with shared canvas
├── shared/
│   ├── providers/
│   │   └── CryptoWorkerProvider.tsx     ← NEW: Worker singleton
│   ├── hooks/
│   │   ├── useReducedMotion.ts          ← NEW
│   │   └── useAnimationSpeed.ts         ← NEW
│   ├── components/
│   │   ├── SkeletonCanvas.tsx           ← NEW
│   │   ├── CanvasFallback.tsx           ← NEW
│   │   ├── FPSCounter.tsx               ← NEW
│   │   └── CompletionConfetti.tsx       ← NEW
│   ├── context/
│   │   └── AnimationSpeedContext.tsx    ← NEW
│   └── utils/
│       └── canvas-interactions.ts       ← NEW
├── visualization/
│   └── engine/
│       ├── visualization-engine.ts      ← MODIFY: masterTimeline, speedMultiplier, breakpointConfigs
│       └── scene-manager.ts             ← MODIFY: shared container
├── features/
│   ├── wizard/components/               ← MODIFY: use shared engine
│   ├── sandbox/performance-slider.tsx   ← MODIFY: use AnimationSpeedContext
│   └── all step features/               ← MODIFY: lazy-loaded, use shared engine
├── routes/
│   └── handshake.step-*.tsx             ← MODIFY: React.lazy + Suspense + routeLoader
├── scripts/
│   └── bundle-budget.js                 ← NEW: CI gate
└── vite.config.ts                       ← MODIFY: manualChunks, PWA plugin (Sprint 11)
```

---

## Sign-Off

- [ ] Architecture Review: ADR-0006, ADR-0013 boundaries respected
- [ ] Security Review: Zero-knowledge backend unchanged
- [ ] Performance Review: Budgets defined, CI gates configured
- [ ] Accessibility Review: WCAG 2.1 AA test plan defined
- [ ] Product Review: Sprint 9/10 scope approved, Sprint 11 optional

**Prepared by**: Principal Full-Stack Engineer / Lead UI/UX Architect
**Next Action**: Begin Sprint 9 F-01 (Code Splitting) — highest leverage, lowest risk.
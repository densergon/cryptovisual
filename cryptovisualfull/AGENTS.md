# AGENTS.md — Frontend

Project: Frontend
Stack:

* TanStack Start
* TypeScript
* React
* Vite
* PixiJS v8 (WebGL/WebGPU)
* GSAP 3.12+
* Motion (Framer Motion) 12+
* XState v5
* Tailwind CSS v4
* Web Crypto API (via Web Workers)

---

# Purpose

This project contains the user-facing application.

Agents must prioritize:

1. Correctness
2. Simplicity
3. Maintainability
4. Performance
5. UX consistency

Do not optimize prematurely.

---

# Operating Rules

Before modifying code:

1. Read:

   * package.json
   * tsconfig
   * README.md
   * docs/*
   * existing routes
   * existing components

2. Understand:

   * routing
   * shared UI patterns
   * state ownership
   * animation architecture (Motion = DOM, GSAP = Canvas)
   * worker protocol (crypto-engine → workers)

3. Explain planned changes before implementation.

Never start coding immediately.

---

# Architecture Rules

Preferred dependency direction:

routes
→ features
→ services
→ shared

Never invert this flow.

Allowed imports:

route → feature
feature → shared

Forbidden:

shared → feature
shared → route

Avoid circular dependencies.

---

# Folder Ownership

/routes
Route composition only. Lazy-load feature components.

/features
Business logic. One vertical slice per wizard step + sandbox.

/components
Reusable presentation. Atomic UI only.

/services
External communication (API, WebSocket, telemetry).

/hooks
Reusable behavior. Include `useReducedMotion`, `useAnimationSpeed`.

/utils
Pure utilities. No side effects.

/types
Shared types. Discriminated unions for worker protocol.

/workers
Web Worker entry points. Zero React imports.

/crypto-engine
Pure Web Crypto wrappers. Zero React imports. Runnable in any JS env.

/visualization
PixiJS engine, scenes, primitives. Imperative only. No React internals.

/state
XState machines + React providers. XState is source of truth.

---

# State Management Rules

State priority:

1. Server state
2. URL state
3. Local state
4. Global state

Do not introduce global state without justification.

Avoid duplicated state.

**Animation State**: Canvas animation state lives in PixiJS scenes / GSAP timelines — never in React state. React only holds playback controls (speed, play/pause).

---

# Component Rules

Prefer:

Small composable components.

Avoid:

God components.

Guidelines:

* Single responsibility
* Extract complexity
* Keep props explicit

Maximum:
~300 lines per component.

**Canvas Components**: Wrapper components only (`CanvasViewport`, `SkeletonCanvas`). Imperative logic stays in `visualization/scenes/*.ts`.

---

# Styling Rules

Prefer existing styling system.

Do not:

* add inline styles
* duplicate tokens
* create one-off utilities

Preserve responsive behavior.

Mobile is mandatory.

**Design Tokens**: Use `styles/tokens.css` — 3-tier palette (asymmetric/magenta, symmetric/cyan, hybrid/gold), surface/slate backgrounds, semantic colors, Inter font.

**Breakpoints**: Tailwind `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). Canvas configs respond to these via `ResizeObserver`.

---

# Performance Rules

Do not optimize blindly.

Measure first.

Watch:

* unnecessary rerenders
* bundle growth
* hydration cost
* excessive memoization
* **Canvas context proliferation** — one `Application` per wizard session
* **Worker cold-starts** — singleton worker via provider
* **GSAP timeline leaks** — `killTweensOf` + `masterTimeline` pattern
* **DevicePixelRatio unbounded** — cap at 2x for canvas resolution

**Budgets (CI-enforced)**:

* Initial JS bundle (gzipped, excl. PixiJS): < 250KB
* LCP < 2.5s, CLS < 0.1, FID < 100ms
* Canvas init < 200ms on desktop, < 400ms on mobile
* Worker ping-pong < 50ms

**Code Splitting**: Route-level `React.lazy` + `Suspense` mandatory for all wizard steps. `manualChunks` in Vite for `pixi.js`, `gsap`, `motion`, `crypto-engine`.

**Preloading**: Use TanStack Router `routeLoader` to preload next step during idle.

---

# Animation Rules

**Dual System (ADR-0006, ADR-0013)**:

* **Motion** — DOM only: page transitions, micro-interactions, tooltips, modals.
* **GSAP** — Canvas only: PixiJS timeline animations (keygen, bitstream, AES matrix, wire).

Strict boundary: No Motion in Canvas. No GSAP in DOM.

**Hardware Acceleration**:

* Animate only `transform` (`x`, `y`, `scale`, `rotation`) and `opacity`.
* Never animate `top`/`left`/`width`/`height` on Canvas objects.
* PixiJS: use `container.position.set()`, `container.scale.set()` — GPU path.

**Reduced Motion (WCAG 2.1 AA)**:

* Hook: `useReducedMotion()` in `shared/hooks`.
* Motion: `transition={reduced ? { duration: 0 } : { ... }}`
* GSAP: `gsap.globalTimeline.timeScale(reduced ? 0 : speedMultiplier)`
* Canvas: Respect `prefers-reduced-motion` — disable auto-play, show step-through controls.

**Performance Slider (Global)**:

* Single source of truth: `VisualizationEngine.speedMultiplier` (default 1).
* Context: `AnimationSpeedProvider` wraps wizard.
* Range: 0.5x – 3x. Persist to `localStorage` (user preference).
* All scenes read `engine.speedMultiplier` — no local multipliers.

**Timeline Management**:

* One `masterTimeline` per `VisualizationEngine`.
* Scenes register tweens via `engine.masterTimeline.to(...)`.
* Cleanup: `engine.masterTimeline.kill()` + `gsap.killTweensOf(container)` in `destroy()`.
* No loose `setTimeout`/`setInterval` for animation pacing — use `gsap.delayedCall()`.

**FPS Monitoring**:

* `VisualizationEngine.getFPS()` exposed.
* Dev HUD: `Ctrl+Shift+F` toggles `FPSCounter` component.
* Target: ≥ 55fps during animation.

---

# Accessibility Rules

Required:

* semantic HTML
* keyboard support
* labels
* visible focus
* screen-reader compatibility
* **Live regions** for Canvas content changes (`LiveRegion` component)
* **Reduced motion** respected (see Animation Rules)
* **Color contrast** — tokens meet WCAG AA
* **Focus visible** — never `outline: none` without replacement
* **Canvas fallback** — CSS-only replica for WebGL failure (see `CanvasFallback`)

---

# API Rules

Never call APIs directly inside UI.

Use services.

Centralize:

* requests
* retries
* serialization

---

# Testing Rules

Minimum:

Unit:
critical logic

Integration:
important flows

Visual Regression:
Canvas scenes (Playwright + pixelmatch)

Never update snapshots blindly.

---

# Refactor Rules

Allowed:

rename
extract
move

Forbidden:

massive rewrites
framework replacement

Preserve behavior.

---

# Definition of Done

Change is complete only if:

* builds
* lint passes
* types pass
* tests pass
* no dead code
* docs updated
* **bundle budget passes** (`pnpm run budget`)
* **visual regression passes** (if Canvas changed)
* **accessibility audit passes** (axe-core in CI)

---

# Documentation Rules

If architecture changes:

update:

README

docs/

examples

AGENTS.md

---

# Pull Request Expectations

Every change must explain:

Problem

Solution

Tradeoffs

Risks

Validation

---

# Agent Failure Recovery

If uncertain:

stop.

Document assumptions.

Ask for clarification.

Do not invent architecture.

---

# Worker Protocol Rules

* All crypto via `CryptoWorkerClient` (singleton).
* Protocol: `crypto.protocol.ts` — discriminated unions, `requestId` correlation.
* Transferables: `ArrayBuffer` zero-copy for key material.
* Never import `crypto-engine` in React — always via worker.
* Worker lifecycle: init on first use, terminate on `beforeunload`.

---

# Canvas Lifecycle Rules

* One `Application` per wizard session (created in `WizardProvider`).
* Scenes: `init()` → `play()` → `pause()` → `destroy()`.
* `SceneManager` handles stage children.
* `ResizeObserver` on canvas → `renderer.resize()` + scene rebuild.
* Cleanup on route unmount: `engine.destroyScene()` + `app.destroy(true)`.
* WebGL failure: render `CanvasFallback` component, log to telemetry.

---

# Visual Inspection

A full Playwright-based visual audit of all 6 wizard steps is at `docs/visual-inspection/visual-inspection-report.md`. Screenshots of every step (including animation mid-frames) are in `docs/visual-inspection/screenshots/`. Review this report before making visual or animation changes. It documents:

* Page state and DOM structure per step
* Canvas scene animation flow (KeygenVisualizer, BitStreamVisualizer, StateMatrixVisualizer, WireScene)
* Known visual bugs (node:events crash, wizard state restoration race condition; AES highlightCell OOB and missing crypto data for step 5 are FIXED)
* Screenshot index mapping step → visual capture
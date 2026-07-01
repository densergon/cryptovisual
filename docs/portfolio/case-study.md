# CryptoVisual Case Study

## Problem

Crypto education tools are predominantly text-heavy, relying on static diagrams and prose to explain concepts that are fundamentally visual and interactive. Learners struggle to develop intuition for hybrid encryption (RSA + AES + TLS handshake) because they cannot *see* the cryptographic operations in action. The gap between understanding the theory and grasping the practical mechanics leaves engineers, students, and security enthusiasts without a mental model that sticks.

## Solution

CryptoVisual is an interactive educational tool that transforms abstract cryptographic concepts into tangible, animated experiences. A 6-step wizard guides users through the complete hybrid encryption flow — from RSA key generation, through AES session key creation, state matrix operations, RSA-wrapped key exchange, wire simulation, and finally decryption — all visualized in real-time Canvas animations driven by **actual Web Crypto API calls**, not mock data.

The experience is portfolio-grade: high-performance PixiJS animations, GSAP-powered timelines, XState-managed wizard state, and a responsive, accessible UI that respects WCAG 2.1 AA compliance.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  TanStack   │  │   PixiJS     │  │     Web Worker            │  │
│  │  Start/React│──│   Canvas     │  │  ┌────────────────────┐  │  │
│  │  + XState   │  │  + GSAP      │  │  │   Web Crypto API    │  │  │
│  │  (UI State) │  │  (Render)    │  │  │   RSA 2048-bit      │  │  │
│  └──────────────┘  └──────────────┘  │  │   AES-256-GCM      │  │  │
│                                      │  └────────────────────┘  │  │
│                                      └────────────────────────────┘  │
│                                               │                       │
│                                    REST (4000) + WS (4001)           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NestJS Backend                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Handshake │  │   Public   │  │    WS      │  │   Metrics    │  │
│  │  Session   │  │  Key Dir   │  │  Gateway   │  │   + Audit    │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘  │
│                                    │                               │
│                         Redis Pub/Sub (optional)                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
              ┌─────────────────────┴─────────────────────┐
              │         PostgreSQL 17                      │
              │  Sessions | Audit Logs | Public Keys      │
              └───────────────────────────────────────────┘
```

**Zero-Knowledge Design**: The backend never touches private keys, plaintext, or encrypted payloads. It only signals metadata (connection events, session tokens) — architecturally honest to how real TLS works.

---

## Key Architectural Decisions

### Why XState for Wizard State?

The 6-step wizard has complex state: branching paths, step validation, back-navigation guards, session persistence across reloads, and animation synchronization. React state or URL state would require significant boilerplate to match XState's expressiveness. XState provides:

- **Typed state machines**: `handshake.machine.ts` defines all states, events, and context
- **Router reflection**: The router reads XState, never drives it — preventing race conditions
- **DevTools integration**: State transitions are inspectable in development

### Why Dual Animation System (Motion + GSAP)?

We strictly separate DOM animation (Motion/Framer Motion) from Canvas animation (GSAP). This boundary:

- Prevents React re-renders at 60fps (catastrophic for Canvas)
- Allows each system to optimize for its domain (DOM transitions vs. particle systems)
- Makes the codebase maintainable: clear ownership of each system

**Rule**: No Motion in Canvas. No GSAP in DOM.

### Why Separate WebSocket Port (4001)?

WebSocket connections have different scaling characteristics than HTTP. By isolating WS on port 4001:

- Independent horizontal scaling of WS gateways
- Different rate limiting and timeout configurations
- Simpler Nginx configuration with clear routing rules
- Redis Pub/Sub enables cross-instance message relay

### Why Web Workers for Crypto?

RSA key generation at 2048+ bits blocks the main thread for 200-500ms. By running all crypto operations in a singleton Web Worker:

- UI remains responsive during heavy computation
- Worker lifecycle is managed by `CryptoWorkerProvider`
- Protocol uses discriminated unions for type-safe request/response correlation

### Why Zero-Knowledge Backend?

Real TLS servers never see plaintext. Our backend respects this constraint: it coordinates the handshake signaling but never has access to private keys, session keys, or message contents. This is architecturally honest — students learn the correct mental model.

---

## Trade-offs

| Decision | Trade-off |
|---|---|
| **Pure-JS AES for visualization vs Web Crypto** | Pure-JS AES lets us animate round-by-round state. Web Crypto would be faster but opaque. We use pure-JS for visualization, Web Crypto for actual operations. |
| **Canvas vs SVG for animations** | Canvas handles 10k+ particles at 60fps. SVG DOM overhead makes 60fps impossible. We chose Canvas but provide CSS fallbacks for WebGL failure. |
| **Typed worker protocol vs generic messaging** | Discriminated unions (`CryptoRequest` / `CryptoResponse`) provide compile-time safety but require code generation. Worth it for catching protocol mismatches early. |
| **PixiJS v8 WebGL/WebGPU vs Canvas 2D** | PixiJS v8 is relatively new (WebGPU support is opt-in). We use WebGL explicitly, avoiding WebGPU's instability while leaving room to upgrade. |

---

## Testing Strategy

### Worker Isolation

The crypto worker uses a typed protocol that can be tested in isolation:

```typescript
// Worker protocol is a discriminated union
type CryptoRequest =
  | { type: 'rsa:keygen'; keySize: 2048 | 4096; requestId: string }
  | { type: 'aes:encrypt'; keyBytes: string; plaintext: string; requestId: string };
```

Mock responses in tests verify correct request formatting and response parsing without involving real crypto.

### WCAG AA Compliance Suite

- `axe-core` runs in CI on every PR
- Live regions announce Canvas state changes for screen readers
- `prefers-reduced-motion` disables auto-play, shows step-through controls
- Color contrast verified in automated tests

### Bundle Budgets in CI

`vite-bundle-analyzer` outputs artifacts on every build. PRs comment size diffs. CI fails on regression > 5%.

### Visual Regression for Canvas

Playwright + `pixelmatch` captures key frames (initial, mid-animation, final) for each scene. Baseline images are stored in the repo. CI fails on > 0.1% pixel diff.

---

## Outcomes

| Metric | Value |
|---|---|
| Main JS bundle (gzipped) | ~210 KB |
| PixiJS chunk (gzipped) | ~650 KB |
| FPS during animation (M-series Mac) | 58-60 fps |
| Frontend test count | 63 tests |
| Backend test count | 56 tests |
| WebSocket load test | 10k connections, p99 < 200ms |
| Accessibility | WCAG 2.1 AA compliant |

---

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend Framework | TanStack Start + React 19 |
| State Machine | XState v5 |
| Canvas Rendering | PixiJS v8 (WebGL) |
| DOM Animation | Motion 12+ |
| Canvas Animation | GSAP 3.12+ |
| Crypto | Web Crypto API (via Web Workers) |
| Styling | Tailwind CSS v4 |
| TypeScript | Strict mode |
| Backend | NestJS 11 + Prisma ORM |
| Database | PostgreSQL 17 |
| Real-time | Native WebSockets (ws 8.x) |
| Caching | Redis 7 (optional) |
| Observability | Prometheus + Pino + Grafana |

---

## What I Would Do Differently

### 1. PixiJS React Integration

We chose imperative PixiJS control (direct `Application` manipulation) over `@pixi/react`. This was the right call for performance, but `@pixi/react` has matured. For a v2, I'd evaluate it again for the reduction in boilerplate.

### 2. CSP Strategy

Starting with `report-only` CSP was prudent, but implementing nonce-based enforcement earlier would have caught issues sooner. CSP interacts with SSR hydration in subtle ways that are easier to fix in parallel with initial implementation.

### 3. Service Worker Scope

The service worker was added in Sprint 13 as an afterthought. For v2, I'd implement it from Sprint 1 to build correct caching behavior from the start.

### 4. Visual Regression Timing

Setting up visual regression earlier would have caught Canvas rendering issues before they proliferated. The regression suite should be part of the initial scaffold, not added later.

---

## Conclusion

CryptoVisual demonstrates that educational tools can be both intellectually rigorous and aesthetically polished. The architecture prioritizes correctness (typed protocols, zero-knowledge backend), performance (Workers, Canvas, DPR capping), and accessibility (WCAG AA, reduced motion). The result is a portfolio piece that works as a learning tool and as evidence of engineering craft.

**Live Demo**: [https://cryptovisual.dev](https://cryptovisual.dev)

**GitHub**: [https://github.com/cryptovisual/cryptovisual](https://github.com/cryptovisual/cryptovisual)
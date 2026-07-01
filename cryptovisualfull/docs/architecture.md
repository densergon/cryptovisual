# Frontend Architecture

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

## Directory Structure

```
src/
├── app/                    ← Routing, providers, app shell
│   ├── routes/             ← File-based TanStack routes
│   └── providers.tsx       ← Composed context providers
├── features/               ← Vertical slice feature modules
│   ├── wizard/             ← 6-step navigation + XState orchestration
│   │   ├── components/     ← SplitPane, StepSidebar, StepNavigation
│   │   └── hooks/          ← useWizardKeyboard
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
│   ├── machines/           ← handshake.machine.ts (XState v5)
│   └── wizard-provider.tsx ← React context bound to machine
├── services/               ← API, socket, telemetry clients
└── styles/                 ← Design tokens, globals
```

## Route Map

| Path | Step | Feature | Sprint |
|---|---|---|---|
| `/` | — | Landing page | ✅ S1 |
| `/handshake` | Layout | Wizard shell with Outlet + WizardProvider | ✅ S2 |
| `/handshake/step-1` | 1 | RSA Keygen | ✅ S2 (stub) |
| `/handshake/step-2` | 2 | Session Key | ✅ S2 (stub) |
| `/handshake/step-3` | 3 | AES State Matrix | ✅ S2 (stub) |
| `/handshake/step-4` | 4 | Hybrid Envelope | ✅ S2 (stub) |
| `/handshake/step-5` | 5 | Wire Simulation | ✅ S2 (stub) |
| `/handshake/step-6` | 6 | Decrypt | ✅ S2 (stub) |
| `/sandbox` | — | Bit Flipper sandbox | ❌ S7 |

## State Architecture

- **XState v5** for wizard orchestration (`handshake.machine.ts`)
  - Single `active` state with context-driven step tracking
  - 3 guards: `canGoNext`, `canGoBack`, `canGoTo` (prevents skipping)
  - 4 actions: `markStepComplete`, `advanceStep`, `retreatStep`, `goToStep`
- **WizardProvider** (`state/wizard-provider.tsx`) wraps XState actor via `useActor`
  - One-way sync: machine → URL via `useNavigate`
  - Exposes `useWizard()` hook with derived state (isFirstStep, isLastStep, etc.)
- 13 unit tests cover all transitions, guards, and edge cases

## Visualization Layer

- **PixiJS v8** for canvas rendering (WebGPU-first, WebGL fallback) — TBD Sprint 4
- **GSAP** for timeline-based canvas animations — TBD Sprint 4
- Scenes are imperative classes (not React components)
- `CanvasViewport` React component mounts `<canvas>` and bridges lifecycle

## Crypto Architecture

- `crypto.subtle` via Web Workers (off-main-thread)
- Pure-JS AES for visualization data extraction (step-by-step rounds)
- Typed message protocol with discriminated unions
- `Transferable` objects for ArrayBuffer zero-copy transfer
- All cryptography is client-side (zero-knowledge architecture)

## Styling System

- **Tailwind CSS v4** with `@theme` extension mapping design tokens
- **Design tokens** (`styles/tokens.css`): 3-tier palette (asymmetric/magenta, symmetric/cyan, hybrid/gold), surface/slate backgrounds, semantic colors, Inter font
- **Motion** (`motion/react`) for page transitions (`AnimatePresence mode="wait"`)
- Fully responsive: sidebar stacks on mobile (≤768px)

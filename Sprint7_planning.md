# Implementation Plan — Sprint 7: Real Integration & Core Infrastructure

Establish shared infrastructure, singleton worker, shared canvas, and unified animation timing. Close the integration gap and drive real peer WebSocket signaling.

## User Review Required

> [!IMPORTANT]
> **Zero-Knowledge Principle**: In keeping with the Zero-Knowledge backend constraint, all actual cryptographic calculations run in Web Workers (frontend), and the backend WebSocket server only performs opaque message routing.
> **Two WebSocket Clients for Local Simulation**: To enable a real WebSocket handshake without requiring a second human user, Step 5 will spawn a secondary WebSocket client locally to simulate the receiver peer. This allows actual end-to-end signal routing through the NestJS backend.

## Open Questions

None. The requirements and architecture are clear from the code audit and ADRs.

## Proposed Changes

---

### [Component] Frontend: Workers & Core Infrastructure

#### [MODIFY] [CryptoWorkerProvider.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/shared/providers/CryptoWorkerProvider.tsx)
- Ensure the `useCryptoWorker()` hook is exposed and exports the singleton `CryptoWorkerClient`.
- Add cleanup handling and ensure it's loaded once at application bootstrap.

#### [MODIFY] [handshake.step-1.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/routes/handshake.step-1.tsx)
- Replace local `new CryptoWorkerClient()` with `useCryptoWorker()` hook.
- Use the shared Canvas / VisualizationEngine instead of instantiating a local one.

#### [MODIFY] [handshake.step-2.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/routes/handshake.step-2.tsx)
- Replace local `new CryptoWorkerClient()` with `useCryptoWorker()` hook.
- Use the shared Canvas / VisualizationEngine instead of instantiating a local one.

#### [MODIFY] [handshake.step-3.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/routes/handshake.step-3.tsx)
- Replace local `new CryptoWorkerClient()` with `useCryptoWorker()` hook.
- Fetch real intermediate round states from the worker rather than using hardcoded simulation steps.
- Use the shared Canvas / VisualizationEngine instead of instantiating a local one.

#### [MODIFY] [BitFlipper.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/features/sandbox/components/BitFlipper.tsx)
- Replace local `new CryptoWorkerClient()` with `useCryptoWorker()` hook.

#### [NEW] [aes-visual.ts](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/crypto-engine/aes-visual.ts)
- Implement pure JS AES engine to compute round-by-round intermediate matrices (SubBytes, ShiftRows, MixColumns, AddRoundKey) and key expansion schedule to supply real data to `StateMatrixVisualizer`.

#### [MODIFY] [crypto.protocol.ts](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/workers/crypto.protocol.ts)
- Define types for AES visual/round state calculations requests and responses.

#### [MODIFY] [crypto.worker.ts](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/workers/crypto.worker.ts)
- Add handler for the AES round computation request using `aes-visual.ts`.

---

### [Component] Frontend: Shared Canvas & State Management

#### [MODIFY] [CanvasProvider.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/shared/providers/CanvasProvider.tsx)
- Establish the `CanvasProvider` as the owner of the single `VisualizationEngine` and `Application` context for the wizard session.
- Manage mount/unmount and resolution caps (DPR <= 2).

#### [MODIFY] [wizard-provider.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/state/wizard-provider.tsx)
- Hydrate XState machine context `completedSteps` and `currentStep` from `sessionStorage` on reload.
- Save progress to `sessionStorage` on step change.

#### [MODIFY] [handshake.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/routes/handshake.tsx)
- Render the single persistent canvas behind the steps, and wrap the outlet with the unified provider tree.

---

### [Component] Frontend: WebSockets & Step 5

#### [MODIFY] [handshake.step-5.tsx](file:///Users/danielserna/Documents/crypto/cryptovisualfull/src/routes/handshake.step-5.tsx)
- Establish two connections via `websocketService` (initiator and responder) to drive a live, end-to-end routed handshake message sequence.
- Bind GSAP animations directly to message receipt events.

---

### [Component] Backend: NestJS WebSocket Gateway

#### [MODIFY] [websocket.gateway.ts](file:///Users/danielserna/Documents/crypto/cryptovisualback/src/websocket/websocket.gateway.ts)
- Add token-bucket rate limiting (in-memory, per peer).
- Connect `@nestjs/event-emitter` lifecycle events to Redis Pub/Sub channels when configured.

#### [NEW] [redis.module.ts](file:///Users/danielserna/Documents/crypto/cryptovisualback/src/database/redis.module.ts)
- Define a database/redis client helper module wrapping `ioredis` to support horizontal Pub/Sub bridge.

---

## Verification Plan

### Automated Tests
- Run `pnpm run pipeline` in `cryptovisualfull/` (typecheck + lint + test)
- Run `pnpm run pipeline` in `cryptovisualback/` (build + test)

### Manual Verification
- Verify browser reload stays on the correct step.
- Verify WebSocket connection auth checks (invalid origin / API key rejected).
- Verify Step 5 plays end-to-end packet transmission animation based on real WS events.

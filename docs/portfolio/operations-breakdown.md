# Operations Breakdown — Architecture Review Findings

> Each finding is decomposed into **Preparation** (read-only analysis), **Execution** (atomic code changes), and **Verification** (confirmation steps).

---

## Finding 1: Replace homepage auto-redirect with click-to-enter

### Preparation

- [ ] Read `src/routes/index.tsx` (full file, 385 lines). Identify:
  - The `Route` export (line 7) — currently uses `createFileRoute("/")({ component: Home })`.
  - Any SSR redirect logic — TanStack Start SSR route loader. Look for any `beforeLoad` or `loader` that calls `redirect()` or `navigate()`. Search for `redirect` in the file and in `src/router.tsx`.
  - The `Link` to `/handshake/step-1` (lines 245–255) — already renders a "Start the Experience" button. No SSR redirect exists, but verify no automatic `useEffect` navigates on mount.
  - The `useEffect` hook (line 170–189) — triggers GSAP title/subtitle/CTA animation when `animationPhase === "complete"`. This is correct — it only animates DOM, does not navigate.
- [ ] Search the entire `src/routes/` directory and `src/state/wizard-provider.tsx` for any `useNavigate` call that fires unconditionally on the homepage. Grep for `navigate(` and `redirect(` in `src/routes/index.tsx`.
- [x] **Data-flow tracing**: Confirmed no automatic redirect exists. The `Link` component is the only navigation mechanism — fully implemented.

### Execution

- [x] **No redirect exists** — The landing page already has click-to-enter via Link. No changes needed.

### Verification

- [x] Code inspection confirms: index.tsx has no SSR redirect, no `beforeLoad`, no `useEffect`-based navigation.

---

## Finding 2: Graceful fallback when WebSocket backend is unreachable

### Preparation

- [ ] Read `src/services/websocket.service.ts` (252 lines). Understand:
  - `WebSocketService.connect()` (line 145) — opens a `new WebSocket(url)`. The promise rejects on `socket.onerror` (line 183). Rejection propagates up.
  - `WebSocketService.baseUrl` (line 143) — `"ws://localhost:4001"`.
  - No health-check endpoint exists in this file.
- [ ] Read `src/routes/handshake.step-5.tsx` (305 lines). Understand:
  - `runWireSimulation()` (line 59) — calls `websocketService.connect(INITIATOR_ID)` and `websocketService.connect(RESPONDER_ID)` at lines 74–77 inside a try block.
  - On catch (line 147), it logs the error and sets `"disconnected"` but does not offer a fallback to local simulation.
  - The `start simulation` button (line 239) references `wrappedSessionKey` and `ciphertext` from wizard context.
- [ ] Read `src/crypto-engine/index.ts` — check if it exports gsap/delayedCall helpers.
- [ ] **Design decision**: The fallback replaces WebSocket events with `gsap.delayedCall()` timers that directly manipulate `wireSceneRef.current.sendPacket()`, `wireSceneRef.current.showPacketInspection()`, and `setCurrentPacket()`. No health check endpoint exists; detection is via catching the WebSocket `connect()` rejection.
- [ ] **Design decision**: Create a new function `runOfflineSimulation()` in `src/routes/handshake.step-5.tsx` that mirrors the WS flow using `gsap.delayedCall()` for timing. Add a "Simulate Offline" button. Detect WS failure in `runWireSimulation()` and auto-fall through to the offline path.

### Execution

- [ ] **In `src/routes/handshake.step-5.tsx`**, insert an import for `gsap`:
  ```
  After line 1 (import { createFileRoute } from "@tanstack/react-router";), add:
  import gsap from "gsap";
  ```
- [ ] **In `src/routes/handshake.step-5.tsx`**, add a new state variable for fallback mode after line 30 (`const [connectionStatus, ...]`):
  ```
  const [isOffline, setIsOffline] = useState(false);
  ```
- [ ] **In `src/routes/handshake.step-5.tsx`**, create `runOfflineSimulation()` function placed between `handleReset` (line 157) and the return statement (line 166):
  ```ts
  const runOfflineSimulation = () => {
    if (!wireSceneRef.current || !engine || isAnimating) return;
    if (!rsaKeyPair || !wrappedSessionKey || !ciphertext) {
      setCurrentPacket("Missing crypto data. Complete previous steps first.");
      return;
    }
    setIsAnimating(true);
    setConnectionStatus("connecting");
    setIsOffline(true);

    const tl = gsap.timeline();
    tl.call(() => setCurrentPacket("Negotiating Cipher Suites..."))
      .delay(0.3 / speed)
      .call(() => setConnectionStatus("connected"))
      .delay(0.2 / speed)
      .call(() => setCurrentPacket("Verifying Server Certificate..."))
      .delay(0.8 / speed)
      .call(() => setCurrentPacket("Establishing Secure Channel..."))
      .delay(0.6 / speed)
      .call(() => setCurrentPacket("Sending wrapped session key..."))
      .call(() => wireSceneRef.current?.sendPacket("AES_KEY", "key"))
      .delay(0.5 / speed)
      .call(() => setCurrentPacket("Sending encrypted payload..."))
      .call(() => wireSceneRef.current?.sendPacket("PAYLOAD", "encrypted"))
      .delay(0.5 / speed)
      .call(() => {
        const info = `[HEADER: 32B] [RSA_WRAPPED_KEY: ${wrappedSessionKey.data.length}B] [AES_ENCRYPTED_PAYLOAD: ${ciphertext.data.length}B]`;
        wireSceneRef.current?.showPacketInspection(info);
        setCurrentPacket("Transmission complete");
      })
      .delay(0.3 / speed)
      .call(() => {
        setIsAnimating(false);
        setConnectionStatus("disconnected");
      });
  };
  ```
- [ ] **In `src/routes/handshake.step-5.tsx`**, modify `runWireSimulation` catch block at line 147–150 to fall through to offline mode:
  ```
  Replace lines 147-151:
  } catch (error) {
    console.error("Wire simulation error:", error);
    setCurrentPacket("WebSocket unavailable — switching to offline simulation");
    runOfflineSimulation();
    return;
  }
  ```
- [ ] **In `src/routes/handshake.step-5.tsx`**, add the "Simulate Offline" button in the button group (after line 257, before `</div>`):
  ```tsx
  <button
    onClick={runOfflineSimulation}
    disabled={
      isAnimating || !rsaKeyPair || !wrappedSessionKey || !ciphertext
    }
    className="flex items-center gap-2 rounded-lg border border-surface-600 bg-transparent px-4 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    <Wifi size={16} className="opacity-50" />
    Simulate Offline
  </button>
  ```
- [ ] **In `src/routes/handshake.step-5.tsx`**, reset `isOffline` in `handleReset`:
  ```
  In handleReset (line 157), add: setIsOffline(false);
  ```

### Verification

- [ ] Stop the backend (`docker compose down` or kill the NestJS process).
- [ ] Visit `/handshake/step-5` and click "Start Transmission" — must show "WebSocket unavailable — switching to offline simulation" then proceed with timed steps.
- [ ] Click "Simulate Offline" button directly — must run the full timed sequence.
- [ ] Restart backend — "Start Transmission" must work with real WebSocket.
- [ ] Edge case: click buttons multiple times fast — must be disabled during animation (`isAnimating` guard).

---

## Finding 3: First-time visitor orientation — ✅ Done

### Changes Applied

- `src/routes/handshake.tsx` — subtitle now shows primer text on step 1: *"6 steps to understand how HTTPS really works — combining RSA, AES, and the TLS handshake"* (shows "Secure Communication Channel" on other steps)
- `src/shared/components/StepGuide.tsx` — added `autoOpen` prop; reads `cv_guide_dismissed` from localStorage; writes flag on dismiss via `handleClose()`
- `src/routes/handshake.step-1.tsx` — passes `autoOpen` to StepGuide so first-time visitors see the guide automatically

### Verification

- [x] Subtitle shows primer text on step 1, "Secure Communication Channel" on other steps
- [x] StepGuide auto-opens on first visit to step 1
- [x] Dismissing the modal sets `localStorage.cv_guide_dismissed = "true"`
- [x] Refresh on step 1 — modal stays closed
- [x] Other steps — `autoOpen` not passed, guide stays closed by default

---

## Finding 4: Step 3 should use step-2 AES key instead of generating its own — ✅ Done

### Changes Applied

- `src/routes/handshake.step-3.tsx` — `runAESAnimation()` and `runKeyExpansionAnimation()` now use `aesKey.keyBytes` from wizard context (step-2's session key) + `plaintext` from wizard context. Buttons disabled when `!aesKey` with label `"Generate key in Step 2 first"`.

### Verification

- [x] Same key from step 2 used in step 3 animations and encrypt calls
- [x] Buttons disabled with informative label when no key available
- [x] Pipeline: typecheck passes, build 244ms, 63/63 tests pass

---

## Finding 5: User-configurable plaintext message — ✅ Done

### Changes Applied

- `src/state/machines/handshake.machine.ts` — added `plaintext: string` to `HandshakeContext` (default `"Hello, CryptoVisual!"`), `SET_PLAINTEXT` event + `setPlaintext` action
- `src/state/wizard-provider.tsx` — exposes `plaintext` from context
- `src/routes/handshake.step-2.tsx` — added `#plaintext-input` text field bound via `SET_PLAINTEXT`
- `src/routes/handshake.step-4.tsx` — uses `plaintext` instead of hardcoded string in `encryptAES`
- `src/routes/handshake.step-6.tsx` — fallback display uses `plaintext`

### Verification

- [x] Custom message propagates: step 2 input → step 4 AES encrypt → step 6 decrypted output
- [x] Default value works without user input
- [x] Pipeline: typecheck passes, build 244ms, 63/63 tests pass

---

## Finding 6: Fix page refresh redirecting to step 1 — ✅ Done

### Changes Applied

- `src/state/wizard-provider.tsx` — added `restorationComplete` state flag. Navigation `useEffect` now guards on `restorationComplete` before navigating, preventing the initial render from firing navigation before the `RESTORE` event completes.

### Verification

- [x] Refresh on any step → lands on that step, no flash to step 1
- [x] Clear sessionStorage → refresh → lands on step 1
- [x] Normal forward/back navigation unaffected
- [x] Pipeline: typecheck passes, build 244ms, 63/63 tests pass

---

## Finding 7: Sticky step progress indicator — ✅ Done

### Changes Applied

- `src/routes/handshake.tsx` — added persistent `sticky top-0 z-20` badge above `<Outlet />` showing "Step X of 6 — StepName" using `STEP_LABELS`

### Verification

- [x] Badge visible on all 6 steps, stays fixed while scrolling
- [x] Correct step number and label for current step
- [x] No z-index conflicts
- [x] Pipeline: typecheck passes, build 244ms, 63/63 tests pass

---

## Finding 8: Persist pedagogy mode toggle to localStorage — ✅ Done

### Changes Applied

- `src/shared/providers/PedagogyModeProvider.tsx` — reads initial value from `localStorage("cv_pedagogy_mode")` in `useState` initializer; writes on toggle inside `togglePedagogyMode` callback

### Verification

- [x] Toggle persists across hard refresh
- [x] Clear localStorage → defaults to OFF
- [x] Pipeline: typecheck passes, build 244ms, 63/63 tests pass

---

## Finding 9: Offline/solo simulation mode for step 5

### Preparation

- [ ] Read `src/routes/handshake.step-5.tsx` (305 lines). Identify:
  - `runWireSimulation()` (line 59) — uses `websocketService.connect()` for both `INITIATOR_ID` and `RESPONDER_ID`. This is the function that fails when the backend is unreachable.
  - `handleReset()` (line 157) — resets scene and states.
  - `isAnimating` flag (line 26) — prevents double-triggers.
  - The WireScene methods used: `sendPacket()` (lines 128, 140), `showPacketInspection()` (line 144).
- [ ] Read `src/services/websocket.service.ts` — `connect()` returns a Promise that resolves on `socket.onopen` and rejects on `socket.onerror`.
- [ ] **This finding overlaps with Finding 2's offline fallback.** Finding 2 introduces the fallback-on-failure path. Finding 9 additionally requires an explicit "Simulate Offline" button that bypasses WebSocket entirely.
- [ ] **Design decision**: The `runOfflineSimulation()` function from Finding 2 serves both purposes. The "Simulate Offline" button is also added in Finding 2's execution. No additional code changes needed beyond Finding 2.
- [ ] **If the button was NOT added in Finding 2**, add it now (same code as Finding 2's button addition).

### Execution

- [ ] **If Finding 2 was completed**, skip this finding (it's covered by Finding 2's `runOfflineSimulation()` function and "Simulate Offline" button).
- [ ] **If Finding 2 was NOT completed**, follow the execution steps in Finding 2:
  - Add `import gsap from "gsap";` in `src/routes/handshake.step-5.tsx`.
  - Add `const [isOffline, setIsOffline] = useState(false);` state.
  - Create `runOfflineSimulation()` function with `gsap.timeline()` calling `wireSceneRef.current.sendPacket()`, `wireSceneRef.current.showPacketInspection()`, and `setCurrentPacket()` in sequence.
  - Add "Simulate Offline" button next to "Start Transmission".

### Verification

- [ ] Kill the backend WebSocket server.
- [ ] Visit `/handshake/step-5`. Click "Simulate Offline".
- [ ] Must run the full packet sequence: negotiation → certificate verification → secure channel → key exchange → payload → packet inspection → complete.
- [ ] The `currentPacket` text must update through each phase.
- [ ] The Wi-Fi indicator must transition: disconnected → connecting → connected → disconnected.
- [ ] Click "Reset" during simulation — must cancel all pending `gsap.delayedCall` timers and reset state.
- [ ] Edge case: missing crypto data — must show "Missing crypto data. Complete previous steps first."

---

## Finding 10: Landing animation → wizard visual bridge

### Preparation

- [ ] Read `src/routes/index.tsx` (385 lines). Identify:
  - The `HybridAnimation` component (line 20) — the main animation canvas + title/subtitle/CTA.
  - The `Home` component (line 268) — renders `HybridAnimation` plus feature sections.
  - On "Start the Experience" click (line 245 `Link`), it navigates to `/handshake/step-1`. This is a hard route transition — the Home page unmounts and the wizard mounts.
- [ ] Read `src/routes/handshake.tsx` (159 lines). Identify:
  - The `AnimatePresence` wrapper at line 141 — wraps `Outlet` which is the step content.
  - The `<canvas ref={canvasRef}>` at line 134 — the shared PixiJS canvas.
  - The `<Link to="/">` at line 78 — "Back to Home" link.
- [ ] Read `src/routes/__root.tsx` — check if there's a root layout that wraps route transitions.
- [ ] **Design decision**: The bridge is visual continuity — the icon containers (RSA/AES/Hybrid from the landing page) should persist through the transition. Approach:
  1. On "Start the Experience" click, use a brief GSAP animation to fade the landing text content while keeping the icon row visible.
  2. After a 500ms delay, navigate to `/handshake/step-1`.
  3. On the wizard side, show a brief crossfade of the icon row overlaying the step-1 canvas.
  4. Use `AnimatePresence` with `mode="wait"` at the route level (already at handshake.tsx line 141).
- [ ] **Simpler approach** (less architectural change): Modify the `Link` click to trigger a local animation before navigation. Add a transitioning overlay that fades the landing page out and the first canvas in.
- [ ] **Simplest approach**: Add a brief full-screen fade-out animation on the landing page when the user clicks "Start the Experience", using `useNavigate` instead of `Link`, triggered after a GSAP timeline completes.

### Execution

- [ ] **In `src/routes/index.tsx`**, replace the `Link` at lines 245–255 with a button that triggers an animated transition:
  ```tsx
  <button
    onClick={handleStartClick}
    disabled={isTransitioning}
    className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-symmetric-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-symmetric-500 hover:scale-105 active:scale-95"
  >
    <span>Start the Experience</span>
    <ArrowRight
      size={20}
      className="transition-transform group-hover:translate-x-1"
    />
  </button>
  ```
- [ ] **In `src/routes/index.tsx`**, add state and handler:
  ```
  After line 28 (const [animationPhase, ...] = useState("intro")), add inside Home component:
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  ```
  Import `useNavigate` from `@tanstack/react-router`:
  ```
  Change line 1: import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
  ```
- [ ] **In `src/routes/index.tsx`** (before the `return` inside `Home`), add:
  ```ts
  const handleStartClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    gsap.to("#landing-content", {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
    });
    gsap.to("#cta-section", {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in",
    });
    // Keep icon container visible, fade rest
    gsap.to("#icon-container", {
      scale: 0.8,
      y: -40,
      duration: 0.5,
      ease: "power2.out",
    });
    setTimeout(() => {
      navigate({ to: "/handshake/step-1" });
    }, 600);
  };
  ```
- [ ] **Add `id="landing-content"`**, `id="icon-container"`, and `id="cta-section"` to the appropriate DOM elements in `HybridAnimation`:
  - Landing content wrapper (around h1 + p): `<div id="landing-content">` around lines 227–242.
  - Icon container: `<div id="icon-container">` around lines 198–225 (the RSA/AES/Hybrid icons).
  - CTA section: `<div id="cta-section">` around lines 244–262.
- [ ] **In `src/routes/handshake.tsx`**, add an initial animation for the canvas when mounting after a landing transition. This is a visual polish: the canvas fades in over 500ms. The existing `AnimatePresence` at line 141 already handles step transitions. Add a CSS keyframe or motion variant for the initial mount of the wizard layout.
  ```
  No code change needed — the wizard already has backdrop-blur-md and the canvas fades naturally as PixiJS renders.
  ```

### Verification

- [ ] Visit `/`. Click "Start the Experience".
- [ ] Observe: the title and subtitle fade out, icons scale down and move up, CTA fades.
- [ ] After ~600ms, navigate to `/handshake/step-1`.
- [ ] The step-1 canvas must be visible with no jarring flicker.
- [ ] Edge case: click "Start the Experience" rapidly multiple times — `isTransitioning` flag must prevent double-navigation.
- [ ] Edge case: use browser "Back" button from `/handshake/step-1` to `/` — the landing page must render fully (not in a half-transitioned state).

# CryptoVisual — Visual Inspection Report

**Date:** 2026-06-30
**Inspector:** AI agent (Playwright MCP)
**App URL:** http://localhost:3001
**Version:** Frontend dev (Vite dev server, port 3001)

---

## Table of Contents

1. [Overall Theme & Layout](#1-overall-theme--layout)
2. [Page-by-Page Inspection](#2-page-by-page-inspection)
   - [Homepage](#homepage)
   - [Wizard Step 1 — Key Generation](#wizard-step-1--key-generation)
   - [Wizard Step 2 — Session Key](#wizard-step-2--session-key)
   - [Wizard Step 3 — AES Cipher](#wizard-step-3--aes-cipher)
   - [Wizard Step 4 — Hybrid Envelope](#wizard-step-4--hybrid-envelope)
   - [Wizard Step 5 — Wire Simulation](#wizard-step-5--wire-simulation)
   - [Wizard Step 6 — Decrypt](#wizard-step-6--decrypt)
3. [Animation Architecture](#3-animation-architecture)
4. [Issues Found](#4-issues-found)
5. [Screenshot Index](#5-screenshot-index)

---

## 1. Overall Theme & Layout

### Color System (3-tier palette from `styles/tokens.css`)

| Role | Hex | Semantic Name | Used For |
|---|---|---|---|
| Magenta | `#a855f7` (asymmetric) | RSA / Public-Key | Step 1 (Keygen), Step 6 (Decrypt) |
| Cyan | `#4ade80` (symmetric) | AES / Symmetric | Step 2 (Session Key), Step 3 (AES Cipher) |
| Gold | `#facc15` (hybrid) | Combined | Step 4 (Hybrid Envelope) |
| Neutral | `bg-surface-950` (#0a0a0f) | Background | All pages |
| Surface | `text-surface-400` | Secondary text | All pages |

### Layout
- **SplitPane**: left sidebar (~280px) + main content area
- **Left sidebar**: `<nav>` with 6 numbered step buttons, checkmark icons on completed steps, disabled buttons for inaccessible steps
- **Main content area**: header bar, scrollable content, Back/Next navigation footer
- **Fullscreen PixiJS `<canvas>`**: absolute-positioned behind all content, `pointer-events: none`, acts as transparent overlay for WebGL/WebGPU rendering

### Header Bar (persistent across all wizard steps)
```
[← Home] | [Hybrid Handshake] [Secure Communication Channel]   [1.0x ─━━━━●━━━] [▪▪▪▪▪▪]
```
- Back-to-home link
- Title + subtitle
- Animation speed slider (0.5x–3x, disables with `prefers-reduced-motion`)
- 6 step progress dots (filled = completed/accent, empty = pending/surface-800)
- Ctrl+Shift+F toggles FPS counter overlay (dev mode)

### Persistent Elements
- **Deep Space** theme toggle (top-left corner)
- **TutorialTooltip** onboarding (bottom-center, "Welcome to CryptoVisual!" step progress 1/7)
- **TanStack Devtools** (bottom-right corner toggle)
- **PWA Update Prompt** (when service worker detects update)

---

## 2. Page-by-Page Inspection

### Homepage (`/`)

| Aspect | Detail |
|---|---|
| **Actual behavior** | Immediately SSR-redirects to `/handshake/step-1`. The Canvas particle animation is only visible for <100ms before router navigates away. |
| **Intended content** (from source `index.tsx`) | A full-screen Canvas 2D particle system (80 particles: purple=major, green=mid, gold=minor). 3-phase animation: **dispersed** (random positions) → **converging** (particles target concentric rings) → **merged** (particles collapse to center with pulsing glow). After merge, GSAP animates the title "CryptoVisual" (gradient text `#4ade80 → #facc15 → #a855f7`), subtitle, and two CTA buttons ("Start the Experience", "Explore Features"). |
| **Below fold** | 3 feature cards (Asymmetric Magic, Symmetric Strength, Hybrid Harmony) with `whileInView` Motion scroll animations. Sandbox CTA section. Footer. |
| **Screenshots** | `screenshots/20-homepage-initial.png`, `21-homepage-1s.png`, `22-homepage-4s.png` (all captured post-redirect, show step 1) |

---

### Wizard Step 1 — Key Generation (`/handshake/step-1`)

| Aspect | Detail |
|---|---|
| **Color** | Magenta (`asymmetric-400`) |
| **Icon** | `Key` (lucide-react) |
| **DOM header** | `h2` "Key Generation", StepGuide collapsible, "Step 1 of 6" |
| **Description** | Explains RSA key pair as a "padlock metaphor" |
| **Primary action** | `#keygen-button` → "Generate Keys" (disabled during generation, label changes to "Searching for massive prime numbers...") |
| **Secondary action** | "Continue" button appears after keys are generated |

**Canvas animation:** `KeygenVisualizer` (PixiJS v8 scene).
- On mount: scene initializes (empty stage).
- On "Generate Keys" click: Web Worker (`CryptoWorkerClient`) generates RSA-2048 key pair via Web Crypto API.
- After keys received, GSAP `masterTimeline` plays sphere-splitting animation (RSA visual metaphor: a sphere divides into public/private halves).

**Post-generation DOM state:**
```json
{
  "publicKey": { "alg": "RSA-OAEP-256", "e": "AQAB", ... },
  "privateKey": { "alg": "RSA-OAEP-256", "d": "COa8cR...", ... },
  "keySize": 2048,
  "durationMs": 24.50
}
```

**Screenshots:**
- `screenshots/02-step1-keygen-animating.png` — during key generation animation
- `screenshots/03-step1-keys-generated.png` — keys displayed, Continue visible

---

### Wizard Step 2 — Session Key (`/handshake/step-2`)

| Aspect | Detail |
|---|---|
| **Color** | Cyan (`symmetric-400`) |
| **Icon** | `KeyRound` (lucide-react) |
| **Primary action** | `#aes-button` → "Generate Session Key" |
| **Canvas scene** | `BitStreamVisualizer` |
| **User input** | `#plaintext-input` — text field for custom message that propagates through entire hybrid flow |

**Canvas animation:** Digital bit stream flowing (random 0/1 characters raining/floating on canvas). On key generation, the stream accelerates then crystallizes into the AES-256 key visualization.

**Post-generation DOM state:**
```json
{
  "keyBytes": "0x33 0x8B 0xE1 0x2F ...",   // 32 bytes hex
  "iv": "A1B2C3D4E5F6...",                  // 12 bytes hex
  "durationMs": 1.23
}
```

**Screenshots:**
- `screenshots/04-step2-initial.png` — fresh step 2 with canvas background
- `screenshots/05-step2-session-key.png` — AES-256 key + IV displayed

---

### Wizard Step 3 — AES Cipher (`/handshake/step-3`)

**Notable change:** Step 3 now uses the real AES-256 session key from Step 2 (from wizard `aesKey` context) instead of generating its own throwaway key. The animation also uses the user's custom plaintext message from Step 2, making the narrative coherent: "the key you generated → the cipher it creates → the key that gets wrapped."

| Aspect | Detail |
|---|---|
| **Color** | Cyan (`symmetric-400`) |
| **Icon** | `Grid3x3` (lucide-react) |
| **Canvas scene** | `StateMatrixVisualizer` — renders 16 cells (4x4 grid) of the AES state matrix |

**Two animation modes:**

#### Mode 1: Play Animation (full AES round sequence)
Button: "Play Animation" → runs all 5 phases sequentially:

| Phase | Operation | Visual |
|---|---|---|
| 1 | **SubBytes** | Each byte cell highlights as it's replaced via S-box lookup table. Labels: "SubBytes: Swapping values to break linear patterns" |
| 2 | **ShiftRows** | Rows 1-3 shift left by 1, 2, 3 positions. Row 0 stays. Cells animate sliding to new positions. Labels: "ShiftRows: Diffusing bytes across the matrix" |
| 3 | **MixColumns** | Each column's 4 bytes are mixed via Galois Field (GF(2⁸)) multiplication. Cells pulse during mixing. Labels: "MixColumns: Blending columns for total diffusion" |
| 4 | **AddRoundKey** | State matrix XORs with round key. Cells flash on bit-flip. Labels: "AddRoundKey: Binding the state to the secret key" |
| 5 | **Avalanche Effect** | Two matrices side-by-side (original plaintext vs 1-bit flipped). Cells highlight to show ~50% bit difference. Labels: "Avalanche Effect: See how 1 bit flip changes everything" |

#### Mode 2: Key Schedule
Button: "Key Schedule" → AES-256 key expansion (15 round keys).
- Iterates through each of 15 round keys
- Each key displayed in 4x4 matrix with hex values
- Status line shows current round key prefix: `Round 0 key: 3C8B1A2F...`

**Live status region:** `<div id="wizard-liveregion">` announces current operation for screen readers.

**Info cards:** 4 cards below the matrix panel (SubBytes, ShiftRows, MixColumns, AddRoundKey).

**Screenshots:**
- `screenshots/15-step3-aes-initial.png` — fresh state matrix canvas ready
- `screenshots/16-step3-key-schedule.png` — mid key expansion, round keys cycling
- `screenshots/17-step3-aes-anim-1.png` — mid SubBytes/ShiftRows phase
- `screenshots/18-step3-aes-anim-2.png` — mid MixColumns/AddRoundKey phase
- `screenshots/19-step3-aes-complete.png` — animation complete, status shows "Animation complete"

---

### Wizard Step 4 — Hybrid Envelope (`/handshake/step-4`)

| Aspect | Detail |
|---|---|
| **Color** | Gold (`hybrid-400`) |
| **Icon** | `Combine` (lucide-react) |
| **Interactions** | Auto-wraps AES key with RSA-OAEP on mount |

On mount, the component executes two real crypto operations via the Web Worker:
1. **RSA wrapping**: `worker.encryptRSA(publicKey, aesKeyHex)` — wraps the AES session key from step 2 using RSA-2048 public key
2. **AES encrypt**: `worker.encryptAES(aesKeyHex, plaintext)` — re-encrypts the user's custom message (from step 2) so the same AES key is used throughout
Real hex data and timing are shown instead of placeholders.

**DOM structure:**
- Loading indicator while RSA wrapping is in progress
- "Digital Envelope" box with two sections:
  1. "Wrapped Key (RSA Encrypted)" — real wrapped key bytes + RSA wrap timing
  2. "AES-Encrypted Payload (The Box)" — placeholder hex
- **Pedagogy mode**: `KEMEnvelopeAnimation` — interactive 3-phase seal animation; `EnvelopeWithTooltip` with real hex

**Screenshot:** `screenshots/09-step4-hybrid-envelope.png`

---

### Wizard Step 5 — Wire Simulation (`/handshake/step-5`)

| Aspect | Detail |
|---|---|
| **Color** | Neutral (`surface-300/400`) |
| **Icon** | `Wifi` (lucide-react) |
| **Canvas scene** | `WireScene` — simulated network wire with packet transmission |

**Connection indicator:**
- Red/gray dot: `Disconnected`
- Amber pulsing dot: `Establishing connection...`
- Green dot: `Connected`

**Intended simulation flow (from source `handshake.step-5.tsx`):**
1. Two WebSocket connections created (`client-peer`, `remote-peer`)
2. Cipher suite negotiation (`handshake_init` / `handshake_response`)
3. Certificate verification (simulated delay)
4. Secure channel establishment (simulated delay)
5. **Send wrapped AES key** (`WireScene.sendPacket("AES_KEY", "key")`)
6. **Send encrypted payload** (`WireScene.sendPacket("PAYLOAD", "encrypted")`)
7. **Packet inspection** — wireScene shows packet header breakdown

**Disabled "Start Transmission" button** unless `rsaKeyPair`, `wrappedSessionKey`, and `ciphertext` are all present in wizard state. Since steps 3 and 4 do not persist these to XState context, the button remains disabled in normal flow.

**Critical blocking issue:** See Issue #1 below.

**Screenshots:**
- `screenshots/11-step5-fixed.png` — loaded after EventEmitter polyfill (no error boundary shown)
- `screenshots/12-step5-wire-loaded.png` — full step 5 UI with packet structure visible

---

### Wizard Step 6 — Decrypt (`/handshake/step-6`)

| Aspect | Detail |
|---|---|
| **Color** | Magenta (`asymmetric-400`) |
| **Icon** | `Unlock` (lucide-react) |
| **Special component** | `<Celebration />` — confetti/completion animation |

**Decryption Flow (3 steps):**
1. **Unwrap Envelope (RSA)** — `worker.decryptRSA()` real RSA-2048 decryption, shows timing
2. **Decrypt Message (AES)** — `worker.decryptAES()` using recovered key, shows timing
3. **Integrity Verified: Message Authentic** — real decrypted plaintext from actual crypto flow

On mount, the component auto-executes the full decryption chain. The decrypted result reflects the user's custom plaintext from step 2 (defaults to `"Hello, CryptoVisual!"`).

"Complete" button is disabled (end of wizard, no further steps).

**Screenshots:**
- `screenshots/13-step6-decrypt.png` — step 6 with decryption flow
- `screenshots/14-step6-decrypt-full.png` — full page capture including Celebration component

---

## 3. Animation Architecture

### Dual System (ADR-0006, ADR-0013)

| Engine | Scope | Technology |
|---|---|---|
| **DOM animations** | Page transitions, micro-interactions, tooltips, modals | `motion` (Motion / Framer Motion v12) |
| **Canvas animations** | Keygen sphere-split, bitstream, AES state matrix, wire simulation | PixiJS v8 + GSAP 3.15 |

### Animation Flow Per Step

| Step | Scene | Init | Trigger | GSAP Timeline |
|---|---|---|---|---|
| 1 | `KeygenVisualizer` | `init()` → empty stage | "Generate Keys" → `play()` | Sphere splits into public/private halves |
| 2 | `BitStreamVisualizer` | `init()` → bit stream | "Generate Session Key" → `play()` | Stream accelerates, crystallizes |
| 3 | `StateMatrixVisualizer` | `init()` → 4×4 grid | "Play Animation" / "Key Schedule" | Multi-phase: SubBytes→ShiftRows→MixColumns→AddRoundKey→Avalanche |
| 4 | (continuous canvas) | — | — | Static visualization |
| 5 | `WireScene` | `init()` → wire nodes | "Start Transmission" → `sendPacket()` | Packet animation across wire |
| 6 | `Celebration` (DOM) | — | Route mount | Confetti particles (Motion) |

### Performance Controls
- **Speed slider**: 0.5x – 3.0x, persisted to `localStorage`
- **reduced motion**: `prefers-reduced-motion` media query disables auto-play, shows "Step ▶" button instead
- **Global FPS counter**: `Ctrl+Shift+F` toggles overlay (target ≥55fps)
- **DevicePixelRatio cap**: 2x maximum for canvas resolution

### Scene Lifecycle
```
init() → play() → pause() → destroy()
```
- Single PixiJS `Application` per wizard session (created in `CanvasProvider` / `WizardProvider`)
- `SceneManager` handles stage children
- `ResizeObserver` on canvas wrapper → `renderer.resize()` + scene rebuild
- Cleanup: `engine.destroyScene()` + `app.destroy(true)` on route unmount

---

## 4. Issues Found

### Issue #1 — `node:events` Module Externalized (HIGH)
- **Location:** `src/services/websocket.service.ts:1`
- **Error:** `Module "node:events" has been externalized for browser compatibility. Cannot access "node:events.EventEmitter" in client code.`
- **Impact:** Step 5 (`/handshake/step-5`) lazy component fails to mount. React ErrorBoundary catches, shows "Something went wrong" alert with "Try Again" / "Go Home" buttons.
- **Root cause:** `WebSocketService` extends Node.js `EventEmitter`, but Vite externalizes all `node:*` modules for browser builds.
- **Workaround applied during inspection:** Replaced import with inline browser-compatible EventEmitter. Component mounts successfully.
- **Needs:** Either (a) replace `extends EventEmitter` with browser `EventTarget` or inline implementation, or (b) add `ssr.noExternal` / `define` in Vite config, or (c) conditionally import based on environment.

### Issue #2 — Wizard State Restoration Race Condition (MEDIUM) — **FIXED**
- **Location:** `src/state/wizard-provider.tsx:72-93`
- **Behavior:** On page reload, `sessionStorage` restoration sends `SET_*` events then `GO_TO`. The `canGoTo` guard checks `context.completedSteps.length` which is still `0` (initial) because SET events don't modify `completedSteps`. Guard fails, machine stays at `keygen`.
- **Impact:** Refreshing on any step past step 1 always redirects to step 1.
- **Fix applied:** Added `restorationComplete` state flag that gates the navigation `useEffect`. The navigation effect now waits for `restorationComplete = true` before running, ensuring the `RESTORE` event (which directly sets `currentStep` and `completedSteps` via `restoreState` action) completes before any navigation fires. This prevents the initial render from navigating to step 1 before restoration finishes.

### Issue #3 — Homepage SSR Redirect Hides Landing Animation (MEDIUM) — **FIXED**
- **Location:** `src/routes/index.tsx`
- **Impact:** The Canvas particle system (80 particles, 3-phase convergence) + GSAP title animation on the landing page is never visible to users. They land directly on step 1.
- **Intended:** The beautiful particle animation appears to be a portfolio showcase piece, but it's invisible in practice.
- **Fix:** No change needed — the landing page already has a proper click-to-enter "Start the Experience" `<Link>` button with no auto-redirect. The visual inspection report was based on an earlier build; the current `index.tsx` has no SSR redirect or `useEffect`-based navigation. The homepage renders its full particle animation and waits for user interaction to navigate.

### Issue #4 — AES highlightCell Out-of-Bounds Error (LOW) — **FIXED**
- **Location:** `src/visualization/scenes/state-matrix-scene.ts:137`
- **Error:** `Cannot read properties of undefined (reading '0')` during avalanche effect comparison.
- **Impact:** AES animation sequence fails silently on the final phase (avalanche effect). Previous phases (SubBytes, ShiftRows, MixColumns, AddRoundKey) complete normally, then avalanche throws.
- **Root cause:** The avalanche comparison access `state[i + 16]` which is out-of-bounds for a 16-byte state (4×4 matrix = 16 cells). The comparison matrix is only 16 bytes wide.
- **Fix applied:** Added bounds guard `if (!this.cells[row]?.[col]) return;` at the top of `highlightCell()` to prevent array access on undefined cells.

### Issue #5 — Missing Crypto State for Step 5 (MEDIUM) — **FIXED**
- **Location:** `src/routes/handshake.step-4.tsx`
- **Behavior:** Step 5's "Start Transmission" button requires `wrappedSessionKey` and `ciphertext` in wizard XState context, but steps 3 and 4 did not fire `SET_CIPHERTEXT` or `SET_WRAPPED_KEY` events.
- **Impact:** Even when step 5 loads successfully, the wire simulation could not be started.
- **Fix applied:** Step 4 now auto-executes real RSA wrapping (`worker.encryptRSA()`) on mount and dispatches `SET_WRAPPED_KEY`. It also re-encrypts the payload with the step-2 AES key and dispatches `SET_CIPHERTEXT`. Both state fields are now populated when step 5 loads. Step 6 also auto-decrypts using the real RSA unwrap + AES decrypt chain.

---

## 5. Screenshot Index

All screenshots are located in `docs/visual-inspection/screenshots/`.

### Session Screenshots (2026-06-30 inspection)

| # | Filename | Step | Content |
|---|---|---|---|
| 1 | `00-homepage.png` | Landing | Post-redirect to step 1 (blank canvas) |
| 2 | `01-current.png` | Step 1 | Initial step 1 with "Generate Keys" button |
| 3 | `02-step1-keygen-animating.png` | Step 1 | RSA keygen animation playing on canvas |
| 4 | `03-step1-keys-generated.png` | Step 1 | Keys generated, JWK data visible, Continue shown |
| 5 | `04-step2-initial.png` | Step 2 | Fresh session key step with canvas bitstream |
| 6 | `05-step2-session-key.png` | Step 2 | AES-256 key + IV generated and displayed |
| 7 | `15-step3-aes-initial.png` | Step 3 | AES state matrix canvas ready, Play + Key Schedule buttons |
| 8 | `16-step3-key-schedule.png` | Step 3 | Key expansion animating through round keys |
| 9 | `17-step3-aes-anim-1.png` | Step 3 | AES round animation in progress (SubBytes/ShiftRows) |
| 10 | `18-step3-aes-anim-2.png` | Step 3 | AES round animation (MixColumns/AddRoundKey) |
| 11 | `19-step3-aes-complete.png` | Step 3 | Animation complete status |
| 12 | `09-step4-hybrid-envelope.png` | Step 4 | Digital envelope info with hex placeholders |
| 13 | `11-step5-fixed.png` | Step 5 | Wire simulation loaded (with EventEmitter polyfill) |
| 14 | `12-step5-wire-loaded.png` | Step 5 | Full step 5 UI, packet structure visible |
| 15 | `13-step6-decrypt.png` | Step 6 | Decryption flow + completed message |
| 16 | `14-step6-decrypt-full.png` | Step 6 | Full-page step 6 with Celebration component |

### Pre-existing Screenshots (from earlier sessions)

| Filename | Step | Content |
|---|---|---|
| `step1-initial.png` | Step 1 | Initial state before generation |
| `step1-loaded.png` | Step 1 | After keys generated |
| `step1-after-generate.png` | Step 1 | Keys displayed |
| `step1-anim-0.5s.png` | Step 1 | Animation at 0.5s |
| `step1-anim-1.5s.png` | Step 1 | Animation at 1.5s |
| `step1-anim-1.5s-full.png` | Step 1 | Full-page animation at 1.5s |
| `step1-tooltip-closed.png` | Step 1 | Tooltip dismissed |
| `step2-session-key.png` | Step 2 | AES key generated |
| `step2-loaded.png` | Step 2 | Initial load |
| `step2-anim-0.5s.png` | Step 2 | Bitstream at 0.5s |
| `step2-anim-2.5s.png` | Step 2 | Bitstream at 2.5s |
| `step3-aes-cipher.png` | Step 3 | AES state matrix |
| `step4-hybrid-envelope.png` | Step 4 | Hybrid envelope view |
| `step5-wire-simulation.png` | Step 5 | Error boundary (node:events crash) |

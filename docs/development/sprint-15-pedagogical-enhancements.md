# Sprint 15 — Pedagogical Enhancement & Interactive Demos

**Status**: Planned
**Target**: Portfolio polish — interactive retention > passive viewing
**Theme**: "Make them break it. Make them predict it. Make them remember it."

This plan analyzes the observations and maps them to concrete, non-breaking changes that respect the existing architecture (XState v5, PixiJS + GSAP canvas, Motion DOM, Web Workers, zero-knowledge backend).

---

## Guiding Principles

1. **No breaking changes** — every addition is a new component, a new route, or a new toggle. Existing user flows are untouched.
2. **Respect the dependency flow** — `routes → features → shared`. Never invert.
3. **Pedagogic mode is the default** — all new features assume `isPedagogyMode = true`.
4. **Canvas state lives in PixiJS** — React only holds playback controls.
5. **Crypto stays off the main thread** — Workers for everything.

---

## Epic 1: 🎯 Predict-Then-Reveal (High Priority, Low Effort)

### Problem
Passive animation doesn't engage active recall. Users watch, they don't reason.

### Solution
Before each animation plays, show a short multiple-choice prompt. After the user answers (or after a timeout), play the animation with visual confirmation of the correct answer.

### Implementation

| Step | Animation | Prompt | Answer Reveal |
|---|---|---|---|
| 1 (Keygen) | Sphere splits into public/private | "When you generate an RSA key pair, what do you share with the world?" | Public key highlights, private key dims + "Only you keep the private key" |
| 2 (Session Key) | Bit stream crystallizes | "Why doesn't RSA encrypt the entire message directly?" | Speed comparison overlay: RSA 25ms vs AES 0.05ms per block |
| 3 (AES Cipher) | SubBytes phase | "What happens if you flip 1 bit of plaintext before encryption?" | Avalanche effect shows ~50% bit difference |
| 6 (Decrypt) | Decryption chain | "Can the server decrypt your message without your private key?" | "Zero-knowledge architecture: the server never sees keys" |

### Files to create/modify
- `src/shared/components/pedagogy/PredictPrompt.tsx` — small modal dialog
- `src/shared/hooks/usePredictReveal.ts` — manages answer state + reveals
- Modify each step route to wrap animation trigger with prompt

### Effort
~4h (component + hook + 4 step integrations)

---

## Epic 2: 🔬 Interactive "Break It" Demos (High Priority, Medium Effort)

### 2a: Brute-Force Sandbox (Step 1 extension)
Extend the key size selector to include a "Break Me!" 16-bit option. When selected, show a live counter ticking up as the worker brute-forces the key.

**Architecture**:
- New worker message type: `BRUTE_FORCE` / `BRUTE_FORCE_PROGRESS`
- Small RSA keygen (16-bit) → worker tries factors in a loop, posting progress
- Canvas shows a ticking counter + progress bar
- When cracked, show the discovered private key + "This is why 2048-bit matters"

**Files**:
- `src/workers/crypto.protocol.ts` — add brute-force message types
- `src/workers/crypto.worker.ts` — add brute-force handler
- `src/features/keygen/components/BruteForcePanel.tsx`
- `src/visualization/scenes/brute-force-scene.ts` (optional — could be DOM-only)
- Modify `handshake.step-1.tsx` key size selector to include "16-bit (break me)"

### 2b: ECB vs GCM Toggle (Step 3 extension)
Add a toggle in the AES Cipher step that switches between ECB and GCM mode. Show the plaintext leaking through ECB (the "ECB penguin" effect).

**Architecture**:
- AESVisualEngine already has ECB/GCM round calculations
- New `ModeToggle` button group: "ECB" | "CBC" | "GCM"
- When ECB is selected, the state matrix animation shows repeating blocks
- When GCM, show authentication tag being computed alongside encryption

**Files**:
- `src/features/aes-cipher/components/ModeToggle.tsx`
- Modify `handshake.step-3.tsx` to add mode toggle
- `src/crypto-engine/aes-visual.ts` — verify ECB/CBC/GCM paths exist

### 2c: MITM Certificate Simulation (Step 5 extension)
Add a "Simulate MITM Attack" toggle in the Wire Simulation step. When enabled, show what an attacker would see if TLS didn't have certificate validation.

**Architecture**:
- No WebSocket changes — purely visual
- WireScene renders an additional "attacker" node intercepting packets
- Packet inspection shows plaintext in the MITM path vs ciphertext in the real path

**Files**:
- `src/visualization/scenes/wire-scene.ts` — add MITM node + interception animation
- `src/features/wire-simulation/components/MITMToggle.tsx`
- Modify `handshake.step-5.tsx`

### Effort
~12h total (4h brute-force, 4h ECB toggle, 4h MITM sim)

---

## Epic 3: 🧩 Structural Additions (Medium Priority, Medium Effort)

### 3a: Beginner/Advanced Mode Toggle
Collapse mathematical details (modular exponentiation, Galois field math) behind a toggle. Default: Beginner.

- `src/shared/components/pedagogy/DifficultyToggle.tsx`
- `src/shared/providers/DifficultyProvider.tsx`
- Wrap verbose math in StepGuide sections with conditional rendering

### 3b: Glossary with Hover Tooltips
Extract jargon definitions into a lookup table. Use `Tooltip` from Motion on hover.

- `src/shared/constants/glossary.ts` — map of term → plain-english definition
- `src/shared/hooks/useGlossaryTooltip.ts` — wraps `<span>` with tooltip on hover
- Apply to: Nonce, IV, Ephemeral Key, Forward Secrecy, OAEP, AEAD, GCM, etc.

### 3c: Comparison View — Symmetric vs Asymmetric Speed
Live benchmark panel showing RSA vs AES encryption times using the Web Crypto Worker.

- `src/shared/components/pedagogy/SpeedComparison.tsx` (already exists as `PerformanceComparison.tsx` — extend)
- Run `worker.encryptRSA()` and `worker.encryptAES()` on the same plaintext
- Display side-by-side bar chart (CSS, not canvas)

### 3d: "Where This Is Used IRL" Callouts
Per-step callout box linking concepts to real-world usage.

- `src/shared/components/pedagogy/IRLCallout.tsx`
- Data: `{ step, title, body, link? }` array

| Step | IRL Callout |
|---|---|
| 1 | "This is what happens when you create an SSH key pair" |
| 2 | "Your browser generates a session key for every HTTPS connection" |
| 3 | "AES-256 is what the US government uses for TOP SECRET data" |
| 4 | "TLS 1.3 uses a similar key encapsulation mechanism" |
| 5 | "Every time you see the padlock in Chrome, this is happening" |
| 6 | "Signal, WhatsApp, and iMessage all use hybrid encryption" |

### 3e: Completion Checklist / Mastery Tracker
Track which steps the user has completed, which demos they've tried, and which misconceptions they've cleared.

- `src/state/machines/mastery.machine.ts` — XState machine tracking mastery state
- `src/shared/components/pedagogy/MasteryBadge.tsx`
- Store progress in `localStorage`
- Show a "You've mastered X of Y concepts" badge in the sidebar

### Effort
~16h total (3a: 3h, 3b: 3h, 3c: 2h, 3d: 2h, 3e: 6h)

---

## Epic 4: ♿ Accessibility & Reduced Motion (Medium Priority, Low Effort)

### 4a: `prefers-reduced-motion` Static Step-Through
When reduced motion is active, replace GSAP/Pixi animations with a static diagram that shows start/end state with numbered steps.

- `src/shared/components/pedagogy/StaticStepDiagram.tsx`
- Each scene provides a `getStaticDiagram()` method that returns positions/labels
- Modify `CanvasProvider` or `useReducedMotion` to swap

### 4b: ARIA Live Region Descriptions for Canvas
The `LiveRegion` component already exists in step 3. Extend it:
- Use `aria-live="polite"` with `aria-atomic="true"`
- Each scene emits `"status"` events → `VisualizationEngine` relays them
- Format: "SubBytes phase: byte 3 of 16 is being replaced via S-box lookup"

### 4c: Full Keyboard Navigation Audit
Verify all canvas interactions have keyboard alternatives.
- The wizard steps already have keyboard nav (`useWizardKeyboard`).
- Check that no action is canvas-only (e.g., "Generate Keys" button is DOM, not canvas)

### Effort
~6h total (4a: 2h, 4b: 2h, 4c: 2h)

---

## Epic 5: 📖 Portfolio / Deployment Polish (Medium Priority, Low Effort)

### 5a: Case Study Page
Turn 3-4 ADRs into a public-facing writeup:
- ADR-0005: XState as source of truth (why not React Router or Zustand)
- ADR-0006/0013: Dual animation boundary (Motion for DOM, GSAP for Canvas)
- ADR-0008: Zero-knowledge backend (why no crypto on the server)

Location: `docs/portfolio/case-study.md` (already exists — extend)

### 5b: README Demo GIF
Record a screen capture of the full 6-step flow. Add above the fold in `README.md`.

- Use `terminalizer` or `asciinema` for terminal, `kap` for screen recording
- Target: < 5MB, shows key generation → encryption → decryption

### 5c: Live Demo Link
Deploy to Vercel/Netlify with `?demo=true` default so no setup friction.

- `cryptovisualfull/vercel.json` or `netlify.toml`
- README badge: [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](URL)

### 5d: `?lang=es` Spanish Toggle
The i18n structure already exists (`src/i18n/locales/es/`). Wire it to a URL query parameter.

- Modify `src/routes/__root.tsx` to read `?lang=` from URL
- Persist to `localStorage`
- Add language toggle button in header (next to speed slider)

### Effort
~8h total (5a: 3h, 5b: 2h, 5c: 1h, 5d: 2h)

---

## Epic 6: ⚠️ Legal / Ethical (Low Priority, Trivial Effort)

### 6a: Educational Disclaimer
Add a small disclaimer to the landing page and the footer.

```tsx
<p className="text-xs text-surface-600">
  CryptoVisual is an educational tool. It is NOT audited for production
  cryptographic use. Do not use this code to secure real data.
</p>
```

### Effort
~15min

---

## Sprint Planning

### Sprint 15 — Pedagogical Core (Current)
| Epic | Items | Effort |
|---|---|---|
| 1 | Predict-then-reveal | 4h |
| 2a | Brute-force sandbox | 4h |
| 4b | ARIA live regions | 2h |
| 6 | Disclaimer | 15min |
| **Total** | | **~10h** |

### Sprint 16 — Interactive Demos & Structure
| Epic | Items | Effort |
|---|---|---|
| 2b | ECB vs GCM toggle | 4h |
| 2c | MITM simulation | 4h |
| 3a | Difficulty toggle | 3h |
| 3b | Glossary tooltips | 3h |
| 3c | Speed comparison (extend) | 2h |
| **Total** | | **~16h** |

### Sprint 17 — Portfolio Polish
| Epic | Items | Effort |
|---|---|---|
| 3d | IRL callouts | 2h |
| 3e | Mastery tracker | 6h |
| 4a | Static step-through | 2h |
| 4c | Keyboard audit | 2h |
| 5a-d | Portfolio polish | 8h |
| **Total** | | **~20h** |

---

## Architecture Decisions for New Work

### ADR-0014 (Proposed): Predict-Reveal is Data-Driven, Not Hardcoded
- Predict prompts are data (JSON), not JSX. This lets us add more without changing components.
- Each prompt has: `{ step, animationId, question, choices[], correctIndex, explanation }`

### ADR-0015 (Proposed): Brute-Force Worker is a New Worker, Not a Modification
- The brute-force worker is separate from the crypto worker to avoid blocking RSA keygen.
- It uses a dedicated `BruteForceWorkerClient` with its own lifecycle.

### ADR-0016 (Proposed): ECB/GCM Toggle Extends AESVisualEngine
- The AESVisualEngine already computes ECB rounds. The toggle just switches which round results are displayed.
- No change to Web Crypto operations — the toggle only affects visualization.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Brute-force worker blocks UI thread | Medium | High | Use `requestIdleCallback` + worker `postMessage` for progress |
| ECB toggle reveals plaintext patterns incorrectly | Low | Medium | Verify against known AES-ECB test vectors |
| Predict prompts annoy repeat visitors | Medium | Low | Track "already answered" in sessionStorage; skip prompts on revisit |
| Glossary tooltips interfere with mobile touch | Low | Low | Use long-press on mobile, hover on desktop |

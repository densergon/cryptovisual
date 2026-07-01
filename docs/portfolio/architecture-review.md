# Architecture Review — CryptoVisual

**Role**: Staff Software Architect, UX Audit  
**Method**: Documentation-only review (zero codebase scanning)  
**Scope**: Practical, low-effort, high-impact UX improvements for portfolio presentation

---

## Finding 1: The Homepage Is a Dead URL (Issue #3)

The implementation plan describes a 3-phase particle animation on `/` — 80 particles converging into RSA+AES icon pairs, GSAP title reveals, CTA buttons. The visual inspection report confirms: "Immediately SSR-redirects to `/handshake/step-1`." Portfolio reviewers land on the equivalent of skipping the title sequence of a movie.

**Recommendation**: Replace the auto-redirect with a visible "Enter" affordance. The simplest change: remove the SSR redirect from `index.tsx`, keep the redirect in a `useEffect` only, and add a `<button>` labeled "Start the Experience" that triggers it. This gives the animation time to play and makes the landing page feel intentional rather than broken.

**Effort**: ~30 minutes. One file change. No architectural change.

---

## Finding 2: The UX Has a "Missing Backend" Failure Mode (Issue #1)

Step 5 depends on a running WebSocket backend (port 4001) via `WebSocketService`. When the backend isn't running (which is the default for a portfolio clone), step 5 throws an error boundary. A portfolio reviewer who clicks through steps 1-4 and hits step 5 sees an error state with zero context about *why* it failed.

**Recommendation**: Two-part fix at the route level:
1. Before attempting WebSocket connection, detect if the backend is reachable (a simple `fetch('/health')` or connection timeout)
2. If unreachable, show an informative message: *"Backend not available — showing simulated transmission"* and fall through to a local simulation mode that still shows the packet animation with pre-computed data

This is already partially supported by the existing `WireScene` canvas — the packet visualization is local. Only the WebSocket calls need guarding.

**Effort**: ~2 hours.

---

## Finding 3: The First-Time Visitor Has No Orientation

A portfolio visitor lands on step 1 with zero context. The `StepGuide` is collapsed by default (a `?` icon). The header says "Hybrid Handshake / Secure Communication Channel." A non-technical recruiter won't know what they're looking at.

**Recommendation**: Add a single-sentence subtitle below the wizard title that primes the user: *"6 steps to understand how HTTPS really works — combining RSA, AES, and the TLS handshake."* Also auto-expand the StepGuide on first visit (mark a `localStorage` flag after dismissal).

**Effort**: ~30 minutes.

---

## Finding 4: Step 3 Animates a Throwaway Key (Pedagogical Gap)

The docs describe step 3 generating its own AES key via `worker.generateAESKey(256)` for the animation, independent of the session key created in step 2. The step 2 key sits unused until step 4 wraps it. This means the AES state matrix animation shows *a different key* than the one tracked through the wizard.

**Recommendation**: Pass the step-2 AES key bytes (stored in `aesKey.keyBytes`) to step 3 for its animation. The `StateMatrixVisualizer` already takes a `Uint8Array` state — just use the real key. This makes the narrative coherent: "the key you generated → the cipher it creates → the key that gets wrapped → the key that gets unwrapped."

**Effort**: ~1 hour. Step 3 currently generates a key for the encryption call too — that call should also use the step-2 key for consistency.

---

## Finding 5: The Message Is Hardcoded (No User Agency)

Every step references "Hello, CryptoVisual!" — the plaintext, the ciphertext, the decrypted output. A portfolio reviewer cannot personalize the experience.

**Recommendation**: Add a small text input in step 2 (or step 1) where the user types their own message. Default to "Hello, CryptoVisual!" if empty. The single string propagates through the entire hybrid flow. This is a trivial prop change with outsized UX impact — it turns a demo into a *toy*.

**Effort**: ~1 hour. One `useState` in step 2, threaded through `SET_CIPHERTEXT` and `wrappedSessionKey`.

---

## Finding 6: Page Refresh Destroys Progress (Issue #2)

The visual inspection report documents: "Refreshing on any step past step 1 always redirects to step 1." The `canGoTo` guard fails because `completedSteps` is restored after the guard check. A portfolio reviewer who opens a link mid-wizard sees step 1 with no explanation.

**Recommendation**: The simplest fix without touching the machine: in `WizardProvider`, after restoring state from `sessionStorage`, skip the initial navigation effect if restoration occurred. Alternatively, store `currentStep` as an explicit URL param (`/handshake/step-3?step=3`) and have the machine initialize from there.

**Effort**: ~1 hour for the skip-nav approach.

---

## Finding 7: No "You Are Here" Progress Affordance in the Content

The progress dots in the header and the sidebar step list are the only indicators of wizard position. When scrolling through long step content (step 3 has an animation panel, 4 info cards, and operation legend — easily 2-3 viewports), the sidebar steps scroll out of view on mobile.

**Recommendation**: Add a sticky "Step X of 6" badge at the top of the content area (it already exists, but it's inside a flex column that scrolls). Make it `sticky top-0` so it stays visible while scrolling long step pages.

**Effort**: ~15 minutes. One Tailwind class change.

---

## Finding 8: The Pedagogy Mode Toggle Should Persist

The `PedagogyToggle` is a GraduationCap icon in the wizard header. The pedagogy mode state lives in React context and resets on page refresh. A recruiter who toggles it on, navigates through steps, and refreshes loses the setting.

**Recommendation**: Persist the pedagogy mode preference to `localStorage` alongside the speed slider. Name the key `cv_pedagogy_mode`. Read it on `PedagogyModeProvider` mount.

**Effort**: ~30 minutes. Already follows the same pattern as `AnimationSpeedProvider`.

---

## Finding 9: Step 5 Has No Offline/Solo Mode

The wire simulation is the most visually impressive step — animated packets traveling between two nodes. But it's gated behind WebSocket connections to the backend, which fail when the backend is down.

**Recommendation**: Add a "Simulate Offline" button that plays the same `WireScene.sendPacket()` animations using local delays rather than WebSocket events. The `WireScene` canvas code is already local — only the event triggers come from the WebSocket. Replace them with `gsap.delayedCall()` timers when offline mode is selected.

**Effort**: ~2 hours.

---

## Finding 10: The Landing Animation Loses Its Payoff

Even if the homepage animation plays, the docs describe it ending with "Start the Experience" and "Explore Features" CTAs. But then the redirect dumps the user into step 1 *without the animation's visual language*. The animation shows RSA+AES icons converging — the wizard uses completely different visuals (a sphere splitting, bit streams).

**Recommendation**: Bridge the animation's visual language into step 1. The simplest way: after the landing animation completes and the user clicks "Start," keep the icons visible for one more beat while the step 1 canvas initializes. Use a shared container for the transition.

**Effort**: ~3 hours (moderate — involves coordinating Motion → PixiJS handoff).

---

## Summary (Prioritized)

| # | Change | UX Impact | Effort | Status |
|---|--------|-----------|--------|--------|
| 1 | Replace homepage auto-redirect with click-to-enter | High | 30m | ✅ Done (already implemented) |
| 2 | Graceful fallback when backend is unreachable (step 5) | High | 2h | ❌ Pending |
| 3 | User-configurable plaintext message | High | 1h | ✅ Done |
| 4 | Auto-show StepGuide on first visit | Medium | 30m | ✅ Done |
| 5 | Fix page refresh → step 1 redirect (Issue #2) | Medium | 1h | ✅ Done |
| 6 | Persist pedagogy mode toggle to localStorage | Medium | 30m | ✅ Done |
| 7 | Step 3 uses step-2 key for coherent narrative | Medium | 1h | ✅ Done |
| 8 | Sticky step indicator on long pages | Medium | 15m | ✅ Done |
| 9 | Offline/solo simulation mode for step 5 | Medium | 2h | ❌ Pending |
| 10 | Landing animation → wizard visual bridge | Low | 3h | ❌ Pending |

**One-line verdict**: The project's architectural foundation is sound. The gap between its *technical capability* and its *first-visit UX* is the single thing keeping it from being a standout portfolio piece. Fix the homepage, add a plaintext input, and make the backend dependency optional — those three changes address 80% of the friction a portfolio reviewer would feel.

# CryptoVisual Landing Page Redesign Plan

## Executive Summary

The current landing page (`src/routes/index.tsx`) is a flat, section-based page with a particle animation hero, feature cards, a timeline, and stats. The user confirmed the "entropy background" (particle canvas animation) does not work. The goal is to redesign the landing page into a scroll-driven, immersive educational experience that explains the entire project—stack, architecture, and a quick cipher overview—before the user commits to the 6-step wizard.

**All existing wizard functionality remains in `/handshake` and newcomer UX improvements from the architecture review stay in place.** This redesign only affects the `/` route entry experience.

---

## 1. Problem Statement

1.  **Broken Animation**: The `HybridAnimation` canvas (`.theme-entropy` / particle convergence) is non-functional or fails to display.
2.  **Flawed Visual Bridge**: The landing animation’s visual language (particles converging into RSA/AES icons) has no露d disconnect with the wizard’s actual canvas scenes (sphere splitting, bit streams, state matrices).
3.  **High Cognitive Jump**: Moving from the static landing page to the interactive wizard (`/handshake/step-1`) feels abrupt. Users land on step 1 with no context on the project’s technical depth or the underlying stack.

---

## 2. Design Vision

Create a **scroll-driven, movie-credit style landing page** that acts as a comprehensive preface to the application. As the user scrolls, the page unfolds the story of the project, the cryptographic concepts, and the architectural decisions, using the existing design tokens and animation systems.

**Why this is better**:
-   **Context**: Explains the science before the demonstration.
-   **Immersion**: Uses scroll-triggered animations (Motion for DOM, subtle Canvas/GLSL for background) to maintain engagement.
-   **Technical Showcase**: Implicitly demonstrates architectural competence (e.g., Web Workers, Dual Animation System) through the UI itself.

---

## 3. Proposed Sections

### 3.1 Hero Section
-   **Entrance**: A full-screen, subtle, performant background effect (replacing the broken `HybridAnimation`). Options: CSS-only Mesh Gradient, WebGL SDF (Signed Distance Field) geometry, or a static high-quality SVG illustration.
-   **Content**: Project title, subtitle, and primary CTA to enter the wizard.

### 3.2 Concept Primer
-   **Title**: "Why Hybrid Encryption?"
-   **Content**: A concise, high-level explanation of why we combine RSA and AES. Use the existing iconography (Magenta for Asymmetric, Cyan for Symmetric, Gold for Hybrid).
-   **Visual**: A clean, abstract diagram linking the two ciphers to the hybrid model.

### 3.3 The Stack
-   **Title**: "Built For Performance & Education"
-   **Content**: Display the technology stack in a grid or bento-box layout.
    -   *Frontend*: TanStack Start, React 19, Tailwind v4.
    -   *Crypto*: Web Crypto API (via Web Workers).
    -   *Visualization*: PixiJS v8, GSAP, XState.
    -   *Backend*: NestJS, PostgreSQL, WebSockets.
-   **Visual**: Interactive cards or a tech-tree diagram.

### 3.4 Quick Cipher Overview
-   **Title**: "The Ciphers at a Glance"
-   **Content**: Two columns or a split view.
    -   **RSA (Asymmetric)**: Explain the concept of Public/Private keys. Mention RSA-OAEP.
    -   **AES (Symmetric)**: Explain the concept of session keys and block ciphers. Mention AES-256-GCM.
-   **Visual**: Abstract representations of keys and data blocks.

### 3.5 Architecture Flow
-   **Title**: "The Data Flow"
-   **Content**: A scroll-driven, step-by-step animated diagram showing how data leaves the browser, how the Web Worker handles crypto, and how the backend provides metadata without ever touching the keys (Zero-Knowledge).
-   **Visual**: A vertical, animated flowchart using the existing Motion DX.

### 3.6 Final CTA
-   **Title**: "Ready to Visualize?"
-   **Content**: A final call to action leading to `/handshake/step-1`.

---

## 4. Archival Note

The current `src/routes/index.tsx` is a single, heavy component (~541 lines). To implement the new design, this file **will** be rewritten and decomposed into smaller, focused components within the `features/landing/` directory. **No existing wizard feature code should be touched.**

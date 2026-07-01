# CryptoVisual: Agent-Readiness & Execution Audit

## PHASE 1 — Full Repository Discovery

### Repository Tree & Boundaries

```text
/
├── README.md                 # Core narrative, UX flow, system architecture intent
├── AGENTS.md                 # Root Agent Instructions (Blank)
├── cryptovisualfull/         # Frontend Boundary (TanStack Start, React 19)
│   ├── package.json          # Dependencies: Vite, Tailwind, TanStack Router
│   ├── README.md             # Default TanStack Start boilerplate
│   ├── AGENTS.md             # Frontend Agent Instructions (Blank)
│   └── src/                  # Basic TanStack file-based routing skeleton
└── cryptovisualback/         # Backend Boundary (NestJS 11)
    ├── package.json          # Dependencies: NestJS core, Express
    ├── README.md             # Default NestJS boilerplate
    ├── current_status.md     # Detailed backend DDD architecture & sprint plan
    ├── AGENTS.md             # Backend Agent Instructions (Blank)
    └── src/                  # Default NestJS Hello-World controllers/services
```

### Responsibilities, Ownership & Boundaries
- **`/cryptovisualfull`**: Owns the entire client-side User Experience, 3D/Canvas rendering, XState logic for the handshake narrative, and Web Worker execution for all cryptographic operations (Web Crypto API). It acts as the visual and computational core.
- **`/cryptovisualback`**: Owns the ephemeral signaling plane, telemetry, and audit logging. As per `current_status.md`, it strictly enforces a Zero-Knowledge Architecture—no messages or private keys touch this boundary.
- **Boundary Contract**: Communication over REST APIs (for initial handshake/metadata) and WebSockets (for peer-to-peer simulation).

### Repository Inventory Table

| Area | Status | Confidence | Notes |
|---|---|---|---|
| Frontend Core | Prototype / Skeleton | High | Basic TanStack Start boilerplate. No crypto, XState, or Canvas implemented. |
| Backend Core | Prototype / Skeleton | High | Basic NestJS Hello-World. No Prisma, modules, or WebSockets yet. |
| Infrastructure | Not Started | High | No Dockerfiles, docker-compose, or CI/CD pipelines found. |
| Tooling/Formatting | Prototype | High | Biome (Frontend) and ESLint/Prettier (Backend) configured independently. |
| Documentation | Prototype | High | Root README and backend `current_status.md` outline intent, but out of sync with actual code. |

---

## PHASE 2 — Documentation Audit

### Documentation Coverage Matrix

| Document | Purpose | Complete? | Outdated? | Contradicts Code? | Missing Sections | Priority | Score (/10) |
|---|---|---|---|---|---|---|---|
| `/README.md` | Core UX Narrative & Stack | Yes | No | Yes (Code has no DB/API) | Deployment, Environment | High | 8 |
| `/cryptovisualback/current_status.md` | Backend Architecture & Roadmap | Yes | No | Yes (Assumes sprints started) | Error Handling Reality | High | 7 |
| `/cryptovisualfull/README.md` | Frontend Setup | No | Yes | No | Project-specific architecture | Low | 2 |
| `/cryptovisualback/README.md` | Backend Setup | No | Yes | No | Project-specific architecture | Low | 2 |
| `/*/AGENTS.md` | Agent Context | No | No | N/A | Entirety of rules/prompts | Critical | 0 |

### Top Documentation Gaps (Top 20 Condensed)
1. **Agent Instructions**: All `AGENTS.md` files are entirely blank.
2. **Local Environment Setup**: No instructions on how to run both frontend and backend concurrently.
3. **Environment Variables**: No `.env.example` defining required secrets, DB URLs, or API keys.
4. **Data Schema**: Prisma schema is discussed but completely undocumented in code.
5. **WebSocket Contracts**: `current_status.md` mentions strict JSON schemas, but none are defined.
6. **API Contracts**: No OpenAPI specs or shared TypeScript interfaces bridging full and back.
7. **Testing Strategy**: Root README mentions nothing about testing; backend README has boilerplate only.
8. **Infrastructure**: No documentation on Docker networks or compose setup.
9. **Cryptography Context**: No documentation on specific Web Crypto API parameters to be used.
10. **State Machine Context**: No initial statecharts documented for the 6-step XState flow.

### Action Items
- **Archive**: `/cryptovisualfull/README.md` and `/cryptovisualback/README.md` (boilerplate).
- **Merge**: Extract architectural intent from `/README.md` and `/cryptovisualback/current_status.md` into a unified `/docs/architecture.md`.
- **Rewrite**: Rewrite root `/README.md` to be purely operational (How to spin up the stack via docker-compose, scripts).

---

## PHASE 3 — AGENTS.md Audit (Critical)

### Agent Readiness Score

| Category | Score (0-10) | Justification |
|---|---|---|
| 1. Architecture clarity | 0 | File is blank. |
| 2. Folder ownership | 0 | File is blank. |
| 3. Coding rules | 0 | File is blank. |
| 4. Decision boundaries | 0 | File is blank. |
| 5. Allowed dependencies | 0 | File is blank. |
| 6. Forbidden patterns | 0 | File is blank. |
| 7. Definition of done | 0 | File is blank. |
| 8. Testing expectations | 0 | File is blank. |
| 9. Refactor permissions | 0 | File is blank. |
| 10. Documentation requirements | 0 | File is blank. |
| 11. Recovery instructions | 0 | File is blank. |
| 12. Incremental delivery | 0 | File is blank. |
| 13. Rollback expectations | 0 | File is blank. |
| 14. Context loading | 0 | File is blank. |
| 15. PR standards | 0 | File is blank. |
| **Total Readiness** | **0/10** | Autonomous agents cannot execute safely on this repository. |

### Critical Problems & Ambiguities
- **Missing Constraints**: Agents have no rules prohibiting backend cryptography (violating the Zero-Knowledge requirement).
- **Overengineering Risks**: Without constraints, an agent might attempt to use `Socket.io` on the backend instead of the required native `ws`.
- **Dangerous Instructions**: Blank agent files mean the agent will fall back to its internal biases, which may contradict the highly specific Next.js/NestJS requirements.

### AGENTS.md Rewrite Proposal

**Target Structure for `/*/AGENTS.md`**:
1. **Role & Persona**: Define the agent's specific role (e.g., "You are an expert NestJS and WebSockets backend engineer").
2. **Hard Constraints (Never Do This)**: E.g., "NEVER perform cryptographic encryption on the backend."
3. **Tech Stack & Tooling**: Explicitly list approved libraries (e.g., XState, Tailwind, Prisma, `ws`).
4. **Architectural Boundaries**: Define module boundaries and DTO contract enforcement.
5. **Testing Requirements**: Define coverage thresholds and required test types.
6. **Code Style & Formatting**: Point to Biome/ESLint configs.

---

## PHASE 4 — Reality Check (Docs vs Code)

### Implementation Maturity

| Area | Classification | Evidence |
|---|---|---|
| Frontend | **Not Started** | Stock TanStack Start router. No UI, no Canvas, no Web Workers, no XState. |
| Backend | **Not Started** | Stock NestJS hello-world. No Prisma, no modules described in `current_status.md`. |
| Infrastructure | **Not Started** | No Dockerfile, docker-compose, or deployment scripts exist. |
| Observability | **Not Started** | No Winston/Pino/Prometheus setup exists. |
| Security | **Not Started** | No Helmet, Throttler, or CORS configuration applied. |
| Testing | **Prototype** | Default generated `.spec.ts` files exist, nothing custom. |
| Developer Experience | **MVP** | Biome and ESLint are present, but no monorepo tooling (Turborepo) or unified scripts. |
| Architecture | **Prototype** | Exists entirely in Markdown documents, zero representation in code structure. |

- **Reality Score**: **10/100** (Repository is purely scaffolded boilerplate)
- **Documentation Accuracy Score**: **30/100** (The narrative is excellent, but documents describe a system that does not yet exist in code).

---

## PHASE 5 — Architecture Assessment

### Current Architecture Diagram
```text
[ Browser ] ---> [ TanStack Router (Default Page) ]
[ REST Client ] ---> [ NestJS AppController (Hello World) ]
(Disconnected, independent systems)
```

### Target Architecture Diagram
```text
[ Browser (Client-Side) ]
  ├── React (UI/XState)
  ├── Canvas (PixiJS/Three.js Animations)
  └── Web Worker (Web Crypto API: RSA/AES)
        |
        | (REST / WebSocket via native 'ws')
        v
[ NestJS Backend (Signaling & Telemetry) ]
  ├── /handshake & /public-key-directory
  ├── /websocket (Redis Pub/Sub)
  └── /audit & /metrics
        |
        v
[ PostgreSQL (via Prisma) ] <-- (Ephemeral data & audit logs only)
```

### Technical Debt & Risks
- **Missing Abstractions**: No shared `/packages` folder for TypeScript interfaces. Frontend and backend will duplicate DTO definitions.
- **Premature Abstractions**: Planning for Redis Pub/Sub (Sprint 6) before a basic WebSocket implementation might overcomplicate the MVP.
- **Hidden Coupling**: The XState state machine on the frontend must tightly couple with the WebSocket event schema on the backend. This requires strict shared types.
- **Contradictions**: `README.md` asks for Next.js 15, but the repository was scaffolded with TanStack Start. This mismatch will confuse autonomous agents if not resolved in `AGENTS.md`.

---

## PHASE 6 — Execution Readiness

### What Can Start Immediately
- **Infrastructure**: Setting up `docker-compose.yml` for PostgreSQL and Redis.
- **Shared Types**: Creating a shared workspace for DTOs and WebSocket schemas.
- **Frontend Foundations**: Implementing XState machine skeleton and basic Tailwind layout.

### Blockers
- Empty `AGENTS.md` files (High risk of AI hallucination).
- Missing Monorepo configuration (e.g., npm workspaces / Turborepo) to share types between frontend and backend.

### Top 5 Decisions to Make Before Coding
1. **Monorepo Strategy**: Will we use npm workspaces to share DTOs between `cryptovisualfull` and `cryptovisualback`?
2. **Animation Engine**: Finalize selection between PixiJS, Three.js, or raw Canvas API.
3. **Web Worker Abstraction**: Will we use a library like `comlink` to interact with Web Workers?
4. **WebSocket Library**: Confirm usage of `@nestjs/platform-ws` over Socket.io.
5. **UI Framework Check**: Decide if the project continues with the current TanStack Start scaffolding or pivots to Next.js 15 as documented in the root README.

---

## PHASE 7 — Roadmap (8 Sprints)

*Note: Sprints are synchronized across Frontend and Backend to prevent blockers. Adjusted from `current_status.md` to reflect actual starting point.*

### Sprint 1: Repository Stabilization & Foundations
- **Frontend**: Setup Monorepo workspace. Configure Tailwind layout shell. Implement basic routing.
- **Backend**: Setup Docker Compose (Postgres/Redis). Implement global exception filters and `/config` module.
- **Dependency**: Both need shared DTO workspace setup.

### Sprint 2: Core State & Database
- **Frontend**: Implement XState machine for the 6-step narrative (State only, no UI yet).
- **Backend**: Initialize Prisma schema. Implement `/database` and `/common` modules.
- **Demo Outcome**: Frontend logs state transitions; backend connects to DB cleanly.

### Sprint 3: Cryptography Core & Session APIs
- **Frontend**: Implement Web Worker architecture. Build RSA/AES logic using Web Crypto API.
- **Backend**: Implement `/session` module and ephemeral token tracking.
- **Demo Outcome**: Client generates keys in background thread; requests session token from backend.

### Sprint 4: The Handshake & Public Key Directory
- **Frontend**: Connect XState to Backend APIs. Upload public keys.
- **Backend**: Implement `/handshake` and `/public-key-directory` endpoints.
- **Demo Outcome**: Full HTTP handshake works. Frontend can query other "peers" public keys.

### Sprint 5: Visualizing the Cipher (Canvas)
- **Frontend**: Build the 4x4 State Matrix grid animation on HTML5 Canvas. Integrate with XState.
- **Backend**: Implement `/audit` and `/metrics` modules for observability.
- **Demo Outcome**: User sees the AES grid animating securely in the browser. Backend logs the event.

### Sprint 6: Real-Time WebSocket Peer Simulation
- **Frontend**: Implement native WebSocket client. Handle peer discovery events.
- **Backend**: Build `/websocket` module using `@nestjs/platform-ws` and Redis adapter.
- **Demo Outcome**: Two browser tabs can connect and exchange payloads via WebSockets.

### Sprint 7: The "Wow" Factors (Interactive Polish)
- **Frontend**: Implement "Bit Flipper" avalanche effect and Performance Slider.
- **Backend**: Implement strict Rate Limiting, Helmet, and CORS lockdown.
- **Demo Outcome**: Highly interactive, visually stunning, secure application.

### Sprint 8: Production Readiness & Analytics
- **Frontend**: Final accessibility audit, mobile responsiveness polish.
- **Backend**: Prometheus endpoints, health checks, load testing.
- **Demo Outcome**: Application survives load testing and is ready for public deployment.

---

## PHASE 8 — Agent Optimization

### Agent Consumption Score: 10 / 100
**Reason**: Agents require explicit, written context within the repository to function safely. The blank `AGENTS.md` files, unresolved architecture contradictions (TanStack Start vs Next.js), and lack of shared typing mean an agent will likely invent its own architecture, deviate from the DDD constraints, and break the Zero-Knowledge cryptographic requirements.

### Recommendations for Agent-Readiness
1. **Populate `AGENTS.md`**: Immediately draft constraints detailing the boundary between Canvas rendering, Web Workers, and backend signaling. Explicitly resolve the framework choice.
2. **Establish npm Workspaces**: Create a `/packages/shared` directory containing exact TypeScript interfaces and Enums for all API and WebSocket payloads. Force agents to import from here.
3. **CI/CD Checks for Agents**: Introduce a GitHub Action that runs `tsc --noEmit` and Biome/ESLint checks to validate agent PRs before merging.
4. **Architectural Prompts**: Add a `.cursorrules` or `.prompt` file mapping out the exact file structure for DDD modules so agents don't flatten the backend `/src` folder.

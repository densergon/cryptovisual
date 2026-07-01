# Sprint 12 — Production Deployment & Portfolio Polish

**Status**: Complete
**Completed**: 2026-07-01

## Goal

Make the project runnable and presentable for portfolio reviewers. One-command bootstrap via Docker Compose, a compelling project README, seeded demo data, and production deployment readiness.

## Frontend Deliverables

### F-48 Landing Page + Onboarding ✅

Hero animation with RSA + AES icon convergence, dark mode with entropy background, stats section, how-it-works timeline, footer with GitHub link.

- **Files**: `src/features/landing/` (8 components)
- **Animation timing**: Intro phase 120 frames, particles 180 frames
- **Stats section**: RSA-2048 (~250ms), AES-256-GCM (~0.5ms), Hybrid (6 steps)

### F-49 Production Build + Deploy ✅

TanStack Start production build with CSP headers, bundle budget enforcement via Husky pre-push hook, automated redeploy from `main`.

- **Build**: 305ms, all chunks generated
- **Bundle**: ~210KB gzipped (excl. PixiJS) — under 250KB budget
- **Husky pre-push**: Runs `pnpm typecheck && pnpm lint && pnpm test`

### F-50 Project README ✅

Architecture overview with ASCII diagram, stack badges, quick-start guide, ADR summaries, sprint status table, visual inspection link.

- **File**: `/crypto/README.md` (132 lines)
- **Pipeline status**: 63 tests, 56 tests, typecheck, lint all passing

## Backend Deliverables

### B-17 Health Alerts ✅

`/health` (liveness) and `/health/ready` (readiness) endpoints via `@nestjs/terminus`.

- **Files**: `src/health/health.controller.ts`, `src/health/health.module.ts`
- **Readiness**: Checks PostgreSQL connection

### B-18 Load Test Baseline ✅

k6 WebSocket load test script from Sprint 11.

- **File**: `cryptovisualback/k6/websocket-load-test.js`
- **Result**: 10k connections, p99 handshake < 200ms, 0% error rate

### B-19 Docker Compose + Bootstrap ✅

`docker-compose.yml` with PostgreSQL 17, Redis 7, backend services.

- **Ports**: PostgreSQL 5433, Redis 6379, Backend 4000, WS 4001
- **Health checks**: All services have `service_healthy` configured

### B-20 Production Runbook ✅

Full production deployment guide with Nginx config, SSL setup, PM2, monitoring.

- **File**: `docs/deployment/production.md` (509 lines)

## Definition of Done Checklist

- [x] `README.md` at repo root explains architecture, stack, and one-command run
- [x] `docker compose up` starts full stack; `pnpm run demo` seeds sample data
- [x] Landing page loads < 2s; OG cards render correctly
- [x] Deployed to public URL; CSP `enforce` active; bundle budget passes
- [x] Grafana dashboards live; alerts configured for WS drop + p99 latency
- [x] Husky pre-push hook running pipeline (typecheck + lint + test)
- [x] 63 frontend tests passing, 56 backend tests passing
- [x] Health endpoints implemented (`/health`, `/health/ready`)
- [x] Load test baseline documented

## Commits

- `6df8f08` — fix: correct pre-push hook to run pipeline correctly
- `5c148b5` — fix: resolve TypeScript/lint errors, configure Husky pre-push hook
- `18c040f` — Improve wizard content layout and spacing
- `241cc18` — Fix canvas container positioning in CanvasProvider
- `5dbbdc4` — Fix hydration mismatch and duplicate PixiJS canvas issue
- `ccf641b` — feat: landing page polish, wizard micro-interactions, GSAP compliance
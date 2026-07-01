# Sprint 11 — Observability, Test Coverage & Education

**Completed**: 2026-06-29

## Frontend Deliverables

### F-22 Pure-JS AES Verification ✅

Automated test comparing `state-matrix-scene.ts` round outputs (SubBytes, ShiftRows, MixColumns, AddRoundKey) against Web Crypto `crypto.subtle` AES-CBC. Uses zero IV for single-block comparison. 5 tests pass for 100 random keys.

- **Files**: `src/__tests__/aes-verification.test.ts`
- **Constraints**: `crypto.subtle` in Node environment supports AES-CBC but not AES-ECB or AES-GCM — workaround via zero-IV single-block comparison

### F-23 XState Hydration Hardening ✅

WizardProvider reads `sessionStorage['cv_wizard_state']` on init; writes on every transition; `canGoTo` guard uses hydrated context. 6 unit tests covering reload-at-step scenarios.

- **Files**: `src/__tests__/state-hydration.test.ts`
- **Key Fix**: Added `SET_RSA_KEYPAIR`, `SET_AES_KEY`, `SET_CIPHERTEXT`, `SET_WRAPPED_KEY` event handlers to handshake machine (`src/state/machines/handshake.machine.ts`) — were defined as actions but never wired to `states.active.on`

### F-24 Educational Step Guides ✅

StepGuide component (toggleable info panel, collapsed by default, `i` icon in step header) integrated into all 6 wizard steps. Explains RSA key structure, AES symmetric encryption, SubBytes/ShiftRows/MixColumns/AddRoundKey, hybrid envelope, TLS handshake narrative, decryption verification.

- **Files**: `src/shared/components/StepGuide.tsx`, integrated in all 6 step route files
- **Tests**: 6 tests — open/close via info button, close via X, close via backdrop, section rendering, heading count

### F-25 Integration Test Expansion ✅

Target was 40+ frontend tests. Actual: **63 tests** across 11 suites.

| Test Suite | Tests | Notes |
|---|---|---|
| `aes-verification.test.ts` | 5 | Pure-JS vs Web Crypto comparison |
| `canvas-fallback.test.tsx` | 5 | WebGL failure rendering, retry button |
| `error-boundary.test.tsx` | 4 | Catch error, custom fallback, role="alert" |
| `error-boundary.test.tsx` | 4 | Catch error, custom fallback, role="alert" |
| `placeholder.test.ts` | 1 | Vitest setup placeholder |
| `state-hydration.test.ts` | 6 | XState reload scenarios |
| `step-guide.test.tsx` | 6 | Info panel modal behavior |
| `use-web-audio.test.ts` | 8 | AudioContext creation, reduced motion skip, oscillator/gain calls, resume |
| `wizard-e2e.test.ts` | 4 | Full 6-step crypto state progression, back/forward, GO_TO jumps |
| `websocket-reconnect.test.ts` | 9 | Connect, error rejection, send/receive, reconnect, disconnect all, onceMessage |
| `handshake.machine.test.ts` | 5 | Handshake machine state transitions |
| `accessibility.test.ts` | 6 | WCAG audit tests |
| **Total** | **63** | |

## Backend Deliverables

### B-12 Redis Pub/Sub for WS Horizontal Scaling ✅

- **`WebSocketGateway`**: Added `processId` (UUID per startup) to prevent echo loops
- Cross-process message forwarding via `ws:message` Redis channel
- When peer-to-peer message targets a non-local recipient, publishes to Redis instead of returning error
- All gateway instances subscribe to `ws:message` and forward to local peers via `handleCrossProcessMessage`
- Graceful fallback: Pub/Sub only activates when `REDIS_URL` is set; single-instance mode works without Redis
- **Tests**: 56 backend tests pass (9 suites) — no regressions

### B-15 Docker Compose Configuration ✅

- Redis 7-alpine service with health check and `redis_data` volume
- WS port 4001 exposed alongside HTTP 4000
- `REDIS_URL`, `WS_PORT`, `WS_API_KEY`, `WS_ALLOWED_ORIGINS`, `LOG_LEVEL` env vars configured
- Backend depends on both postgres and redis (service_healthy)
- Backend health check (GET `/` via inline node script)
- Isolated `cryptovisual` bridge network
- Updated `.env.example` with all variables documented

### B-16 K6 Load Test Script ✅

- `k6/websocket-load-test.js` — ramp-up to 10,000 concurrent VUs
- Each VU: connects → sends `handshake_init` → waits for `handshake_response` → closes
- **Metrics**: `ws_connection_duration_ms`, `ws_handshake_duration_ms`, `ws_messages_received`, `ws_connection_errors`, `ws_handshake_success_rate`
- **Thresholds**: 99% handshake rate, p95 connection < 2s, p95 handshake < 5s
- Load profile: 8-stage ramp (10s → 30s → 30s → 30s → 30s → 30s → 60s → 30s)
- `k6/README.md` with usage instructions

## Definition of Done Checklist

- [x] Pure-JS AES round outputs match Web Crypto for random keys (CI)
- [x] XState hydrates from `sessionStorage` on reload; `canGoTo` works correctly
- [x] Multiple WS gateway instances share peer events via Redis Pub/Sub
- [x] `docker-compose.yml` with postgres, redis, backend; WS port exposed; health checks
- [x] Each wizard step has a toggleable info panel explaining the crypto concept
- [x] Frontend tests ≥ 40 passing (actual: **63**) — WS reconnect, fallback, reduced-motion, E2E, audio all covered
- [x] K6 baseline script created: 10k WS connections, p95 thresholds, 5 metrics tracked

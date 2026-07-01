CryptoVisual Backend Implementation Strategy
Phase 1 — Repository Assessment
1.1 Repository Map & Current State
An inspection of the current cryptovisualback repository reveals a fresh, unmodified NestJS project skeleton (v11.0.1).

Current Modules: Only the default AppModule, AppController, and AppService.
Dependency Graph: Base @nestjs/core, @nestjs/common, and @nestjs/platform-express. No external dependencies (ORM, WebSockets, or validation) have been introduced yet.
Configuration Strategy: Currently non-existent. Hardcoded defaults from the NestJS CLI.
Environment Setup: Standard package.json scripts (start:dev, build, test), but no .env file or environment separation.
1.2 Detection & Observations
Dead Code: app.controller.ts and app.service.ts contain boilerplate "Hello World" logic and should be removed.
Architectural Smells: No modular boundaries exist. The src/ directory is flat.
Missing Boundaries: No separated domains (Auth, Database, Config, etc.), no DTOs, no entity models, and no error handling interceptors.
Phase 2 — Backend Architecture
The backend will follow a Domain-Driven Design (DDD) approach within NestJS's modular ecosystem.

2.1 Module Design
/config: Global module wrapper for @nestjs/config. Owns environment variables parsing and validation (via Joi/Zod).
/database: Global module owning the PrismaClient instantiation and connection lifecycle.
/common: Contains global guards, interceptors (e.g., logging, error mapping), decorators, and shared interfaces.
/auth: Owns API key validation, JWT verification (if applicable for admin tasks), and route-level authorization guards.
/session: Manages the ephemeral lifecycle of user browser sessions, issuing session tokens.
/handshake: Handles the metadata exchange and verification for the initial key exchange simulation.
/public-key-directory: Manages the ephemeral registration and retrieval of public keys.
/audit: Owns the persistent logging of critical security events and actions.
/metrics: Aggregates client-reported performance metrics (e.g., crypto operation execution time).
/websocket: Owns the real-time simulation layer, broadcasting peer events and managing socket lifecycles.
/analytics: Aggregates higher-level usage data based on sessions and events.
2.2 Ownership, Contracts, and Dependency Rules
Dependency Rules (Acyclic): Feature modules (handshake, public-key-directory) may depend on Core modules (database, config, common). Feature modules should not depend on each other directly; they should communicate via events (@nestjs/event-emitter) if cross-domain interaction is needed.
Contracts: Inter-module communication must use strict TypeScript interfaces. The boundary between the API layer (Controllers) and the Business layer (Services) must be defined by Request/Response DTOs.
Ownership: The database module strictly owns Prisma. No other module should instantiate a database connection.
Phase 3 — API Design
The API will be RESTful, documented via OpenAPI (Swagger), and strictly validated using class-validator and class-transformer.

3.1 Endpoints & DTOs
POST /api/v1/handshake/init
Request DTO: { sessionId: string, timestamp: string, clientMetadata: object }
Response DTO: { handshakeId: string, serverChallenge: string, expiresAt: string }
Purpose: Initiates a cryptographic handshake simulation.
POST /api/v1/handshake/verify
Request DTO: { handshakeId: string, challengeResponse: string, pubKeyRef: string }
Response DTO: { status: "SUCCESS" | "FAILED", establishedAt: string }
Purpose: Completes the simulated handshake.
POST /api/v1/audit/log
Request DTO: { eventType: string, actorId: string, targetId: string, actionPayload: object, timestamp: string }
Response DTO: { status: "RECEIVED" } (Fire-and-forget from client perspective)
Purpose: Records an immutable audit log.
GET /api/v1/public-keys
Request DTO: ?sessionId=<id>&limit=50&offset=0
Response DTO: { keys: [{ kid: string, pubKey: string, algorithm: string, ownerId: string }] }
Purpose: Retrieves a directory of public keys for peer simulation.
GET /api/v1/metrics
Request DTO: ?timeframe=24h&metricType=encryption_speed
Response DTO: { data: [...], aggregates: {...} }
Purpose: Retrieves performance metrics.
3.2 Global API Policies
Versioning: URI versioning (/api/v1/...).
Validation: Global ValidationPipe with whitelist: true and forbidNonWhitelisted: true.
Error Models: RFC 7807 Problem Details for HTTP APIs (standardized JSON error responses).
OpenAPI: Auto-generated Swagger documentation at /api/docs using @nestjs/swagger.
Rate Limiting: @nestjs/throttler applied globally (e.g., 100 req/min/IP), with stricter limits on /handshake endpoints (10 req/min/IP).
Phase 4 — Database
4.1 Technology & Rationale
Database: PostgreSQL (relational integrity, JSONB support for flexible metadata).
ORM: Prisma (type safety, excellent schema migration).
Zero-Knowledge Architecture: We store NO message contents, NO private keys, and NO encrypted payloads. The backend is strictly a signaling and telemetry plane. This eliminates the risk of data breaches exposing user communications and offloads all cryptographic overhead to the client. This enforces our goal of an educational tool demonstrating true end-to-end client-side encryption.
4.2 Entity Relationship & Tables (Prisma Schema Outline)
HandshakeSession: Tracks ephemeral negotiation states. (id, status, challenge, expiresAt, createdAt)
PublicKey: Stores purely public material. (kid, publicKeyPem, algorithm, sessionId, createdAt)
AuditLog: Append-only log. (id, eventType, actorId, details [JSONB], createdAt)
PerformanceMetric: Time-series telemetry. (id, operationType, durationMs, clientEnvironment [JSONB], recordedAt)
PeerConnection: Tracks simulated topologies. (id, sourceSessionId, targetSessionId, status, establishedAt)
HistoricalSession: Archived session metadata for analytics. (id, durationSeconds, totalEvents, endedAt)
4.3 Indexes & Retention Policy
Indexes: BTREE on (sessionId), (createdAt) for fast lookups and time-series queries. GIN indexes on JSONB fields (details, clientEnvironment) if querying by internal keys is required.
Retention: Ephemeral data (HandshakeSession, PublicKey, PeerConnection) is TTL-bound via background cron (e.g., 24 hours). AuditLog and HistoricalSession are retained for 1 year, partitioned by month.
Phase 5 — Real-Time Layer
5.1 WebSocket Architecture
Framework Evaluation: While Socket.IO is standard in NestJS, it is not justified here. Socket.IO adds long-polling fallbacks and heavy framing protocol overhead. Since this is an educational platform relying on modern browser Web Crypto APIs, we can assume 100% of our clients support native WebSockets.
Recommendation: Use native ws via @nestjs/platform-ws. It drastically reduces memory per connection and CPU overhead, which is critical for dense peer simulations and maintaining minimal latency.
5.2 Real-Time Requirements
Peer Simulation: WebSocket rooms will map to "simulation networks". Broadcasts within a room simulate peer-to-peer gossip.
Event Contracts: Strict JSON schemas for WS payloads ({ type: string, payload: any, timestamp: number, signature?: string }).
Reconnect & Ordering: Clients must implement exponential backoff. The backend does not buffer missed messages (to enforce the "no storage" rule); clients must request state reconciliation upon reconnect.
Timeouts: Aggressive ping/pong intervals (15s). Connections dropping pings are forcefully terminated.
Observability: Track active connections, packet sizes, and drop rates using custom interceptors emitting to the /metrics pipeline.
Scaling Path: Redis Pub/Sub adapter to scale WebSocket instances horizontally across multiple Node processes.
Phase 6 — Security Review
6.1 Defensive Architecture
CORS: Strict origin matching against known frontend domains. No wildcards. Preflight caching enabled.
CSP (Content Security Policy): Handled primarily by the frontend server, but backend should enforce helmet for all API responses to prevent MIME-sniffing and clickjacking.
OWASP Protections: Implementation of Helmet, Throttler, and strict input sanitization via class-validator.
6.2 Threat Modeling
Assets: Public Key Directory, Audit Logs, Telemetry.
Entry Points: REST API, WebSocket connections.
Attack Paths & Mitigations:
MITM Simulation Abuse: An attacker floods the simulation with fake peers. Mitigation: Strict rate-limiting on WebSocket connections per IP and session validation before allowing room join.
Key Spoofing: Uploading a malicious public key. Mitigation: The backend validates the structural integrity of the public key (e.g., valid ASN.1/PEM format) but does NOT trust it. Authenticity is strictly verified client-side.
Worker Isolation: If complex calculations were moved to backend, it could lead to ReDoS or CPU exhaustion. Mitigation: All cryptography explicitly remains client-side.
Session Abuse: Token reuse. Mitigation: Short-lived opaque tokens mapped to HTTP-only, secure cookies, or explicitly bound to client IP fingerprints.
Phase 7 — Execution Plan (8 Sprints)
Each sprint is 2 weeks.

Sprint 1: Repository Stabilization

Goal: Set up the fundamental project scaffolding.
Deliverables: Linter/Prettier config, CI pipeline (GitHub Actions), Dockerfile, Environment configuration (@nestjs/config).
Architecture changes: Initialize base directory structure.
Database changes: None.
API changes: Boilerplate cleanup.
Testing: Setup Jest unit/e2e config.
Observability: None.
Risks: Slow initial setup blocking frontend mocks.
Exit Criteria: A clean, containerized NestJS app deploys successfully to a staging environment.
Sprint 2: Core Backend Foundation

Goal: Database integration and error handling.
Deliverables: Prisma setup, initial migrations, global exception filters, logging interceptor (Winston/Pino).
Architecture changes: Introduce /database, /common, /config.
Database changes: Initial Prisma schema setup.
API changes: RFC 7807 error formatting implemented globally.
Testing: Database connection tests.
Observability: Basic request logging.
Risks: ORM configuration mismatches.
Exit Criteria: Database connects cleanly; errors are uniformly formatted.
Sprint 3: Session Management

Goal: Implement secure, ephemeral session tracking.
Deliverables: /session module, token issuance, Redis integration for fast session lookups.
Architecture changes: Add /session, /auth.
Database changes: HandshakeSession and HistoricalSession models.
API changes: POST /api/v1/session/init (implicitly part of handshake flow).
Testing: Session token lifecycle unit tests.
Observability: Session creation rate metrics.
Risks: Token leak vulnerabilities.
Exit Criteria: Clients can securely request and refresh session tokens.
Sprint 4: Public Key Directory

Goal: Enable the exchange of cryptographic identities.
Deliverables: /public-key-directory APIs, DTO validation.
Architecture changes: Add /public-key-directory.
Database changes: PublicKey model.
API changes: GET /api/v1/public-keys, upload equivalents.
Testing: DTO validation boundaries, invalid PEM rejection tests.
Observability: Monitor key registration frequencies.
Risks: Storage exhaustion from key spam.
Exit Criteria: Clients can upload and retrieve valid public keys associated with active sessions.
Sprint 5: Metrics and Audit

Goal: Implement observability and compliance logging.
Deliverables: /audit and /metrics modules, asynchronous event processing.
Architecture changes: Add /audit, /metrics.
Database changes: AuditLog, PerformanceMetric models.
API changes: POST /api/v1/audit/log, GET /api/v1/metrics.
Testing: Event emitter processing tests.
Observability: Application internal telemetry enabled.
Risks: DB write bottlenecks on high log volume.
Exit Criteria: Audit events and performance metrics are successfully ingested asynchronously.
Sprint 6: WebSocket Simulation

Goal: Real-time peer communication layer.
Deliverables: WebSocket gateway (ws), room management, Redis Pub/Sub adapter.
Architecture changes: Add /websocket module.
Database changes: PeerConnection state models.
API changes: WebSocket upgrade endpoint.
Testing: E2E socket connection and broadcast tests.
Observability: Socket connection count, event latency.
Risks: Memory leaks in connection state tracking.
Exit Criteria: Multiple clients can join a simulation room and broadcast events with sub-50ms latency.
Sprint 7: Security and Hardening

Goal: Threat mitigation and policy enforcement.
Deliverables: Rate limiting, Helmet, CORS lockdown, simulated payload size limits.
Architecture changes: Global guard/interceptor updates.
Database changes: None.
API changes: Stricter HTTP responses.
Testing: Penetration testing scripts, rate-limit threshold tests.
Observability: Blocked request metrics.
Risks: Overly aggressive rate limiting breaking UX.
Exit Criteria: Automated security scans report zero high/critical vulnerabilities.
Sprint 8: Production Readiness

Goal: Operations, scaling, and handoff.
Deliverables: Prometheus metrics endpoint (/metrics via exporter), health checks (/health), load testing, runbooks.
Architecture changes: Terminus health checks.
Database changes: Finalize indexing and cleanup jobs.
API changes: None.
Testing: Artillery/K6 load tests.
Observability: Grafana dashboard definitions.
Risks: Scaling bottlenecks under peak load.
Exit Criteria: System survives a simulated load test of 10,000 concurrent WebSocket connections.
Phase 8 — Operations
8.1 Deployment Strategy
Docker Strategy: Multi-stage distroless Node.js image to minimize attack surface and image size.
Local Development: docker-compose orchestrating the NestJS app, PostgreSQL, and Redis (for WS and rate-limiting).
CI/CD: GitHub Actions -> Lint -> Unit Tests -> Build -> Push to container registry -> Deploy via Infrastructure as Code (e.g., Terraform to AWS ECS or Render).
Logging: Structured JSON logs via Pino, ingested into a centralized log aggregator (e.g., Datadog, ELK).
Monitoring & Health: @nestjs/terminus for liveness/readiness probes. Prometheus scraping for Node.js event loop metrics and HTTP response times.
Backup: PostgreSQL automated daily snapshots with 30-day retention (metadata only, low risk).
Deployment Topology: Load balancer (Nginx/ALB) -> Multiple NestJS instances (stateless) -> Managed Postgres (Primary) + Managed Redis (for WS Pub/Sub and session state).
8.2 Estimates & Risks
Engineering Effort: ~16 weeks (8 sprints) for 1-2 Backend Engineers.
High-Risk Areas: WebSocket scalability (managing state and dropped packets across multiple nodes) and preventing memory leaks in the real-time layer.
Longest Critical Path: Sprint 6 (WebSocket Simulation). The transition from REST to real-time events introduces architectural complexity (Redis Pub/Sub) that must be stabilized before hardening (Sprint 7).
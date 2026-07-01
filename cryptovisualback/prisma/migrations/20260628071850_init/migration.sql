-- CreateTable
CREATE TABLE "HandshakeSession" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "challenge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "HandshakeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicKey" (
    "id" TEXT NOT NULL,
    "kid" TEXT NOT NULL,
    "publicKeyPem" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT,
    "actionPayload" JSONB,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "durationMs" DOUBLE PRECISION NOT NULL,
    "clientEnvironment" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerConnection" (
    "id" TEXT NOT NULL,
    "sourceSessionId" TEXT NOT NULL,
    "targetSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "establishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeerConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalSession" (
    "id" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "totalEvents" INTEGER NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HandshakeSession_createdAt_idx" ON "HandshakeSession"("createdAt");

-- CreateIndex
CREATE INDEX "HandshakeSession_status_idx" ON "HandshakeSession"("status");

-- CreateIndex
CREATE INDEX "PublicKey_sessionId_idx" ON "PublicKey"("sessionId");

-- CreateIndex
CREATE INDEX "PublicKey_createdAt_idx" ON "PublicKey"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PublicKey_kid_key" ON "PublicKey"("kid");

-- CreateIndex
CREATE INDEX "AuditLog_eventType_idx" ON "AuditLog"("eventType");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "PerformanceMetric_operationType_idx" ON "PerformanceMetric"("operationType");

-- CreateIndex
CREATE INDEX "PerformanceMetric_recordedAt_idx" ON "PerformanceMetric"("recordedAt");

-- CreateIndex
CREATE INDEX "PeerConnection_sourceSessionId_idx" ON "PeerConnection"("sourceSessionId");

-- CreateIndex
CREATE INDEX "PeerConnection_status_idx" ON "PeerConnection"("status");

-- CreateIndex
CREATE INDEX "HistoricalSession_endedAt_idx" ON "HistoricalSession"("endedAt");

-- AddForeignKey
ALTER TABLE "PublicKey" ADD CONSTRAINT "PublicKey_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "HandshakeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

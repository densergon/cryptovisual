-- CreateTable
CREATE TABLE "Handshake" (
    "id" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "responderId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Handshake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Handshake_sessionId_idx" ON "Handshake"("sessionId");

-- CreateIndex
CREATE INDEX "Handshake_initiatorId_idx" ON "Handshake"("initiatorId");

-- CreateIndex
CREATE INDEX "Handshake_responderId_idx" ON "Handshake"("responderId");

-- CreateIndex
CREATE INDEX "Handshake_createdAt_idx" ON "Handshake"("createdAt");

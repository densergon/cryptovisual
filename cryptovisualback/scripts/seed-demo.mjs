import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomBytes, createHash } from 'crypto';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  console.log('Cleaning existing demo data...');
  const demoPrefix = 'demo-session-';
  const existingSessions = await prisma.handshakeSession.findMany({
    where: { id: { startsWith: demoPrefix } },
    select: { id: true },
  });
  const existingIds = existingSessions.map(s => s.id);
  if (existingIds.length > 0) {
    await prisma.auditLog.deleteMany({ where: { eventType: 'demo_seeded' } });
    await prisma.handshake.deleteMany({ where: { sessionId: { in: existingIds } } });
    await prisma.publicKey.deleteMany({ where: { sessionId: { in: existingIds } } });
    await prisma.handshakeSession.deleteMany({ where: { id: { in: existingIds } } });
    console.log(`  Removed ${existingIds.length} existing demo session(s)`);
  }

  console.log('Seeding demo data...');

  const sessionId = `demo-session-${Date.now()}`;
  const challenge = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const session = await prisma.handshakeSession.create({
    data: {
      id: sessionId,
      status: 'ACTIVE',
      challenge,
      expiresAt,
    },
  });
  console.log(`  Created HandshakeSession: ${session.id}`);

  const demoPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8Dbv8prpJmD+o7g
9NVqWn5MnC3sx3esTo5x8TKX7q3KfH4sX8Y5v5G7Hm7X8Y5v5G7Hm7X8Y5v
5G7Hm7X8Y5v5G7Hm7X8Y5v5G7Hm7X8Y5v5G7Hm7X8Y5v5G7Hm7X8Y5v5G7H
-----END PUBLIC KEY-----`;

  const kid = `key-demo-${createHash('sha256').update(demoPublicKey).digest('hex').slice(0, 16)}`;

  await prisma.publicKey.create({
    data: {
      kid,
      publicKeyPem: demoPublicKey,
      algorithm: 'RSA-OAEP-2048',
      ownerId: 'demo-user-alice',
      sessionId: session.id,
    },
  });
  console.log(`  Created PublicKey: ${kid}`);

  const handshake = await prisma.handshake.create({
    data: {
      initiatorId: 'demo-user-alice',
      responderId: 'demo-user-bob',
      sessionId: session.id,
      status: 'in_progress',
      metadata: {
        demo: true,
        label: 'Demo handshake — pre-seeded for portfolio review',
        steps: ['keygen', 'session-key', 'aes-cipher', 'hybrid-envelope', 'wire-simulation', 'decrypt'],
      },
    },
  });
  console.log(`  Created Handshake: ${handshake.id}`);

  await prisma.auditLog.create({
    data: {
      eventType: 'demo_seeded',
      actorId: 'system',
      actionPayload: { sessionId: session.id, handshakeId: handshake.id },
    },
  });
  console.log('  Created AuditLog entry');

  console.log('\nDemo data seeded successfully!');
  console.log(`  Session ID: ${session.id}`);
  console.log(`  Handshake ID: ${handshake.id}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSessionDto, SessionResponseDto } from './dto/session.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private databaseService: DatabaseService) {}

  async createSession(dto: CreateSessionDto): Promise<SessionResponseDto> {
    const challenge = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const session = await this.databaseService.handshakeSession.create({
      data: {
        status: 'PENDING',
        challenge,
        expiresAt,
        createdAt: new Date(),
      },
    });

    this.logger.log(`Session created: ${session.id}`);

    return {
      sessionId: session.id,
      status: session.status,
      challenge: session.challenge || undefined,
      expiresAt: session.expiresAt!,
      createdAt: session.createdAt,
    };
  }

  async getSession(sessionId: string): Promise<SessionResponseDto | null> {
    const session = await this.databaseService.handshakeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return null;
    }

    return {
      sessionId: session.id,
      status: session.status,
      challenge: session.challenge || undefined,
      expiresAt: session.expiresAt!,
      createdAt: session.createdAt,
    };
  }

  async validateChallenge(
    sessionId: string,
    challenge: string,
  ): Promise<boolean> {
    const session = await this.databaseService.handshakeSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.challenge) {
      return false;
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
      await this.databaseService.handshakeSession.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' },
      });
      return false;
    }

    return session.challenge === challenge;
  }

  async completeSession(sessionId: string): Promise<void> {
    await this.databaseService.handshakeSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`Session completed: ${sessionId}`);
  }

  async expireSession(sessionId: string): Promise<void> {
    await this.databaseService.handshakeSession.update({
      where: { id: sessionId },
      data: { status: 'EXPIRED' },
    });

    this.logger.log(`Session expired: ${sessionId}`);
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.databaseService.handshakeSession.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        status: 'PENDING',
      },
      data: {
        status: 'EXPIRED',
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired sessions`);
    return result.count;
  }
}
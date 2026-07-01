import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateAuditLogDto, AuditLogResponseDto } from './dto/audit.dto';

@Injectable()
export class AuditLogService {
  constructor(private readonly database: DatabaseService) {}

  async log(event: CreateAuditLogDto): Promise<AuditLogResponseDto> {
    const auditLog = await this.database.auditLog.create({
      data: {
        eventType: event.eventType,
        actorId: event.actorId,
        targetId: event.targetId ?? null,
        actionPayload: event.actionPayload ? (event.actionPayload as any) : null,
        details: event.details ? (event.details as any) : null,
      },
    });

    return {
      id: auditLog.id,
      eventType: auditLog.eventType,
      actorId: auditLog.actorId,
      targetId: auditLog.targetId ?? undefined,
      actionPayload: auditLog.actionPayload as Record<string, unknown>,
      details: auditLog.details as Record<string, unknown>,
      timestamp: auditLog.timestamp,
      createdAt: auditLog.createdAt,
    };
  }

  async getLogs(
    eventType?: string,
    actorId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLogResponseDto[]> {
    const where: Record<string, unknown> = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        (where.timestamp as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.timestamp as Record<string, Date>).lte = endDate;
      }
    }

    const logs = await this.database.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      eventType: log.eventType,
      actorId: log.actorId,
      targetId: log.targetId ?? undefined,
      actionPayload: log.actionPayload as Record<string, unknown>,
      details: log.details as Record<string, unknown>,
      timestamp: log.timestamp,
      createdAt: log.createdAt,
    }));
  }

  async getLogById(logId: string): Promise<AuditLogResponseDto> {
    const log = await this.database.auditLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new BadRequestException(`Audit log with id ${logId} not found`);
    }

    return {
      id: log.id,
      eventType: log.eventType,
      actorId: log.actorId,
      targetId: log.targetId ?? undefined,
      actionPayload: log.actionPayload as Record<string, unknown>,
      details: log.details as Record<string, unknown>,
      timestamp: log.timestamp,
      createdAt: log.createdAt,
    };
  }

  async getLogsByActor(actorId: string, limit: number = 50): Promise<AuditLogResponseDto[]> {
    const logs = await this.database.auditLog.findMany({
      where: { actorId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      eventType: log.eventType,
      actorId: log.actorId,
      targetId: log.targetId ?? undefined,
      actionPayload: log.actionPayload as Record<string, unknown>,
      details: log.details as Record<string, unknown>,
      timestamp: log.timestamp,
      createdAt: log.createdAt,
    }));
  }
}
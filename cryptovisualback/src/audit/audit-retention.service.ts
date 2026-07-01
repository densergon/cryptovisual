import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import { AuditLogService } from './audit.service';

const RETENTION_DAYS = parseInt(process.env.AUDIT_RETENTION_DAYS || '365', 10);

@Injectable()
export class AuditRetentionService {
  private readonly logger = new Logger(AuditRetentionService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeOldLogs() {
    this.logger.log(`Starting nightly audit log purge (retention: ${RETENTION_DAYS} days)`);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    try {
      const deletedLogs = await this.database.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoff },
        },
      });

      const deletedMetrics = await this.database.performanceMetric.deleteMany({
        where: {
          recordedAt: { lt: cutoff },
        },
      });

      this.logger.log(`Purged ${deletedLogs.count} audit logs and ${deletedMetrics.count} performance metrics older than ${RETENTION_DAYS} days`);

      await this.auditLogService.log({
        eventType: 'retention_purge',
        actorId: 'system',
        actionPayload: {
          auditLogsPurged: deletedLogs.count,
          metricsPurged: deletedMetrics.count,
          retentionDays: RETENTION_DAYS,
          cutoffDate: cutoff.toISOString(),
        },
      });
    } catch (error) {
      this.logger.error('Audit retention purge failed', error);
    }
  }
}

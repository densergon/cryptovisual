import { Module } from '@nestjs/common';
import { AuditLogController } from './audit.controller';
import { AuditLogService } from './audit.service';
import { AuditRetentionService } from './audit-retention.service';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditRetentionService],
  exports: [AuditLogService],
})
export class AuditModule {}

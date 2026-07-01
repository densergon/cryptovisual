import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit.service';
import { CreateAuditLogDto, AuditLogResponseDto, AuditLogQueryDto } from './dto/audit.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('audit')
@UseGuards(ApiKeyGuard)
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async logEvent(@Body() dto: CreateAuditLogDto): Promise<{ success: boolean; data: AuditLogResponseDto }> {
    const log = await this.service.log(dto);
    return {
      success: true,
      data: log,
    };
  }

  @Get()
  async getLogs(
    @Query() query: AuditLogQueryDto,
  ): Promise<{ success: boolean; data: AuditLogResponseDto[] }> {
    const { eventType, actorId, startDate, endDate, limit } = query;
    
    const logs = await this.service.getLogs(
      eventType,
      actorId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      success: true,
      data: logs,
    };
  }

  @Get(':logId')
  async getLogById(@Param('logId') logId: string): Promise<{ success: boolean; data: AuditLogResponseDto }> {
    const log = await this.service.getLogById(logId);
    return {
      success: true,
      data: log,
    };
  }

  @Get('actor/:actorId')
  async getLogsByActor(
    @Param('actorId') actorId: string,
    @Query('limit') limit?: string,
  ): Promise<{ success: boolean; data: AuditLogResponseDto[] }> {
    const logs = await this.service.getLogsByActor(
      actorId,
      limit ? parseInt(limit, 10) : 50,
    );

    return {
      success: true,
      data: logs,
    };
  }
}
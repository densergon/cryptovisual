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
import { PerformanceMetricService } from './metrics.service';
import { CreatePerformanceMetricDto, PerformanceMetricResponseDto, PerformanceMetricSummaryDto } from './dto/metrics.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('metrics')
@UseGuards(ApiKeyGuard)
export class PerformanceMetricController {
  constructor(private readonly service: PerformanceMetricService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async recordMetric(
    @Body() dto: CreatePerformanceMetricDto,
  ): Promise<{ success: boolean; data: PerformanceMetricResponseDto }> {
    const metric = await this.service.record(dto);
    return {
      success: true,
      data: metric,
    };
  }

  @Get()
  async getMetrics(
    @Query('operationType') operationType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ): Promise<{ success: boolean; data: PerformanceMetricResponseDto[] }> {
    const metrics = await this.service.getMetrics(
      operationType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      success: true,
      data: metrics,
    };
  }

  @Get('summary')
  async getSummary(
    @Query('operationType') operationType?: string,
  ): Promise<{ success: boolean; data: PerformanceMetricSummaryDto[] }> {
    const summaries = await this.service.getSummary(operationType);
    return {
      success: true,
      data: summaries,
    };
  }

  @Get('type/:operationType')
  async getMetricsByType(
    @Param('operationType') operationType: string,
    @Query('limit') limit?: string,
  ): Promise<{ success: boolean; data: PerformanceMetricResponseDto[] }> {
    const metrics = await this.service.getMetricsByType(
      operationType,
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      success: true,
      data: metrics,
    };
  }

  @Get('prometheus')
  async getPrometheusMetrics(): Promise<string> {
    const summaries = await this.service.getSummary();

    let output = '';
    for (const s of summaries) {
      output += `# HELP crypto_op_duration_ms Average duration of ${s.operationType}\n`;
      output += `# TYPE crypto_op_duration_ms gauge\n`;
      output += `crypto_op_duration_ms{operation="${s.operationType}"} ${s.avgDurationMs}\n`;
      output += `crypto_op_p50{operation="${s.operationType}"} ${s.p50DurationMs}\n`;
      output += `crypto_op_p95{operation="${s.operationType}"} ${s.p95DurationMs}\n`;
      output += `crypto_op_p99{operation="${s.operationType}"} ${s.p99DurationMs}\n`;
    }

    return output;
  }
}

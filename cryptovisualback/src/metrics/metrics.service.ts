import { Injectable } from '@nestjs/common';
import { build } from 'hdr-histogram-js';
import { DatabaseService } from '../database/database.service';
import { CreatePerformanceMetricDto, PerformanceMetricResponseDto, PerformanceMetricSummaryDto } from './dto/metrics.dto';

@Injectable()
export class PerformanceMetricService {
  constructor(private readonly database: DatabaseService) {}

  async record(metric: CreatePerformanceMetricDto): Promise<PerformanceMetricResponseDto> {
    const recorded = await this.database.performanceMetric.create({
      data: {
        operationType: metric.operationType,
        durationMs: metric.durationMs,
        clientEnvironment: metric.clientEnvironment ? (metric.clientEnvironment as any) : null,
      },
    });

    return {
      id: recorded.id,
      operationType: recorded.operationType,
      durationMs: recorded.durationMs,
      clientEnvironment: recorded.clientEnvironment as Record<string, unknown>,
      recordedAt: recorded.recordedAt,
    };
  }

  async getMetrics(
    operationType?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<PerformanceMetricResponseDto[]> {
    const where: Record<string, unknown> = {};

    if (operationType) {
      where.operationType = operationType;
    }

    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) {
        (where.recordedAt as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.recordedAt as Record<string, Date>).lte = endDate;
      }
    }

    const metrics = await this.database.performanceMetric.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });

    return metrics.map((metric) => ({
      id: metric.id,
      operationType: metric.operationType,
      durationMs: metric.durationMs,
      clientEnvironment: metric.clientEnvironment as Record<string, unknown>,
      recordedAt: metric.recordedAt,
    }));
  }

  async getSummary(operationType?: string): Promise<PerformanceMetricSummaryDto[]> {
    const where = operationType ? { operationType } : {};

    const metrics = await this.database.performanceMetric.findMany({
      where,
      orderBy: { durationMs: 'asc' },
    });

    const grouped = new Map<string, number[]>();

    for (const metric of metrics) {
      if (!grouped.has(metric.operationType)) {
        grouped.set(metric.operationType, []);
      }
      grouped.get(metric.operationType)!.push(metric.durationMs);
    }

    const summaries: PerformanceMetricSummaryDto[] = [];

    for (const [type, durations] of grouped.entries()) {
      const sorted = durations.sort((a, b) => a - b);
      const count = sorted.length;
      const sum = sorted.reduce((a, b) => a + b, 0);
      const avg = sum / count;
      const min = sorted[0];
      const max = sorted[count - 1];

      const histogram = build({ numberOfSignificantValueDigits: 3 });
      for (const d of durations) {
        histogram.recordValue(Math.round(d));
      }

      summaries.push({
        operationType: type,
        count,
        avgDurationMs: avg,
        minDurationMs: min,
        maxDurationMs: max,
        p50DurationMs: histogram.getValueAtPercentile(50),
        p95DurationMs: histogram.getValueAtPercentile(95),
        p99DurationMs: histogram.getValueAtPercentile(99),
      });
    }

    return summaries;
  }

  async getMetricsByType(operationType: string, limit: number = 100): Promise<PerformanceMetricResponseDto[]> {
    const metrics = await this.database.performanceMetric.findMany({
      where: { operationType },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });

    return metrics.map((metric) => ({
      id: metric.id,
      operationType: metric.operationType,
      durationMs: metric.durationMs,
      clientEnvironment: metric.clientEnvironment as Record<string, unknown>,
      recordedAt: metric.recordedAt,
    }));
  }
}

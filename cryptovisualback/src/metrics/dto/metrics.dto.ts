import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePerformanceMetricDto {
  @IsString()
  @IsNotEmpty()
  operationType: string;

  @IsNumber()
  @IsNotEmpty()
  durationMs: number;

  @IsObject()
  @IsOptional()
  clientEnvironment?: Record<string, unknown>;
}

export class PerformanceMetricResponseDto {
  id: string;
  operationType: string;
  durationMs: number;
  clientEnvironment?: Record<string, unknown>;
  recordedAt: Date;
}

export class PerformanceMetricSummaryDto {
  operationType: string;
  count: number;
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
}
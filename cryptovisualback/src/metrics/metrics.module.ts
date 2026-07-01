import { Module } from '@nestjs/common';
import { PerformanceMetricController } from './metrics.controller';
import { PerformanceMetricService } from './metrics.service';
import { PrometheusService } from './prometheus.service';

@Module({
  controllers: [PerformanceMetricController],
  providers: [PerformanceMetricService, PrometheusService],
  exports: [PerformanceMetricService, PrometheusService],
})
export class MetricsModule {}

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { WebSocketModule } from '../websocket/websocket.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [TerminusModule, WebSocketModule, MetricsModule],
  controllers: [HealthController],
})
export class HealthModule {}

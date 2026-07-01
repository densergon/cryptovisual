import { Controller, Get, Logger } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private database: DatabaseService,
    private wsGateway: WebSocketGateway,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        try {
          await this.database.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch (error) {
          throw new Error('Database health check failed');
        }
      },
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      async () => {
        try {
          await this.database.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch (error) {
          throw new Error('Database health check failed');
        }
      },
      async () => {
        const stats = this.wsGateway.getStats();
        const wsStatus = stats.connectedPeers >= 0 ? 'up' : 'down';
        return {
          websocket: {
            status: wsStatus,
            ...stats,
          },
        };
      },
    ]);
  }
}

import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './database/redis.module';
import { CommonModule } from './common/common.module';
import { SessionModule } from './session/session.module';
import { PublicKeyDirectoryModule } from './public-key-directory/public-key-directory.module';
import { AuditModule } from './audit/audit.module';
import { MetricsModule } from './metrics/metrics.module';
import { WebSocketModule } from './websocket/websocket.module';
import { HandshakeModule } from './handshake/handshake.module';
import { HealthModule } from './health/health.module';
import { throttlerConfig } from './config/throttler.config';

@Module({
  imports: [
    ThrottlerModule.forRoot(throttlerConfig),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino/file',
          options: { destination: 1 },
        },
        level: process.env.LOG_LEVEL || 'info',
        autoLogging: false,
        serializers: {
          req: () => undefined,
          res: () => undefined,
        },
      },
    }),
    AppConfigModule,
    DatabaseModule,
    RedisModule,
    CommonModule,
    SessionModule,
    PublicKeyDirectoryModule,
    AuditModule,
    MetricsModule,
    WebSocketModule,
    HandshakeModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

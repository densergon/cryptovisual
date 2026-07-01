import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CspMiddleware } from './common/middleware/csp.middleware';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT ?? 4000;
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

  app.enableCors({ origin: corsOrigin });
  
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  const cspMiddleware = new CspMiddleware();
  app.use((req, res, next) => cspMiddleware.use(req, res, next));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}`);
  logger.log(`CORS origin: ${corsOrigin}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

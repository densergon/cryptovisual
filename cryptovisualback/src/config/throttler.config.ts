import { ThrottlerModuleOptions, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60000,
      limit: 60,
    },
  ],
};

export const throttlerProvider = {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
};

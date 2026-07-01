import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth(): Record<string, unknown> {
    return {
      status: 'ok',
      service: 'cryptovisual-backend',
      timestamp: new Date().toISOString(),
    };
  }
}

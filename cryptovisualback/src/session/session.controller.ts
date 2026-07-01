import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto, ValidateSessionDto } from './dto/session.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSession(@Body() dto: CreateSessionDto) {
    const session = await this.sessionService.createSession(dto);
    return {
      success: true,
      data: session,
    };
  }

  @Get(':sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    const session = await this.sessionService.getSession(sessionId);

    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      };
    }

    return {
      success: true,
      data: session,
    };
  }

  @Post(':sessionId/validate')
  async validateChallenge(
    @Param('sessionId') sessionId: string,
    @Body() body: ValidateSessionDto,
  ) {
    const isValid = await this.sessionService.validateChallenge(
      sessionId,
      body.challenge,
    );

    return {
      success: isValid,
      data: { valid: isValid },
    };
  }

  @Post(':sessionId/complete')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  async completeSession(@Param('sessionId') sessionId: string) {
    await this.sessionService.completeSession(sessionId);

    return {
      success: true,
      message: 'Session completed',
    };
  }
}

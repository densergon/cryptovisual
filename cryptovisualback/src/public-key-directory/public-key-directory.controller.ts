import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PublicKeyDirectoryService } from './public-key-directory.service';
import { RegisterKeyDto, KeyResponseDto, FingerprintResponseDto } from './dto/public-key.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('public-key-directory')
export class PublicKeyDirectoryController {
  constructor(
    private readonly service: PublicKeyDirectoryService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerKey(@Body() dto: RegisterKeyDto): Promise<{ success: boolean; data: KeyResponseDto }> {
    const key = await this.service.registerKey(dto);
    return {
      success: true,
      data: key,
    };
  }

  @Get(':keyId')
  async getKeyByKeyId(@Param('keyId') keyId: string): Promise<{ success: boolean; data: KeyResponseDto }> {
    const key = await this.service.getKeyByKeyId(keyId);
    return {
      success: true,
      data: key,
    };
  }

  @Get('user/:userId')
  async getKeyByUserId(@Param('userId') userId: string): Promise<{ success: boolean; data: KeyResponseDto[] }> {
    const keys = await this.service.getKeyByUserId(userId);
    return {
      success: true,
      data: keys,
    };
  }

  @Get(':keyId/fingerprint')
  async getFingerprint(@Param('keyId') keyId: string): Promise<{ success: boolean; data: FingerprintResponseDto }> {
    const key = await this.service.getKeyByKeyId(keyId);
    const fingerprint = this.service.calculateFingerprint(key.publicKey);

    return {
      success: true,
      data: {
        fingerprint,
        algorithm: key.algorithm,
      },
    };
  }

  @Delete(':keyId')
  @UseGuards(ApiKeyGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeKey(@Param('keyId') keyId: string): Promise<{ success: boolean; message: string }> {
    await this.service.revokeKey(keyId);
    return {
      success: true,
      message: 'Key revoked successfully',
    };
  }
}

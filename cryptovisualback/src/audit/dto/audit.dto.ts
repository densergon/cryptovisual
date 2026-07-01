import { IsString, IsNotEmpty, IsOptional, IsObject, IsDateString } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @IsString()
  @IsNotEmpty()
  actorId: string;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsObject()
  @IsOptional()
  actionPayload?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  details?: Record<string, unknown>;
}

export class AuditLogResponseDto {
  id: string;
  eventType: string;
  actorId: string;
  targetId?: string;
  actionPayload?: Record<string, unknown>;
  details?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
}

export class AuditLogQueryDto {
  @IsString()
  @IsOptional()
  eventType?: string;

  @IsString()
  @IsOptional()
  actorId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
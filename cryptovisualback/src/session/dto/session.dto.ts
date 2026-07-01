import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsInt()
  @Min(1024)
  @Max(4096)
  @IsOptional()
  preferredKeySize?: number;
}

export class SessionResponseDto {
  sessionId: string;
  status: string;
  challenge?: string;
  expiresAt: Date;
  createdAt: Date;
}

export class ValidateSessionDto {
  @IsString()
  sessionId: string;

  @IsString()
  challenge: string;
}
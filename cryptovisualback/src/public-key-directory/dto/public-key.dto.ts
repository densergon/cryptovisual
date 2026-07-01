import { IsString, IsNotEmpty, IsOptional, IsObject, IsDateString } from 'class-validator';

export class RegisterKeyDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @IsString()
  @IsNotEmpty()
  algorithm: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class KeyResponseDto {
  keyId: string;
  userId: string;
  kid: string;
  publicKey: string;
  fingerprint: string;
  algorithm: string;
  createdAt: Date;
  revokedAt?: Date;
}

export class FingerprintResponseDto {
  fingerprint: string;
  algorithm: string;
}
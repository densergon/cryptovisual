import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RegisterKeyDto, KeyResponseDto, FingerprintResponseDto } from './dto/public-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class PublicKeyDirectoryService {
  constructor(private readonly database: DatabaseService) {}

  async registerKey(dto: RegisterKeyDto): Promise<KeyResponseDto> {
    const fingerprint = this.calculateFingerprint(dto.publicKey);
    const kid = `key-${fingerprint.slice(0, 16)}`;

    try {
      const key = await this.database.publicKey.create({
        data: {
          kid,
          publicKeyPem: dto.publicKey,
          algorithm: dto.algorithm,
          ownerId: dto.userId,
          sessionId: dto.userId,
        },
      });

      return {
        keyId: key.id,
        userId: key.ownerId,
        kid: key.kid,
        publicKey: key.publicKeyPem,
        fingerprint,
        algorithm: key.algorithm,
        createdAt: key.createdAt,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Key with kid ${kid} already exists`);
      }
      throw error;
    }
  }

  async getKeyByKeyId(keyId: string): Promise<KeyResponseDto> {
    const key = await this.database.publicKey.findUnique({
      where: { id: keyId },
    });

    if (!key) {
      throw new NotFoundException(`Key with id ${keyId} not found`);
    }

    const fingerprint = this.calculateFingerprint(key.publicKeyPem);

    return {
      keyId: key.id,
      userId: key.ownerId,
      kid: key.kid,
      publicKey: key.publicKeyPem,
      fingerprint,
      algorithm: key.algorithm,
      createdAt: key.createdAt,
    };
  }

  async getKeyByUserId(userId: string): Promise<KeyResponseDto[]> {
    const keys = await this.database.publicKey.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((key) => ({
      keyId: key.id,
      userId: key.ownerId,
      kid: key.kid,
      publicKey: key.publicKeyPem,
      fingerprint: this.calculateFingerprint(key.publicKeyPem),
      algorithm: key.algorithm,
      createdAt: key.createdAt,
    }));
  }

  async revokeKey(keyId: string): Promise<void> {
    const key = await this.database.publicKey.findUnique({
      where: { id: keyId },
    });

    if (!key) {
      throw new NotFoundException(`Key with id ${keyId} not found`);
    }

    await this.database.publicKey.delete({
      where: { id: keyId },
    });
  }

  calculateFingerprint(publicKey: string): string {
    const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
    return hash;
  }
}
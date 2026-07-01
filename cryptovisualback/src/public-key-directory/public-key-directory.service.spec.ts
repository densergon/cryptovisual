import { Test, TestingModule } from '@nestjs/testing';
import { PublicKeyDirectoryService } from './public-key-directory.service';
import { DatabaseService } from '../database/database.service';
import { RegisterKeyDto } from './dto/public-key.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PublicKeyDirectoryService', () => {
  let service: PublicKeyDirectoryService;
  let database: DatabaseService;

  const mockDatabase = {
    publicKey: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicKeyDirectoryService,
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<PublicKeyDirectoryService>(PublicKeyDirectoryService);
    database = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerKey', () => {
    const dto: RegisterKeyDto = {
      userId: 'user-123',
      publicKey: '-----BEGIN PUBLIC KEY-----\ntest-key\n-----END PUBLIC KEY-----',
      algorithm: 'RSA-OAEP',
    };

    it('should register a new public key successfully', async () => {
      const mockKey = {
        id: 'key-id-123',
        kid: 'key-abc123',
        publicKeyPem: dto.publicKey,
        algorithm: dto.algorithm,
        ownerId: dto.userId,
        sessionId: dto.userId,
        createdAt: new Date(),
      };

      mockDatabase.publicKey.create.mockResolvedValue(mockKey);

      const result = await service.registerKey(dto);

      expect(result.keyId).toBe('key-id-123');
      expect(result.userId).toBe(dto.userId);
      expect(result.algorithm).toBe(dto.algorithm);
      expect(result.fingerprint).toBeDefined();
      expect(database.publicKey.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          kid: expect.stringContaining('key-'),
          publicKeyPem: dto.publicKey,
          algorithm: dto.algorithm,
          ownerId: dto.userId,
        }),
      });
    });

    it('should throw ConflictException if key already exists', async () => {
      const mockError = { code: 'P2002' };
      mockDatabase.publicKey.create.mockRejectedValue(mockError);

      await expect(service.registerKey(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getKeyByKeyId', () => {
    it('should return key response dto when key exists', async () => {
      const mockKey = {
        id: 'key-id-123',
        kid: 'key-abc123',
        publicKeyPem: '-----BEGIN PUBLIC KEY-----\ntest-key\n-----END PUBLIC KEY-----',
        algorithm: 'RSA-OAEP',
        ownerId: 'user-123',
        sessionId: 'session-123',
        createdAt: new Date(),
      };

      mockDatabase.publicKey.findUnique.mockResolvedValue(mockKey);

      const result = await service.getKeyByKeyId('key-id-123');

      expect(result.keyId).toBe('key-id-123');
      expect(result.fingerprint).toBeDefined();
      expect(database.publicKey.findUnique).toHaveBeenCalledWith({
        where: { id: 'key-id-123' },
      });
    });

    it('should throw NotFoundException when key does not exist', async () => {
      mockDatabase.publicKey.findUnique.mockResolvedValue(null);

      await expect(service.getKeyByKeyId('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getKeyByUserId', () => {
    it('should return array of keys for user', async () => {
      const mockKeys = [
        {
          id: 'key-1',
          kid: 'key-abc1',
          publicKeyPem: '-----BEGIN PUBLIC KEY-----\nkey1\n-----END PUBLIC KEY-----',
          algorithm: 'RSA-OAEP',
          ownerId: 'user-123',
          sessionId: 'session-123',
          createdAt: new Date(),
        },
        {
          id: 'key-2',
          kid: 'key-abc2',
          publicKeyPem: '-----BEGIN PUBLIC KEY-----\nkey2\n-----END PUBLIC KEY-----',
          algorithm: 'AES-GCM',
          ownerId: 'user-123',
          sessionId: 'session-123',
          createdAt: new Date(),
        },
      ];

      mockDatabase.publicKey.findMany.mockResolvedValue(mockKeys);

      const result = await service.getKeyByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].keyId).toBe('key-1');
      expect(result[1].keyId).toBe('key-2');
      expect(database.publicKey.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no keys', async () => {
      mockDatabase.publicKey.findMany.mockResolvedValue([]);

      const result = await service.getKeyByUserId('user-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('revokeKey', () => {
    it('should delete key successfully', async () => {
      const mockKey = {
        id: 'key-id-123',
        kid: 'key-abc123',
        publicKeyPem: 'test-key',
        algorithm: 'RSA-OAEP',
        ownerId: 'user-123',
        sessionId: 'session-123',
        createdAt: new Date(),
      };

      mockDatabase.publicKey.findUnique.mockResolvedValue(mockKey);
      mockDatabase.publicKey.delete.mockResolvedValue(undefined);

      await service.revokeKey('key-id-123');

      expect(database.publicKey.delete).toHaveBeenCalledWith({
        where: { id: 'key-id-123' },
      });
    });

    it('should throw NotFoundException when revoking non-existent key', async () => {
      mockDatabase.publicKey.findUnique.mockResolvedValue(null);

      await expect(service.revokeKey('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateFingerprint', () => {
    it('should calculate SHA-256 fingerprint of public key', () => {
      const publicKey = '-----BEGIN PUBLIC KEY-----\ntest-key\n-----END PUBLIC KEY-----';
      const fingerprint = service.calculateFingerprint(publicKey);

      expect(fingerprint).toHaveLength(64);
      expect(fingerprint).toMatch(/^[a-f0-9]+$/);
    });

    it('should return consistent fingerprint for same key', () => {
      const publicKey = '-----BEGIN PUBLIC KEY-----\ntest-key\n-----END PUBLIC KEY-----';
      const fingerprint1 = service.calculateFingerprint(publicKey);
      const fingerprint2 = service.calculateFingerprint(publicKey);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should return different fingerprints for different keys', () => {
      const key1 = '-----BEGIN PUBLIC KEY-----\nkey1\n-----END PUBLIC KEY-----';
      const key2 = '-----BEGIN PUBLIC KEY-----\nkey2\n-----END PUBLIC KEY-----';
      
      const fingerprint1 = service.calculateFingerprint(key1);
      const fingerprint2 = service.calculateFingerprint(key2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });
});
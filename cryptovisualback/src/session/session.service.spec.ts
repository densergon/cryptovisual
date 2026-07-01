import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';

describe('SessionController', () => {
  let controller: SessionController;
  let service: SessionService;

  const mockDatabaseService = {
    handshakeSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        SessionService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const dto = { clientId: 'test-client', preferredKeySize: 2048 };
      const mockSession = {
        id: 'test-session-id',
        status: 'PENDING',
        challenge: 'abc123',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      mockDatabaseService.handshakeSession.create.mockResolvedValue(mockSession);

      const result = await service.createSession(dto);

      expect(result).toBeDefined();
      expect(result.sessionId).toBe('test-session-id');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('getSession', () => {
    it('should return session if exists', async () => {
      const mockSession = {
        id: 'test-session-id',
        status: 'PENDING',
        challenge: 'abc123',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      mockDatabaseService.handshakeSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.getSession('test-session-id');

      expect(result).toBeDefined();
      expect(result?.sessionId).toBe('test-session-id');
    });

    it('should return null if session not found', async () => {
      mockDatabaseService.handshakeSession.findUnique.mockResolvedValue(null);

      const result = await service.getSession('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('validateChallenge', () => {
    it('should return true for valid challenge', async () => {
      const mockSession = {
        id: 'test-session-id',
        challenge: 'abc123',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      mockDatabaseService.handshakeSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.validateChallenge('test-session-id', 'abc123');

      expect(result).toBe(true);
    });

    it('should return false for invalid challenge', async () => {
      const mockSession = {
        id: 'test-session-id',
        challenge: 'abc123',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      mockDatabaseService.handshakeSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.validateChallenge('test-session-id', 'wrong');

      expect(result).toBe(false);
    });
  });
});

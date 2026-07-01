import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit.service';
import { DatabaseService } from '../database/database.service';
import { CreateAuditLogDto } from './dto/audit.dto';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let database: DatabaseService;

  const mockDatabase = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    database = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    const dto: CreateAuditLogDto = {
      eventType: 'SESSION_CREATED',
      actorId: 'user-123',
      targetId: 'session-456',
      actionPayload: { sessionId: 'session-456' },
      details: { ip: '127.0.0.1' },
    };

    it('should create an audit log entry successfully', async () => {
      const mockLog = {
        id: 'audit-123',
        eventType: dto.eventType,
        actorId: dto.actorId,
        targetId: dto.targetId,
        actionPayload: dto.actionPayload,
        details: dto.details,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      mockDatabase.auditLog.create.mockResolvedValue(mockLog);

      const result = await service.log(dto);

      expect(result.id).toBe('audit-123');
      expect(result.eventType).toBe(dto.eventType);
      expect(result.actorId).toBe(dto.actorId);
      expect(database.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: dto.eventType,
          actorId: dto.actorId,
          targetId: dto.targetId,
        }),
      });
    });

    it('should handle audit log without optional fields', async () => {
      const minimalDto: CreateAuditLogDto = {
        eventType: 'KEY_GENERATED',
        actorId: 'user-123',
      };

      const mockLog = {
        id: 'audit-124',
        eventType: minimalDto.eventType,
        actorId: minimalDto.actorId,
        targetId: null,
        actionPayload: null,
        details: null,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      mockDatabase.auditLog.create.mockResolvedValue(mockLog);

      const result = await service.log(minimalDto);

      expect(result.eventType).toBe('KEY_GENERATED');
      expect(result.targetId).toBeUndefined();
    });
  });

  describe('getLogs', () => {
    it('should return all logs when no filters provided', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          eventType: 'SESSION_CREATED',
          actorId: 'user-123',
          targetId: 'session-456',
          actionPayload: null,
          details: null,
          timestamp: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'audit-2',
          eventType: 'KEY_GENERATED',
          actorId: 'user-123',
          targetId: null,
          actionPayload: null,
          details: null,
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ];

      mockDatabase.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getLogs();

      expect(result).toHaveLength(2);
      expect(database.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should filter by eventType', async () => {
      mockDatabase.auditLog.findMany.mockResolvedValue([]);

      await service.getLogs('SESSION_CREATED');

      expect(database.auditLog.findMany).toHaveBeenCalledWith({
        where: { eventType: 'SESSION_CREATED' },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should filter by date range', async () => {
      mockDatabase.auditLog.findMany.mockResolvedValue([]);
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await service.getLogs(undefined, undefined, startDate, endDate);

      expect(database.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });
  });

  describe('getLogById', () => {
    it('should return audit log by id', async () => {
      const mockLog = {
        id: 'audit-123',
        eventType: 'SESSION_CREATED',
        actorId: 'user-123',
        targetId: null,
        actionPayload: null,
        details: null,
        timestamp: new Date(),
        createdAt: new Date(),
      };

      mockDatabase.auditLog.findUnique.mockResolvedValue(mockLog);

      const result = await service.getLogById('audit-123');

      expect(result.id).toBe('audit-123');
      expect(database.auditLog.findUnique).toHaveBeenCalledWith({
        where: { id: 'audit-123' },
      });
    });

    it('should throw BadRequestException when log not found', async () => {
      mockDatabase.auditLog.findUnique.mockResolvedValue(null);

      await expect(service.getLogById('nonexistent')).rejects.toThrow(
        'Audit log with id nonexistent not found',
      );
    });
  });

  describe('getLogsByActor', () => {
    it('should return logs for specific actor', async () => {
      const mockLogs = [
        {
          id: 'audit-1',
          eventType: 'SESSION_CREATED',
          actorId: 'user-123',
          targetId: null,
          actionPayload: null,
          details: null,
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ];

      mockDatabase.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.getLogsByActor('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].actorId).toBe('user-123');
      expect(database.auditLog.findMany).toHaveBeenCalledWith({
        where: { actorId: 'user-123' },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });
    });

    it('should respect custom limit', async () => {
      mockDatabase.auditLog.findMany.mockResolvedValue([]);

      await service.getLogsByActor('user-123', 10);

      expect(database.auditLog.findMany).toHaveBeenCalledWith({
        where: { actorId: 'user-123' },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceMetricService } from './metrics.service';
import { DatabaseService } from '../database/database.service';
import { CreatePerformanceMetricDto } from './dto/metrics.dto';

describe('PerformanceMetricService', () => {
  let service: PerformanceMetricService;
  let database: DatabaseService;

  const mockDatabase = {
    performanceMetric: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceMetricService,
        {
          provide: DatabaseService,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<PerformanceMetricService>(PerformanceMetricService);
    database = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('record', () => {
    const dto: CreatePerformanceMetricDto = {
      operationType: 'RSA_KEYGEN',
      durationMs: 245.5,
      clientEnvironment: { browser: 'Chrome', version: '120.0' },
    };

    it('should record a performance metric successfully', async () => {
      const mockMetric = {
        id: 'metric-123',
        operationType: dto.operationType,
        durationMs: dto.durationMs,
        clientEnvironment: dto.clientEnvironment,
        recordedAt: new Date(),
      };

      mockDatabase.performanceMetric.create.mockResolvedValue(mockMetric);

      const result = await service.record(dto);

      expect(result.id).toBe('metric-123');
      expect(result.operationType).toBe(dto.operationType);
      expect(result.durationMs).toBe(dto.durationMs);
      expect(database.performanceMetric.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          operationType: dto.operationType,
          durationMs: dto.durationMs,
        }),
      });
    });
  });

  describe('getMetrics', () => {
    it('should return all metrics when no filters provided', async () => {
      const mockMetrics = [
        {
          id: 'metric-1',
          operationType: 'RSA_KEYGEN',
          durationMs: 245.5,
          clientEnvironment: null,
          recordedAt: new Date(),
        },
        {
          id: 'metric-2',
          operationType: 'AES_ENCRYPT',
          durationMs: 12.3,
          clientEnvironment: null,
          recordedAt: new Date(),
        },
      ];

      mockDatabase.performanceMetric.findMany.mockResolvedValue(mockMetrics);

      const result = await service.getMetrics();

      expect(result).toHaveLength(2);
      expect(database.performanceMetric.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { recordedAt: 'desc' },
        take: 100,
      });
    });

    it('should filter by operationType', async () => {
      mockDatabase.performanceMetric.findMany.mockResolvedValue([]);

      await service.getMetrics('RSA_KEYGEN');

      expect(database.performanceMetric.findMany).toHaveBeenCalledWith({
        where: { operationType: 'RSA_KEYGEN' },
        orderBy: { recordedAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('getSummary', () => {
    it('should calculate summary statistics for all operation types', async () => {
      const mockMetrics = [
        { operationType: 'RSA_KEYGEN', durationMs: 100, recordedAt: new Date() },
        { operationType: 'RSA_KEYGEN', durationMs: 200, recordedAt: new Date() },
        { operationType: 'RSA_KEYGEN', durationMs: 300, recordedAt: new Date() },
        { operationType: 'AES_ENCRYPT', durationMs: 10, recordedAt: new Date() },
        { operationType: 'AES_ENCRYPT', durationMs: 20, recordedAt: new Date() },
      ];

      mockDatabase.performanceMetric.findMany.mockResolvedValue(mockMetrics);

      const result = await service.getSummary();

      expect(result).toHaveLength(2);
      
      const rsaSummary = result.find(s => s.operationType === 'RSA_KEYGEN');
      expect(rsaSummary).toBeDefined();
      expect(rsaSummary?.count).toBe(3);
      expect(rsaSummary?.avgDurationMs).toBe(200);
      expect(rsaSummary?.minDurationMs).toBe(100);
      expect(rsaSummary?.maxDurationMs).toBe(300);

      const aesSummary = result.find(s => s.operationType === 'AES_ENCRYPT');
      expect(aesSummary).toBeDefined();
      expect(aesSummary?.count).toBe(2);
    });

    it('should filter summary by operationType', async () => {
      const mockMetrics = [
        { operationType: 'RSA_KEYGEN', durationMs: 100, recordedAt: new Date() },
        { operationType: 'RSA_KEYGEN', durationMs: 200, recordedAt: new Date() },
      ];

      mockDatabase.performanceMetric.findMany.mockResolvedValue(mockMetrics);

      const result = await service.getSummary('RSA_KEYGEN');

      expect(result).toHaveLength(1);
      expect(result[0].operationType).toBe('RSA_KEYGEN');
    });
  });

  describe('getMetricsByType', () => {
    it('should return metrics for specific operation type', async () => {
      const mockMetrics = [
        {
          id: 'metric-1',
          operationType: 'RSA_KEYGEN',
          durationMs: 245.5,
          clientEnvironment: null,
          recordedAt: new Date(),
        },
        {
          id: 'metric-2',
          operationType: 'RSA_KEYGEN',
          durationMs: 312.1,
          clientEnvironment: null,
          recordedAt: new Date(),
        },
      ];

      mockDatabase.performanceMetric.findMany.mockResolvedValue(mockMetrics);

      const result = await service.getMetricsByType('RSA_KEYGEN');

      expect(result).toHaveLength(2);
      expect(result.every(m => m.operationType === 'RSA_KEYGEN')).toBe(true);
      expect(database.performanceMetric.findMany).toHaveBeenCalledWith({
        where: { operationType: 'RSA_KEYGEN' },
        orderBy: { recordedAt: 'desc' },
        take: 100,
      });
    });

    it('should respect custom limit', async () => {
      mockDatabase.performanceMetric.findMany.mockResolvedValue([]);

      await service.getMetricsByType('RSA_KEYGEN', 10);

      expect(database.performanceMetric.findMany).toHaveBeenCalledWith({
        where: { operationType: 'RSA_KEYGEN' },
        orderBy: { recordedAt: 'desc' },
        take: 10,
      });
    });
  });
});
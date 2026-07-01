import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from '../api-key.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should allow access when a valid API key is provided', () => {
    const mockRequest = {
      headers: {
        'x-api-key': 'test-api-key',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException when API key is missing', () => {
    const mockRequest = {
      headers: {},
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when API key is invalid', () => {
    const mockRequest = {
      headers: {
        'x-api-key': 'wrong-key',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });
});

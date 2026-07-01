import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate: (config) => ({
            PORT: parseInt(config.PORT as string, 10) || 4000,
            CORS_ORIGIN:
              (config.CORS_ORIGIN as string) || 'http://localhost:3000',
            DATABASE_URL:
              (config.DATABASE_URL as string) ||
              'postgresql://user:password@localhost:5432/cryptovisual',
          }),
        }),
      ],
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(async () => {
    await service.$disconnect();
  });
});

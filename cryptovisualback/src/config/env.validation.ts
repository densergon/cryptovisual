export interface ValidatedEnv {
  PORT: number;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  API_KEY?: string;
  WS_PORT?: number;
  WS_ALLOWED_ORIGINS?: string;
  WS_API_KEY?: string;
  WS_PING_INTERVAL_MS?: number;
  WS_MAX_MISSED_PONGS?: number;
  WS_MAX_MESSAGE_SIZE?: number;
  WS_RATE_LIMIT_TOKENS?: number;
  WS_RATE_LIMIT_FILL_RATE?: number;
  WS_RATE_LIMIT_COST?: number;
  REDIS_URL?: string;
  AUDIT_RETENTION_DAYS?: number;
}

export function validateEnv(config: Record<string, unknown>): ValidatedEnv {
  const errors: string[] = [];

  const port = parseInt(config.PORT as string, 10);
  if (isNaN(port) || port < 1024 || port > 65535) {
    errors.push('PORT must be a number between 1024 and 65535');
  }

  if (!config.CORS_ORIGIN || typeof config.CORS_ORIGIN !== 'string') {
    errors.push('CORS_ORIGIN must be a valid origin string');
  }

  if (!config.DATABASE_URL || typeof config.DATABASE_URL !== 'string') {
    errors.push('DATABASE_URL is required');
  } else if (
    !config.DATABASE_URL.startsWith('postgresql://') &&
    !config.DATABASE_URL.startsWith('postgres://')
  ) {
    errors.push('DATABASE_URL must start with postgresql:// or postgres://');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return {
    PORT: port,
    CORS_ORIGIN: config.CORS_ORIGIN as string,
    DATABASE_URL: config.DATABASE_URL as string,
    API_KEY: config.API_KEY as string | undefined,
    WS_PORT: config.WS_PORT ? parseInt(config.WS_PORT as string, 10) : undefined,
    WS_ALLOWED_ORIGINS: config.WS_ALLOWED_ORIGINS as string | undefined,
    WS_API_KEY: config.WS_API_KEY as string | undefined,
    WS_PING_INTERVAL_MS: config.WS_PING_INTERVAL_MS ? parseInt(config.WS_PING_INTERVAL_MS as string, 10) : undefined,
    WS_MAX_MISSED_PONGS: config.WS_MAX_MISSED_PONGS ? parseInt(config.WS_MAX_MISSED_PONGS as string, 10) : undefined,
    WS_MAX_MESSAGE_SIZE: config.WS_MAX_MESSAGE_SIZE ? parseInt(config.WS_MAX_MESSAGE_SIZE as string, 10) : undefined,
    WS_RATE_LIMIT_TOKENS: config.WS_RATE_LIMIT_TOKENS ? parseInt(config.WS_RATE_LIMIT_TOKENS as string, 10) : undefined,
    WS_RATE_LIMIT_FILL_RATE: config.WS_RATE_LIMIT_FILL_RATE ? parseFloat(config.WS_RATE_LIMIT_FILL_RATE as string) : undefined,
    WS_RATE_LIMIT_COST: config.WS_RATE_LIMIT_COST ? parseInt(config.WS_RATE_LIMIT_COST as string, 10) : undefined,
    REDIS_URL: config.REDIS_URL as string | undefined,
    AUDIT_RETENTION_DAYS: config.AUDIT_RETENTION_DAYS ? parseInt(config.AUDIT_RETENTION_DAYS as string, 10) : undefined,
  };
}

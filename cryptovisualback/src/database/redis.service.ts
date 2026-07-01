import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private client: Redis | null = null;
	private subscriber: Redis | null = null;
	private publisher: Redis | null = null;
	private readonly logger = new Logger(RedisService.name);
	private readonly enabled: boolean;

	constructor() {
		this.enabled = !!process.env.REDIS_URL;
	}

	async onModuleInit() {
		if (!this.enabled) {
			this.logger.log('Redis not configured, skipping connection');
			return;
		}

		try {
			this.client = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: 3 });
			this.subscriber = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: 3 });
			this.publisher = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: 3 });

			await this.client.ping();
			this.logger.log('Redis connected successfully');
		} catch (error) {
			this.logger.error('Failed to connect to Redis', error);
			this.client = null;
			this.subscriber = null;
			this.publisher = null;
		}
	}

	async onModuleDestroy() {
		this.client?.disconnect();
		this.subscriber?.disconnect();
		this.publisher?.disconnect();
	}

	isEnabled(): boolean {
		return this.enabled && this.client !== null;
	}

	getClient(): Redis | null {
		return this.client;
	}

	async publish(channel: string, message: string): Promise<boolean> {
		if (!this.publisher) return false;
		try {
			await this.publisher.publish(channel, message);
			return true;
		} catch (error) {
			this.logger.error(`Failed to publish to channel ${channel}`, error);
			return false;
		}
	}

	async subscribe(channel: string, handler: (message: string) => void): Promise<boolean> {
		if (!this.subscriber) return false;
		try {
			await this.subscriber.subscribe(channel);
			this.subscriber.on('message', (ch, msg) => {
				if (ch === channel) {
					handler(msg);
				}
			});
			return true;
		} catch (error) {
			this.logger.error(`Failed to subscribe to channel ${channel}`, error);
			return false;
		}
	}
}
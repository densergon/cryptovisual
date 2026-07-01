import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { WebSocket, WebSocketServer } from 'ws';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IncomingMessage } from 'http';
import { parse } from 'querystring';
import { randomUUID } from 'crypto';
import { RedisService } from '../database/redis.service';
import { PrometheusService } from '../metrics/prometheus.service';

export interface PeerConnection {
	id: string;
	userId: string;
	status: 'connecting' | 'connected' | 'disconnected';
	connectedAt?: Date;
	metadata?: Record<string, unknown>;
}

export interface WebSocketMessage {
	type: 'handshake_init' | 'handshake_response' | 'key_exchange' | 'metadata' | 'error';
	payload: unknown;
	senderId: string;
	recipientId?: string;
	timestamp: Date;
}

interface TokenBucket {
	tokens: number;
	lastRefill: number;
}

@Injectable()
export class WebSocketGateway implements OnModuleInit, OnModuleDestroy {
	private wss: WebSocketServer;
	private peers: Map<string, { ws: WebSocket; connection: PeerConnection }> = new Map();
	private rateLimits: Map<string, TokenBucket> = new Map();
	private readonly port: number;
	private heartbeatInterval?: NodeJS.Timeout;
	private readonly logger = new Logger(WebSocketGateway.name);

	private readonly WS_ALLOWED_ORIGINS = process.env.WS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
	private readonly WS_API_KEY = process.env.WS_API_KEY || 'dev-secret-key';
	private readonly WS_PING_INTERVAL_MS = parseInt(process.env.WS_PING_INTERVAL_MS || '30000', 10);
	private readonly WS_MAX_MISSED_PONGS = parseInt(process.env.WS_MAX_MISSED_PONGS || '2', 10);
	private readonly WS_MAX_MESSAGE_SIZE = parseInt(process.env.WS_MAX_MESSAGE_SIZE || '65536', 10);
	private readonly processId: string;

	private readonly RATE_LIMIT_TOKENS = parseInt(process.env.WS_RATE_LIMIT_TOKENS || '100', 10);
	private readonly RATE_LIMIT_FILL_RATE = parseFloat(process.env.WS_RATE_LIMIT_FILL_RATE || '10');
	private readonly RATE_LIMIT_COST = parseInt(process.env.WS_RATE_LIMIT_COST || '1', 10);

	constructor(
		private eventEmitter: EventEmitter2,
		private redisService: RedisService,
		private prometheus: PrometheusService,
	) {
		this.port = parseInt(process.env.WS_PORT || '4001', 10);
		this.processId = randomUUID();
	}

	onModuleInit() {
		this.wss = new WebSocketServer({
			port: this.port,
			maxPayload: this.WS_MAX_MESSAGE_SIZE,
			perMessageDeflate: true,
			verifyClient: (info, callback) => {
				const origin = info.req.headers.origin;
				const query = parse(info.req.url?.split('?')?.[1] || '');
				const apiKey = query['api_key'] || info.req.headers['x-api-key'];

				const isOriginAllowed = !origin || this.WS_ALLOWED_ORIGINS.includes(origin);
				const isAuthValid = apiKey === this.WS_API_KEY;

				if (!isOriginAllowed) {
					return callback(false, 403, 'Forbidden: Origin not allowed');
				}
				if (!isAuthValid) {
					return callback(false, 401, 'Unauthorized: Invalid API Key');
				}

				callback(true);
			},
		});

		this.wss.on('connection', (ws, req: IncomingMessage) => {
			this.handleConnection(ws, req);
		});

		this.setupHeartbeat();
		this.setupRedisSubscription();

		this.logger.log(`WebSocket Gateway started on port ${this.port} [process: ${this.processId.slice(0, 8)}]`);
	}

	private setupHeartbeat() {
		this.wss.on('connection', (ws: any) => {
			ws.isAlive = true;
			ws.missedPongs = 0;
			ws.on('pong', () => {
				ws.isAlive = true;
				ws.missedPongs = 0;
			});
		});

		this.heartbeatInterval = setInterval(() => {
			this.wss.clients.forEach((ws: any) => {
				if (ws.isAlive === false) {
					if (ws.missedPongs >= this.WS_MAX_MISSED_PONGS) {
						this.logger.warn(`Terminating stale connection: too many missed pongs (${ws.missedPongs})`);
						return ws.terminate();
					}
					ws.missedPongs++;
				}

				ws.isAlive = false;
				ws.ping();
			});
		}, this.WS_PING_INTERVAL_MS);
	}

	onModuleDestroy() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}
		this.peers.forEach(({ ws }) => {
			ws.close(1000, 'Server shutting down');
		});
		this.peers.clear();
		this.rateLimits.clear();

		if (!this.wss) return;

		return new Promise<void>((resolve) => {
			this.wss.close(() => {
				this.logger.log('WebSocket Gateway closed');
				resolve();
			});
		});
	}

	private checkRateLimit(peerId: string): boolean {
		let bucket = this.rateLimits.get(peerId);
		const now = Date.now();

		if (!bucket) {
			bucket = { tokens: this.RATE_LIMIT_TOKENS, lastRefill: now };
			this.rateLimits.set(peerId, bucket);
		}

		const elapsed = (now - bucket.lastRefill) / 1000;
		bucket.tokens = Math.min(
			this.RATE_LIMIT_TOKENS,
			bucket.tokens + elapsed * this.RATE_LIMIT_FILL_RATE,
		);
		bucket.lastRefill = now;

		if (bucket.tokens >= this.RATE_LIMIT_COST) {
			bucket.tokens -= this.RATE_LIMIT_COST;
			return true;
		}

		return false;
	}

	private handleConnection(ws: WebSocket, req: IncomingMessage) {
		this.prometheus.incrementWsConnections();
		this.prometheus.activePeers.inc();
		ws.on('message', (data: Buffer) => {
			try {
				const message = JSON.parse(data.toString()) as WebSocketMessage;
				const senderId = message.senderId;

				if (senderId && !this.checkRateLimit(senderId)) {
					this.sendError(ws, 'Rate limit exceeded');
					return;
				}

				this.handleMessage(ws, message);
			} catch (error) {
				this.sendError(ws, 'Invalid message format');
			}
		});

		ws.on('close', () => {
			const peer = Array.from(this.peers.entries()).find(([_, p]) => p.ws === ws);
			if (peer) {
				this.handleDisconnect(peer[0]);
			}
		});

		ws.on('error', (error) => {
			this.logger.error('WebSocket error:', error);
			const connectionPeer = Array.from(this.peers.entries()).find(([_, p]) => p.ws === ws);
			if (connectionPeer) {
				this.handleDisconnect(connectionPeer[0]);
			}
		});
	}

	private handleMessage(ws: WebSocket, message: WebSocketMessage) {
		switch (message.type) {
			case 'handshake_init':
				this.handleHandshakeInit(ws, message);
				break;
			case 'handshake_response':
				this.handleHandshakeResponse(ws, message);
				break;
			case 'key_exchange':
				this.handleKeyExchange(ws, message);
				break;
			case 'metadata':
				this.handleMetadata(ws, message);
				break;
			default:
				this.sendError(ws, `Unknown message type: ${message.type}`);
		}
	}

	private emitToRedis(channel: string, data: any) {
		if (this.redisService.isEnabled()) {
			this.redisService.publish(channel, JSON.stringify(data)).catch((err) => {
				this.logger.error(`Failed to publish to Redis channel ${channel}`, err);
			});
		}
	}

	private handleHandshakeInit(ws: WebSocket, message: WebSocketMessage) {
		const startTime = Date.now();
		const { senderId, payload } = message;

		if (!senderId || !payload) {
			this.sendError(ws, 'Missing senderId or payload');
			return;
		}

		const peerConnection: PeerConnection = {
			id: senderId,
			userId: (payload as any).userId || senderId,
			status: 'connected',
			connectedAt: new Date(),
			metadata: payload as Record<string, unknown>,
		};

		this.peers.set(senderId, { ws, connection: peerConnection });
		this.prometheus.observeHandshakeDuration(Date.now() - startTime);

		this.send(ws, {
			type: 'handshake_response',
			payload: { status: 'accepted', peerId: senderId },
			senderId: 'server',
			recipientId: senderId,
			timestamp: new Date(),
		});

		this.eventEmitter.emit('peer.connected', peerConnection);
		this.emitToRedis('peer:connected', peerConnection);
	}

	private handleHandshakeResponse(ws: WebSocket, message: WebSocketMessage) {
		const { recipientId } = message;

		if (!recipientId) {
			this.sendError(ws, 'Missing recipientId');
			return;
		}

		const targetPeer = this.peers.get(recipientId);
		if (targetPeer) {
			this.send(targetPeer.ws, message);
			this.emitToRedis('peer:handshake_response', message);
			return;
		}

		this.publishToRedis(message);
	}

	private handleKeyExchange(ws: WebSocket, message: WebSocketMessage) {
		const startTime = Date.now();
		const { recipientId } = message;

		if (!recipientId) {
			this.sendError(ws, 'Missing recipientId for key exchange');
			return;
		}

		const targetPeer = this.peers.get(recipientId);
		if (targetPeer) {
			this.send(targetPeer.ws, message);
			const latency = Date.now() - startTime;
			this.prometheus.observePeerMessageLatency(latency);
			this.prometheus.peerLatency.observe(latency);

			const eventData = {
				senderId: message.senderId,
				recipientId,
				timestamp: message.timestamp,
			};
			this.eventEmitter.emit('peer.key_exchange', eventData);
			this.emitToRedis('peer:key_exchange', eventData);
			return;
		}

		this.publishToRedis(message);
	}

	private handleMetadata(ws: WebSocket, message: WebSocketMessage) {
		const { recipientId } = message;

		if (!recipientId) {
			this.sendError(ws, 'Missing recipientId for metadata');
			return;
		}

		const targetPeer = this.peers.get(recipientId);
		if (targetPeer) {
			this.send(targetPeer.ws, message);

			const eventData = {
				senderId: message.senderId,
				recipientId,
				metadata: message.payload,
				timestamp: message.timestamp,
			};
			this.eventEmitter.emit('peer.metadata_exchanged', eventData);
			this.emitToRedis('peer:metadata_exchanged', eventData);
			return;
		}

		this.publishToRedis(message);
	}

	private setupRedisSubscription() {
		if (!this.redisService.isEnabled()) return;

		this.redisService.subscribe('ws:message', (raw: string) => {
			try {
				const data = JSON.parse(raw);
				if (data._processId === this.processId) return;
				this.handleCrossProcessMessage(data.message);
			} catch (err) {
				this.logger.error('Failed to process cross-process message', err);
			}
		}).catch((err: Error) => {
			this.logger.error('Failed to subscribe to ws:message channel', err);
		});

		this.logger.log('Subscribed to ws:message channel for cross-process messaging');
	}

	private handleCrossProcessMessage(message: WebSocketMessage) {
		const recipientId = message.recipientId;
		if (!recipientId) return;

		const target = this.peers.get(recipientId);
		if (!target) return;

		this.send(target.ws, message);
		this.prometheus.observePeerMessageLatency(Date.now() - new Date(message.timestamp).getTime());
	}

	private publishToRedis(message: WebSocketMessage) {
		if (!this.redisService.isEnabled()) return;
		const envelope = JSON.stringify({ _processId: this.processId, message });
		this.redisService.publish('ws:message', envelope).catch((err: Error) => {
			this.logger.error('Failed to publish cross-process message', err);
		});
	}

	private handleDisconnect(peerId: string) {
		const peer = this.peers.get(peerId);
		if (peer) {
			peer.connection.status = 'disconnected';
			this.eventEmitter.emit('peer.disconnected', peer.connection);
			this.emitToRedis('peer:disconnected', peer.connection);
			this.peers.delete(peerId);
			this.rateLimits.delete(peerId);
			this.prometheus.decrementWsConnections();
			this.prometheus.activePeers.dec();
		}
	}

	send(ws: WebSocket, message: WebSocketMessage) {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message));
		}
	}

	sendTo(peerId: string, message: WebSocketMessage) {
		const peer = this.peers.get(peerId);
		if (peer) {
			this.send(peer.ws, message);
			return true;
		}
		return false;
	}

	broadcast(message: Omit<WebSocketMessage, 'recipientId'>) {
		this.peers.forEach(({ ws }) => {
			this.send(ws, message as WebSocketMessage);
		});
	}

	getPeer(peerId: string): PeerConnection | undefined {
		return this.peers.get(peerId)?.connection;
	}

	getConnectedPeers(): PeerConnection[] {
		return Array.from(this.peers.values()).map(({ connection }) => connection);
	}

	getStats() {
		return {
			connectedPeers: this.peers.size,
			peers: Array.from(this.peers.keys()),
		};
	}

	private sendError(ws: WebSocket, errorMessage: string) {
		this.send(ws, {
			type: 'error',
			payload: { error: errorMessage },
			senderId: 'server',
			timestamp: new Date(),
		});
	}
}

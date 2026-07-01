import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketGateway, WebSocketMessage } from '../websocket.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from '../../database/redis.service';
import { PrometheusService } from '../../metrics/prometheus.service';
import { WebSocket } from 'ws';

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketGateway,
        EventEmitter2,
        {
          provide: RedisService,
          useValue: {
            isEnabled: jest.fn().mockReturnValue(false),
            publish: jest.fn(),
            subscribe: jest.fn(),
          },
        },
        {
          provide: PrometheusService,
          useValue: {
            incrementWsConnections: jest.fn(),
            decrementWsConnections: jest.fn(),
            observeHandshakeDuration: jest.fn(),
            observePeerMessageLatency: jest.fn(),
            activePeers: { inc: jest.fn(), dec: jest.fn() },
            peerLatency: { observe: jest.fn() },
          },
        },
      ],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle handshake_init and register peer', async () => {
    const mockWs = {
      send: jest.fn(),
      on: jest.fn(),
      readyState: 1,
    } as unknown as WebSocket;

    const message: WebSocketMessage = {
      type: 'handshake_init',
      payload: { userId: 'user-123' },
      senderId: 'peer-123',
      timestamp: new Date(),
    };

    (gateway as any).handleMessage(mockWs, message);

    expect(gateway.getPeer('peer-123')).toBeDefined();
    expect(gateway.getPeer('peer-123')?.userId).toBe('user-123');
    expect(mockWs.send).toHaveBeenCalled();
  });

  it('should forward key_exchange messages', () => {
    const ws1 = { send: jest.fn(), on: jest.fn(), readyState: 1 } as unknown as WebSocket;
    const ws2 = { send: jest.fn(), on: jest.fn(), readyState: 1 } as unknown as WebSocket;

    (gateway as any).handleHandshakeInit(ws1, {
      type: 'handshake_init',
      payload: { userId: 'user-1' },
      senderId: 'peer-1',
      timestamp: new Date(),
    } as any);

    (gateway as any).handleHandshakeInit(ws2, {
      type: 'handshake_init',
      payload: { userId: 'user-2' },
      senderId: 'peer-2',
      timestamp: new Date(),
    } as any);

    const message: WebSocketMessage = {
      type: 'key_exchange',
      payload: { encryptedKey: 'abc' },
      senderId: 'peer-1',
      recipientId: 'peer-2',
      timestamp: new Date(),
    };

    (gateway as any).handleMessage(ws1, message);

    expect(ws2.send).toHaveBeenCalled();
  });

  it('should return error for unknown message type', () => {
    const mockWs = { send: jest.fn(), on: jest.fn(), readyState: 1 } as unknown as WebSocket;
    const message = { type: 'unknown', payload: {}, senderId: 'p1', timestamp: new Date() } as any;

    (gateway as any).handleMessage(mockWs, message);

    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('Unknown message type')
    );
  });
});

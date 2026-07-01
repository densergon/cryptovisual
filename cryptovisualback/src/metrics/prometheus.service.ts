import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Gauge, Histogram, Registry, Counter } from 'prom-client';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class PrometheusService implements OnModuleDestroy {
  private readonly logger = new Logger(PrometheusService.name);
  private readonly registry: Registry;

  public readonly wsConnections: Gauge<string>;
  public readonly handshakeDuration: Histogram<string>;
  public readonly peerMessageLatency: Histogram<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpRequestsTotal: Counter<string>;
  public readonly activePeers: Gauge<string>;
  public readonly peerLatency: Histogram<string>;

  constructor() {
    this.registry = new Registry();

    this.wsConnections = new Gauge({
      name: 'ws_connections_active',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    this.handshakeDuration = new Histogram({
      name: 'handshake_duration_ms',
      help: 'Duration of handshake operations in milliseconds',
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });

    this.peerMessageLatency = new Histogram({
      name: 'peer_message_latency_ms',
      help: 'Latency of peer message forwarding in milliseconds',
      buckets: [1, 5, 10, 25, 50, 100, 250, 500],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.activePeers = new Gauge({
      name: 'ws_active_peers',
      help: 'Number of currently connected peers',
      registers: [this.registry],
    });

    this.peerLatency = new Histogram({
      name: 'ws_peer_latency_ms',
      help: 'Message latency per peer in milliseconds',
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  incrementWsConnections(): void {
    this.wsConnections.inc();
  }

  decrementWsConnections(): void {
    this.wsConnections.dec();
  }

  observeHandshakeDuration(ms: number): void {
    this.handshakeDuration.observe(ms);
  }

  observePeerMessageLatency(ms: number): void {
    this.peerMessageLatency.observe(ms);
  }

  onModuleDestroy(): void {
    this.registry.clear();
  }
}

# K6 Load Tests

## Prerequisites

Install [k6](https://k6.io/docs/getting-started/installation/):

```bash
brew install k6
```

## WebSocket Load Test

Tests up to 10,000 concurrent WebSocket connections with handshake signaling.

### Usage

```bash
# Quick smoke test (local dev)
k6 run k6/websocket-load-test.js -e WS_URL=ws://localhost:4001

# Full load test against staging
k6 run k6/websocket-load-test.js \
  -e WS_URL=wss://staging.example.com:4001 \
  -e WS_API_KEY=your-api-key \
  --out json=results.json

# Output as summary + Prometheus
k6 run k6/websocket-load-test.js --out statsd
```

### Metrics Tracked

| Metric | Type | Description |
|---|---|---|
| `ws_connection_duration_ms` | Trend | Time to establish WebSocket connection |
| `ws_handshake_duration_ms` | Trend | Time from connect to handshake response |
| `ws_messages_received` | Counter | Total handshake responses received |
| `ws_connection_errors` | Counter | Failed connections |
| `ws_handshake_success_rate` | Rate | % of VUs that completed handshake |

### Thresholds

- Handshake success rate > 99%
- p95 connection time < 2s
- p95 handshake time < 5s
- Connection failure rate < 1%

### Load Profile

| Stage | Target VUs | Duration |
|---|---|---|
| Ramp-up | 100 | 10s |
| Ramp-up | 500 | 20s |
| Ramp-up | 1,000 | 30s |
| Ramp-up | 2,000 | 30s |
| Ramp-up | 5,000 | 30s |
| Ramp-up | 10,000 | 30s |
| Sustain | 10,000 | 60s |
| Ramp-down | 0 | 30s |

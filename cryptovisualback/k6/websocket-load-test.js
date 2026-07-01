import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

const connectionDuration = new Trend('ws_connection_duration_ms');
const handshakeDuration = new Trend('ws_handshake_duration_ms');
const messagesReceived = new Counter('ws_messages_received');
const connectionErrors = new Counter('ws_connection_errors');
const handshakeSuccess = new Rate('ws_handshake_success_rate');

export const options = {
  stages: [
    { target: 100, duration: '10s' },
    { target: 500, duration: '20s' },
    { target: 1000, duration: '30s' },
    { target: 2000, duration: '30s' },
    { target: 5000, duration: '30s' },
    { target: 10000, duration: '30s' },
    { target: 10000, duration: '60s' },
    { target: 0, duration: '30s' },
  ],
  thresholds: {
    ws_handshake_success_rate: ['rate>0.99'],
    ws_connection_duration_ms: ['p(95)<2000'],
    ws_handshake_duration_ms: ['p(95)<5000'],
    http_req_failed: ['rate<0.01'],
  },
};

const WS_URL = __ENV.WS_URL || 'ws://localhost:4001';
const API_KEY = __ENV.WS_API_KEY || 'dev-secret-key';

export default function () {
  const peerId = `loadtest-peer-${__VU}-${Date.now()}`;
  const userId = `loadtest-user-${__VU}`;
  const connectStart = Date.now();

  const url = `${WS_URL}?api_key=${API_KEY}`;

  const response = ws.connect(url, function (socket) {
    socket.on('open', function () {
      const connectTime = Date.now() - connectStart;
      connectionDuration.add(connectTime);

      socket.send(JSON.stringify({
        type: 'handshake_init',
        payload: { userId },
        senderId: peerId,
        timestamp: new Date().toISOString(),
      }));
    });

    socket.on('message', function (data) {
      const handshakeTime = Date.now() - connectStart;
      handshakeDuration.add(handshakeTime);
      messagesReceived.add(1);

      try {
        const msg = JSON.parse(data);
        if (msg.type === 'handshake_response' && msg.recipientId === peerId) {
          handshakeSuccess.add(true);
          socket.close();
        }
      } catch {
        // ignore parse errors
      }
    });

    socket.on('error', function (e) {
      connectionErrors.add(1);
      handshakeSuccess.add(false);
    });

    socket.on('close', function () {
      // connection closed
    });
  });

  check(response, {
    'status is 101': (r) => r && r.status === 101,
  });

  sleep(1);
}

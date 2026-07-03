# CryptoVisual Production Deployment Guide

## Overview

CryptoVisual is an educational web application demonstrating hybrid encryption (RSA + AES) through interactive visualizations. This guide covers production deployment, configuration, and monitoring.

## Quick Start (Docker Compose)

The fastest way to run the full stack locally:

```bash
# Start PostgreSQL, Redis, and backend
docker compose up --build -d

# Seed demo data (optional — creates sample session)
cd cryptovisualback && pnpm run demo:seed

# Start frontend
cd cryptovisualfull && pnpm install && pnpm run dev
```

This starts:
- **PostgreSQL 17** on port `5433`
- **Redis 7** on port `6379`
- **Backend API** on port `4000`
- **WebSocket** on port `4001`

> For production deployment, see the [Manual Deployment](#manual-deployment) section below.

---

## Manual Deployment
---

## Vercel Deployment (Monorepo)

You can deploy both frontend and backend from this repository using Vercel Services.

### Backend (NestJS)
1. Create a new project in Vercel.
2. Set the **Root Directory** to `cryptovisualback`.
3. Vercel uses the `vercel.json` in the backend directory to configure the serverless function entry point (`src/main.ts`).
4. Configure environment variables in the Vercel dashboard.

### Frontend (TanStack Start)
1. Create a new project in Vercel.
2. Set the **Root Directory** to `cryptovisualfull`.
3. Deploy as a standard TanStack Start project.
4. Configure environment variables (e.g., `VITE_API_URL`, `VITE_WS_URL`) to point to your deployed backend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   React 19  │  │   PixiJS v8  │  │  Web Workers    │   │
│  │   + TanStack│  │   + GSAP     │  │  (Web Crypto)   │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (3000)
                            │ WSS (4001)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Production Stack                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Nginx     │  │   NestJS 11  │  │   PostgreSQL 17 │   │
│  │   (Reverse  │  │   (API)      │  │   (Metadata)    │   │
│  │    Proxy)   │  └──────────────┘  └─────────────────┘   │
│  └─────────────┘         │                                  │
│                          │ Redis (Sessions)                 │
│                  ┌───────┴───────┐                          │
│                  │   ioredis     │                          │
│                  └───────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Node.js 20+ (LTS)
- pnpm 8.0+
- PostgreSQL 17
- Redis 7.0+
- Nginx (for reverse proxy)
- SSL certificates (Let's Encrypt recommended)

---

## Environment Configuration

### Backend (.env.production)

```bash
# Server
NODE_ENV=production
PORT=4000
WS_PORT=4001
CORS_ORIGIN=https://cryptovisual.example.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cryptovisual?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Security
API_KEY_HEADER=X-API-Key
API_KEYS=cryptovisual-prod-key-1,cryptovisual-prod-key-2

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json

# WebSocket
WS_ORIGIN=https://cryptovisual.example.com
WS_HEARTBEAT_INTERVAL=30000
```

### Frontend (.env.production)

```bash
# API
VITE_API_URL=https://api.cryptovisual.example.com
VITE_WS_URL=wss://api.cryptovisual.example.com:4001

# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id

# Feature Flags
VITE_ENABLE_SANDBOX=true
VITE_ENABLE_I18N=true
```

---

## Deployment Steps

### 1. Database Setup

```bash
# Install PostgreSQL 17
sudo apt-get install postgresql-17 postgresql-contrib-17

# Create database and user
sudo -u postgres psql
CREATE DATABASE cryptovisual;
CREATE USER cryptovisual_user WITH ENCRYPTED PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE cryptovisual TO cryptovisual_user;
\q

# Run migrations
cd cryptovisualback
pnpm prisma migrate deploy
pnpm prisma generate
```

### 2. Redis Setup

```bash
# Install Redis
sudo apt-get install redis-server

# Configure authentication
sudo nano /etc/redis/redis.conf
# Set: requirepass your-redis-password

# Restart Redis
sudo systemctl restart redis
```

### 3. Backend Build & Deploy

```bash
cd cryptovisualback

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm run build

# Run migrations
pnpm prisma migrate deploy

# Start with PM2
pm2 start dist/main.js --name cryptovisual-api --env production
pm2 save
pm2 startup
```

### 4. Frontend Build & Deploy

```bash
cd cryptovisualfull

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm run build

# Deploy dist/ to web server
# Example: Copy to Nginx web root
sudo cp -r dist/* /var/www/cryptovisual/
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/cryptovisual
server {
    listen 80;
    server_name cryptovisual.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cryptovisual.example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/cryptovisual.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cryptovisual.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    root /var/www/cryptovisual;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d cryptovisual.example.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## Monitoring & Alerting

### Health Checks

```bash
# API Health
curl https://api.cryptovisual.example.com/health

# Expected Response:
# {"status":"ok","timestamp":"2026-06-28T21:00:00.000Z"}
```

### PM2 Monitoring

```bash
# View logs
pm2 logs cryptovisual-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart cryptovisual-api
```

### Application Metrics

Backend exposes performance metrics via `/metrics` endpoint:

```bash
# Get metrics summary
curl https://api.cryptovisual.example.com/metrics/summary

# Filter by operation type
curl https://api.cryptovisual.example.com/metrics/type/RSA_KEYGEN
```

### Recommended Monitoring Stack

- **Uptime Monitoring**: UptimeRobot or Pingdom
- **Error Tracking**: Sentry
- **Performance**: New Relic or DataDog
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana) or Grafana Loki

---

## Security Hardening

### Rate Limiting

Backend includes built-in rate limiting:

```typescript
// Default: 100 requests per minute per IP
// Configured via RATE_LIMIT_TTL and RATE_LIMIT_MAX
```

### API Key Authentication

Protected endpoints require API key:

```bash
curl -H "X-API-Key: your-api-key" https://api.cryptovisual.example.com/protected-endpoint
```

### WebSocket Security

- Origin validation enabled
- Heartbeat mechanism (30s interval)
- Automatic disconnect for stale connections

### Content Security Policy

Update CSP header in Nginx config to match your requirements:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

---

## Backup Strategy

### Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U cryptovisual_user cryptovisual > /backups/cryptovisual_$DATE.sql
find /backups -name "cryptovisual_*.sql" -mtime +7 -delete
```

### Redis Backup

```bash
# Enable RDB persistence in redis.conf
save 900 1
save 300 10
save 60 10000
```

---

## Scaling Considerations

### Horizontal Scaling

- Deploy multiple API instances behind load balancer
- Use Redis for session sharing
- Database connection pooling via Prisma

### Vertical Scaling

- Increase Node.js process memory if needed
- Upgrade PostgreSQL instance for larger datasets
- Scale Redis based on session volume

### CDN

- Serve static assets via CDN (Cloudflare, CloudFront)
- Cache immutable assets (hash-based filenames)

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check DATABASE_URL
# Verify PostgreSQL is running: sudo systemctl status postgresql
# Check firewall: sudo ufw status
```

**2. WebSocket Connection Fails**
```bash
# Verify WS_PORT is open
# Check WS_ORIGIN matches frontend domain
# Test with wscat: wscat -c wss://api.cryptovisual.example.com/ws
```

**3. High Memory Usage**
```bash
# Monitor with PM2: pm2 monit
# Check for memory leaks in logs
# Consider increasing PM2 memory limit
```

### Log Locations

- **Backend**: `pm2 logs cryptovisual-api`
- **Nginx**: `/var/log/nginx/cryptovisual.example.com.log`
- **PostgreSQL**: `/var/log/postgresql/postgresql-17-main.log`
- **Redis**: `/var/log/redis/redis-server.log`

---

## Performance Optimization

### Frontend

- Code splitting enabled via Vite
- Lazy loading for routes
- Tree shaking for unused code
- Compression via gzip/brotli

### Backend

- Prisma query optimization
- Redis caching for sessions
- Database indexing on frequently queried fields
- Connection pooling

### Network

- HTTP/2 enabled
- Gzip compression for text assets
- Browser caching headers
- CDN for static assets

---

## Rollback Procedure

### Backend Rollback

```bash
# Revert database migration
pnpm prisma migrate resolve --rolled-back <migration-name>

# Deploy previous version
git checkout <previous-tag>
pnpm install
pnpm build
pm2 restart cryptovisual-api
```

### Frontend Rollback

```bash
# Deploy previous build
git checkout <previous-tag>
pnpm install
pnpm build
sudo cp -r dist/* /var/www/cryptovisual/
```

---

## Contact & Support

- **GitHub Issues**: https://github.com/your-org/cryptovisual/issues
- **Documentation**: https://cryptovisual.example.com/docs
- **Status Page**: https://status.cryptovisual.example.com

---

## Version Information

- **Frontend**: v1.0.0
- **Backend**: v1.0.0
- **Last Updated**: June 28, 2026
- **Sprint**: 8 (Production Ready)
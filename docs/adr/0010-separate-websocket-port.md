# ADR-0010 — Separate WebSocket Port

Date: Sprint 6

## Status

Accepted

## Context

REST API runs on port 4000. WebSocket could share the same port or use a separate one.

## Decision

Run WebSocket server on separate port 4001 (configurable via `WS_PORT` env var).

## Consequences

Independent scaling. Clear separation of concerns. Easier debugging. Additional port to manage in deployment.

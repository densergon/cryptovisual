# ADR-0009 — Native WebSocket over Socket.io

Date: Sprint 6

## Status

Accepted

## Context

Backend needs real-time communication. Socket.io is standard in NestJS but adds overhead.

## Decision

Use native `ws` library instead of Socket.io.

## Consequences

Lighter bundle (~50KB vs ~300KB). Simpler API. No automatic reconnection or room management — implement manually if needed. Better alignment with the native Web Crypto API philosophy.

# ADR-0008 — Zero-Knowledge Backend

Date: Sprint 1

## Status

Accepted

## Context

Backend needs to handle signaling and telemetry. Could store keys/messages or remain zero-knowledge.

## Decision

No private keys stored or transmitted. No message contents persisted. No encrypted payloads logged. All cryptography executes client-side in Web Workers. Backend is signaling + telemetry only.

## Consequences

Backend never has access to sensitive data. Architecturally accurate to real TLS. Simplifies security compliance. Backend modules are CRUD + metadata only.

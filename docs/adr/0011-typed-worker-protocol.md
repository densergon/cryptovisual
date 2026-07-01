# ADR-0011 — Typed Worker Protocol with Discriminated Unions

Date: Sprint 3

## Status

Accepted

## Context

Web Worker communication needs type safety across thread boundaries.

## Decision

Use discriminated union message protocol: `{ type: 'RSA_KEYGEN_REQUEST', payload: {...} }` → `{ type: 'RSA_KEYGEN_RESPONSE', payload: {...} }`. Every request carries a unique `requestId` for correlation.

## Consequences

Compile-time verification of message shapes. Better IDE support. Reduced runtime errors. `Transferable` objects for ArrayBuffer zero-copy transfer.

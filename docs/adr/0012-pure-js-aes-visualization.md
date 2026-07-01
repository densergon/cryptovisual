# ADR-0012 — Pure-JS AES for Visualization Only

Date: Sprint 4

## Status

Accepted

## Context

Web Crypto API is a black box — doesn't expose intermediate AES round data (SubBytes, ShiftRows, etc.) needed for visualization.

## Decision

Separate pure-JS AES implementation (`crypto-engine/aes-visual.ts`) for educational animation data extraction. Production encryption uses `crypto.subtle` exclusively.

## Consequences

Two AES codepaths: one for visualization (educational, not production-grade), one for actual encryption (secure, standards-compliant). Must be clearly separated and documented.

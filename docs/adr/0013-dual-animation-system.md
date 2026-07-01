# ADR-0013 — Two Animation Systems: Motion + GSAP

Date: Sprint 3

## Status

Accepted

## Context

DOM transitions and Canvas animations have different performance characteristics and APIs.

## Decision

**Motion** (formerly Framer Motion) for DOM page transitions and UI micro-interactions. **GSAP** for Canvas/PixiJS timeline animations (keygen, bitstream, AES matrix).

## Consequences

Strict boundary: Motion = DOM only, GSAP = Canvas only. No overlap. Additional dependency (GSAP) justified by timeline-based Canvas animation needs.

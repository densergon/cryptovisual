# ADR-0006 — Motion for DOM, GSAP for Canvas

Date: Sprint 2

## Status

Accepted

## Context

Need animation systems for both DOM transitions and Canvas animations.

## Decision

Use `motion` (formerly Framer Motion) for DOM animations. Use GSAP for Canvas/PixiJS timeline animations.

## Consequences

Strict boundary: Motion owns DOM, GSAP owns Canvas. No overlap. Two animation systems but with clear ownership boundaries.

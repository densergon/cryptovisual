# ADR-0003 — Design System Token Source

Date: Sprint 1

## Status

Accepted

## Context

Need a source of truth for design tokens that works with Tailwind CSS v4.

## Decision

Use CSS custom properties for the design system, consumed by Tailwind v4's `@theme` directive.

## Consequences

CSS custom properties are the single source of truth. Tailwind consumes them via `@theme`. No duplicate token definitions.

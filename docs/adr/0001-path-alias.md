# ADR-0001 — Path Alias Convention

Date: Sprint 1

## Status

Accepted

## Context

Both `#/*` and `@/*` mapped to `./src/*` in tsconfig, creating ambiguity.

## Decision

Use `@/*` as the canonical path alias. Remove `#/*` duplication.

## Consequences

Single import convention across the codebase. All imports use `@/` prefix.

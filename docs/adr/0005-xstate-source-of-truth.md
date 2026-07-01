# ADR-0005 — XState as Source of Truth for Wizard State

Date: Sprint 2

## Status

Accepted

## Context

Wizard state could be owned by TanStack Router (URL-based) or XState (state machine).

## Decision

XState machine is the source of truth. Router reflects XState state — never independently navigates to a guarded step.

## Consequences

XState provides richer semantics (guards, context, parallel states). Router `beforeLoad` guard checks machine state. URL is a projection of machine state.

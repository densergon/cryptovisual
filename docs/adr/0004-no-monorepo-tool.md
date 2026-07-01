# ADR-0004 — No Monorepo Tool

Date: Sprint 1

## Status

Accepted

## Context

Two projects (frontend + backend) in one repository. Turborepo and Nx are available options.

## Decision

Do NOT add a monorepo tool (Turborepo, Nx). Two projects is manageable with pnpm scripts.

## Consequences

Simpler configuration. No workspace orchestration overhead. May reconsider if shared packages are introduced.

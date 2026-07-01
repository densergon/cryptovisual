# ADR-0002 — Linting and Formatting Tool

Date: Sprint 1

## Status

Accepted

## Context

Need to choose between Biome, ESLint+Prettier, or a hybrid approach for linting and formatting.

## Decision

Use Biome exclusively (no ESLint, no Prettier). Biome handles both lint and format.

## Consequences

Single tool for linting and formatting. Faster than ESLint+Prettier. No plugin ecosystem but sufficient rules for this project.

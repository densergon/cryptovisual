# ADR-0007 — Imperative PixiJS, Not React Bindings

Date: Sprint 3

## Status

Accepted

## Context

PixiJS can be integrated via `@pixi/react` bindings or via imperative Canvas management.

## Decision

PixiJS runs imperatively. The `CanvasViewport` React component mounts a `<canvas>` ref and hands it to `VisualizationEngine`. React never touches PixiJS internals.

## Consequences

Full control over PixiJS lifecycle. No React-PixiJS abstraction leaks. Better performance. `@pixi/react` may lag behind PixiJS v8 API.

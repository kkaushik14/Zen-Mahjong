# ADR-001: Workspace architecture

- **Status:** Accepted for prototype foundation
- **Date:** 2026-09-25

## Context

The prototype must support extraction of components and game logic into future applications without coupling them to Expo Router screens.

## Decision

Use a pnpm workspace with one Expo app and focused packages for tokens, generic UI, Mahjong UI, game rules, persistence, shared types, and test utilities.

## Consequences

Package APIs and dependency directions are visible early. Initial setup is more structured than a single application directory, and workspace compatibility must be verified whenever native dependencies or Expo are upgraded.

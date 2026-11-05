# ADR-002: NoSQL persistence with MMKV

- **Status:** Accepted for prototype foundation; device validation required
- **Date:** 2026-09-25

## Context

The application is offline-first and stores a modest set of settings, progress, achievement, streak, and active-session documents. The user requested NoSQL storage and explicit justification before SQLite is introduced.

## Decision

Use `react-native-mmkv` behind repository interfaces. Store versioned document envelopes and keep persistence details out of feature and game-engine packages.

## Reliability measures

- Validate every restored envelope and domain payload.
- Maintain schema versions and ordered explicit migrations.
- Save monotonically increasing revisions with timestamps.
- Keep a previous valid snapshot for every repository document.
- Store profile, progress, achievements, and streaks atomically to avoid partial completion updates.
- Make completion idempotent by persisted session ID.
- Test termination, malformed data, migration, and restore scenarios on both platforms.

## Why not SQLite now?

The current records do not require joins, ad hoc queries, or multi-table transactions. SQLite would introduce relational schema and migration complexity without a demonstrated prototype requirement.

## SQLite adoption threshold

SQLite may be proposed when measured requirements include large searchable history, relational reporting, multi-record atomic transactions, or query patterns that key-value documents cannot support reliably. A new ADR must document evidence, alternatives, migration, rollback, and maintenance impact before adoption.

## Consequences

MMKV requires an Expo development build because it contains native code. The persistence package must remain replaceable, and web support requires a separate adapter if web becomes a release target.

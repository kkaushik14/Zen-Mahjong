# Zen Mahjong Prototype v0.3.0 Plan

## Status

The `v0.2.0` development line is the technical baseline. The `v0.3.0` roadmap covers enhancement, authoritative game rules, dual online/offline execution, and release-quality re-testing.

This document is an execution plan, not a source of confirmed game rules. Proposed behavior remains an assumption until it is moved to `DECISIONS.md` and reflected in acceptance tests.

## Phase objectives

1. Raise the visual quality of tiles, backgrounds, screens, modals, transitions, and feedback.
2. Finalize selection, stacking, Undo, Shuffle, Hint, limits, no-moves recovery, and rewards.
3. Make level completion feel calm, rewarding, and recognizably Zen without obscuring results or controls.
4. Add a server-authoritative execution path for account-backed play.
5. Preserve a separate, complete offline execution path that never depends on server availability.
6. Re-test behavior, accessibility, persistence, performance, and recovery on physical iOS and Android devices.

## Product modes

### Offline play

- The device is authoritative for the active game and local progression.
- Bundled levels, gameplay, settings, rewards, and recovery work without network access.
- MMKV remains the local document store behind repository interfaces.
- Offline progress is never silently merged into an account. Import requires an explicit, server-validated reconciliation flow.
- Features that intrinsically require a server, such as cross-device state, global events, or competitive rankings, are visibly unavailable rather than partially simulated.

### Account play

- The server is authoritative for account progression, reward balances, claimed rewards, remote content eligibility, and cross-device state.
- The client may optimistically animate a valid-looking move, but it must reconcile with the server response before committing account-owned state.
- Every command carries an idempotency key, session ID, expected revision, content version, and deterministic engine version.
- Server responses return the accepted revision and enough state or events for deterministic client reconciliation.
- Temporary network failure queues retryable commands only when their ordering and replay behavior are explicitly safe.

### Shared domain contract

Both modes use the same framework-independent commands and events:

```text
GameCommand -> ExecutionPort -> GameResult
                       |-> OfflineExecutor
                       |-> ServerExecutorClient
```

The UI must not contain separate matching rules for online and offline play. Authority, persistence, and reconciliation differ; game semantics do not.

## Proposed repository additions

```text
apps/
  mobile/                    Expo application
  game-server/               Proposed TypeScript API service
packages/
  game-engine/               Deterministic rules and state transitions
  game-content/              Versioned levels, tile sets, rewards, themes
  execution-contracts/       Commands, events, schemas, errors, revisions
  offline-executor/          Local authority and MMKV-backed outbox
  sync-client/               Authenticated transport and reconciliation
  mahjong-ui/                Tiles, board rendering, animation, modals
```

The server framework, hosting platform, authentication provider, and document database remain unselected. Selection requires a short ADR comparing operational cost, Expo integration, local development, schema validation, observability, backup, and migration behavior.

## Milestone 8: Rule and economy specification

### Work

- Confirm matching families, special flower/season behavior, and complete availability geometry.
- Define board generation, solvability guarantees, shuffle semantics, and no-moves recovery.
- Define Undo, Hint, and Shuffle limits, replenishment, costs, advertisements if any, and accessibility alternatives.
- Define score, stars, rewards, streaks, level progression, failure, replay, and reward claiming.
- Define which values are content configuration and which are engine invariants.
- Create versioned command, event, level, reward, and completion schemas.

### Exit criteria

- Every open gameplay question has a confirmed decision or remains visibly deferred.
- Examples cover first move, legal match, illegal match, blocked tile, Undo, Hint, Shuffle, no moves, win, retry, and duplicate completion.
- Unit tests express the confirmed rules before UI or server work depends on them.

## Milestone 9: Design enhancement

### Tiles

- Refine motif artwork at small and large sizes, color-blind differentiation, face texture, edge material, shadows, highlights, and disabled treatment.
- Add theme manifests so artwork, palette, depth, audio, and particle accents can change without branching gameplay code.
- Establish visual snapshots for available, blocked, pressed, selected, hinted, matching, removing, returning, and rewarded states.

### Background and pages

- Build quiet full-width environmental layers for each garden without reducing tile contrast.
- Enrich Home, level selection, Profile, Achievements, Settings, and Streaks with useful progression information rather than decorative cards.
- Use bitmap textures or illustrations where atmosphere is needed and SVG only for scalable interface or tile artwork.

### Modals and animation

- Add reusable Pause, Restart confirmation, No Moves, Reward, Level Complete, Offline Status, Sync Conflict, and Error modals.
- Define native-thread animation sequences for board entrance, selection, match, invalid match, Undo, Shuffle, reward reveal, and level completion.
- Every sequence has a Reduced Motion equivalent and cannot block input longer than its state transition requires.

### Exit criteria

- Approved screenshots pass at `360x800`, `390x844`, and `430x932`.
- Tiles remain identifiable without relying only on color.
- No background, particle, or transition interferes with tile hit targets or screen-reader order.
- Animation maintains the agreed frame-time threshold on both physical test devices.

## Milestone 10: Advanced game logic

### Work

- Replace prototype overlap logic with a documented tile-footprint and stacking model.
- Add a layout validator and deterministic solver used by tests and content tooling.
- Guarantee solvability at generation time or document the exact recovery contract.
- Implement selection state as an explicit interaction state machine.
- Implement confirmed limits and reward spending through typed commands rather than direct UI counters.
- Make Undo restore game state, costs, rewards, move counters, and analytics consistently.
- Make Shuffle preserve or regenerate solvability according to the confirmed rule.
- Make Hint deterministic for tests while allowing a product-defined selection strategy.

### Exit criteria

- Property tests exercise generated layouts and command invariants across many seeds.
- Illegal, duplicate, stale, and out-of-order commands cannot mutate authoritative state.
- Undo, Shuffle, and Hint produce identical domain results in offline and server executors.

## Milestone 11: Zen level-clear presentation

### Proposed sequence

1. The final pair resolves without immediately replacing the board.
2. The garden responds with restrained environmental motion, sound, and haptic feedback.
3. A Zen object advances, such as a lotus opening, stones balancing, a lantern lighting, or a garden path extending.
4. Results show score, rewards, newly unlocked content, and streak impact.
5. Clear actions offer Continue, Replay, and Home.

### Rules

- No unskippable long celebration.
- No quote is presented as authentic cultural teaching without reviewed attribution.
- Reward results remain readable with sound disabled and Reduced Motion enabled.
- Completion remains idempotent if the app terminates at any point in the sequence.

## Milestone 12: Server-authoritative execution

### Services

- Authentication and device/session registration.
- Versioned content delivery and minimum-supported-client policy.
- Game-session creation, command validation, deterministic execution, and snapshots.
- Account progression, reward ledger, claims, achievements, and streak calculations.
- Idempotency storage, rate limiting, structured audit events, metrics, and tracing.

### Reliability and security

- Validate all payloads at the API boundary; never trust client-computed rewards or completion.
- Store append-only reward ledger entries and derive balances from accepted transactions or verified snapshots.
- Use optimistic concurrency through expected revisions.
- Encrypt transport and secrets, minimize personal data, and document retention/deletion behavior.
- Back up server data and test restoration before production use.

### NoSQL position

A document database is the current assumption because sessions, snapshots, content, and player progression fit versioned aggregate documents. Reward ledgers and idempotency records may require transactional guarantees. If measurements show that relational transactions or queries are necessary, SQLite is still not the server answer; a separate ADR must compare an appropriate server relational database with document-store transactions. Device SQLite remains excluded until the threshold in `ADR-002` is met.

## Milestone 13: Offline execution and synchronization

### Work

- Keep offline sessions under a separate local authority identifier.
- Persist commands, snapshots, content version, engine version, and completion receipts.
- Define explicit transitions between Offline Play and Account Play.
- Add network-state indicators that describe impact without interrupting local play.
- Implement retry, backoff, deduplication, stale-revision handling, and user-visible conflict resolution.
- Test account sign-out, account switching, device clock changes, reinstall, expired credentials, content upgrades, and partial synchronization.

### Default conflict policy

Until confirmed, do not perform field-level last-write-wins merges. Preserve both valid histories, ask the server for a reconciliation result, and require user choice when neither history can be safely subsumed.

## Milestone 14: Enhancement re-test and release gate

### Automated coverage

- Engine unit, property, solver, and fixture tests.
- Command-schema and client/server contract tests.
- Repository migration, corruption, idempotency, and replay tests.
- UI component, navigation, modal, and accessibility tests.
- Server integration, authorization, concurrency, rate-limit, and backup-restore tests.
- Offline/online transition, retry, conflict, and chaos-network tests.

### Device coverage

- Physical iPhone and OnePlus Nord 2 5G.
- Fresh install, upgrade, airplane-mode first launch, background termination, low storage, low power, interrupted completion, and reinstall.
- VoiceOver, TalkBack, large text, display zoom, contrast, and Reduced Motion.
- Cold launch, board load, selection response, animation frame pacing, memory, battery, and thermal checks on 36-, 72-, and target maximum-tile boards.

### Release gate

- No crash, data loss, duplicate reward, inaccessible critical action, irrecoverable sync conflict, or server dependency in Offline Play.
- Online commands are authenticated, authorized, idempotent, revision-checked, and observable.
- Product, design, accessibility, engineering, and device-QA acceptance criteria are recorded and passed.

## Recommended execution order

1. Complete Milestone 8 before implementing limits, rewards, or server mutations.
2. Develop Milestones 9 and 10 in parallel once their state contracts are stable.
3. Build Milestone 11 on the confirmed completion and reward events.
4. Implement Milestones 12 and 13 against the same execution contracts.
5. Run Milestone 14 continuously, with the final physical-device matrix after feature freeze.

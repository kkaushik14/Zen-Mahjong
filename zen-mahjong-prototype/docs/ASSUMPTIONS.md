# Assumptions

No assumption in this file is a final product rule. A confirmed item must move to `DECISIONS.md`, and affected acceptance criteria and tests must be updated.

## ASM-001: Product identity

- **Status:** Proposed
- **Assumption:** The product is named **Zen Mahjong Prototype**. `v0.1.0` is the initial prototype and `v0.2.0` is the current development line.
- **Reason:** Requested project naming and version.
- **Impact if incorrect:** App metadata, package names, and release records change.
- **Validation needed:** Confirm public store name and platform identifiers before signing.

## ASM-002: Platforms

- **Status:** Proposed
- **Assumption:** iOS and Android phones are primary. Web is a development convenience, not a release target.
- **Reason:** The supplied designs target mobile frames.
- **Impact if incorrect:** Navigation, storage, interaction, and QA scope expand.
- **Validation needed:** Confirm tablet and web requirements.

## ASM-003: Offline independence

- **Status:** Confirmed in `DEC-007`
- **Assumption:** Installation through a store aside, first launch and all gameplay capabilities that do not inherently require a server work without an internet connection.
- **Reason:** Explicit correction in the rules context.
- **Impact if incorrect:** Data ownership and startup flows change.
- **Validation needed:** Confirm whether any future content download is mandatory.

## ASM-004: Mahjong rules

- **Status:** Proposed
- **Assumption:** The game is Mahjong Solitaire: two matching, currently available tiles can be removed.
- **Reason:** Current designs and terminology.
- **Impact if incorrect:** The game engine and board representation change substantially.
- **Validation needed:** Confirm matching groups, availability geometry, special tiles, and win conditions.

## ASM-005: Session controls

- **Status:** Proposed
- **Assumption:** Undo reverses the latest accepted move; Hint identifies one legal pair; Shuffle rearranges remaining tiles; Restart restores the level's initial state.
- **Reason:** Controls shown in the design context.
- **Impact if incorrect:** History, solvability, and persistence models change.
- **Validation needed:** Confirm limits, costs, confirmation prompts, and solvability guarantees.

## ASM-006: Local persistence

- **Status:** Proposed
- **Assumption:** MMKV stores versioned local documents for settings, profile, progress, achievements, streaks, and active sessions.
- **Reason:** Requested NoSQL storage and modest prototype data volume.
- **Impact if incorrect:** Storage adapter and migration strategy change.
- **Validation needed:** Validate restore reliability on physical iOS and Android devices.

## ASM-007: State ownership

- **Status:** Proposed
- **Assumption:** Pure game state belongs to `game-engine`; temporary view state remains in components; persisted documents are accessed through repositories.
- **Reason:** Testability and reuse across future applications.
- **Impact if incorrect:** Package boundaries and APIs change.
- **Validation needed:** Review after the first complete level flow.

## ASM-008: Visual direction

- **Status:** Proposed
- **Assumption:** The sage, ivory, jade, gold, botanical, restrained visual system from the supplied design artifacts remains the prototype baseline.
- **Reason:** Existing production design export.
- **Impact if incorrect:** Tokens and visual assets change without affecting the engine.
- **Validation needed:** Visual review against the Figma source on target devices.

## ASM-009: Accessibility

- **Status:** Proposed
- **Assumption:** Controls use at least 44-point targets, tile state is not color-only, screen-reader labels describe tile identity and availability, and reduced motion is supported.
- **Reason:** Supplied design accessibility requirements.
- **Impact if incorrect:** Interaction components and QA criteria change.
- **Validation needed:** VoiceOver and TalkBack device review.

## ASM-010: Native project ownership

- **Status:** Proposed
- **Assumption:** Expo Continuous Native Generation owns `ios/` and `android/`; generated native directories are not committed.
- **Reason:** Reduces native drift while native customizations remain configuration-driven.
- **Impact if incorrect:** Native directories and review responsibilities enter source control.
- **Validation needed:** Revisit before adding custom native code.

## ASM-011: Prototype gameplay ruleset

- **Status:** Implemented for prototype validation; not confirmed as final product behavior
- **Assumption:** A tile occupies a unit-square footprint at an integer or fractional grid position. It is unavailable when a higher tile overlaps its footprint and horizontally open when at least one side has no touching same-layer tile with overlapping row footprint. Matching uses explicit data-driven groups. Hint returns the first legal pair in board order. Shuffle deterministically redistributes remaining tiles across remaining positions without guaranteeing solvability. Restart restores the original fixture, and a nonempty board without a legal pair is stalled.
- **Reason:** Milestone 3 needs deterministic, testable behavior while the final geometry, special-tile, economy, and recovery rules remain unresolved.
- **Impact if incorrect:** The availability strategy, shuffle policy, hint selection, and stalled-board flow can be replaced without changing the UI or persistence boundaries.
- **Validation needed:** Resolve open questions 1-5 and 11 before calling gameplay rules final.

## ASM-012: Playable prototype session

- **Status:** Implemented legacy runtime behavior; superseded by planned `v0.2.0` Concentration requirements
- **Assumption:** New legacy-flow sessions use the 36-tile `garden-two` fixture while older `garden-one` sessions remain restorable. Undo, Hint, Shuffle, and Restart are unlimited; Restart acts immediately; an invalid second selection becomes the new selected tile; and completion reports pairs, hints, and shuffles without calculating score. Active session state persists locally.
- **Reason:** These behaviors provide a complete testable loop without inventing economy, confirmation, scoring, or persistence rules that remain unresolved.
- **Impact if incorrect:** Control limits, prompts, feedback, completion metrics, and session ownership will change while the engine and board component remain reusable.
- **Validation needed:** Replace this interaction only after the Concentration session schema, migration, recovery, and acceptance tests are ready.

## ASM-013: Local progress model

- **Status:** Implemented for prototype validation; not confirmed as final product behavior
- **Assumption:** The prototype has one local profile. Settings are one document, profile/progress/achievements/streaks are one atomic player-state document, and the active game is a separate recoverable document. A completed board advances one garden, adds matched pairs, unlocks the four visible prototype achievements, and records one active day using the device's local calendar date. Multiple completions on one date do not extend the streak, and duplicate completion of the same session ID is ignored.
- **Reason:** This model gives offline recovery and internally consistent progress without requiring relational queries or a server.
- **Impact if incorrect:** Profile ownership, achievement catalog, streak boundaries, progression, and document boundaries may change. Repository interfaces and migrations isolate those changes from UI components.
- **Validation needed:** Resolve open questions 6-9 and test clock changes, time-zone travel, termination, and storage pressure on physical devices.

## ASM-014: Dual-device development topology

- **Status:** Proposed for device QA; not yet physically validated
- **Assumption:** One iPhone and one Android phone connect to the same Expo development server at the same time after a development build is installed on each device. Each installation owns independent local MMKV data; device-to-device synchronization is outside `v0.2.0` and planned in the `v0.3.0` roadmap.
- **Reason:** This provides simultaneous platform coverage without adding a server or changing the offline-first product boundary.
- **Impact if incorrect:** The QA workflow, development-build distribution, or storage ownership model must change.
- **Validation needed:** Install on both physical devices, connect both clients to one Metro server, and complete the runbook in `DEVICE-QA.md`.

## ASM-015: Android test-device compatibility

- **Status:** Partially confirmed; installation remains blocked
- **Assumption:** The OnePlus Nord 2 5G test phone running Android 13/OxygenOS 13.0 has enough free space for the 283 MB development APK plus installation overhead and has no conflicting installation of `com.zenmahjong.prototype` signed with different credentials.
- **Reason:** The EAS build completed successfully, while Android rejected the downloaded APK as an invalid package.
- **Impact if incorrect:** A conflicting package must be removed, insufficient storage must be freed, or an incomplete download must be replaced. Android version incompatibility is no longer a suspected cause.
- **Validation needed:** Retry using the clean-install checklist in `DEVICE-QA.md`, then use a fresh EAS build and ADB package-manager output if Android still rejects the APK.

## ASM-016: Visual tile system and board scale

- **Status:** Implemented for prototype validation; not confirmed as final art direction
- **Assumption:** A reusable 2.5D tile built from React Native views and custom SVG motifs provides sufficient depth and visual quality without a 3D engine. The Garden II prototype uses nine motif groups, four matching tiles per group, 36 tiles across three layers, native-thread selection/hint/removal/repositioning animation, and static state changes when Reduced Motion is enabled.
- **Reason:** This approach keeps artwork themeable, accessible, and performant while preserving the pure game-engine and reusable UI-package boundaries.
- **Impact if incorrect:** Motif artwork, material rendering, depth geometry, animation timing, and board density can change without replacing persistence or the matching engine. A move to true 3D would require a different rendering and interaction layer.
- **Validation needed:** Review motif legibility, color meaning, animation comfort, touch accuracy, and frame pacing on the physical iOS and Android test devices before treating the visual system as final.

## ASM-017: Dual execution modes

- **Status:** Proposed for `v0.3.0`; direction confirmed, detailed behavior unresolved
- **Assumption:** Offline Play and Account Play use the same deterministic commands and game rules through separate execution adapters. The device is authoritative for offline sessions, while the server is authoritative for account sessions and account-owned progression.
- **Reason:** Separate offline execution is required alongside server-based execution without duplicating gameplay semantics in the presentation layer.
- **Impact if incorrect:** Authority boundaries, persistence, UI status, command handling, and conflict behavior must be redesigned.
- **Validation needed:** Confirm whether local progress can be imported into an account and which features are unavailable offline.

## ASM-018: Server-owned economy

- **Status:** Proposed for `v0.3.0`; not confirmed
- **Assumption:** Reward balances, reward claims, paid or scarce actions, remote events, and account progression are calculated and validated by the server in Account Play. The client never supplies an authoritative reward result.
- **Reason:** Prevents duplicate claims, replay abuse, and cross-device balance divergence.
- **Impact if incorrect:** A client-authoritative economy would need a documented trust and reconciliation model.
- **Validation needed:** Confirm reward types, whether monetization exists, fraud-risk expectations, and offline earning rules.

## ASM-019: Server persistence direction

- **Status:** Proposed; vendor unselected
- **Assumption:** Server sessions and player aggregates begin in a transactional document database, while append-only reward and audit records use guarantees sufficient for idempotent writes and concurrency control.
- **Reason:** This preserves the requested NoSQL direction while recognizing that account economy and command replay require stronger guarantees than uncoordinated document replacement.
- **Impact if incorrect:** Storage schemas, transaction boundaries, deployment operations, backup, and migration plans change.
- **Validation needed:** Create an ADR comparing candidate server databases and measured query/transaction requirements before implementation.

## ASM-020: Control limits and rewards

- **Status:** Partially resolved; only confirmed values may be encoded
- **Assumption:** Identity/Super Concentration included uses are Normal `2`, High Concentration `1`, and Super Concentration `0`. First and second Concentration Score revives cost `10` and `15`. Undo, Hint, Shuffle, Special Relaxation, later revives, cooldowns, purchases, and broader reward limits remain unresolved.
- **Reason:** The newer rule context confirms a narrow set of help and revive values while leaving the general assist economy undefined.
- **Impact if incorrect:** Premature counters or economy code would leak assumptions into persistence, UI, tests, and server contracts.
- **Validation needed:** Resolve the remaining `v0.2.0` questions and the `v0.3.0` Milestone 8 decisions before implementing broader limits or reward spending.

## ASM-021: Enhanced visual direction

- **Status:** Proposed for design review
- **Assumption:** The enhanced experience remains calm and garden-focused, adds richer tile materials and environmental art, and uses restrained Zen-themed completion objects rather than long or highly stimulating celebrations.
- **Reason:** Extends the accepted prototype language while meeting the request for richer pages, backgrounds, pop-ups, animations, and level-clear presentation.
- **Impact if incorrect:** Theme manifests and component boundaries remain reusable, but visual assets, motion choreography, audio, and completion scenes change.
- **Validation needed:** Approve representative tile, gameplay, modal, and level-clear compositions before producing the full asset set.

## ASM-022: Concentration session migration

- **Status:** Proposed for `v0.2.0`; implementation pending
- **Assumption:** Existing active sessions using direct two-tile selection remain restorable, while new Concentration Tray sessions use a new versioned session schema containing ordered tray entries, special-slot uses, revive count, and assist/ad metrics.
- **Reason:** The new interaction changes authoritative session state and cannot safely reuse the old payload shape without migration or explicit compatibility handling.
- **Impact if incorrect:** Existing local sessions could be discarded or interpreted incorrectly during upgrade.
- **Validation needed:** Define the new schema, migration/fallback behavior, and upgrade acceptance tests before enabling the Concentration Tray by default.

## ASM-023: Concentration design source

- **Status:** Reported by the Design task; detailed QA unverified
- **Assumption:** The production Figma file contains an editable `Concentration System · Screen Design Updates` section with 21 screens and reusable component states.
- **Reason:** The Design task reports successful creation but could not complete detailed visual QA or local export because desktop control was interrupted.
- **Impact if incorrect:** Implementation could target missing, incomplete, or visually inconsistent frames.
- **Validation needed:** Inspect the Figma section directly and export refreshed local review assets before design sign-off.

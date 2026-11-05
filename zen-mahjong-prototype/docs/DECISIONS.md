# Confirmed decisions

Only user-confirmed decisions belong here.

## DEC-001: Framework

- React Native with Expo.

## DEC-002: Repository intent

- Use a structured, component-based repository that can export reusable packages to future applications.

## DEC-003: Persistence direction

- Use NoSQL persistence by default. Any adoption of SQLite requires a written explanation of why it is necessary.

## DEC-004: Initial version

- Prototype version is `0.1.0` and release label is `v0.1.0`.

## DEC-005: v0.3.0 roadmap direction

- The `v0.2.0` development line is the technical baseline for the seven-milestone `v0.3.0` enhancement and re-test roadmap.
- The `v0.3.0` roadmap covers design enhancement, finalized game controls and rewards, Zen level-clear presentation, server-based execution, and a separate complete offline execution path.
- Detailed rules, service vendors, limits, reward values, and synchronization policy remain unresolved and are not confirmed by this direction alone.

## DEC-006: Current development version

- The current project and application development version is `0.2.0`.
- `v0.2.0` captures the imported Concentration-system requirements and design handoff without claiming those unimplemented mechanics are release-complete.
- The existing seven-milestone roadmap is assigned to `v0.3.0` with no scope or ordering change.

## DEC-007: Offline independence

- Offline gameplay is independent and supports every capability that does not inherently require a server.
- Initial setup and ordinary gameplay must not require an internet connection.
- Concentration Score revival is available online and offline; reward-ad actions require network and ad-service availability.

## DEC-008: Concentration Tray direction

- The planned interaction replaces selected-tile highlighting with four ordered regular Concentration Tray slots and one separate Identity/Super Concentration slot.
- Matching tray tiles resolve automatically; four different unmatched regular tiles create a blocked state.
- Included special-slot uses are Normal `2`, High Concentration `1`, and Super Concentration `0`; Special Relaxation remains unresolved.

## DEC-009: Planned revival and score model

- Blocked-tray recovery offers a reward-ad path when available and a Concentration Score path online or offline.
- The first and second score-funded revives in one game cost `10` and `15` Concentration Score respectively.
- Zen Score, milestone, and eight-level tier requirements are accepted as planned behavior, but unresolved precedence, timing, placement, and rounding rules block implementation.

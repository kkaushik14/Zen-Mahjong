# Milestones

## Milestone 1: Repository foundation

- **Status:** Complete
- Expo SDK 57 application and pnpm workspace
- Strict TypeScript, linting, formatting, tests, EAS profiles, and VS Code review tasks
- Pure TypeScript game-engine boundary
- MMKV NoSQL adapter behind repository contracts
- Assumption, decision, environment, and offline documentation

Physical iOS and Android validation remains a device task. A local iOS Simulator development build and an Android EAS development build now pass compilation.

## Milestone 2: Design system and static screens

- **Status:** Complete
- Reusable tokens, action buttons, cards, metrics, progress, settings rows, status pills, and Mahjong tiles
- Home, Gameplay, Profile, Settings, Loading, Completion, Achievements, and Streaks routes
- Component gallery for visual review
- Responsive targets: `360x800`, `390x844`, and `430x932`
- Accessibility roles and labels for interactive controls

## Milestone 3: Gameplay engine

- **Status:** Complete under documented prototype assumptions
- Availability geometry, matching groups, board fixtures, hints, shuffle, no-moves detection, deterministic restart, and expanded tests
- Final product behavior remains subject to the related questions in `OPEN-QUESTIONS.md`

## Milestone 4: Playable board

- **Status:** Complete under documented prototype assumptions
- Engine-backed layered board rendering, selection feedback, subtle motion, session controls, live status, and completion flow
- Verified at `360x800`, `390x844`, and `430x932`

## Milestone 5: Persistence and progress

- **Status:** Complete under documented prototype assumptions
- Active-session recovery, persisted settings, atomic player progress, achievements, local-day streaks, migrations, and previous-snapshot corruption recovery
- Browser lifecycle verified across session reload, completion, progress reload, and settings reload
- Physical-device termination and storage-pressure validation remains in Milestone 6

## Milestone 6: Device QA

- **Status:** Partially complete; iOS Simulator build/install passes, physical-device validation remains pending
- Expo Doctor 21/21, iOS and Android Hermes bundles, responsive layout, browser accessibility geometry, loaded-app offline operation, persistence, and runtime-log checks pass
- Profile touch targets found during QA were corrected to the 44-point minimum
- Android EAS build passes, but installation on the Android 13 OnePlus Nord 2 5G is blocked by an invalid-package result; clean-download, package-conflict, and installer-state checks remain
- Physical iOS installation, VoiceOver/TalkBack, termination recovery, audio/haptics, and native performance profiling remain pending
- See `DEVICE-QA.md` for the dual-device setup and exit criteria

## Milestone 7: Visual tile system and scalable boards

- **Status:** First implementation complete under documented prototype assumptions
- Nine reusable, color-coded garden motifs rendered as scalable SVG components
- Layered 2.5D tile material with face highlight, physical depth, shadow, selection lift, hint pulse, match exit, undo entrance, and shuffle repositioning
- Pure responsive board-geometry module with support for fractional coordinates and multi-layer bounds
- Availability rules upgraded to detect overlapping higher tiles and side contact on fractional grids
- Garden II adds a deterministically solvable 36-tile, three-layer fixture while restored Garden I sessions remain compatible
- Reduced Motion bypasses movement while preserving selected, hinted, blocked, and available state styling
- iPhone 18 Pro simulator rendering passes initial visual inspection; physical iOS and Android frame pacing and touch accuracy remain part of device QA

## v0.2.0: Concentration system requirements and design

- **Status:** Requirements and screen handoff imported; runtime implementation pending
- Project, app, runtime, and reusable workspace packages target version `0.2.0`
- Concentration Tray, special-slot, revive, Zen Score, progress, and eight-level tier requirements are recorded without filling unresolved rules
- Concentration gameplay, recovery, completion, progression, and accessibility screen states are recorded separately from game logic
- Existing `v0.1.0` gameplay remains the runtime compatibility baseline until versioned session migration and Concentration-system tests are implemented
- See `ZEN-MAHJONG-PROTOTYPE-V0.2.0-REQUIREMENTS.md` and `ZEN-MAHJONG-PROTOTYPE-V0.2.0-DESIGN-HANDOFF.md`

## v0.3.0: Enhancement and re-test roadmap

- **Status:** Planned; product-rule confirmation is the first gate
- Milestone 8: Rule and economy specification
- Milestone 9: Design enhancement
- Milestone 10: Advanced game logic
- Milestone 11: Zen level-clear presentation
- Milestone 12: Server-authoritative execution
- Milestone 13: Offline execution and synchronization
- Milestone 14: Enhancement re-test and release gate
- Detailed scope, architecture assumptions, sequencing, and exit criteria are in `ZEN-MAHJONG-PROTOTYPE-V0.3.0-PLAN.md`

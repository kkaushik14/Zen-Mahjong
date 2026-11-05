# Changelog

All notable changes are documented here. The project follows Semantic Versioning while it remains a prototype.

## [0.2.0] - Unreleased

### Added

- Reusable nine-motif 2.5D tile system and responsive 36-tile Garden II board.
- Fractional board geometry and overlap-aware availability checks.
- Native-thread tile entrance, selection, hint, removal, Undo, and Shuffle transitions.
- Imported Concentration Tray, revival, Zen Score, Zen progress, and eight-level tier requirements.
- Imported Concentration-system screen and component design handoff from the production Figma task.

### Changed

- Project, application, runtime, and internal workspace package versions now target `0.2.0`.
- The existing seven-milestone enhancement/server/offline roadmap is assigned to `v0.3.0` without changing its scope or order.

### Pending

- Concentration Tray gameplay, scoring, reward ads, progress calculation, and revive economy remain unimplemented until unresolved rules are confirmed.
- The reported Figma Concentration section still requires detailed visual QA and refreshed local exports.

## [0.1.0] - 2026-09-25

### Added

- Expo and React Native workspace foundation.
- Reusable design-token, UI, Mahjong UI, game-engine, persistence, and shared-type packages.
- Assumption-led product documentation and architecture decision records.
- VS Code review workspace and automated verification tasks.
- Initial offline-first prototype shell.
- Reusable design-system primitives and component gallery.
- Routed static screens for Home, Gameplay, Profile, Settings, Loading, Completion, Achievements, and Streaks.
- Offline readiness states and accessible navigation controls.
- Framework-independent gameplay engine with provisional availability geometry, matching, hints, deterministic shuffle, undo, restart, win and stalled-state detection.
- Reusable flat and layered board fixtures with expanded engine coverage.
- Reusable responsive Mahjong board component with layered positioning and accessible tile states.
- Playable fourteen-tile Garden I flow with selection, Hint, Undo, Shuffle, Restart, stalled guidance, and dynamic completion metrics.
- Versioned NoSQL repositories with migrations, monotonically increasing revisions, payload validation, and previous-snapshot recovery.
- Reload-safe active sessions and idempotent completion updates for local progress, achievements, and streaks.
- Persisted settings and shared local state across Home, Profile, Achievements, Streaks, Settings, Gameplay, and Completion.
- App-local EAS profiles and reusable commands for simultaneous iOS and Android development-device testing.
- Milestone 6 QA runbook, environment audit, native bundle checks, and physical-device exit criteria.
- EAS project linkage, Expo Updates configuration, and an Android internal development build.
- Reproducible iOS path/Xcode compatibility through an Expo config plugin and pnpm dependency patches.
- Expo's UIKit scene-lifecycle opt-in required for SDK 57 development builds compiled with Xcode 27.

### Fixed

- Corrected Profile navigation controls to meet the 44-point minimum touch target.
- Corrected generated iOS build scripts for repository paths containing spaces and disabled nested ExpoModulesJSI framework signing that Xcode rejects due to generated metadata.

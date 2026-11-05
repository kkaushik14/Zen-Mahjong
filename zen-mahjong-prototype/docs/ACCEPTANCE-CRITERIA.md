# Acceptance criteria

These criteria describe the current prototype assumptions and will evolve with confirmed rules.

## Foundation

- The repository installs from one root command and uses a committed lockfile.
- Type-check, lint, tests, and formatting checks run from the repository root.
- Reusable packages do not import from `apps/mobile`.
- The current development app reports version `0.2.0` in local and build metadata; historical `v0.1.0` build records remain unchanged.

## Offline operation

- A previously installed build launches in airplane mode on first app launch.
- Gameplay, settings, profile, progress, achievements, and streaks do not require a network request.
- An interrupted active session restores to the latest valid persisted revision.
- Invalid persisted data falls back safely and preserves a recoverable previous snapshot when possible.
- Stored documents reject unknown future schemas and migrate supported older schemas sequentially.
- Replaying a completed session ID does not duplicate board, pair, achievement, or streak progress.
- Settings and active-board progress survive an application reload without a network request.
- Progress, achievements, and streaks update from one atomic player-state document.

## Interface

- Primary controls expose accessible names and minimum practical touch targets.
- The gameplay board remains the primary visual element at supported phone widths.
- Decorative content never prevents tile recognition or interaction.
- Reduced-motion settings remove nonessential motion.

## Gameplay

- Game rules are evaluated by the framework-independent engine.
- Illegal matches do not mutate the board.
- Accepted moves can be serialized and restored.
- Prototype availability is derived from layer coverage and open horizontal sides.
- Legal-pair discovery and hints are deterministic for the same state.
- Undo reverses the latest accepted pair without mutating earlier state.
- Shuffle preserves tile identity, matching groups, removal state, and the set of remaining positions.
- The same seed, state, and shuffle count produce the same shuffled result.
- Restart restores the original board snapshot and clears session history.
- Win and stalled states are derived from board state rather than stored flags.
- The rendered board positions tiles from engine coordinates and layers without duplicating rules in UI code.
- Blocked tiles cannot be activated; selected and hinted states have visible and semantic feedback.
- Remaining-pair counts and action availability update after every accepted transition.
- Completing `garden-one` navigates to completion with actual pair, hint, and shuffle metrics.
- The board and action dock fit supported phone widths without horizontal overflow.
- A restored active session resumes the exact tile, history, shuffle, and hint state from the latest valid revision.
- These criteria remain provisional until the corresponding open rule questions are confirmed.

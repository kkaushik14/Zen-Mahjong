# Game engine

Framework-independent Mahjong Solitaire state and rules for the prototype. Product choices remain provisional and are documented in `docs/ASSUMPTIONS.md` and `docs/GAME-RULES.md`.

## Public API

- `createGameState` creates an immutable session boundary with an initial snapshot.
- `standardAvailabilityRule` evaluates the prototype unit-grid geometry.
- `canMatch`, `findLegalPairs`, and `getHint` inspect legal play.
- `applyMatch`, `undoLastMove`, `shuffleRemainingTiles`, and `restartGame` return new state.
- `getGameStatus` derives `in-progress`, `won`, or `stalled`.
- `createFixtureState` supplies deterministic flat and layered boards.

The availability rule is injectable so confirmed geometry can replace the prototype strategy without coupling the engine to presentation code.

# Game rules

## Status

The complete game rules are not yet confirmed. This document must be updated before gameplay behavior is considered final.

## Implemented prototype ruleset

- A board contains uniquely identified tile instances.
- Each tile has a motif, matching group, position, layer, and removal state.
- Availability is calculated from board geometry, not stored as authoritative data.
- Positions use unit-grid coordinates that may contain fractional values.
- A tile is covered when an active tile on a higher layer overlaps its unit-square footprint.
- A tile is horizontally open when at least one vertical side has no touching tile with an overlapping row footprint on the same layer.
- A move selects two different, available, unremoved tiles from the same matching group.
- A legal move removes both tiles and records a reversible history entry.
- Undo restores the most recently removed pair.
- Hint returns the first legal pair in stable board order.
- Shuffle uses the session seed and shuffle count to redistribute remaining tile instances across remaining positions deterministically. It does not currently guarantee a solvable result.
- Restart restores a cloned initial tile snapshot and clears move and shuffle history.
- The level is won when no tiles remain and stalled when tiles remain without a legal pair.

## Engine contract

- The engine is framework-independent and never imports React or React Native.
- State transitions return new state and do not mutate their input.
- Matching behavior is data-driven through `matchingGroup`, so special-family behavior can be represented without UI branching once confirmed.
- Availability remains injectable for tests and future geometry strategies.
- `flat-introduction` and `layered-introduction` fixtures provide deterministic integration inputs.

## Playable prototype behavior

- `garden-one` is a fourteen-tile, three-row, two-layer compatibility fixture. New sessions use `garden-two`, a deterministically solvable 36-tile, three-row, three-layer fixture with nine motif groups.
- Blocked tiles are visible but disabled. Open tiles expose their motif and availability to assistive technology.
- Selecting two legal matches removes them; selecting a nonmatching second tile keeps that tile selected.
- Hint visually identifies one legal pair and increments the session hint count.
- Undo, Shuffle, and Restart call the engine directly and provide live status feedback.
- A stalled board displays recovery guidance. A won board opens completion with pairs, hints, and shuffle counts.
- Active session state is persisted after accepted transitions and restored through the local repository boundary.

See `OPEN-QUESTIONS.md` for unresolved availability, special-tile, shuffle, scoring, and no-moves rules.

## Planned v0.2.0 Concentration rules

These rules are confirmed as planned product direction but are not yet the runtime implementation:

- Four ordered regular Concentration Tray slots replace direct selected-tile highlighting.
- Any eligible tile may enter the first available regular slot.
- Two matching tray tiles resolve automatically; remaining entries preserve order.
- Four different unmatched entries block the tray and open recovery.
- A separate Identity/Super Concentration slot resolves one tray tile with its board counterpart.
- Included special-slot uses are Normal `2`, High Concentration `1`, and Super Concentration `0`; Special Relaxation is unresolved.
- Reward-ad recovery returns four blocked tray tiles to valid board positions when the service is available.
- Concentration Score recovery is available online and offline and costs `10` for the first use and `15` for the second use in one game.
- Zen Score, progress milestones at `3`, `6`, `10`, and `20`, and the eight-level Concentration Score model are defined in `ZEN-MAHJONG-PROTOTYPE-V0.2.0-REQUIREMENTS.md`.

Scoring precedence, no-assist timing, fractional rounding, board-return placement, Special Relaxation uses, and recovery after the second score-funded revive remain unresolved and must not be invented in implementation.

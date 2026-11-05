# Zen Mahjong Prototype v0.2.0 Requirements

## Status

`v0.2.0` is the current development line. These requirements were imported from the newer Rules and Good Practices task on 2026-10-01.

The requirements are approved as product direction unless marked unresolved. They are **not yet implemented** merely because the repository and app metadata report `0.2.0`. The existing two-tile board-selection flow remains the runtime baseline until the Concentration system is built and tested.

Source task: `codex://threads/01a0c498-3bfd-7a71-8274-1782c09797b6`

## Offline independence

- Offline gameplay is independent and supports every capability that does not inherently require a server.
- Initial setup and ordinary gameplay must not require an internet connection.
- Concentration Score revival works online and offline.
- Reward-ad actions appear only when the network and ad service are available.
- If the tray is blocked, no ad is available, and the player cannot afford a score-funded revive, Restart remains available.

## Concentration Tray

The Concentration Tray replaces the current selected-tile highlight interaction.

### Structure

- Four ordered regular slots hold playable board tiles.
- One visually and logically separate Identity/Super Concentration slot provides help.
- The special slot is associated with the tray but is not a fifth regular holding slot.

### Regular slots

- Selecting an eligible board tile moves it into the first available regular slot.
- The next tile does not need to match a tile already in the tray.
- When two identical or matching tiles are present, they resolve and leave the tray automatically.
- Remaining tray tiles preserve their logical order after removal.
- Four different unmatched tiles create a blocked-tray state.
- Tap remains the accessible baseline interaction. Drag may be added as an expressive equivalent where it does not reduce accessibility.

### Identity/Super Concentration slot

The player moves a tile from a regular slot into the special slot. The system finds its matching board tile and resolves the tray tile with that board tile.

Included uses per game:

| Difficulty          | Included uses |
| ------------------- | ------------: |
| Normal              |             2 |
| High Concentration  |             1 |
| Super Concentration |             0 |
| Special Relaxation  |    Unresolved |

Additional uses may be offered through reward ads when the service is available. Configuration beyond these included values remains content-driven and is not permanent engine policy.

## Blocked-tray recovery

When four different unmatched tiles fill the regular tray, offer a calm recovery state.

### Reward-ad revive

- Available only when the network and reward-ad service are available.
- After a qualifying ad, all four regular slots clear.
- The four tiles return logically to valid positions on the current board.
- Existing board progress remains intact.
- The return-position algorithm is unresolved and must preserve a valid recoverable game state.

### Concentration Score revive

- Available online and offline.
- First score-funded revive in one game costs `10` Concentration Score.
- Second score-funded revive in the same game costs `15` Concentration Score.
- Pricing or availability after the second revive is unresolved.

The recovery presentation shows the current balance, selected cost, available ad option, and Restart. Offline presentation must not show a misleading disabled ad action.

## Zen Score

Zen Score is awarded when a game level is completed.

| Completion condition                         |          Planned Zen Score |
| -------------------------------------------- | -------------------------: |
| Level cleared                                |                         10 |
| Completed without Shuffle                    |                         14 |
| Completed without Hint                       |                         15 |
| Completed without Undo                       |                         18 |
| Undo, Shuffle, and Hint all used             |                         10 |
| No assists used                              | Integer from 18 through 20 |
| Reward ad used to regain an exhausted assist |       +1 per qualifying ad |

Example: using all three assists and then watching one qualifying reward ad produces `11` Zen Score: `10` completion points plus `1` ad point.

The no-assist score changes in 10-second completion-time intervals. Its time baseline, direction, thresholds, and final precedence are unresolved. Overlapping conditions, such as completing without both Hint and Shuffle, also require an explicit precedence table before implementation.

## Zen progress

The gameplay screen includes Zen Level progress with milestone markers at:

- `3`
- `6`
- `10`
- `20`

The exact measured value, milestone meaning, reset behavior, and carry-over behavior remain configurable and unresolved.

## Tier and Concentration Score

- One grade tier currently contains eight completed game levels.
- The tier name and upgraded grade names remain placeholders.
- The experience references Normal, High Concentration, Super Concentration, and Special Relaxation categories.
- Category distribution across the eight levels remains unresolved.

```text
Concentration Score = Total Zen Score earned across the tier / completed levels
```

Example:

```text
8 levels x 10 Zen Score = 80
80 / 8 completed levels = 10 Concentration Score
```

Fractional-score rounding remains unresolved.

## Implementation gate

Do not implement score calculation, progress mutation, advertisements, reward balances, or server reconciliation until unresolved precedence, timing, rounding, placement, and authority rules have acceptance examples and tests.

The Concentration Tray itself may be implemented first behind versioned session migration and feature-level tests, provided the existing `v0.1.0`/early `v0.2.0` active-session format remains recoverable.

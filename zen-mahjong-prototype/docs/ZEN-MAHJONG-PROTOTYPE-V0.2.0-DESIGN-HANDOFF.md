# Zen Mahjong Prototype v0.2.0 Screen Design Handoff

## Scope

This document contains screen and component design requirements only. Gameplay reasoning and scoring logic belong in `ZEN-MAHJONG-PROTOTYPE-V0.2.0-REQUIREMENTS.md`.

Source task: `codex://threads/01a0bfdf-7e2a-7351-a47a-a34b1efaf629`

Existing production Figma file: [Zen Mahjong Prototype Production Mobile System](https://www.figma.com/design/lsPHWqjJBItMCFnjKg3Gy2)

## Design task status

- The Design task reports one existing-file section named `Concentration System · Screen Design Updates`.
- It reports 21 screens and reusable component variants in that section.
- Original screens remain intact.
- Detailed visual QA and a refreshed local export were not verified because Figma Desktop control was interrupted.
- Existing local PDFs and PNGs predate the Concentration update and must not be treated as proof of the new frames.
- Prepared local design tooling remains under `figma-zen-mahjong-generator/concentration-update/` outside the application repository.

## Visual language

- Preserve deep sage environments, ivory Mahjong tiles, jade controls, and restrained warm-gold emphasis.
- Keep the board visually dominant.
- Use mature botanical styling and calm tactile motion.
- Avoid casino, neon, cartoon, or visually noisy reward treatment.
- Keep letter spacing at `0`, controls at 44-48 px minimum touch size, and card radii restrained.

## Gameplay screen updates

- Replace selected-tile highlighting with a persistent Concentration Tray.
- Present four regular slots as one ordered group.
- Present the Identity/Super Concentration slot as visually separate but related.
- Integrate the tray and Zen progress without crowding the board.
- Provide Normal, High Concentration, Super Concentration, and Special Relaxation gameplay variants.
- Show remaining special-slot uses without relying only on color.

## Concentration Tray variants

- Empty
- One regular tile stored
- Multiple nonmatching tiles stored
- Matching pair entering
- Matching pair resolving and clearing
- Full four-tile blocked state
- Disabled or unavailable state
- Special-slot drag target
- Searching for board match
- Match found
- Pair resolving
- Last use consumed
- No uses remaining
- Reward-ad use available
- Offline/ad unavailable

## Recovery screens

- Online recovery bottom sheet with reward ad, Concentration Score, and Restart.
- Offline recovery bottom sheet with Concentration Score and Restart.
- Reward-ad prompt state.
- Concentration Score revive state with balance and cost.
- Calm tile-return treatment that does not imply irreversible deletion.

## Progress and completion screens

- Zen Level progress bar with markers at 3, 6, 10, and 20.
- Level-completion screen with Zen Score presentation.
- Eight-level completion summary.
- Concentration Score summary.
- Grade-tier advancement screen using placeholder naming.

## Motion and accessibility

- Support tap and drag affordances, with tap as the accessible fallback.
- Keep compact tray motifs recognizable.
- Communicate occupied, matching, blocked, and unavailable states with shape, icon, label, and motion rather than color alone.
- Keep tile movement traceable between board and tray.
- Provide Reduced Motion variants using opacity and explicit state changes.
- Preserve a logical screen-reader order across board, tray, recovery actions, and gameplay controls.

## Responsive review

Validate representative states at:

- `360x800`
- `390x844`
- `430x932`

Decorative content reduces before board readability, tray recognition, progress legibility, or action hit targets are compressed.

## Required verification before implementation sign-off

1. Open the reported Concentration section in the production Figma file.
2. Verify all 21 reported frames exist and are editable component instances.
3. Review gameplay, blocked recovery, completion, tier summary, and Reduced Motion frames at readable scale.
4. Check clipping, safe areas, contrast, touch targets, and board/tray hierarchy.
5. Export refreshed screen-board and component-library assets locally.
6. Update the export manifest so old and new design generations are unambiguous.

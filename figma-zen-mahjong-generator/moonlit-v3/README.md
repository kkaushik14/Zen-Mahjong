# Zen Mahjong / Moonlit Garden V3

## Locked Direction

An original composition assembled in-house from the user's supplied garden,
marble, branch, flower, logo, and tile materials. No third-party screen or UI kit
is used. Similarity to designs elsewhere cannot be ruled out or guaranteed.
This remains a design study, not a certified production design.

- Home: moonlit garden, smaller brand mark, quiet wood and ivory surfaces.
- Gameplay: retain the approved autumn atmosphere and marble tile bodies.
- Loading: retain the sage garden.
- Profile, Settings, Achievements, and Streaks: garden backgrounds and shared
  organic controls; content is readable rather than tied to painted scenery.
- All functional labels, balances, counts, progress, and states are native,
  editable Figma layers. Supplied illustrations remain raster assets.
- Keep the finalized 50 tile artworks, including both distinct squirrels.
- Continue is bottom-pinned above a reserved safe area. Whole destination rows
  are interactive; arrows are not the only touch targets.
- Daily progress and streak progress use explicit text, not glow alone.
- Do not invent a purchase flow, economy, or new reward rules from concept art.

## Deliverable Scope

1. New duplicate file, never overwrite the V2 source.
2. Home at 360 x 800, 390 x 844, 412 x 915, and 430 x 932.
3. First-play Home plus completed/claimable daily progress specimens.
4. Reusable Home components, editable properties, pressed/disabled variants,
   variables, and an orderly component showcase.
5. Carry the existing gameplay, app screens, Identity tray, and popup family into
   V3. Rewire navigation to V3 destinations.
6. Review rendered screenshots, text bounds, safe areas, touch targets, states,
   and responsive layouts before calling the work complete.
7. Export PNG renders and a manifest; save a separate editable FIG backup.

## Asset Provenance

`assets/moonlit-garden.png` is the user's clean background, copied unchanged
from `ChatGPT Image Oct 7, 2026, 04_49_11 AM.png`.

`assets/home-materials-alpha.png` and `assets/menu-materials-alpha.png` are
transparent derivatives of the user's 02_57_07 and 02_57_09 sheets. Baked labels,
counts, and progress were removed using image generation. These are not
pixel-exact cutouts: generated details require visual review. Originals remain
unchanged in Downloads. Both derivatives have real alpha channels.

## Manual Setup

1. Create project `Zen Mahjong - Moonlit Garden` and duplicate the existing file
   into it. If the plan disallows another project, use Drafts instead.
2. Name the duplicate `Zen Mahjong - Moonlit Garden V3`, open it in Desktop,
   and share its URL in this chat. Keep the original file untouched.
3. Import the development plugin from this folder's `dist/manifest.json`:
   Figma menu > Plugins > Development > Import plugin from manifest.
4. Run `Zen Mahjong Moonlit Garden V3`. Review the displayed file name before
   pressing Build V3. The plugin will reject the known original file key.
5. Keep Figma open. Do not reload while changes are unsynced. Report any error
   displayed by the plugin; do not run the build repeatedly.

The local plugin needs no network access and does not use Figma MCP quota.
Build with `node bundle.cjs` from this folder after changes to `builder.js`.

## Current Status

Assets and local build package prepared. The new Figma file, actual plugin run,
rendered visual QA, and final export are pending. A prepared plugin is not proof
of a completed Figma design.

# Orange Zen Garden / Gameplay

An additive native Figma design generator for the existing Zen Mahjong file.
It targets the existing `03 Screens` page and writes only into the new
`Orange Zen Garden / Gameplay` section. Existing screen sections, components,
and variable collections are not modified. The manually created marble
prototype is preserved at the lower-right of the new section.

## Run In Figma Desktop

1. Open `Zen Mahjong - Production Mobile System`.
2. Choose Plugins > Development > Import plugin from manifest.
3. Select the `manifest.json` in this folder.
4. Run `Zen Mahjong - Orange Garden Gameplay` from Plugins > Development.

The generator uses only the native Figma Plugin API. It has no network access
and does not modify application source code or gameplay logic.

## Expected Result

- Four responsive gameplay frames: 360 x 800, 390 x 844, 412 x 915, 430 x 932.
- Eight illustrative states: partial tray, full tray, pause, restart,
  offline recovery, no moves, completion, reduced motion.
- Eight component sets with state/type variants, plus artwork, icon, board,
  background, and count-badge components.
- Nested component instances for tiles, artwork, tray slots, controls,
  progress markers, sheets, and screen composition.
- A separate gameplay variable collection, aliasing existing colors where
  the normalized palette matches the existing foundation.
- Basic pause/restart prototype navigation and 2x PNG export settings.

## Verification Status

JavaScript syntax checked locally. The complete generator has not yet been run
in Figma. Component bindings, runtime compatibility, layout, and prototype
behavior require verification in the actual Figma canvas before production
acceptance. Physical-device accessibility testing is also still required.

This is an editable vector design baseline, not a complete illustrated asset
pack or a gameplay implementation. Tile layout and numerical values are visual
examples. Scoring, ad eligibility, tile matching, and rewards are not implemented.

## Export

After visual verification, use File > Save Local Copy for an editable `.fig`
backup. Individual screens have 2x PNG export settings.

If a run fails, do not repeat it blindly. The section is tagged as in-progress
to prevent accidental duplicate content. Inspect the plugin console first.

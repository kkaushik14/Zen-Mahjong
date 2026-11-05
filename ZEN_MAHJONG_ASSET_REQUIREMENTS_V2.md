# Zen Mahjong - Revised Design and Asset Requirements

Date: 7 October 2026
Status: Current asset request. Supersedes the earlier asset checklist for what you need to provide.

## 1. Important: tile artwork is already finalized

You have finalized a theme containing **50 tile artwork files** and will provide it separately.

**This document does NOT request tile artwork, new tile symbols, additional tile identities, alternate artwork themes, or a tile-art inventory.** Do not recreate or extract tile illustrations from the preview sheets to satisfy this request. We will use your finalized pack when you provide it.

**Plain tile surfaces ARE needed** and are requested below. They are the blank marble bodies behind the artwork, not the artwork itself.

## 2. What this request covers

Provide assets and visual references for Loading, Home, Gameplay, Profile, Settings, Completion, Achievements, Streaks, and supporting popups.

This is design-only work. No code, game rules, account implementation, ad integration, reward calculations, or audio files are requested.

Existing Figma designs will remain untouched. New component-based designs will be created under a different parent section in the same existing file.

### Priority labels

- **Required export:** an individual asset we need, preferably exported from your existing original artwork. This does not mean generate a new design.
- **Layout reference:** one screen/popup composition showing your preferred arrangement. You can supply it, or explicitly leave its layout to us using the existing PRDs.
- **Optional:** useful source material, but not a blocker.
- **We build:** editable Figma construction and derived states; no additional artwork required from you.

You do not need to create every state or every phone size as a separate image.

## 3. Preserve the approved visual direction

- Gameplay: your warm autumn orange garden, realistic polished ivory marble, organic branch controls, and layered tile board.
- Popups: your Restart dialog's branch frame, light marble panel, ivory Cancel button, and warm amber primary button.
- Other screens: proposed cool garden/sage-jade atmosphere with matching marble and organic materials. Confirm this through the Home reference or a short written approval; do not generate several competing themes.
- Loading: quiet sage/plaster, minimal branding and restrained decoration.
- Use your supplied palette rather than substituting approximate colors. Keep the original textures, lighting, highlights, bevels, and material depth.
- The original gameplay and Restart compositions remain the primary fidelity references. The newer asset sheets are supporting material, not permission to combine every alternative style.

## 4. Required exports from the supplied sheets

Export the chosen assets individually from the highest-resolution originals available. No new artwork is needed when an existing asset already matches.

### A. Backgrounds

| Filename | Requirement |
| --- | --- |
| `background-gameplay-autumn.png` | The selected warm orange garden background, without tiles, controls, captions or phone bezel |
| `background-app-cool-garden.png` | One selected cool garden background for Home and related screens |
| `background-loading-sage.png` | Quiet sage/plaster background; can reuse an existing suitable texture |
| `texture-marble-panel.png` | Clean light marble material for resizable UI surfaces |
| `texture-wood.png` | Chosen wood/branch material only if available separately |

One cool background may serve several screens. Extra spring, night, black-marble and alternate seasonal themes are optional, not requested for the initial design.

### B. Plain tile bodies - required, without artwork

| Filename | Requirement |
| --- | --- |
| `tile-plain-ivory-primary.png` | One approved front-facing blank ivory marble tile, with polished face, rounded bevel, and visible thickness |
| `tile-plain-ivory-soft-vein.png` | Optional quieter-vein alternative if the primary surface competes with the artwork |
| `tile-side-edge.png` | Optional separate side/stack edge if available; otherwise the primary tile body is sufficient |

- No symbols, flowers, characters, numbers, labels or decorative artwork on these files.
- Use the approved Polished Marble Tile Texture Grid as the material reference. Select one consistent primary body rather than randomly using all twelve textures on a board.
- Preserve the approved proportions. Recommended source size: approximately 600 x 800 px or larger at the same aspect ratio.
- Transparent background with clean edges, no beige rectangle, no baked checkerboard and no clipped bevel.
- Gentle gold veins are acceptable; the central area must remain readable behind the separately supplied artwork.
- Do not provide new green, black, pink or blue tile-body themes unless you deliberately choose them for a later theme.

We will create Selected, Hinted, Blocked, Pressed, Matching, Clearing and Disabled treatments around the approved body. You do not need seven newly painted tile images.

### C. Gameplay controls and tray

| Asset | Required export |
| --- | --- |
| Back and Restart | Separate organic rectangular/square control surfaces and glyphs where available |
| Undo, Hint, Shuffle, More | Chosen organic button surfaces; icons separately where available |
| Count badge | Blank badge surface, without a number |
| Progress | Empty branch track, separate leaf-fill pieces, and blank milestone marker |
| Tray | Empty organic tray with four regular tile pockets and a visually distinct Identity pocket |
| Identity marker | Separate non-text emblem or distinguishing frame, if available |

Keep labels, counts and milestone values out of the exported textures. **More has no count badge.** A generic five-pocket tray must be adapted to distinguish the Identity pocket; do not treat all five as interchangeable regular slots.

If icons are inseparable from existing buttons, provide the originals as-is and flag that in the manifest. Do not redraw approved controls just to separate them.

### D. Popup family

| Filename/group | Required export |
| --- | --- |
| `popup-panel-marble.png` | Blank light marble panel from your approved dialog |
| `popup-frame-branches.png` | Branch frame with transparent center and surroundings |
| `popup-button-secondary.png` | Blank ivory button surface |
| `popup-button-primary.png` | Blank warm amber button surface |
| `popup-divider.png` | Decorative divider without title or body text |
| `popup-corner-*.png` | Separate corners/decorations if available; optional |
| `popup-edge-*.png` | Separate branch edges or a nine-slice guide if available; optional |

Do not bake Cancel, Restart, titles, explanations, numbers or other text into reusable surfaces. Preserve the complete Restart reference separately for visual matching.

### E. Shared surfaces, decoration and icons

- [ ] One compact blank marble surface for summaries, achievement items and profile highlights.
- [ ] Selected branch dividers, leaves, blossoms and lantern decorations as individual transparent files.
- [ ] Any existing approved logo/brand mark, preferably transparent PNG or editable SVG.
- [ ] Available navigation/status glyphs: Home, Profile, Settings, Achievements, Calendar/Streak, Theme, Tiles, Close, Edit, Check, Lock, Chevron, Help, Sound, Music, Haptics, Offline and Sync.

Missing utility icons can be built as a coherent set by us. You do not need to illustrate a unique ornate frame for each icon.

## 5. Remaining illustration requests

These are **not tile artwork**. Reuse matching approved artwork if it already exists, or leave these to us rather than creating unnecessary duplicates.

| Item | Requested visual |
| --- | --- |
| Avatar set | Six small profile emblems: lotus, crane, bamboo, mountain, moon, garden gate |
| Achievement set | Eight emblems: lotus, crane, bamboo, mountain, moon, garden gate, mandala-inspired geometry, garden path |
| Completion | One calm lotus/garden illustration, without text |
| Streak growth | Four stages of one lotus: bud, opening, bloom, mature bloom |
| Empty state | One small quiet garden/lotus illustration, reusable across empty lists |

Avatar and achievement sets may share illustrations. We will create frames, progress, locked treatments and numeric tiers in Figma. Do not create a separate emblem for every achievement threshold.

## 6. Screen layout references

For each row, provide one composition or write `Design layout from PRD`. **Home is the first layout approval checkpoint.** Gameplay and Restart references are already supplied and need not be recreated.

| Reference | Content to show |
| --- | --- |
| `screen-loading.png` | Brand, quiet loading motif, status text space |
| `screen-home.png` | Profile/menu controls, Zen Mahjong title, one Play OR Continue action, Daily Challenge, compact Streak/Journey summaries, secondary destinations |
| `screen-profile.png` | Avatar, name, journey, lifetime metrics, achievement/theme highlights, links to Achievements/Streaks |
| `screen-settings.png` | Grouped audio, haptics, reduced motion, notifications, appearance, privacy/consent, restore purchases, help and version; a second scroll reference if needed |
| `screen-completion.png` | Calm completion art, main results, Continue and Home, subordinate streak/progress/achievement modules |
| `screen-achievements.png` | Category filters, achievement list/grid, visible progress and locked/unlocked examples |
| `screen-streaks.png` | Current/best streak, weekly activity, calendar and next milestone |

Reference size: **390 x 844 logical pixels**, or a proportionate 3x render at **1170 x 2532 px**. Export the screen itself without the phone bezel or outside mockup scenery.

We handle 360 x 800, 412 x 915 and 430 x 932 adaptations. Do not uniformly stretch the screen to produce these sizes.

Text can appear in a reference screenshot, but reusable background/panel assets must remain text-free. Text and values will be editable in Figma.

## 7. Popup and overlay layout references

Reuse the supplied Restart visual language. Provide a contact sheet or leave these compositions to us based on the existing specifications.

| Popup/overlay | Needed arrangement |
| --- | --- |
| Pause | Title/body, Resume, Save & Home, Restart Board |
| More | Compact list of approved in-game destinations/actions |
| Full Tray | Explanation and recovery actions from approved rules |
| Offline Recovery | Network-dependent action clearly unavailable, local alternatives visible |
| No Moves | Brief explanation and approved Shuffle/Restart choices |
| Achievement Unlocked | Emblem, title, brief description and dismiss/continue action |
| Streak Milestone | Lotus/emblem, editable milestone value and continue action |
| Profile Edit | Name field, avatar picker, Save/Cancel |
| Appearance Picker | Theme/tile-body previews, selected marker, apply/close actions |
| Achievement Detail | Emblem, description, progress and approved reward information if applicable |

Use `TBD - approved rules` for undefined costs, rewards or recovery wording. No new game logic is requested. Cloud/account dialogs and paid-theme/store screens are out of scope unless separately approved.

## 8. Component states - examples helpful, not mandatory new assets

One visual state contact sheet is enough if you want to specify these appearances. Otherwise we build them using your approved materials.

| Component | States we will build |
| --- | --- |
| Buttons | Default, Pressed, Disabled; Loading when appropriate |
| Counted gameplay actions | Available count, Zero count, Disabled; no count on More |
| Toggle | On, Off, Disabled; thumb position must distinguish On/Off |
| Slider | Track, fill, thumb, Disabled |
| Selector/filter | Selected, Unselected, Disabled |
| Text field | Default, Focused, Error, Disabled |
| Calendar day | Played, Not Played, Today, Future |
| Avatar/theme selection | Selected marker and unselected appearance |
| Status | Offline, Syncing, Synced, Sync Issue when those features apply |
| Achievement | Locked, In Progress, Unlocked, Newly Unlocked |
| Popup | Two-action and three-action layouts, background scrim |

Disabled controls must not glow as if enabled. State differences should include position, outline, marker or contrast, not color alone. Preserve readable labels and at least 48 logical pixel touch targets for controls.

## 9. Export specifications

- **Raster objects:** individual PNG files with actual alpha transparency. A pictured checkerboard is not transparency.
- **Backgrounds:** full-resolution PNG/JPG; transparency is unnecessary.
- **Vectors:** editable SVG where genuine vector originals exist. Do not wrap a bitmap in SVG and label it editable.
- **Resolution guidance:** portrait backgrounds at least 1170 x 2532 px; tile body approximately 600 x 800 px; glyphs/emblems 512 x 512 px; popup panels around 1200 px wide or larger. Preserve original aspect ratios rather than stretching to these suggested dimensions.
- **Edges:** no halos, unwanted sheet background, captions, adjacent assets or clipped shadows/foliage.
- **Materials:** consistent light direction and bevel depth. Do not recolor approved imagery for export.
- **Resizable frames:** separate center, corners and edges if available. We will preserve ornaments rather than stretching them.
- **Source:** layered PSD, original Figma, or editable SVG is optional and welcome. Individual PNGs are sufficient to begin.
- **Preservation:** retain originals; any cleanup/extraction should be a separate version.

Sheets remain useful references, but individual original exports retain more detail than cutting tiny assets out of a flattened atlas. There is no need to provide both a new atlas and individual files; the existing atlases plus individual exports are sufficient.

## 10. Delivery folders

```text
Zen-Mahjong-Design-Pack-V2/
  00-palette-and-reference/
  01-backgrounds/
  02-plain-tile-bodies/
  03-gameplay-controls-and-tray/
  04-popup-surfaces-and-frames/
  05-shared-icons-and-decoration/
  06-avatars-and-achievements/
  07-streak-and-completion/
  08-screen-layout-references/
  09-state-reference-sheets/          # optional
  asset-manifest.md
```

**The finalized 50-file tile artwork theme will be delivered separately. It is intentionally not requested in this folder checklist.**

The asset manifest should list filename, role, intended screen/component, dimensions, transparency, state (if any), and whether text or glyphs are baked in. Also identify the selected primary background, plain tile body, button family and popup frame so we do not mix conflicting alternatives.

## 11. Final submission checklist

- [ ] Individual warm gameplay and cool app backgrounds selected and supplied.
- [ ] One clean transparent plain ivory marble tile body supplied, without artwork.
- [ ] Gameplay controls/progress/tray exported; Identity pocket distinct from regular pockets.
- [ ] Popup marble panel, branch frame, blank buttons and divider supplied.
- [ ] Shared material/decorative assets exported where available.
- [ ] Logo, avatar/emblem, completion and streak assets supplied or marked for us to build.
- [ ] Home layout supplied or explicitly delegated; other screen/popup layouts supplied or delegated.
- [ ] Actual transparency verified; highest-resolution originals used where available.
- [ ] Counts, text and milestones excluded from reusable surface textures.
- [ ] More count badge omitted.
- [ ] Asset manifest identifies the chosen cohesive family and any inseparable baked content.

## 12. What happens after delivery

We will inspect the pack, prepare assets, build theme-bound components, and compose one faithful Gameplay screen, Restart popup and Home screen for approval. Then we expand to the remaining screens, responsive sizes and navigation prototype, verify visual quality, and prepare local exports.

The finalized tile artwork will be incorporated when you provide it separately. Until then, plain tile bodies can be assembled without commissioning replacement artwork. Figma's previously reported Starter-plan tool limit remains a separate implementation access constraint; it does not change these asset requirements.

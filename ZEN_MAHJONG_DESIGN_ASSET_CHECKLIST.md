# Zen Mahjong - Complete Screen and Component Artwork Checklist

Prepared: 7 October 2026

## 1. Purpose and scope

Prepare the remaining artwork and screen references in one batch so we can build an editable, component-based Figma mobile design.

This brief covers Loading, Home, Gameplay, Profile, Settings, Completion, Achievements, Streaks, and their supporting overlays. It requests visual designs only, not game rules, account systems, reward calculations, ads, or implementation logic. Existing PRDs inform screen content; optional features in them are not automatically required.

Existing Figma designs must remain untouched. New work belongs under a separately named parent section in the same existing file.

**You do not need to redraw everything.** The supplied gameplay, marble, control, and popup artwork is the source of truth. Most remaining work is new screen compositions and a small shared set of artwork and controls.

## 2. Theme direction for this batch

- Gameplay: warm autumn orange, layered garden depth, ivory marble tiles, tactile wooden/branch controls, restrained olive foliage.
- Popups: your ivory marble panels and intertwined branch frames, dark readable text, ivory secondary buttons and warm amber primary buttons.
- Other screens: recommended cool garden atmosphere with the existing sage/jade foundation, ivory marble surfaces, and matching organic controls. This is the proposed direction for your new references, not a replacement of the existing foundation.
- Loading: retain the PRD's quiet sage/plaster treatment; do not make it an orange gameplay screen.
- Keep the same visual craftsmanship across screens. Avoid flat substitutes for supplied materials, heavy gold everywhere, or orange recoloring of every surface.
- Keep scenery behind the interface calm enough for readable text. Place detailed foliage mostly at the edges.
- Use the existing Figma typography foundation where suitable: Cormorant Garamond for display/headings and Inter for utility text. Artwork lettering can guide style but should not be baked into reusable assets.

### Supplied color reference

Use these exact written values from your artwork token sheet as the initial palette. Lighting and textures may contain additional colors; do not flatten them to solid swatches.

| Family | Colors |
| --- | --- |
| Cool environment | `#12262E`, `#263D46`, `#3B5A6D`, `#627065` |
| Autumn gameplay | `#350E01`, `#582409`, `#813611`, `#A03C12`, `#C74C1B`, `#DA733B` |
| Marble | `#FAE8D5`, `#EDCEAF`, `#DCAA7F`, `#B18967` |
| Organic materials | `#77431E`, `#996037`, `#627065`, `#8A9C55` |
| Text | Dark `#2A1A12`, light `#FFF6EC` |

Figma theme tokens will be scoped and bound to components. The shared foundation will be reused rather than overwritten.

## 3. Already supplied - do not recreate

| Item | Current source | What is still needed |
| --- | --- | --- |
| Gameplay composition | Cool Zen Garden Mahjong Phone Mockup; Autumn Mahjong UI Comparison | Use as composition references; no new artwork required |
| Color/material direction | Gameplay artwork token sheet | Written palette already available above |
| Backgrounds and textures | Garden/background/material sheet | Separate clean images without captions if available |
| Navigation, tray, progress, boosters | Organic gameplay control sheet | Separate parts without baked labels/counts if available |
| Decorated tile artwork | Marble tile symbol sheet | Separate symbol layers if available; confirm coverage of actual tile inventory |
| Blank marble tile surfaces | Polished Marble Tile Texture Grid | Preserve source; transparent cutout draft requires edge cleanup |
| Popup frame and decorations | Autumn Forest Game UI Asset Sheet | Separate transparent frame/corners/branches if available |
| Popup panel and buttons | Autumn Marble Game UI Set | Blank individual assets if available |
| Restart popup composition | Zen Mahjong Restart Dialog | Reuse as the fidelity reference |

Individual originals are helpful, not mandatory. Sheets can be prepared from the supplied files. Do not regenerate approved artwork merely to change its packaging.

## 4. Required new screen references

Create one complete portrait composition per screen at **390 x 844 logical pixels**. A high-resolution render at **1170 x 2532 pixels** is suitable. No phone bezel or surrounding presentation scene in the actual screen export. A separate phone mockup is optional.

You only need to design the standard size. We will adapt components and layouts to 360 x 800, 412 x 915, and 430 x 932 in Figma; do not stretch the entire screen uniformly.

### A. Loading

- [ ] `screen-loading.png`: sage/plaster background, Zen Mahjong mark/title, quiet loading motif, status text space.
- [ ] One small example of offline status using the same layout.
- [ ] Static reduced-motion loading appearance.

No separate artwork is needed for every status. First-setup retry is conditional on the existing requirements, not a mandatory new onboarding flow.

### B. Home

- [ ] `screen-home.png`: cool garden atmosphere, brand visible, profile/menu controls, one dominant Play or Continue action.
- [ ] Daily Challenge module, subordinate to Play/Continue.
- [ ] Compact Streak and Journey summaries, plus access to Achievements, Themes, Profile, and Settings.
- [ ] Show Play and Continue as alternatives in a component example, not competing primary actions on one screen.
- [ ] Daily Challenge module examples: Not Started, In Progress, Completed.

Reuse the garden background and marble/organic materials. Do not turn Home into a dense dashboard or promotional landing page.

### C. Profile

- [ ] `screen-profile.png`: back/header, avatar, display name, journey stage, selected readable lifetime metrics.
- [ ] A latest-achievement highlight, favorite-theme preview, and links to Achievements and Streak History.
- [ ] `overlay-profile-edit.png`: editable name field and avatar selection using the shared popup family.

Local profiles must look complete without sign-in. Cloud status is secondary and conditional; no social feed, followers, leaderboard, or new account screens requested.

### D. Settings

- [ ] `screen-settings.png`: grouped, readable rows rather than a decorative panel around each setting.
- [ ] Include music, ambient sound, sound effects, haptics, reduced motion, notifications, privacy/consent, restore purchases, help, and version as described in the PRD.
- [ ] Include appearance/theme and tile-style entry points if retained in the existing scope.
- [ ] One scrolled continuation reference if the full settings list exceeds the viewport.

Use modest branch dividers or small corner accents. Settings should remain easy to scan and operate.

### E. Completion

- [ ] `screen-completion.png`: calm completion artwork, brief title, main board results, clear Continue action and secondary Home action.
- [ ] Reusable small progress/streak update and achievement-unlocked module.
- [ ] Reward area only for approved reward types; no invented currencies or reward quantities.

Provide a popup version only if completion is intended as an overlay instead of the existing full screen. Shared artwork can support both without duplicating assets.

### F. Achievements

- [ ] `screen-achievements.png`: header, compact category filters, achievement list/grid, visible progress.
- [ ] Achievement examples: Locked, In Progress, Unlocked, Newly Unlocked.
- [ ] `overlay-achievement-detail.png`: larger emblem, name, description, progress and approved reward area if applicable.

Use the existing categories: Journey, Mastery, Consistency/Streak, Daily Challenge, Exploration. Do not add a Claim button unless the product actually requires claiming.

### G. Streaks

- [ ] `screen-streaks.png`: current and best streak, recent/weekly activity, monthly calendar, next milestone.
- [ ] A gentle zero-streak/returning-player example using the same components.
- [ ] Milestone strip/list and a reusable achieved-milestone example.

Use a growing lotus as the recommended consistent motif. No urgent flames, red warnings, or guilt-based missed-day visuals. Numeric milestones remain editable and follow the PRD.

### H. Appearance picker

- [ ] `overlay-appearance-picker.png`: compact theme previews and tile-style previews, with a clearly selected state.

This is a shared picker for existing appearance entry points, not a new store or paid-content system. Use approved themes only.

## 5. Required new reusable artwork

### Brand and botanical illustrations

- [ ] `brand-mark`: clean lotus/Mahjong emblem, transparent background; reuse an existing approved logo if one exists.
- [ ] `brand-wordmark`: optional separate Zen Mahjong wordmark; retain editable screen title text regardless.
- [ ] `illustration-completion`: one calm lotus/garden completion illustration, transparent, no text.
- [ ] `illustration-streak-growth`: four stages of the same lotus (bud, opening, bloom, mature bloom), consistent framing and lighting.
- [ ] `illustration-empty-state`: one small calm garden/lotus illustration reusable for empty history or no achievements yet.

### Avatar and achievement artwork

- [ ] Six avatar emblems: lotus, crane, bamboo, mountain, moon, garden gate. Transparent background, no names or numbers.
- [ ] Eight achievement emblems: lotus, crane, bamboo, mountain, moon, garden gate, mandala-inspired geometry, garden path.
- [ ] One shared emblem frame and one muted locked treatment. Tier numbers/progress remain editable; no need to draw a badge for every numeric milestone.

Avatar and achievement illustrations may share source artwork, but must be visually legible at their different display sizes.

### Shared navigation and status icon set

- [ ] Match the existing gameplay icon finish: Home, Profile, Settings, Achievements, Streaks/Calendar, Theme/Palette, Tiles, Close, Edit, Check, Lock, Chevron, Help, Sound, Music, Haptics, Offline, Sync.
- [ ] Supply icon glyphs separately from decorative frames.

These can be coherent SVGs or transparent PNGs. They do not each need a new ornate button illustration. Back, Restart, Undo, Hint, Shuffle and More are already supplied.

### Shared surfaces and controls

- [ ] Compact marble surface for repeated summaries/achievement items; reuse the existing texture and bevel.
- [ ] Thin organic divider: branch or botanical center detail, supplied separately from text.
- [ ] Toggle: On, Off, Disabled; distinct thumb positions, not color alone.
- [ ] Slider: track, fill and thumb separately; muted disabled example.
- [ ] Segmented selector/category filter: Selected, Unselected, Disabled.
- [ ] Text field: Default, Focused, Error, Disabled; quiet marble/plaster treatment.
- [ ] Calendar day: Played, Not Played, Today, Future; distinguish with marker/outline as well as color.
- [ ] Selection marker: check/outline for avatars and theme previews.
- [ ] Small status pill/banner surface for Offline, Syncing, Synced and Sync Issue; reuse one shape.

One component/state sheet is sufficient for these. We will construct native editable Figma controls from it; you do not need to render every screen combination.

## 6. Gameplay additions - reuse the supplied artwork

- [ ] Distinct Identity slot treatment beside four regular tray slots. Do not deliver five indistinguishable regular slots.
- [ ] Tile state reference: Available, Blocked, Pressed, Selected, Hinted, Matching, Clearing/Removing, Disabled.
- [ ] Tray state reference: Empty, Occupied, Newly Added, Matching, Clearing, Almost Full, Full, Disabled.
- [ ] Action button reference: Default, Pressed, Disabled, Zero Count, Loading where applicable.
- [ ] Progress branch reference: Empty, Partial, Complete; tiny leaf fill rather than a solid green tube if following the gameplay specification.

Use overlays, outlines, elevation or restrained lighting to distinguish states; do not repaint approved marble or symbols. These are visual states, not instructions to define gameplay rules.

**Tile inventory:** supplied illustrated tiles establish the art style, but blank marble variants are not additional tile identities. Provide separate symbols for every tile identity actually used by the game, or a written inventory of the remaining identities so they can be commissioned. Do not assume a complete traditional Mahjong set is required without checking the approved game inventory.

## 7. Popup compositions still needed

Restart is already supplied. Use its panel, frame, divider and button materials for the following; one contact sheet of all popup compositions is enough. Also provide text-free surfaces separately where possible.

| Reference | Composition needed |
| --- | --- |
| `popup-pause` | Title, brief body, Resume, Save & Home, Restart Board |
| `popup-more` | Compact menu using existing in-game destinations; do not duplicate Pause unless intentional |
| `popup-tray-full` | Full-tray title, brief explanation, recovery actions from the approved rules |
| `popup-offline-recovery` | Same family; clearly unavailable network-dependent action and available local alternatives |
| `popup-no-moves` | Calm title, brief explanation, approved Shuffle/Restart actions |
| `popup-achievement-unlocked` | Emblem, title, short achievement text, one dismiss/continue action |
| `popup-streak-milestone` | Growing lotus/emblem, editable milestone number, one continue action |

Profile edit, appearance picker and achievement detail are covered in Section 4. Use the shared confirmation component for other confirmed destructive actions; do not add data-delete/account dialogs unless those features are in scope.

When recovery wording, concentration cost, or reward eligibility is undefined, mark it `TBD - approved rules` in the reference. Do not invent the rule to complete a mockup.

## 8. Export and delivery format

### Artwork exports

- Transparent PNG for raster objects; SVG for genuinely vector artwork. Do not wrap a raster image in SVG and call it editable.
- Suggested sizes: portrait backgrounds at least 1170 x 2532 px; tile masters approximately 600 x 800 px; icons/emblems 512 x 512 px; popup surfaces at least 1200 px wide. These are recommended source resolutions, not fixed UI dimensions.
- Match the approved tile proportions. Leave sufficient transparent padding for foliage and shadows; never clip decorative edges.
- Export backgrounds without device frames, captions, UI, or baked overlay text.
- Export panel/button textures without labels. Keep title, body, button labels, counts, progress values and dates separate.
- Supply a blank tile surface and separate symbol art wherever possible. If only decorated tiles exist, identify them explicitly as flattened artwork.
- Keep frame corners and branch edges separate from the stretchable panel center. Provide a nine-slice guide if available; do not stretch full frames and distort leaves.
- Preserve one consistent lighting direction, material scale, edge finish and palette.
- Preserve approved originals. New extraction/cleanup outputs should be versioned siblings.

### Suggested folders

```text
Zen-Mahjong-Artwork-Pack/
  00-reference-and-palette/
  01-backgrounds/
  02-brand/
  03-marble-and-organic-surfaces/
  04-gameplay-tiles-and-symbols/
  05-gameplay-controls-and-tray/
  06-navigation-and-status-icons/
  07-avatars-and-achievements/
  08-streak-and-completion-art/
  09-popup-assets/
  10-control-state-sheets/
  11-screen-references/
  asset-manifest.md
```

Use filenames such as `avatar-lotus.png`, `toggle-on.png`, `popup-frame-corner-top-left.png`, and `screen-home.png`. The manifest should list each file, intended screen/component, dimensions, transparency, state, and whether it contains baked text.

Layered PSD, editable SVG, or original Figma source is welcome but not required. Contact sheets are useful for review; individual exports are preferable for assembly.

## 9. What you prepare versus what we build

| You prepare | We build in Figma |
| --- | --- |
| Remaining screen composition references | Native frames, responsive constraints and auto-layout |
| Distinctive brand, emblem and illustration artwork | Reusable components, variants and instance-swap properties |
| Material/texture assets and visual state examples | Scoped theme tokens and shared foundation bindings |
| Blank surfaces and separated glyphs where possible | Editable labels, counts, dates, statistics and popup text |
| References for undefined visual treatments | Four device sizes and navigation prototype |
| Artwork pack and palette/asset manifest | Visual QA, cleanup, exports and handoff |

You do not need to provide application code, animation engines, account logic, sound files, ad assets or reward calculations for this design task.

## 10. Final batch checklist

- [ ] Eight primary screen references: Loading, Home, Gameplay (already supplied), Profile, Settings, Completion, Achievements, Streaks.
- [ ] Shared edit/profile, appearance and achievement-detail overlays.
- [ ] Popup contact sheet; reuse the supplied Restart reference.
- [ ] Brand mark, avatar/emblem set, completion and streak artwork.
- [ ] Shared icon set and control-state sheet.
- [ ] Actual gameplay symbol inventory, with any missing symbol artwork identified.
- [ ] Existing approved textures, backgrounds, controls and popup surfaces included without redesign.
- [ ] Individual transparent or layered exports where available.
- [ ] No More count badge; regular tray and Identity slot remain distinct.
- [ ] Text readable at 390 x 844 and decorative assets do not obscure controls.
- [ ] Asset manifest included; optional/cloud/reward content clearly marked rather than invented.

Once this pack is available, the first fidelity checkpoint will be one gameplay screen, one Restart popup, and one Home screen. After those are approved, we will expand the shared system to the remaining screens and sizes. Figma's previously reported Starter-plan tool limit is an implementation access constraint, not a reason to request additional artwork.

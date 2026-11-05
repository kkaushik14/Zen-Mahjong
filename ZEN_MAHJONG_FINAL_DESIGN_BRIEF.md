# Zen Mahjong - Final Design Brief

Date: 7 October 2026
Status: Theme direction approved for an iterative design pass, not a finalized production design. Asset preparation and design assembly may begin when editing access is available.

## Source-of-truth order

1. User's original gameplay composition and Zen Mahjong Restart Dialog: composition and fidelity targets.
2. Gameplay artwork token sheet: exact written palette values.
3. Marble Garden Game UI Asset Sheet-3: primary supporting component family, backgrounds, plain tile bodies, popup pieces, buttons, frames and materials.
4. Zen Garden Mahjong Motif Collection: profile, achievement, completion and decorative illustration source, where suitable.
5. Other supplied sheets: supporting alternatives only; use them to fill a specific gap, not to mix visual families indiscriminately.

The approved imagery must not be replaced with simplified flat approximations or newly generated substitutes without approval. Newer sheets do not override the original gameplay layout or approved game requirements.

## Theme

- Gameplay: warm orange autumn garden; ivory marble tiles; tactile branch/wood controls; restrained olive foliage and warm highlights.
- Other screens: cool garden atmosphere with the shared sage/jade foundation, ivory marble and matching organic details.
- Loading: quiet sage/plaster background and minimal brand treatment.
- Popups: original Restart composition's branch border, light marble panel, dark readable text, ivory secondary and warm amber primary buttons.
- Preserve image textures, lighting and bevel depth. Use bound variables for editable UI properties without flattening raster artwork to solid colors.
- Retain the existing typography foundation: Cormorant Garamond display/headings and Inter utility text where suitable.
- Decorative scenery remains subordinate to tile readability and usable controls.

## Asset decisions

- Use a consistent blank ivory tile body from the selected family. Prefer its quieter-vein version where needed for legibility; retain the side edge for depth if useful.
- The 50 finalized tile artworks have now been supplied in five sheets named `ChatGPT Image Oct 7, 2026, 01_20_26 AM-1.png` through `ChatGPT Image Oct 7, 2026, 01_20_33 AM-5.png` in Downloads. Do not request, commission, invent or regenerate replacements.
- Both squirrel illustrations are distinct approved designs, as confirmed by the user. Keep them as separate identities.
- Prepare individual artwork assets from the supplied sheets, verify transparency and edge quality, and combine them with the plain tile bodies. Do not substitute blank tiles as the completed artwork treatment.
- Reuse the supplied organic controls and marble popup surfaces; create editable labels, counts and milestones separately.
- Use motifs for avatars/achievement illustrations where appropriate. Do not assume decorative motif images define new tile identities or gameplay features.
- Do not introduce extra boosters, currencies, hearts, gems, alternate board mechanics or paid themes merely because they appear on an asset sheet.

## Preparation ownership

The supplied sheets are sufficient to begin. Additional full-screen mockups are not required.

We handle:

- Asset selection, cropping/extraction, background/caption removal and edge cleanup.
- Verification of actual alpha transparency; pictured checkerboards are not assumed transparent.
- Keeping source originals intact and storing prepared assets as versioned siblings.
- Separating editable UI text from raster surfaces.
- Preparing reusable corners/edges or other constrained resizing so foliage and bevels do not stretch.
- Coherent utility icons and native settings controls where the supplied assets have gaps.
- Responsive layout and visual state construction.

Individual high-resolution originals or layered files are welcome if available, but not a prerequisite for starting. Sheet extraction cannot restore detail absent from the source. Any visible resolution or edge-quality limitation must be reported before declaring the output production-ready.

## Screen inventory

1. Loading: normal loading, passive offline appearance and reduced-motion appearance. Blocking first-setup fallback only if required by the existing product scope.
2. Home: Play or Continue as the dominant action, Daily Challenge, compact Streak/Journey summaries and existing secondary destinations.
3. Gameplay: original composition, navigation, editable branch milestones, layered board, concentration tray and four actions.
4. Profile: identity, local statistics, achievement/theme highlights, edit-name/avatar overlay.
5. Settings: grouped controls for the existing PRD scope, with scroll behavior as needed.
6. Completion: calm results, Continue/Home, subordinate progress/streak/achievement updates.
7. Achievements: category filters, readable progress and achievement-detail overlay.
8. Streaks: current/best streak, recent activity, calendar and next milestone.

Appearance picker is a shared supporting overlay for approved appearance options, not a new store.

We compose missing screen layouts from the existing PRDs. Undefined visual details can be resolved within this theme; undefined costs, rewards, recovery eligibility or account behavior must not be invented.

## Component inventory and states

- Plain tile shell with nested artwork layer: Available, Blocked, Pressed, Selected, Hinted, Matching, Clearing/Removing, Disabled.
- Navigation buttons: Back and Restart remain rectangular/square, not circular.
- Gameplay actions: Undo, Hint, Shuffle, More; editable counts on the first three only. No count badge on More.
- Tray: four regular pockets plus one distinct Identity pocket, not five interchangeable regular slots. Empty, Occupied, Newly Added, Matching, Clearing, Almost Full, Full and Disabled states.
- Progress: separate branch track, tiny leaf fill, editable milestone values and markers. Supplied values are visual examples, not newly defined game rules.
- Shared buttons: Default, Pressed, Disabled, Loading where appropriate.
- Toggle, slider, selector/filter, text field, selection marker, calendar day and passive status components.
- Avatar, achievement emblem, compact summary, completion illustration and streak motif components.
- Popup family: panel, branch frame, divider, scrim, flexible two/three-action layouts and editable content.

No new painted asset is required for every state. Use restrained overlays, outlines, markers and elevation. Disabled states must not appear actively glowing; communicate status through more than color alone.

## Popup inventory

- Restart: match the supplied reference.
- Pause: Resume, Save & Home, Restart Board.
- More: approved contextual destinations/actions; no new gameplay mechanics.
- Full Tray and Offline Recovery: only approved recovery choices; undefined costs/eligibility remain explicitly pending.
- No Moves: existing approved Shuffle/Restart choices.
- Achievement Unlocked, Achievement Detail and Streak Milestone.
- Profile Edit and Appearance Picker.

Additional destructive/account dialogs are conditional on approved scope, not automatically added.

## Figma organization and preservation

- Preserve all existing screens, components and foundation collections.
- Build under a new parent section named `Zen Mahjong / Artwork-Faithful Design V2` in the same existing Figma file.
- Keep the earlier `Orange Zen Garden / Gameplay` draft as historical work; do not overwrite it.
- Group new work into `01 Components`, `02 Screens`, and `03 States and Prototype` under the new parent.
- Use linked instances, semantic variable bindings, editable text, auto-layout for related content and proper component properties.
- Do not import a flattened whole-screen image as the final editable design.

## Execution phases and approval

### Phase 1 - Assets and components

Prepare selected imagery, scoped theme tokens and reusable components. First fidelity checkpoint: one tile/control/tray specimen and the Restart popup treatment.

### Phase 2 - Screens

Compose Gameplay, Restart and Home at 390 x 844. Review against source images before propagating the system to remaining screens. Then adapt layouts to 360 x 800, 412 x 915 and 430 x 932 without scaling the entire UI uniformly.

### Phase 3 - Prototype and export

Connect navigation and popup demonstrations without implementing game logic. Check readability, safe areas, decoration clipping, touch targets, scroll content, nested instances and state appearance. Prepare local screen renders and component assets with a manifest; provide a native editable backup when the available Figma interface supports it.

## Completion conditions

- Faithful materials, palette and composition, not the rejected simplified draft.
- No known overlaps or clipped text at the four target sizes.
- Controls have at least 48 logical pixel touch targets, apart from decorative noninteractive markers.
- More has no count; Identity pocket is distinct.
- Text/counts and repeated UI remain editable and component-linked.
- Final tile artwork uses the user's separate finalized pack.
- Reduced-motion examples do not depend on decorative motion.
- Original Figma work remains intact.
- Local exports exist and are verified before claiming delivery.

## Access status

On 7 October 2026, the user-approved native plugin completed the V2 theme-study pass in section `45:16399`. The library contains the 50 supplied artworks, state components, organic controls, shared popup borders, four holding pockets and a separate Identity slot. Twenty screen frames and prototype destinations exist, including section `57:17709`. Background/button constraints were repaired. Four gameplay-size geometry checks and native-render inspection passed. A ZIP with twenty screens, sixty-four component renders and a manifest was downloaded and verified; an editable .fig backup was also saved and its archive integrity checked. Both are preserved under `figma-zen-mahjong-generator/artwork-v2/exports`. Older sections remain intact. Cloud sync, physical-device accessibility and exhaustive prototype testing remain independently unverified. See `figma-zen-mahjong-generator/artwork-v2/QA.md`. This is an iteration, not production sign-off.

## User inputs still pending

No additional artwork or mandatory screen mockups are requested. The finalized tile artwork has been supplied as five sheets; optional individual high-resolution originals can improve final quality. Theme fidelity is the immediate goal, while production sign-off remains a later review.

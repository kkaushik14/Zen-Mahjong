# Zen Mahjong Artwork V2

Local Figma development plugin for the approved theme study, not a final production release.

Import `manifest.json` from Figma's Plugins > Development menu. Run only in the existing Zen Mahjong Production Mobile System file, after confirming desktop sync.

The plugin reads nine source image fills already uploaded to the V2 section, creates editable components and initial Gameplay, Restart, and Home review screens, and preserves older sections. It uses no external network access. It refuses to run if the V2 component area already exists.

The source is `../artwork-v2.js`; `code.js` is its mechanically adapted native-plugin version. Subsequent repair, polish and export stages modify only the V2 work. See `QA.md` for verification and production follow-up.

## Current Execution Status

The initial component build, corrected `complete-native.js`, `repair-native.js` and `polish-native.js` have run. Twenty screens exist, with shared organic popup borders, editable dialogs and four holding slots plus a separate Identity component. Four gameplay-size geometry checks passed and their PNGs were inspected. The current temporary plugin entry point `/tmp/zen-mahjong-artwork-v2/code.js` contains `export-stream-native.js`. Do not rerun the original builder or the legacy bulk export over existing work.

Cloud sync is independently unverified. An editable local backup is now saved and checked. See `state.json` for preserved IDs and production follow-up.

## Restart Recovery

`repair-native.js` corrected image and button constraints after the restart. `polish-native.js` completed the scoped popup and tray work. The user manually ran the native stages and saved exports when desktop controls were unreliable.

## Verified Local Delivery

`exports/Zen-Mahjong-Artwork-V2-Theme-Study.zip` contains 20 native-size screen PNGs, 64 component/state PNGs and a manifest. All screen dimensions match declared frames; ZIP integrity passed. Extracted files are also under `exports/`.

`exports/Zen-Mahjong-Artwork-V2-Editable.fig` is the complete editable file backup, including older designs, variables and image assets. Archive integrity passed; a reimport round-trip has not been tested. This remains a theme iteration, not production sign-off.

# Zen Mahjong Prototype mobile app

The Expo application for the Zen Mahjong Prototype workspace. Run commands from the repository root and review product assumptions under `../../docs`.

## Development

Run commands from the repository root:

```sh
pnpm install
pnpm start
```

Use an Expo development build for device testing because the NoSQL adapter uses native MMKV code. The root `README.md` contains build commands, and `REVIEWING.md` contains the review sequence.

Run EAS commands from this directory. Expo's monorepo setup requires `app.json` and `eas.json` to live in the application directory, while workspace installation and shared verification commands remain at the repository root.

Routes live in `src/app`. Screens compose reusable code from the workspace packages; game rules and persistence logic do not belong in route files.

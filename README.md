# Zen Mahjong

An offline-first Mahjong Solitaire prototype for iOS and Android, built with Expo, React Native, and TypeScript.

This repository captures the **Prototype v0.4.0** source snapshot. Application package metadata currently remains at `0.3.0`; see the implementation notes and QA reports for the status of individual features.

## Repository layout

- [`zen-mahjong-prototype/`](zen-mahjong-prototype/): runnable pnpm workspace, application source, game logic, assets, tests, and implementation documentation.
- [`figma-zen-mahjong-generator/`](figma-zen-mahjong-generator/): Figma generators and design reference assets.
- [`exports/`](exports/): exported design screens, component references, and PDFs.
- Root `ZEN_MAHJONG_*.md` files: design briefs and asset requirements.

Dependency caches, generated native projects and builds, machine-local environment files, and the archived `zen-mahjong-v3-21-ios-contaminated/` backup are excluded from version control.

## Get started

Install Node.js 24 and pnpm 11.19.0, then run:

```sh
git clone https://github.com/kkaushik14/Zen-Mahjong.git
cd Zen-Mahjong/zen-mahjong-prototype
pnpm install
pnpm verify
```

The mobile app uses native MMKV storage and requires an Expo development build. With the native platform tools installed, build and start it with:

```sh
# iOS (macOS and Xcode required)
pnpm ios

# Android (Android SDK required)
pnpm android
```

For an installed development client, start Metro with:

```sh
pnpm dev:client
```

See the [device setup and QA guide](zen-mahjong-prototype/docs/DEVICE-QA.md) for physical devices and EAS build instructions.

## Workspace packages

- `apps/mobile`: Expo application, navigation, and screens.
- `packages/game-engine`: framework-independent Mahjong rules.
- `packages/game-content`: game content and level definitions.
- `packages/mahjong-ui`, `packages/ui`, and `packages/design-tokens`: reusable presentation and design foundations.
- `packages/persistence`: local storage contracts and MMKV adapter.
- `packages/shared-types` and `packages/test-utils`: shared contracts and test fixtures.

## Validation and documentation

Run commands from `zen-mahjong-prototype/`:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

`pnpm verify` runs all four checks. For further context, see the [review guide](zen-mahjong-prototype/REVIEWING.md), [v0.3.0 implementation documentation](zen-mahjong-prototype/docs/v0.3.0/README.md), [game rules](zen-mahjong-prototype/docs/GAME-RULES.md), and [privacy and store release gates](zen-mahjong-prototype/docs/GLOBAL-PRIVACY-AND-STORE-COMPLIANCE.md).

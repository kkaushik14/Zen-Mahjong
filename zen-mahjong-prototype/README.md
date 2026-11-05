# Zen Mahjong Prototype

Version `0.2.0` of an offline-first Mahjong Solitaire prototype for iOS and Android.

## Status

This repository is an implementation baseline. The `v0.2.0` Concentration-system requirements and screen handoff are documented but not yet fully implemented. Start with [docs/ZEN-MAHJONG-PROTOTYPE-V0.2.0-REQUIREMENTS.md](docs/ZEN-MAHJONG-PROTOTYPE-V0.2.0-REQUIREMENTS.md), [docs/ZEN-MAHJONG-PROTOTYPE-V0.2.0-DESIGN-HANDOFF.md](docs/ZEN-MAHJONG-PROTOTYPE-V0.2.0-DESIGN-HANDOFF.md), [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md), and [docs/OPEN-QUESTIONS.md](docs/OPEN-QUESTIONS.md).

The current machine audit and native-build prerequisites are recorded in [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).
Current delivery status is tracked in [docs/MILESTONES.md](docs/MILESTONES.md).
Global privacy, country review, and App Store/Google Play release gates are defined in [docs/GLOBAL-PRIVACY-AND-STORE-COMPLIANCE.md](docs/GLOBAL-PRIVACY-AND-STORE-COMPLIANCE.md).

## Workspace

- `apps/mobile`: Expo application and route composition.
- `packages/design-tokens`: portable visual and motion tokens.
- `packages/ui`: application-neutral React Native controls.
- `packages/mahjong-ui`: reusable Mahjong presentation components.
- `packages/game-engine`: framework-independent game rules.
- `packages/persistence`: NoSQL contracts and MMKV adapter.
- `packages/shared-types`: cross-package contracts.
- `packages/test-utils`: reusable test fixtures.

## Local setup

Use Node 24 LTS and pnpm 11.

```sh
pnpm install
pnpm verify
pnpm start
```

The app uses a native NoSQL dependency, so production-oriented development uses an Expo development build rather than Expo Go.

```sh
pnpm --filter @zen-mahjong/mobile exec expo run:ios
pnpm --filter @zen-mahjong/mobile exec expo run:android
```

For simultaneous physical testing, install a development build on each connected phone, then share one Metro development server:

```sh
pnpm device:ios
pnpm device:android
pnpm dev:client
```

The iPhone and Android phone keep separate local MMKV data. Setup prerequisites, the EAS alternative, and the complete validation matrix are in [docs/DEVICE-QA.md](docs/DEVICE-QA.md).

## Review

Open `zen-mahjong-prototype.code-workspace` in VS Code. See [REVIEWING.md](REVIEWING.md) for the review path and checks.

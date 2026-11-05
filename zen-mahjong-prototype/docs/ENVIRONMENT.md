# Local environment audit

- **Checked:** 2026-09-26
- **Installed Node:** Homebrew Node `24.21.0` at `/opt/homebrew/opt/node@24/bin/node`; a stale Node 25 link remains unusable outside the configured interactive shell
- **Repository Node requirement:** Node 24 LTS (`>=24 <25`)
- **Installed pnpm:** `11.19.0`
- **Repository package-manager pin:** `pnpm@11.19.0`
- **Git:** `2.52.0`
- **VS Code:** Installed; workspace file and review tasks are configured
- **Xcode:** `27.0` (`27A266a`) installed with the iOS 27.0 Simulator runtime
- **CocoaPods:** `1.17.0`
- **Selected developer directory:** `/Library/Developer/CommandLineTools`; run `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer` to make Xcode the system default
- **Android Studio:** Not installed
- **Android SDK/ADB:** Not installed or available on `PATH`
- **Java:** Launcher exists, but no Java runtime is installed
- **Available simulated hardware:** iPhone 18 Pro and other iOS 27.0 simulator devices
- **Connected mobile hardware:** No physical device is connected to local developer tooling; a OnePlus Nord 2 5G running Android 13/OxygenOS 13.0 was used to attempt the EAS APK installation

## Completed on this host

- All TypeScript, lint, formatting, and 17 automated tests pass.
- Expo Doctor passes 21/21 checks from `apps/mobile`.
- Expo configuration targets version `0.2.0`, iOS bundle identifier `com.zenmahjong.prototype`, and Android package `com.zenmahjong.prototype`; native configuration must be revalidated before the next build.
- Hermes production bundles generate for both iOS and Android. The current JavaScript bundles are approximately 4.9 MB for iOS and 5.1 MB for Android before store packaging.
- Responsive browser QA passes at `360x800`, `390x844`, and `430x932`.
- The loaded application continues routing, reading local progress, and playing a legal match after its local HTTP server is stopped.
- A native iOS Debug build compiles, installs, and launches on the iPhone 18 Pro simulator.
- Expo Build Properties opts SDK 57 into the UIKit scene lifecycle required by Xcode 27; the development launcher remains running and discovers Metro on port 8081.
- The EAS-linked Android development build completes successfully as an internal-distribution APK.

## Native blockers

Physical iOS testing still requires an iPhone, Developer Mode, trust/signing setup, and completion of the system `xcode-select` command. Local Android compilation and ADB diagnostics require Android Studio, an Android SDK, ADB, and a JDK; the selected EAS Android workflow does not require those tools merely to install a compatible APK.

EAS project ownership is configured for `kkos14`. The Android test device exceeds Expo SDK 57's minimum OS requirement; installation remains pending clean-download, existing-package, available-storage, and OxygenOS package-installer checks. iOS cloud distribution would still require Apple signing credentials and device registration.

Because the repository path contains a space, Expo SDK 57's affected iOS scripts are patched through `patchedDependencies`, and the generated app bundle phase is corrected by `apps/mobile/plugins/with-path-safe-ios-bundle.js`. Xcode 27 scene support is enabled through `expo-build-properties`; Expo SDK 58 and newer include scene support without this opt-in. Remove compatibility workarounds only after verifying the corresponding upstream packages on this exact path and Xcode version.

Use Node 24 and the repository-pinned pnpm version for routine development. See `DEVICE-QA.md` for dual-device setup and the remaining runbook.

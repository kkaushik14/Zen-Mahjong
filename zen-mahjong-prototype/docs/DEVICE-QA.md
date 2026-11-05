# Device QA

## Status

Milestone 6 is **partially complete** as of 2026-09-27. Platform-independent validation and an iOS Simulator native build/install pass are complete. Physical iOS execution remains pending, and the Android EAS development APK currently fails installation on a OnePlus Nord 2 5G running Android 13/OxygenOS 13.0 with Android's `package appears to be invalid` message.

Do not mark the milestone complete until both physical-device columns below pass.

## Two-device strategy

One iPhone and one Android phone can connect to the same Expo development server simultaneously. Each device needs a development build because MMKV is a native dependency and is not supplied by Expo Go. Device data remains independent; cross-device synchronization is outside `v0.2.0` and planned in `v0.3.0`.

### Local builds

1. Install Xcode, select it with `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`, accept its license, and install an iOS platform runtime. Xcode 27.0 and the iOS 27.0 Simulator runtime are installed on this Mac; the system-wide `xcode-select` step still requires the Mac administrator password.
2. Install Android Studio with Android SDK Platform Tools, an SDK platform compatible with Expo SDK 57, and its bundled JDK. Add `ANDROID_HOME` and platform tools to the shell environment.
3. On iPhone, enable Developer Mode, connect and trust the Mac, and select an Apple development team when Xcode requests signing.
4. On Android, enable Developer Options and USB debugging, connect the phone, and accept its RSA prompt.
5. Use Node 24 and the repository-pinned pnpm version.
6. Install once on each connected device:

```sh
pnpm device:ios
pnpm device:android
```

7. Start one shared Metro server from the repository root:

```sh
pnpm dev:client
```

8. Open the development client on both phones. Keep both phones and the Mac on the same LAN, or use Expo's tunnel option when LAN discovery is unavailable.

### EAS alternative

EAS cloud builds avoid local Xcode and Android compilation, but require an Expo account, confirmed app ownership, signing credentials, and final platform identifiers. Run EAS commands from `apps/mobile`, where `eas.json` and `app.json` live.

- Android internal distribution produces an installable APK.
- iOS internal distribution requires a paid Apple Developer membership and each iPhone UDID in the ad hoc provisioning profile.
- Register iPhones before building with `eas device:create`.

The EAS project is linked to Expo account `kkos14` with project ID `62d00bec-9875-45ec-a1eb-7e8ea8da52f3`. Android development build `51f1b741-ddcc-4afc-bb8e-9718bf38cf1a` finished successfully as a signed internal-distribution APK. Expo organization ownership is therefore operationally confirmed; Apple team, store names, and final release identifiers remain unconfirmed.

Expo SDK 57 supports Android 7 or newer and iOS 16.4 or newer. The OnePlus Nord 2 5G test device runs Android 13/OxygenOS 13.0, so minimum OS compatibility is confirmed. The remaining likely causes are an incomplete APK download, a conflicting installation of `com.zenmahjong.prototype` signed with different credentials, or stale package-installer state.

Before the next Android installation attempt:

1. Uninstall any existing **Zen Mahjong Prototype** installation from the phone.
2. Delete every previously downloaded Zen Mahjong APK from Downloads.
3. In **Settings > Apps > Special app access > Install unknown apps**, allow the browser or Files app that will open the APK.
4. Clear the cache for the browser, Downloads/Download Manager, and Package Installer when OxygenOS exposes those system apps. Do not clear unrelated application data.
5. Confirm at least 1 GB of free device storage, then download the APK again over a stable connection.
6. Open the newly downloaded file from the Files app and record the exact result. If it still fails, create a fresh EAS build and compare installation through ADB before changing application code.

## QA matrix

| Area                                        | Automated/browser                           | Physical iOS                     | Physical Android                 |
| ------------------------------------------- | ------------------------------------------- | -------------------------------- | -------------------------------- |
| TypeScript, lint, formatting                | Pass                                        | N/A                              | N/A                              |
| Unit and repository tests                   | Pass                                        | N/A                              | N/A                              |
| Expo configuration and dependency health    | Pass                                        | Pass in simulator environment    | EAS build pass                   |
| Native Metro bundle generation              | Pass                                        | Native build and install pass    | EAS native build pass            |
| Responsive layout at supported phone widths | Pass                                        | Pending                          | Pending                          |
| Touch targets and semantic control names    | Pass in accessibility tree                  | Pending VoiceOver                | Pending TalkBack                 |
| First launch in airplane mode               | Loaded-web flow pass; native launch pending | Pending physical-device test     | Pending installation             |
| Active-session termination and recovery     | Reload pass                                 | Pending force-quit test          | Pending force-stop test          |
| Settings/progress persistence               | Reload pass                                 | Pending reinstall/upgrade checks | Pending reinstall/upgrade checks |
| Previous-snapshot corruption recovery       | Unit pass                                   | Pending storage-fault test       | Pending storage-fault test       |
| Reduced motion                              | Logic and web interaction pass              | Pending system-setting review    | Pending system-setting review    |
| Haptics and audio                           | Settings only; services not implemented     | Pending                          | Pending                          |
| Performance and memory                      | Browser smoke pass                          | Pending Instruments              | Pending Android Profiler         |

Milestone 7 adds a 36-tile, three-layer Garden II board. Device runs must exercise this denser board when checking touch accuracy, reduced motion, frame pacing, shuffle transitions, and match-removal animation.

## Physical-device runbook

Run every item on both devices and record model, OS version, build profile, commit, and result.

1. Install a fresh development or preview build with no prior app data.
2. Enable airplane mode before first launch; confirm Home, Gameplay, Settings, Profile, Achievements, and Streaks open without a network error.
3. Make one match, force-quit or force-stop the app, relaunch, and confirm exactly six pairs remain with Undo available.
4. Change Music and Reduced Motion, terminate the app, relaunch, and confirm both settings persist.
5. Finish the board without hints; confirm Garden, boards, pairs, Still Mind, and streak update exactly once.
6. Terminate during completion, relaunch, and confirm the same session is not counted twice.
7. Change the device date forward one day, complete a board, and inspect the streak; then restore automatic date and time. Do not treat this as final time-zone validation until product rules are confirmed.
8. Turn on VoiceOver or TalkBack and complete a match without sight. Confirm blocked tiles are announced as disabled, open tiles include motif and availability, and all dock controls are reachable in a logical order.
9. Enable Reduced Motion and confirm tile selection changes remain visible without transition animation.
10. Rotate the device and confirm portrait orientation remains enforced.
11. Exercise Hint, Undo, Shuffle, Restart, background/resume, low-power mode, and an incoming-call interruption.
12. Profile a complete board. Record cold launch, interaction responsiveness, peak memory, crashes, and native warnings.

## Exit criteria

- Both physical-device columns pass all applicable rows.
- No crash, data loss, duplicate completion, inaccessible critical control, or external network dependency remains.
- Native warnings and measured performance are recorded with accepted thresholds.
- Any product-rule ambiguity discovered during device testing is added to `OPEN-QUESTIONS.md`, not silently encoded in the application.

## Recorded runs

### iOS Simulator, 2026-09-26

- Xcode 27.0, iOS 27.0 runtime, iPhone 18 Pro simulator.
- Native dependencies compiled, `ZenMahjongPrototype.app` was signed for the simulator, installed, and launched.
- Xcode 27's required UIKit scene lifecycle is enabled through Expo Build Properties. The development client now remains open and discovers the local Metro server.
- Runtime interaction QA remains pending one manual selection of the visible `Zen Mahjong Prototype` development-server row because Device Hub does not expose the simulated screen to the available accessibility controller.
- Project-path compatibility for `Game Development` is preserved through a local Expo config plugin and versioned pnpm patches. Generated `ios/` remains uncommitted under Continuous Native Generation.

### Android EAS development build, 2026-09-26

- Build ID: `51f1b741-ddcc-4afc-bb8e-9718bf38cf1a`.
- EAS status: finished; profile: `development`; distribution: internal; package: `com.zenmahjong.prototype`; version: `0.1.0` (`versionCode` 1).
- Test device: OnePlus Nord 2 5G, Android 13, OxygenOS 13.0.
- The downloaded 283 MB APK matches the EAS artifact, but Android rejected it as an invalid package. The device exceeds the minimum Android version; retry using the clean-install checklist above to distinguish a damaged download, existing-package signature conflict, or stale package-installer state.

## References

- [Expo monorepo EAS setup](https://docs.expo.dev/build-reference/build-with-monorepos/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Expo SDK platform requirements](https://docs.expo.dev/versions/latest/)
- [Expo Build Properties scene support](https://docs.expo.dev/versions/latest/sdk/build-properties/)

# Local environment audit

- **Checked:** 2026-09-25
- **Installed Node:** `25.2.1`
- **Repository Node requirement:** Node 24 LTS (`>=24 <25`)
- **pnpm:** `11.19.0`
- **Git:** `2.52.0`
- **VS Code:** Installed; workspace file opens successfully
- **Xcode:** Full Xcode toolchain is not active; only Command Line Tools are selected
- **Android SDK:** `adb` and `emulator` are not available on `PATH`

## Consequences

Type-checking, linting, tests, Expo Doctor, static export, and responsive browser QA can run locally. Native iOS and Android development builds cannot be verified until full Xcode and Android SDK tooling are configured. Use Node 24 LTS before routine development so local execution matches the repository contract.

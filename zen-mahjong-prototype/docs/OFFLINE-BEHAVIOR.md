# Offline behavior

## Baseline

The application is local-first and does not require internet access for setup or gameplay. The installed application owns its local state.

## Device-local capabilities

- Launch and onboarding
- Level content bundled with the application
- Gameplay and session restoration
- Settings and accessibility preferences
- Profile, progress, achievements, and streaks
- Audio and haptic preferences

## Implemented storage behavior

- MMKV stores versioned JSON document envelopes for settings, atomic player state, and the active session.
- Every accepted engine transition writes the active session synchronously.
- Before replacing a valid document, the repository retains its previous serialized snapshot.
- Reads validate envelope and payload shape, apply sequential migrations, and recover the previous valid snapshot when the current value is malformed.
- Board completion is idempotent by session ID and updates progress, achievements, and streaks in one player-state write.
- If MMKV initialization is unavailable, the app remains playable with an explicitly reported in-memory fallback; that fallback does not survive process termination.

## Future server capabilities

Cloud synchronization, cross-device restoration, online events, and remote content are outside `v0.2.0` and planned in the `v0.3.0` roadmap. They must enhance rather than gate the device-local experience unless the product requirements explicitly change.

Concentration Score revival is planned to work online and offline. Reward-ad recovery is available only when network and ad service are available; offline recovery must never display a misleading ad action.

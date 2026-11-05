# Persistence

Replaceable versioned-document persistence for the offline-first prototype.

## Building blocks

- `KeyValueStore` isolates repositories from the storage engine.
- `MmkvKeyValueStore` adapts `react-native-mmkv` for iOS, Android, and development web.
- `MemoryKeyValueStore` supports deterministic tests and graceful temporary fallback.
- `VersionedRepository` validates payloads, applies ordered migrations, increments revisions, retains the previous valid snapshot, and recovers from malformed current data.

Domain definitions and their validators remain in the application layer. The persistence package does not import game or interface code.

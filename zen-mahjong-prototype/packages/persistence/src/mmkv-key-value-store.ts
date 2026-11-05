import type { MMKV } from 'react-native-mmkv';

import type { KeyValueStore } from './contracts';

export class MmkvKeyValueStore implements KeyValueStore {
  constructor(private readonly storage: MMKV) {}

  getString(key: string): string | undefined {
    return this.storage.getString(key);
  }

  setString(key: string, value: string): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.remove(key);
  }
}

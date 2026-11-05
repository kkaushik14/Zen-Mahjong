import type { KeyValueStore } from './contracts';

export class MemoryKeyValueStore implements KeyValueStore {
  private readonly values = new Map<string, string>();

  getString(key: string): string | undefined {
    return this.values.get(key);
  }

  setString(key: string, value: string): void {
    this.values.set(key, value);
  }

  remove(key: string): void {
    this.values.delete(key);
  }
}

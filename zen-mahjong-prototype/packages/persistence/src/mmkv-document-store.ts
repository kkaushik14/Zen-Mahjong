import type { VersionedDocument } from '@zen-mahjong/shared-types';
import type { MMKV } from 'react-native-mmkv';

import type { DocumentCodec, DocumentStore } from './contracts';

export class MmkvDocumentStore implements DocumentStore {
  constructor(private readonly storage: MMKV) {}

  get<T>(key: string, codec: DocumentCodec<T>): VersionedDocument<T> | null {
    const serialized = this.storage.getString(key);
    if (!serialized) return null;

    try {
      const value: unknown = JSON.parse(serialized);
      return codec.isValid(value) ? value : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, document: VersionedDocument<T>): void {
    this.storage.set(key, JSON.stringify(document));
  }

  remove(key: string): void {
    this.storage.remove(key);
  }
}

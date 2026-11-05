import type { VersionedDocument } from '@zen-mahjong/shared-types';

export interface DocumentCodec<T> {
  isValid(value: unknown): value is VersionedDocument<T>;
}

export interface DocumentStore {
  get<T>(key: string, codec: DocumentCodec<T>): VersionedDocument<T> | null;
  set<T>(key: string, document: VersionedDocument<T>): void;
  remove(key: string): void;
}

export interface KeyValueStore {
  getString(key: string): string | undefined;
  remove(key: string): void;
  setString(key: string, value: string): void;
}

export interface DocumentMigration {
  fromVersion: number;
  migrate(payload: unknown): unknown;
}

export interface VersionedRepositoryDefinition<T> {
  key: string;
  migrations?: readonly DocumentMigration[];
  schemaVersion: number;
  validate(payload: unknown): payload is T;
}

export interface RepositoryReadResult<T> {
  document: VersionedDocument<T> | null;
  recovered: boolean;
}

export interface RepositoryReadOrCreateResult<T> {
  created: boolean;
  document: VersionedDocument<T>;
  recovered: boolean;
}

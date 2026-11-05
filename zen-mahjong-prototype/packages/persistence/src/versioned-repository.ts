import type { VersionedDocument } from '@zen-mahjong/shared-types';

import type {
  KeyValueStore,
  RepositoryReadOrCreateResult,
  RepositoryReadResult,
  VersionedRepositoryDefinition,
} from './contracts';

interface UnknownDocument {
  payload: unknown;
  revision: number;
  schemaVersion: number;
  updatedAt: string;
}

function parseDocument(serialized: string | undefined): UnknownDocument | null {
  if (!serialized) return null;

  try {
    const value: unknown = JSON.parse(serialized);
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Partial<UnknownDocument>;
    if (
      !Number.isInteger(candidate.schemaVersion) ||
      !Number.isInteger(candidate.revision) ||
      typeof candidate.updatedAt !== 'string' ||
      !('payload' in candidate)
    ) {
      return null;
    }
    return candidate as UnknownDocument;
  } catch {
    return null;
  }
}

export class VersionedRepository<T> {
  private readonly previousKey: string;

  constructor(
    private readonly store: KeyValueStore,
    private readonly definition: VersionedRepositoryDefinition<T>,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.previousKey = `${definition.key}:previous`;
  }

  read(): RepositoryReadResult<T> {
    const current = this.decode(this.store.getString(this.definition.key));
    if (current) {
      const document = current.migrated ? this.persistMigrated(current.document) : current.document;
      return { document, recovered: false };
    }

    const previous = this.decode(this.store.getString(this.previousKey));
    if (!previous) return { document: null, recovered: false };

    this.store.setString(this.definition.key, JSON.stringify(previous.document));
    return { document: previous.document, recovered: true };
  }

  readOrCreate(createDefault: () => T): RepositoryReadOrCreateResult<T> {
    const result = this.read();
    if (result.document) {
      return { created: false, document: result.document, recovered: result.recovered };
    }

    return {
      created: true,
      document: this.write(createDefault(), 0),
      recovered: false,
    };
  }

  write(payload: T, expectedRevision?: number): VersionedDocument<T> {
    if (!this.definition.validate(payload)) {
      throw new Error(`Invalid payload for ${this.definition.key}`);
    }

    const currentSerialized = this.store.getString(this.definition.key);
    const current = this.decode(currentSerialized);
    const currentRevision = current?.document.revision ?? 0;
    if (expectedRevision !== undefined && currentRevision !== expectedRevision) {
      throw new RepositoryRevisionConflictError(
        this.definition.key,
        expectedRevision,
        currentRevision,
      );
    }
    if (current && currentSerialized) this.store.setString(this.previousKey, currentSerialized);

    const document: VersionedDocument<T> = {
      payload,
      revision: currentRevision + 1,
      schemaVersion: this.definition.schemaVersion,
      updatedAt: this.now().toISOString(),
    };
    this.store.setString(this.definition.key, JSON.stringify(document));
    return document;
  }

  update(createDefault: () => T, updatePayload: (payload: T) => T): VersionedDocument<T> {
    const result = this.read();
    const revision = result.document?.revision ?? 0;
    const payload = result.document?.payload ?? createDefault();
    return this.write(updatePayload(payload), revision);
  }

  remove(): void {
    this.store.remove(this.definition.key);
    this.store.remove(this.previousKey);
  }

  private decode(
    serialized: string | undefined,
  ): { document: VersionedDocument<T>; migrated: boolean } | null {
    const parsed = parseDocument(serialized);
    if (!parsed || parsed.schemaVersion > this.definition.schemaVersion) return null;

    let payload = parsed.payload;
    let version = parsed.schemaVersion;
    while (version < this.definition.schemaVersion) {
      const migration = this.definition.migrations?.find((entry) => entry.fromVersion === version);
      if (!migration) return null;
      try {
        payload = migration.migrate(payload);
      } catch {
        return null;
      }
      version += 1;
    }

    if (!this.definition.validate(payload)) return null;
    return {
      document: {
        payload,
        revision: parsed.revision,
        schemaVersion: this.definition.schemaVersion,
        updatedAt: parsed.updatedAt,
      },
      migrated: parsed.schemaVersion !== this.definition.schemaVersion,
    };
  }

  private persistMigrated(document: VersionedDocument<T>): VersionedDocument<T> {
    const current = this.store.getString(this.definition.key);
    if (current) this.store.setString(this.previousKey, current);
    const migrated = {
      ...document,
      revision: document.revision + 1,
      updatedAt: this.now().toISOString(),
    };
    this.store.setString(this.definition.key, JSON.stringify(migrated));
    return migrated;
  }
}

export class RepositoryRevisionConflictError extends Error {
  constructor(
    readonly key: string,
    readonly expectedRevision: number,
    readonly actualRevision: number,
  ) {
    super(`Revision conflict for ${key}: expected ${expectedRevision}, received ${actualRevision}`);
    this.name = 'RepositoryRevisionConflictError';
  }
}

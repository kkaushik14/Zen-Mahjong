import { MemoryKeyValueStore } from '../memory-key-value-store';
import { RepositoryRevisionConflictError, VersionedRepository } from '../versioned-repository';

interface Preferences {
  musicEnabled: boolean;
  reducedMotion: boolean;
}

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Preferences>;
  return (
    typeof candidate.musicEnabled === 'boolean' && typeof candidate.reducedMotion === 'boolean'
  );
}

function createRepository(store: MemoryKeyValueStore) {
  return new VersionedRepository<Preferences>(
    store,
    {
      key: 'settings',
      schemaVersion: 2,
      validate: isPreferences,
      migrations: [
        {
          fromVersion: 1,
          migrate: (payload) => ({ ...(payload as object), reducedMotion: false }),
        },
      ],
    },
    () => new Date('2026-09-25T00:00:00.000Z'),
  );
}

describe('VersionedRepository', () => {
  it('writes validated documents with increasing revisions', () => {
    const repository = createRepository(new MemoryKeyValueStore());

    expect(repository.write({ musicEnabled: true, reducedMotion: false }).revision).toBe(1);
    expect(repository.write({ musicEnabled: false, reducedMotion: true }).revision).toBe(2);
    expect(repository.read().document?.payload).toEqual({
      musicEnabled: false,
      reducedMotion: true,
    });
  });

  it('migrates an older document and persists the current schema', () => {
    const store = new MemoryKeyValueStore();
    store.setString(
      'settings',
      JSON.stringify({
        schemaVersion: 1,
        revision: 4,
        updatedAt: '2026-09-24T00:00:00.000Z',
        payload: { musicEnabled: true },
      }),
    );

    const result = createRepository(store).read();

    expect(result.document).toEqual({
      schemaVersion: 2,
      revision: 5,
      updatedAt: '2026-09-25T00:00:00.000Z',
      payload: { musicEnabled: true, reducedMotion: false },
    });
    expect(JSON.parse(store.getString('settings') ?? '{}').schemaVersion).toBe(2);
  });

  it('restores the previous valid snapshot when the current value is corrupted', () => {
    const store = new MemoryKeyValueStore();
    const repository = createRepository(store);
    repository.write({ musicEnabled: true, reducedMotion: false });
    repository.write({ musicEnabled: false, reducedMotion: true });
    store.setString('settings', '{not-json');

    const result = repository.read();

    expect(result.recovered).toBe(true);
    expect(result.document?.payload).toEqual({ musicEnabled: true, reducedMotion: false });
  });

  it('returns an empty result when neither snapshot is valid', () => {
    const store = new MemoryKeyValueStore();
    store.setString('settings', '{broken');
    store.setString('settings:previous', '[]');

    expect(createRepository(store).read()).toEqual({ document: null, recovered: false });
  });

  it('creates a default once and updates it as one revision', () => {
    const repository = createRepository(new MemoryKeyValueStore());

    const created = repository.readOrCreate(() => ({
      musicEnabled: true,
      reducedMotion: false,
    }));
    const updated = repository.update(
      () => ({ musicEnabled: false, reducedMotion: false }),
      (preferences) => ({ ...preferences, reducedMotion: true }),
    );

    expect(created.created).toBe(true);
    expect(created.document.revision).toBe(1);
    expect(updated).toMatchObject({
      payload: { musicEnabled: true, reducedMotion: true },
      revision: 2,
    });
  });

  it('rejects a stale writer instead of overwriting a newer snapshot', () => {
    const repository = createRepository(new MemoryKeyValueStore());
    repository.write({ musicEnabled: true, reducedMotion: false });
    repository.write({ musicEnabled: false, reducedMotion: false }, 1);

    expect(() => repository.write({ musicEnabled: true, reducedMotion: true }, 1)).toThrow(
      RepositoryRevisionConflictError,
    );
    expect(repository.read().document?.payload).toEqual({
      musicEnabled: false,
      reducedMotion: false,
    });
  });
});

import {
  createConcentrationRun,
  createConcentrationSession,
  createFixtureState,
  createInitialAdvertisementState,
  createInitialOfflineSave,
  executeTrackedConcentrationCommand,
  getEconomyBalances,
  getConcentrationHint,
  validateOfflineSave,
  type OfflineSaveV2,
} from '@zen-mahjong/game-engine';
import { MemoryKeyValueStore, VersionedRepository } from '@zen-mahjong/persistence';

const NOW = '2026-10-02T00:00:00.000Z';
const KEY = 'offline-state:v0.3.0';

function createRepository(store: MemoryKeyValueStore) {
  return new VersionedRepository<OfflineSaveV2>(
    store,
    {
      key: KEY,
      schemaVersion: 2,
      validate: validateOfflineSave,
      migrations: [
        {
          fromVersion: 1,
          migrate: (payload) => ({
            ...(payload as object),
            advertisements: createInitialAdvertisementState(),
            schemaVersion: 2,
          }),
        },
      ],
    },
    () => new Date(NOW),
  );
}

describe('mobile v0.3.0 offline aggregate', () => {
  it('migrates a schema-one save with an empty advertisement receipt state', () => {
    const store = new MemoryKeyValueStore();
    const current = createInitialOfflineSave(NOW);
    const { advertisements: _advertisements, ...legacy } = current;
    store.setString(
      KEY,
      JSON.stringify({
        payload: { ...legacy, schemaVersion: 1 },
        revision: 4,
        schemaVersion: 1,
        updatedAt: NOW,
      }),
    );

    const result = createRepository(store).read();

    expect(result.document).toMatchObject({
      payload: { advertisements: { receipts: [], schemaVersion: 1 }, schemaVersion: 2 },
      revision: 5,
      schemaVersion: 2,
    });
    expect(result.document?.payload.economy).toEqual(current.economy);
    expect(result.document?.payload.progression).toEqual(current.progression);
    expect(getEconomyBalances(result.document?.payload.economy ?? current.economy)).toEqual({
      concentrationScore: 0,
      hint: 6,
      shuffle: 2,
      undo: 4,
    });
    expect(result.document?.payload.economy.transactions).toHaveLength(1);
  });

  it('commits a gameplay transition as one document and recovers the prior valid state', () => {
    const store = new MemoryKeyValueStore();
    const repository = createRepository(store);
    const initial = createInitialOfflineSave(NOW);
    repository.write(initial);

    const session = createConcentrationSession({
      category: 'normal',
      game: createFixtureState('garden-two', 'persisted-run'),
      levelContentVersion: '0.3.0',
      levelNumber: 1,
      sessionId: 'persisted-run',
      startedAt: NOW,
    });
    repository.update(
      () => initial,
      (save) => ({ ...save, activeRun: createConcentrationRun(session) }),
    );

    const hint = getConcentrationHint(session);
    if (!hint || hint.command.type !== 'select-board-tile') throw new Error('Expected tile hint');
    repository.update(
      () => initial,
      (save) => {
        if (!save.activeRun) throw new Error('Expected active run');
        const transition = executeTrackedConcentrationCommand(
          save.activeRun,
          save.economy,
          hint.command,
          { createdAt: NOW, transactionId: 'selection-1' },
        );
        if (!transition.accepted) throw new Error('Expected accepted selection');
        return { ...save, activeRun: transition.run, economy: transition.economy };
      },
    );

    store.setString(KEY, '{interrupted-write');
    const recovered = repository.read();

    expect(recovered.recovered).toBe(true);
    expect(recovered.document?.revision).toBe(2);
    expect(recovered.document?.payload.activeRun?.session.regularTray).toEqual([]);
    expect(validateOfflineSave(recovered.document?.payload)).toBe(true);
  });
});

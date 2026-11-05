import { createFixtureState } from '../fixtures';
import {
  acknowledgeFutureSyncEvent,
  createInitialOfflineSave,
  enqueueFutureSyncEvent,
  getPendingFutureSyncEvents,
  migrateLegacyOfflineState,
  validateOfflineSave,
} from '../offline-save';

const NOW = '2026-10-02T00:00:00.000Z';

describe('v0.3.0 offline save', () => {
  it('creates one valid aggregate with the initial inventory ledger', () => {
    const save = createInitialOfflineSave(NOW);

    expect(validateOfflineSave(save)).toBe(true);
    expect(save.economy.transactions).toHaveLength(1);
    expect(save.progression.currentLevelNumber).toBe(1);
    expect(save.outbox.events).toEqual([]);
  });

  it('migrates a legacy board as a paused run and archives legacy data', () => {
    const game = {
      ...createFixtureState('garden-two', 'legacy-seed'),
      shuffleCount: 2,
      tiles: createFixtureState('garden-two', 'legacy-seed').tiles.map((tile, index) =>
        index < 2 ? { ...tile, removed: true } : tile,
      ),
    };
    const result = migrateLegacyOfflineState({
      activeSession: {
        game,
        hintCount: 3,
        id: 'legacy-session',
        startedAt: '2026-10-01T10:00:00.000Z',
      },
      migratedAt: NOW,
      playerState: { progress: { boardsCompleted: 7 } },
    });

    expect(result.activeSessionMigrated).toBe(true);
    expect(result.playerStateArchived).toBe(true);
    expect(result.save.activeRun?.session).toMatchObject({
      activeSince: null,
      assistUsage: { hint: 3, shuffle: 2, undo: 0 },
      levelContentVersion: '0.2.0-legacy',
      sessionId: 'legacy-session',
    });
    expect(result.save.activeRun?.session.game.tiles.filter((tile) => tile.removed)).toHaveLength(
      2,
    );
    expect(result.save.legacyMigration?.playerState).toEqual({
      progress: { boardsCompleted: 7 },
    });
    expect(validateOfflineSave(result.save)).toBe(true);
  });

  it('keeps future sync events idempotent and explicitly acknowledged', () => {
    const initial = createInitialOfflineSave(NOW).outbox;
    const event = {
      aggregateId: 'session-1',
      eventId: 'session-1:snapshot-1',
      kind: 'session-snapshot' as const,
      occurredAt: NOW,
      payload: { revision: 1 },
      payloadVersion: 1,
    };
    const queued = enqueueFutureSyncEvent(initial, event);
    const retried = enqueueFutureSyncEvent(queued, event);
    const acknowledged = acknowledgeFutureSyncEvent(
      retried,
      event.eventId,
      '2026-10-02T00:01:00.000Z',
    );

    expect(retried).toBe(queued);
    expect(getPendingFutureSyncEvents(queued)).toHaveLength(1);
    expect(getPendingFutureSyncEvents(acknowledged)).toEqual([]);
    expect(acknowledged.events[0]).toMatchObject({
      acknowledgedAt: '2026-10-02T00:01:00.000Z',
      status: 'acknowledged',
    });
  });

  it('rejects an aggregate whose active run and progression disagree', () => {
    const save = createInitialOfflineSave(NOW);
    const migrated = migrateLegacyOfflineState({
      activeSession: {
        game: createFixtureState('garden-two', 'legacy-seed'),
        hintCount: 0,
        id: 'legacy-session',
        startedAt: NOW,
      },
      migratedAt: NOW,
      playerState: null,
    }).save;

    expect(
      validateOfflineSave({
        ...migrated,
        progression: { ...save.progression, currentLevelNumber: 2 },
      }),
    ).toBe(false);
  });
});

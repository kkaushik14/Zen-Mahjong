import { createFixtureState } from '../fixtures';
import { createConcentrationSession, executeConcentrationCommand } from '../concentration-engine';
import {
  validateCompletionReceipt,
  validateConcentrationSession,
  validateEconomyLedgerEntry,
} from '../contracts';

describe('v0.3.0 contracts', () => {
  it('validates active sessions and rejects overfilled trays', () => {
    const initial = createConcentrationSession({
      category: 'normal',
      game: createFixtureState('garden-two', 'v0.3.0-contract'),
      levelContentVersion: '0.3.0',
      levelNumber: 1,
      sessionId: 'session-1',
      startedAt: '2026-10-02T00:00:00.000Z',
    });
    const session = executeConcentrationCommand(initial, {
      tileId: 'base-row-one-outer-lotus-left',
      type: 'select-board-tile',
    }).session;

    expect(validateConcentrationSession(session)).toBe(true);
    expect(
      validateConcentrationSession({
        ...session,
        regularTray: ['one', 'two', 'three', 'four', 'five'],
      }),
    ).toBe(false);
    expect(validateConcentrationSession({ ...session, regularTray: ['not-a-real-tile'] })).toBe(
      false,
    );
  });

  it('validates idempotent ledger and completion records', () => {
    expect(
      validateEconomyLedgerEntry({
        asset: 'hint',
        createdAt: '2026-10-02T00:00:00.000Z',
        delta: 6,
        entryId: 'initial-hints',
        reason: 'initial-grant',
        schemaVersion: 1,
        sessionId: null,
      }),
    ).toBe(true);

    expect(
      validateCompletionReceipt({
        activeDurationSeconds: 160,
        assistUsage: { hint: 0, shuffle: 0, undo: 0 },
        completedAt: '2026-10-02T00:02:40.000Z',
        levelNumber: 1,
        qualifyingAssistAdCount: 0,
        receiptId: 'completion-session-1',
        schemaVersion: 1,
        sessionId: 'session-1',
        zenScore: 18,
      }),
    ).toBe(true);
  });
});

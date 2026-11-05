import type {
  AssistUsage,
  CompletionReceiptV1,
  ConcentrationSessionV1,
} from '../concentration-model';
import { createFixtureState } from '../fixtures';
import { createInitialEconomyState, getEconomyBalances } from '../local-economy';
import {
  completeLevel,
  createInitialPlayerProgression,
  getZenProgressPresentation,
  recordCompletionReceipt,
  recordDailyVisit,
  validatePlayerProgression,
  type PlayerProgressionV1,
} from '../score-progression';

const createdAt = '2026-10-02T00:00:00.000Z';

function receipt(levelNumber: number, zenScore: number): CompletionReceiptV1 {
  return {
    activeDurationSeconds: 180 - levelNumber,
    assistUsage: { hint: 0, shuffle: 0, undo: 0 },
    completedAt: `2026-10-${String(levelNumber).padStart(2, '0')}T00:00:00.000Z`,
    levelNumber,
    qualifyingAssistAdCount: 0,
    receiptId: `receipt-${levelNumber}`,
    schemaVersion: 1,
    sessionId: `session-${levelNumber}`,
    zenScore,
  };
}

function wonSession(
  levelNumber: number,
  activeDurationSeconds: number,
  assistUsage: AssistUsage = { hint: 0, shuffle: 0, undo: 0 },
): ConcentrationSessionV1 {
  const game = createFixtureState('flat-introduction', `level-${levelNumber}`);
  return {
    activeElapsedMs: activeDurationSeconds * 1000,
    activeSince: null,
    assistUsage,
    category: levelNumber % 8 < 3 ? 'normal' : 'high',
    game: {
      ...game,
      tiles: game.tiles.map((tile) => ({ ...tile, removed: true })),
    },
    levelContentVersion: '0.3.0',
    levelNumber,
    regularTray: [],
    revivalCount: 0,
    schemaVersion: 1,
    sessionId: `session-${levelNumber}`,
    specialSlotTileId: null,
    specialUsesRemaining: 0,
    startedAt: createdAt,
    status: 'won',
  };
}

function recordScores(scores: readonly number[]): {
  economy: ReturnType<typeof createInitialEconomyState>;
  progression: PlayerProgressionV1;
} {
  let progression = createInitialPlayerProgression();
  let economy = createInitialEconomyState(createdAt);
  scores.forEach((score, index) => {
    const result = recordCompletionReceipt(progression, economy, receipt(index + 1, score));
    expect(result.accepted).toBe(true);
    progression = result.progression;
    economy = result.economy;
  });
  return { economy, progression };
}

describe('v0.3.0 Zen Score completion', () => {
  it('records no comparison bonus for the first level and +1 at exactly ten seconds faster', () => {
    const initialProgression = createInitialPlayerProgression();
    const initialEconomy = createInitialEconomyState(createdAt);
    const first = completeLevel(wonSession(1, 160), initialProgression, initialEconomy, {
      completedAt: '2026-10-02T00:02:40.000Z',
      qualifyingAssistAdCount: 0,
      receiptId: 'completion-1',
    });
    const second = completeLevel(wonSession(2, 150), first.progression, first.economy, {
      completedAt: '2026-10-03T00:02:30.000Z',
      qualifyingAssistAdCount: 0,
      receiptId: 'completion-2',
    });

    expect(first.breakdown).toEqual({
      assistAdBonus: 0,
      baseScore: 18,
      finalScore: 18,
      timeBonus: 0,
    });
    expect(second.breakdown).toEqual({
      assistAdBonus: 0,
      baseScore: 18,
      finalScore: 19,
      timeBonus: 1,
    });
    expect(second.progression.currentLevelNumber).toBe(3);
  });

  it('keeps unlimited qualifying ad bonuses and displays the actual overflow score', () => {
    const result = completeLevel(
      wonSession(1, 100),
      createInitialPlayerProgression(),
      createInitialEconomyState(createdAt),
      {
        completedAt: '2026-10-02T00:01:40.000Z',
        qualifyingAssistAdCount: 4,
        receiptId: 'overflow-completion',
      },
    );

    expect(result.receipt?.zenScore).toBe(22);
    expect(getZenProgressPresentation(result.receipt?.zenScore ?? 0)).toEqual({
      actualScore: 22,
      milestonePercent: 100,
      overflow: true,
      standardScaleEndReached: true,
    });
  });

  it('stops a running completion timer at the supplied final-match timestamp', () => {
    const running = {
      ...wonSession(1, 0),
      activeSince: '2026-10-02T00:00:00.000Z',
    };
    const result = completeLevel(
      running,
      createInitialPlayerProgression(),
      createInitialEconomyState(createdAt),
      {
        completedAt: '2026-10-02T00:01:40.000Z',
        qualifyingAssistAdCount: 0,
        receiptId: 'running-timer-completion',
      },
    );

    expect(result.session.activeSince).toBeNull();
    expect(result.receipt?.activeDurationSeconds).toBe(100);
  });

  it('rejects replay and duplicate completion receipts', () => {
    const first = recordCompletionReceipt(
      createInitialPlayerProgression(),
      createInitialEconomyState(createdAt),
      receipt(1, 18),
    );
    const duplicate = recordCompletionReceipt(first.progression, first.economy, receipt(1, 18));
    const replay = recordCompletionReceipt(first.progression, first.economy, {
      ...receipt(1, 18),
      receiptId: 'different-replay-receipt',
    });

    expect(duplicate).toMatchObject({ accepted: false, reason: 'duplicate-receipt' });
    expect(replay).toMatchObject({ accepted: false, reason: 'level-not-current' });
    expect(duplicate.progression).toBe(first.progression);
    expect(replay.economy).toBe(first.economy);
  });
});

describe('v0.3.0 tier progression', () => {
  it('awards Concentration Score only after eight sequential levels and rounds exactly .5 down', () => {
    const { economy, progression } = recordScores([10, 10, 10, 10, 10, 10, 10, 14]);

    expect(progression.currentLevelNumber).toBe(9);
    expect(progression.tierAwards).toHaveLength(1);
    expect(progression.tierAwards[0]?.concentrationScore).toBe(10);
    expect(progression.lifetimeConcentrationScoreEarned).toBe(10);
    expect(getEconomyBalances(economy).concentrationScore).toBe(10);
  });

  it('does not award a partial tier', () => {
    const { economy, progression } = recordScores([18, 18, 18, 18, 18, 18, 18]);

    expect(progression.tierAwards).toEqual([]);
    expect(progression.lifetimeConcentrationScoreEarned).toBe(0);
    expect(getEconomyBalances(economy).concentrationScore).toBe(0);
  });

  it('automatically grants the once-only 25-score achievement after tier calculation', () => {
    const { economy, progression } = recordScores([25, 25, 25, 25, 25, 25, 25, 25]);

    expect(progression.lifetimeConcentrationScoreEarned).toBe(25);
    expect(getEconomyBalances(economy)).toMatchObject({ concentrationScore: 27, undo: 5 });
    expect(
      economy.transactions.filter(
        (transaction) => transaction.transactionId === 'achievement:concentration-25',
      ),
    ).toHaveLength(1);
  });

  it('validates JSON-reconstructed incremental progression', () => {
    const { progression } = recordScores([18, 18, 18]);

    expect(validatePlayerProgression(JSON.parse(JSON.stringify(progression)))).toBe(true);
    expect(validatePlayerProgression({ ...progression, currentLevelNumber: 2 })).toBe(false);
    expect(
      validatePlayerProgression({ ...progression, lifetimeConcentrationScoreEarned: 10 }),
    ).toBe(false);
    expect(validatePlayerProgression({ ...progression, tierAwards: [{}] })).toBe(false);
  });
});

describe('v0.3.0 streak progression', () => {
  it('starts at day one, continues on the next date, and resets after a gap', () => {
    let progression = createInitialPlayerProgression();
    let economy = createInitialEconomyState(createdAt);
    const first = recordDailyVisit(progression, economy, {
      createdAt,
      localDate: '2026-10-01',
    });
    progression = first.progression;
    economy = first.economy;
    const second = recordDailyVisit(progression, economy, {
      createdAt,
      localDate: '2026-10-02',
    });
    const reset = recordDailyVisit(second.progression, second.economy, {
      createdAt,
      localDate: '2026-10-04',
    });

    expect(first.progression.streak.current).toBe(1);
    expect(second.progression.streak.current).toBe(2);
    expect(reset.progression.streak).toMatchObject({ best: 2, current: 1 });
  });

  it('grants the day-seven achievement once and ignores repeated visits on the same date', () => {
    let progression = createInitialPlayerProgression();
    let economy = createInitialEconomyState(createdAt);
    for (let day = 1; day <= 7; day += 1) {
      const result = recordDailyVisit(progression, economy, {
        createdAt,
        localDate: `2026-10-${String(day).padStart(2, '0')}`,
      });
      progression = result.progression;
      economy = result.economy;
    }
    const repeated = recordDailyVisit(progression, economy, {
      createdAt,
      localDate: '2026-10-07',
    });

    expect(progression.streak.current).toBe(7);
    expect(getEconomyBalances(economy)).toMatchObject({ hint: 7, undo: 5 });
    expect(repeated.progression).toBe(progression);
    expect(repeated.economy).toBe(economy);
  });
});

describe('v0.3.0 score presentation milestones', () => {
  it.each([
    [2, 0, false, false],
    [3, 10, false, false],
    [6, 20, false, false],
    [10, 50, false, false],
    [20, 100, true, false],
    [22, 100, true, true],
  ] as const)(
    'maps score %i to milestone %i',
    (score, milestonePercent, standardScaleEndReached, overflow) => {
      expect(getZenProgressPresentation(score)).toMatchObject({
        actualScore: score,
        milestonePercent,
        overflow,
        standardScaleEndReached,
      });
    },
  );
});

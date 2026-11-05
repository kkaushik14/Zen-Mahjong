import {
  createInitialEconomyState,
  createInitialPlayerProgression,
  recordCompletionReceipt,
  type CompletionReceiptV1,
} from '@zen-mahjong/game-engine';

import { getCompletionPresentation } from '../completion-presentation';

const NOW = '2026-10-01T00:00:00.000Z';

function receipt(levelNumber: number, zenScore = 18): CompletionReceiptV1 {
  return {
    activeDurationSeconds: 160 - levelNumber,
    assistUsage: { hint: 0, shuffle: 0, undo: 0 },
    completedAt: `2026-10-${String(levelNumber).padStart(2, '0')}T00:00:00.000Z`,
    levelNumber,
    qualifyingAssistAdCount: zenScore - 18,
    receiptId: `completion-${levelNumber}`,
    schemaVersion: 1,
    sessionId: `session-${levelNumber}`,
    zenScore,
  };
}

describe('completion presentation', () => {
  it('reconstructs score overflow from the persisted receipt', () => {
    const initialProgression = createInitialPlayerProgression();
    const initialEconomy = createInitialEconomyState(NOW);
    const recorded = recordCompletionReceipt(initialProgression, initialEconomy, receipt(1, 22));

    expect(
      getCompletionPresentation(recorded.progression, recorded.economy, 'completion-1'),
    ).toMatchObject({
      activeDuration: '02:39',
      breakdown: { assistAdBonus: 4, baseScore: 18, finalScore: 22, timeBonus: 0 },
      levelNumber: 1,
      nextLevelNumber: 2,
      score: 22,
      scoreOverflow: true,
      tierPosition: 1,
    });
  });

  it('presents the awarded Concentration Score only on an eight-level tier completion', () => {
    let progression = createInitialPlayerProgression();
    let economy = createInitialEconomyState(NOW);
    for (let level = 1; level <= 8; level += 1) {
      const recorded = recordCompletionReceipt(progression, economy, receipt(level));
      progression = recorded.progression;
      economy = recorded.economy;
    }

    expect(getCompletionPresentation(progression, economy, 'completion-8')).toMatchObject({
      tierNumber: 1,
      tierPosition: 8,
      tierScoreAwarded: 18,
    });
    expect(getCompletionPresentation(progression, economy, 'completion-7')).toMatchObject({
      tierScoreAwarded: null,
    });
  });
});

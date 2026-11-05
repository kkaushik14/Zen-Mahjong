import {
  createInitialEconomyState,
  createInitialPlayerProgression,
  grantEligibleAchievementRewards,
} from '@zen-mahjong/game-engine';

import { getAchievementPresentations } from '../achievement-presentation';

const NOW = '2026-10-07T00:00:00.000Z';

describe('achievement presentation', () => {
  it('uses once-only ledger transactions as the unlocked authority', () => {
    const progression = {
      ...createInitialPlayerProgression(),
      lifetimeConcentrationScoreEarned: 50,
      streak: { best: 7, current: 7, lastVisitLocalDate: '2026-10-07' },
    };
    const rewarded = grantEligibleAchievementRewards(createInitialEconomyState(NOW), {
      concentrationScore: 50,
      createdAt: NOW,
      streakDays: 7,
    });

    const achievements = getAchievementPresentations(progression, rewarded.state);

    expect(achievements.find((item) => item.id === 'streak-7')).toMatchObject({
      progress: 7,
      reward: '1 Undo and 1 Hint',
      unlocked: true,
    });
    expect(achievements.find((item) => item.id === 'concentration-50')).toMatchObject({
      progress: 50,
      reward: '4 Concentration Score and 2 Undo',
      unlocked: true,
    });
    expect(achievements.find((item) => item.id === 'concentration-100')).toMatchObject({
      progress: 50,
      unlocked: false,
    });
  });
});

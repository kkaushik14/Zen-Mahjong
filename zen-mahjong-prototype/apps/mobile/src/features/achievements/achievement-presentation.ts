import {
  ACHIEVEMENT_REWARD_DEFINITIONS,
  type EconomyMutation,
  type LocalEconomyStateV1,
  type PlayerProgressionV1,
  type RewardAchievementId,
} from '@zen-mahjong/game-engine';

interface AchievementCopy {
  artworkId: string;
  description: string;
  title: string;
}

export interface AchievementPresentation extends AchievementCopy {
  id: RewardAchievementId;
  maximum: number;
  progress: number;
  reward: string;
  status: 'In progress' | 'Unlocked';
  unlocked: boolean;
}

const copy: Record<RewardAchievementId, AchievementCopy> = {
  'streak-7': {
    artworkId: '08-sun',
    description: 'Reach a 7-day visit streak',
    title: 'Returning Light',
  },
  'streak-14': {
    artworkId: '06-moon',
    description: 'Reach a 14-day visit streak',
    title: 'Two Quiet Weeks',
  },
  'streak-21': {
    artworkId: '05-lotus',
    description: 'Reach a 21-day visit streak',
    title: 'Stillness Habit',
  },
  'concentration-25': {
    artworkId: '01-bamboo',
    description: 'Earn 25 lifetime Concentration Score',
    title: 'Focused Beginning',
  },
  'concentration-50': {
    artworkId: '09-river',
    description: 'Earn 50 lifetime Concentration Score',
    title: 'Clear Current',
  },
  'concentration-100': {
    artworkId: '07-mountain',
    description: 'Earn 100 lifetime Concentration Score',
    title: 'Mountain Mind',
  },
  'concentration-125': {
    artworkId: '26-waterfall',
    description: 'Earn 125 lifetime Concentration Score',
    title: 'Deep Current',
  },
  'concentration-150': {
    artworkId: '25-bridge',
    description: 'Earn 150 lifetime Concentration Score',
    title: 'Quiet Horizon',
  },
  'concentration-200': {
    artworkId: '12-bonsai',
    description: 'Earn 200 lifetime Concentration Score',
    title: 'Still Mountain',
  },
};

const assetNames: Record<EconomyMutation['asset'], string> = {
  'concentration-score': 'Concentration Score',
  hint: 'Hint',
  shuffle: 'Shuffle',
  undo: 'Undo',
};

function formatRewards(rewards: readonly EconomyMutation[]): string {
  const parts = rewards.map((reward) => `${reward.delta} ${assetNames[reward.asset]}`);
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
}

export function getAchievementPresentations(
  progression: PlayerProgressionV1,
  economy: LocalEconomyStateV1,
): readonly AchievementPresentation[] {
  const granted = new Set(
    economy.transactions
      .filter((transaction) => transaction.transactionId.startsWith('achievement:'))
      .map((transaction) => transaction.transactionId.replace('achievement:', '')),
  );

  return ACHIEVEMENT_REWARD_DEFINITIONS.map((definition) => {
    const details = copy[definition.id];
    const measuredProgress =
      definition.kind === 'streak'
        ? progression.streak.current
        : progression.lifetimeConcentrationScoreEarned;
    const unlocked = granted.has(definition.id);
    return {
      ...details,
      id: definition.id,
      maximum: definition.threshold,
      progress: unlocked ? definition.threshold : Math.min(measuredProgress, definition.threshold),
      reward: formatRewards(definition.rewards),
      status: unlocked ? 'Unlocked' : 'In progress',
      unlocked,
    };
  });
}

import type { EconomyMutation, LocalEconomyStateV1 } from './local-economy';
import { applyEconomyTransaction } from './local-economy';

export type RewardAchievementId =
  | 'streak-7'
  | 'streak-14'
  | 'streak-21'
  | 'concentration-25'
  | 'concentration-50'
  | 'concentration-100'
  | 'concentration-125'
  | 'concentration-150'
  | 'concentration-200';

export interface AchievementRewardDefinition {
  id: RewardAchievementId;
  kind: 'concentration-score' | 'streak';
  rewards: readonly EconomyMutation[];
  threshold: number;
}

export interface AchievementRewardInput {
  concentrationScore: number;
  createdAt: string;
  streakDays: number;
}

export interface AchievementRewardResult {
  grantedAchievementIds: readonly RewardAchievementId[];
  state: LocalEconomyStateV1;
}

const CONCENTRATION_REWARDS = [
  [25, 2, 1],
  [50, 4, 2],
  [100, 6, 3],
  [125, 8, 4],
  [150, 10, 5],
  [200, 12, 6],
] as const;

export const ACHIEVEMENT_REWARD_DEFINITIONS: readonly AchievementRewardDefinition[] = [
  {
    id: 'streak-7',
    kind: 'streak',
    rewards: [
      { asset: 'undo', delta: 1, reason: 'achievement-reward' },
      { asset: 'hint', delta: 1, reason: 'achievement-reward' },
    ],
    threshold: 7,
  },
  {
    id: 'streak-14',
    kind: 'streak',
    rewards: [{ asset: 'shuffle', delta: 2, reason: 'achievement-reward' }],
    threshold: 14,
  },
  {
    id: 'streak-21',
    kind: 'streak',
    rewards: [
      { asset: 'shuffle', delta: 2, reason: 'achievement-reward' },
      { asset: 'undo', delta: 3, reason: 'achievement-reward' },
      { asset: 'hint', delta: 4, reason: 'achievement-reward' },
    ],
    threshold: 21,
  },
  ...CONCENTRATION_REWARDS.map<AchievementRewardDefinition>(([threshold, score, undo]) => ({
    id: `concentration-${threshold}` as RewardAchievementId,
    kind: 'concentration-score',
    rewards: [
      { asset: 'concentration-score', delta: score, reason: 'achievement-reward' },
      { asset: 'undo', delta: undo, reason: 'achievement-reward' },
    ],
    threshold,
  })),
];

export function grantEligibleAchievementRewards(
  state: LocalEconomyStateV1,
  input: AchievementRewardInput,
): AchievementRewardResult {
  if (!Number.isInteger(input.streakDays) || input.streakDays < 0) {
    throw new RangeError('streakDays must be a non-negative integer');
  }
  if (!Number.isInteger(input.concentrationScore) || input.concentrationScore < 0) {
    throw new RangeError('concentrationScore must be a non-negative integer');
  }

  let current = state;
  const grantedAchievementIds: RewardAchievementId[] = [];
  for (const definition of ACHIEVEMENT_REWARD_DEFINITIONS) {
    const value = definition.kind === 'streak' ? input.streakDays : input.concentrationScore;
    if (value < definition.threshold) continue;

    const result = applyEconomyTransaction(current, {
      createdAt: input.createdAt,
      mutations: definition.rewards,
      transactionId: `achievement:${definition.id}`,
    });
    if (result.applied) {
      current = result.state;
      grantedAchievementIds.push(definition.id);
    }
  }

  return { grantedAchievementIds, state: current };
}

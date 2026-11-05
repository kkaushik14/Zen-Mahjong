import type { ConcentrationCategory, TierPosition } from './model';

const LEVELS_PER_TIER = 8;
const LEVELS_PER_CATEGORY = 2;
const CATEGORY_ORDER: readonly ConcentrationCategory[] = ['normal', 'high', 'super', 'special'];

export function getTierPosition(levelNumber: number): TierPosition {
  if (!Number.isInteger(levelNumber) || levelNumber < 1) {
    throw new RangeError('levelNumber must be a positive integer');
  }

  const zeroBasedLevel = levelNumber - 1;
  const levelInTier = (zeroBasedLevel % LEVELS_PER_TIER) + 1;
  const categoryIndex = Math.floor((levelInTier - 1) / LEVELS_PER_CATEGORY);
  const category = CATEGORY_ORDER[categoryIndex];

  if (!category) throw new RangeError('Unable to map level category');

  return {
    category,
    categoryLevel: (((levelInTier - 1) % LEVELS_PER_CATEGORY) + 1) as 1 | 2,
    levelInTier,
    levelNumber,
    tierNumber: Math.floor(zeroBasedLevel / LEVELS_PER_TIER) + 1,
  };
}

export function getNextLevelNumber(levelNumber: number): number {
  getTierPosition(levelNumber);
  return levelNumber + 1;
}

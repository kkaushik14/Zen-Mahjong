import type { ConcentrationCategory } from '@zen-mahjong/game-content';

import type { AssistInventory } from './concentration-model';

export const INITIAL_ASSIST_INVENTORY: Readonly<AssistInventory> = Object.freeze({
  hint: 6,
  shuffle: 2,
  undo: 4,
});

const INCLUDED_SPECIAL_USES: Readonly<Record<ConcentrationCategory, number>> = Object.freeze({
  high: 1,
  normal: 2,
  special: 2,
  super: 0,
});

export function createInitialAssistInventory(): AssistInventory {
  return { ...INITIAL_ASSIST_INVENTORY };
}

export function getIncludedSpecialUses(category: ConcentrationCategory): number {
  return INCLUDED_SPECIAL_USES[category];
}

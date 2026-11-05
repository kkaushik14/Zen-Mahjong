import {
  createInitialAssistInventory,
  getIncludedSpecialUses,
  INITIAL_ASSIST_INVENTORY,
} from '../concentration-config';

describe('v0.3.0 Concentration configuration', () => {
  it('provides a fresh copy of the confirmed initial assist inventory', () => {
    const first = createInitialAssistInventory();
    const second = createInitialAssistInventory();

    expect(first).toEqual({ hint: 6, shuffle: 2, undo: 4 });
    expect(first).toEqual(INITIAL_ASSIST_INVENTORY);
    expect(first).not.toBe(second);
  });

  it.each([
    ['normal', 2],
    ['high', 1],
    ['super', 0],
    ['special', 2],
  ] as const)('%s includes %i special-slot uses', (category, expected) => {
    expect(getIncludedSpecialUses(category)).toBe(expected);
  });
});

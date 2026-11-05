import { getNextLevelNumber, getTierPosition } from '../progression';

describe('v0.3.0 tier progression', () => {
  it.each([
    [1, 1, 1, 'normal', 1],
    [2, 1, 2, 'normal', 2],
    [3, 1, 3, 'high', 1],
    [4, 1, 4, 'high', 2],
    [5, 1, 5, 'super', 1],
    [6, 1, 6, 'super', 2],
    [7, 1, 7, 'special', 1],
    [8, 1, 8, 'special', 2],
    [9, 2, 1, 'normal', 1],
    [16, 2, 8, 'special', 2],
  ] as const)(
    'maps level %i into tier %i position %i',
    (levelNumber, tierNumber, levelInTier, category, categoryLevel) => {
      expect(getTierPosition(levelNumber)).toEqual({
        category,
        categoryLevel,
        levelInTier,
        levelNumber,
        tierNumber,
      });
    },
  );

  it('advances incrementally and rejects invalid level numbers', () => {
    expect(getNextLevelNumber(8)).toBe(9);
    expect(() => getTierPosition(0)).toThrow(RangeError);
    expect(() => getTierPosition(1.5)).toThrow(RangeError);
  });
});

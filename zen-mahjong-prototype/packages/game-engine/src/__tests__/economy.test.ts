import {
  calculateConcentrationScore,
  calculateZenScore,
  getRevivalCost,
  getZenScoreBase,
} from '../economy';

describe('v0.3.0 Zen Score', () => {
  it.each([
    [{ undo: 1, hint: 1, shuffle: 1 }, 10],
    [{ undo: 1, hint: 1, shuffle: 0 }, 18],
    [{ undo: 1, hint: 0, shuffle: 1 }, 15],
    [{ undo: 0, hint: 1, shuffle: 1 }, 14],
    [{ undo: 1, hint: 0, shuffle: 0 }, 18],
    [{ undo: 0, hint: 1, shuffle: 0 }, 15],
    [{ undo: 0, hint: 0, shuffle: 1 }, 14],
    [{ undo: 0, hint: 0, shuffle: 0 }, 18],
  ])('applies the confirmed precedence for usage %o', (assistUsage, expected) => {
    expect(getZenScoreBase(assistUsage)).toBe(expected);
  });

  it('awards one point at the ten-second boundary and none on the first completion', () => {
    const common = {
      assistUsage: { hint: 0, shuffle: 0, undo: 0 },
      qualifyingAssistAdCount: 0,
    };

    expect(
      calculateZenScore({
        ...common,
        currentActiveDurationSeconds: 150,
        previousActiveDurationSeconds: 160,
      }).timeBonus,
    ).toBe(1);
    expect(
      calculateZenScore({
        ...common,
        currentActiveDurationSeconds: 151,
        previousActiveDurationSeconds: 160,
      }).timeBonus,
    ).toBe(0);
    expect(
      calculateZenScore({
        ...common,
        currentActiveDurationSeconds: 150,
        previousActiveDurationSeconds: null,
      }).timeBonus,
    ).toBe(0);
  });

  it('keeps scores uncapped above the visual threshold', () => {
    expect(
      calculateZenScore({
        assistUsage: { hint: 0, shuffle: 0, undo: 0 },
        currentActiveDurationSeconds: 100,
        previousActiveDurationSeconds: 120,
        qualifyingAssistAdCount: 4,
      }),
    ).toEqual({ assistAdBonus: 4, baseScore: 18, finalScore: 23, timeBonus: 1 });
  });
});

describe('v0.3.0 Concentration economy', () => {
  it('produces the confirmed revival sequence', () => {
    expect(Array.from({ length: 8 }, (_, index) => getRevivalCost(index + 1))).toEqual([
      10, 15, 25, 40, 50, 65, 75, 90,
    ]);
  });

  it('rounds tier averages down through exactly .5 and up above .5', () => {
    expect(calculateConcentrationScore([10, 10, 10, 10, 10, 10, 10, 14])).toBe(10);
    expect(calculateConcentrationScore([10, 10, 10, 10, 10, 10, 10, 15])).toBe(11);
    expect(() => calculateConcentrationScore([10])).toThrow(RangeError);
  });
});

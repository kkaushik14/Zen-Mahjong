import type { AssistUsage } from './concentration-model';

export interface ZenScoreInput {
  assistUsage: AssistUsage;
  currentActiveDurationSeconds: number;
  previousActiveDurationSeconds: number | null;
  qualifyingAssistAdCount: number;
}

export interface ZenScoreBreakdown {
  assistAdBonus: number;
  baseScore: number;
  finalScore: number;
  timeBonus: number;
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}

export function getZenScoreBase(usage: AssistUsage): number {
  assertNonNegativeInteger(usage.undo, 'assistUsage.undo');
  assertNonNegativeInteger(usage.hint, 'assistUsage.hint');
  assertNonNegativeInteger(usage.shuffle, 'assistUsage.shuffle');

  const undoUsed = usage.undo > 0;
  const hintUsed = usage.hint > 0;
  const shuffleUsed = usage.shuffle > 0;

  if (undoUsed && hintUsed && shuffleUsed) return 10;
  if (undoUsed && hintUsed) return 18;
  if (undoUsed && shuffleUsed) return 15;
  if (hintUsed && shuffleUsed) return 14;
  if (undoUsed) return 18;
  if (hintUsed) return 15;
  if (shuffleUsed) return 14;
  return 18;
}

export function calculateZenScore(input: ZenScoreInput): ZenScoreBreakdown {
  assertNonNegativeInteger(input.currentActiveDurationSeconds, 'currentActiveDurationSeconds');
  assertNonNegativeInteger(input.qualifyingAssistAdCount, 'qualifyingAssistAdCount');
  if (input.previousActiveDurationSeconds !== null) {
    assertNonNegativeInteger(input.previousActiveDurationSeconds, 'previousActiveDurationSeconds');
  }

  const baseScore = getZenScoreBase(input.assistUsage);
  const timeBonus =
    input.previousActiveDurationSeconds !== null &&
    input.currentActiveDurationSeconds <= input.previousActiveDurationSeconds - 10
      ? 1
      : 0;
  const assistAdBonus = input.qualifyingAssistAdCount;

  return {
    assistAdBonus,
    baseScore,
    finalScore: baseScore + timeBonus + assistAdBonus,
    timeBonus,
  };
}

export function getRevivalCost(revivalNumber: number): number {
  if (!Number.isInteger(revivalNumber) || revivalNumber < 1) {
    throw new RangeError('revivalNumber must be a positive integer');
  }

  if (revivalNumber === 1) return 10;

  let cost = 15;
  for (let current = 3; current <= revivalNumber; current += 1) {
    cost += current % 2 === 1 ? 10 : 15;
  }
  return cost;
}

export function calculateConcentrationScore(zenScores: readonly number[]): number {
  if (zenScores.length !== 8) {
    throw new RangeError('Concentration Score requires exactly eight completed levels');
  }
  zenScores.forEach((score) => assertNonNegativeInteger(score, 'zenScore'));

  const average = zenScores.reduce((total, score) => total + score, 0) / zenScores.length;
  const floor = Math.floor(average);
  return average - floor > 0.5 ? Math.ceil(average) : floor;
}

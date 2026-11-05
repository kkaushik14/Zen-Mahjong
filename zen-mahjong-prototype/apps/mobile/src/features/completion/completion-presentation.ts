import {
  calculateZenScore,
  getZenProgressPresentation,
  type LocalEconomyStateV1,
  type PlayerProgressionV1,
  type RewardAchievementId,
  type ZenScoreBreakdown,
} from '@zen-mahjong/game-engine';
import { getTierPosition } from '@zen-mahjong/game-content';

export interface CompletionPresentation {
  achievementIds: readonly RewardAchievementId[];
  activeDuration: string;
  assistCount: number;
  breakdown: ZenScoreBreakdown;
  levelNumber: number;
  nextLevelNumber: number;
  score: number;
  scoreOverflow: boolean;
  tierNumber: number;
  tierPosition: number;
  tierScoreAwarded: number | null;
}

export function formatActiveDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function getCompletionPresentation(
  progression: PlayerProgressionV1,
  economy: LocalEconomyStateV1,
  receiptId?: string,
): CompletionPresentation | null {
  const receiptIndex = receiptId
    ? progression.completedLevels.findIndex((receipt) => receipt.receiptId === receiptId)
    : progression.completedLevels.length - 1;
  if (receiptIndex < 0) return null;
  const receipt = progression.completedLevels[receiptIndex];
  if (!receipt) return null;
  const previous = progression.completedLevels[receiptIndex - 1];
  const breakdown = calculateZenScore({
    assistUsage: receipt.assistUsage,
    currentActiveDurationSeconds: receipt.activeDurationSeconds,
    previousActiveDurationSeconds: previous?.activeDurationSeconds ?? null,
    qualifyingAssistAdCount: receipt.qualifyingAssistAdCount,
  });
  const position = getTierPosition(receipt.levelNumber);
  const tierAward = progression.tierAwards.find(
    (award) => award.levelNumbers.at(-1) === receipt.levelNumber,
  );
  const achievementIds = economy.transactions
    .filter(
      (transaction) =>
        transaction.createdAt === receipt.completedAt &&
        transaction.transactionId.startsWith('achievement:'),
    )
    .map(
      (transaction) => transaction.transactionId.replace('achievement:', '') as RewardAchievementId,
    );

  return {
    achievementIds,
    activeDuration: formatActiveDuration(receipt.activeDurationSeconds),
    assistCount: receipt.assistUsage.hint + receipt.assistUsage.shuffle + receipt.assistUsage.undo,
    breakdown,
    levelNumber: receipt.levelNumber,
    nextLevelNumber: receipt.levelNumber + 1,
    score: receipt.zenScore,
    scoreOverflow: getZenProgressPresentation(receipt.zenScore).overflow,
    tierNumber: position.tierNumber,
    tierPosition: position.levelInTier,
    tierScoreAwarded: tierAward?.concentrationScore ?? null,
  };
}

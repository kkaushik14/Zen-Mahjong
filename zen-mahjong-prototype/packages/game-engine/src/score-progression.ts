import { grantEligibleAchievementRewards, type RewardAchievementId } from './achievement-rewards';
import type { CompletionReceiptV1, ConcentrationSessionV1 } from './concentration-model';
import { COMPLETION_RECEIPT_SCHEMA_VERSION } from './concentration-model';
import { validateCompletionReceipt } from './contracts';
import { calculateConcentrationScore, calculateZenScore, type ZenScoreBreakdown } from './economy';
import { applyEconomyTransaction, type LocalEconomyStateV1 } from './local-economy';
import { getActiveDurationSeconds, pauseSessionTiming } from './timing';

export const PLAYER_PROGRESSION_SCHEMA_VERSION = 1 as const;
export const TIER_AWARD_SCHEMA_VERSION = 1 as const;

export interface DailyStreakV1 {
  best: number;
  current: number;
  lastVisitLocalDate: string | null;
}

export interface TierAwardV1 {
  concentrationScore: number;
  levelNumbers: readonly number[];
  schemaVersion: typeof TIER_AWARD_SCHEMA_VERSION;
  tierNumber: number;
  transactionId: string;
}

export interface PlayerProgressionV1 {
  completedLevels: readonly CompletionReceiptV1[];
  currentLevelNumber: number;
  lifetimeConcentrationScoreEarned: number;
  schemaVersion: typeof PLAYER_PROGRESSION_SCHEMA_VERSION;
  streak: DailyStreakV1;
  tierAwards: readonly TierAwardV1[];
}

export interface ZenProgressPresentation {
  actualScore: number;
  milestonePercent: 0 | 10 | 20 | 50 | 100;
  overflow: boolean;
  standardScaleEndReached: boolean;
}

export interface RecordDailyVisitResult {
  economy: LocalEconomyStateV1;
  grantedAchievementIds: readonly RewardAchievementId[];
  progression: PlayerProgressionV1;
}

export interface RecordCompletionResult {
  accepted: boolean;
  economy: LocalEconomyStateV1;
  grantedAchievementIds: readonly RewardAchievementId[];
  progression: PlayerProgressionV1;
  reason: 'duplicate-receipt' | 'level-not-current' | 'invalid-receipt' | 'session-not-won' | null;
  tierScoreAwarded: number | null;
}

export interface CompleteLevelInput {
  completedAt: string;
  qualifyingAssistAdCount: number;
  receiptId: string;
}

export interface CompleteLevelResult extends RecordCompletionResult {
  breakdown: ZenScoreBreakdown | null;
  receipt: CompletionReceiptV1 | null;
  session: ConcentrationSessionV1;
}

export function createInitialPlayerProgression(): PlayerProgressionV1 {
  return {
    completedLevels: [],
    currentLevelNumber: 1,
    lifetimeConcentrationScoreEarned: 0,
    schemaVersion: PLAYER_PROGRESSION_SCHEMA_VERSION,
    streak: { best: 0, current: 0, lastVisitLocalDate: null },
    tierAwards: [],
  };
}

export function getZenProgressPresentation(score: number): ZenProgressPresentation {
  if (!Number.isInteger(score) || score < 0) {
    throw new RangeError('score must be a non-negative integer');
  }
  const milestonePercent =
    score >= 20 ? 100 : score >= 10 ? 50 : score >= 6 ? 20 : score >= 3 ? 10 : 0;
  return {
    actualScore: score,
    milestonePercent,
    overflow: score > 20,
    standardScaleEndReached: score >= 20,
  };
}

function localDateDayNumber(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError('localDate must use YYYY-MM-DD');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError('localDate must be a valid calendar date');
  }
  return Math.floor(timestamp / 86_400_000);
}

export function recordDailyVisit(
  progression: PlayerProgressionV1,
  economy: LocalEconomyStateV1,
  input: { createdAt: string; localDate: string },
): RecordDailyVisitResult {
  const nextDay = localDateDayNumber(input.localDate);
  const previousDate = progression.streak.lastVisitLocalDate;
  let streak = progression.streak;

  if (previousDate === null) {
    streak = { best: 1, current: 1, lastVisitLocalDate: input.localDate };
  } else {
    const difference = nextDay - localDateDayNumber(previousDate);
    if (difference > 0) {
      const current = difference === 1 ? progression.streak.current + 1 : 1;
      streak = {
        best: Math.max(progression.streak.best, current),
        current,
        lastVisitLocalDate: input.localDate,
      };
    }
  }

  const nextProgression = streak === progression.streak ? progression : { ...progression, streak };
  const rewards = grantEligibleAchievementRewards(economy, {
    concentrationScore: nextProgression.lifetimeConcentrationScoreEarned,
    createdAt: input.createdAt,
    streakDays: nextProgression.streak.current,
  });
  return {
    economy: rewards.state,
    grantedAchievementIds: rewards.grantedAchievementIds,
    progression: nextProgression,
  };
}

export function recordCompletionReceipt(
  progression: PlayerProgressionV1,
  economy: LocalEconomyStateV1,
  receipt: CompletionReceiptV1,
): RecordCompletionResult {
  if (!validateCompletionReceipt(receipt)) {
    return {
      accepted: false,
      economy,
      grantedAchievementIds: [],
      progression,
      reason: 'invalid-receipt',
      tierScoreAwarded: null,
    };
  }
  if (progression.completedLevels.some((entry) => entry.receiptId === receipt.receiptId)) {
    return {
      accepted: false,
      economy,
      grantedAchievementIds: [],
      progression,
      reason: 'duplicate-receipt',
      tierScoreAwarded: null,
    };
  }
  if (receipt.levelNumber !== progression.currentLevelNumber) {
    return {
      accepted: false,
      economy,
      grantedAchievementIds: [],
      progression,
      reason: 'level-not-current',
      tierScoreAwarded: null,
    };
  }

  const completedLevels = [...progression.completedLevels, receipt];
  let nextEconomy = economy;
  let tierScoreAwarded: number | null = null;
  let lifetimeConcentrationScoreEarned = progression.lifetimeConcentrationScoreEarned;
  let tierAwards = progression.tierAwards;

  if (receipt.levelNumber % 8 === 0) {
    const tierNumber = receipt.levelNumber / 8;
    const tierReceipts = completedLevels.slice(-8);
    const firstExpectedLevel = receipt.levelNumber - 7;
    if (
      tierReceipts.length !== 8 ||
      tierReceipts.some((entry, index) => entry.levelNumber !== firstExpectedLevel + index)
    ) {
      return {
        accepted: false,
        economy,
        grantedAchievementIds: [],
        progression,
        reason: 'level-not-current',
        tierScoreAwarded: null,
      };
    }

    tierScoreAwarded = calculateConcentrationScore(tierReceipts.map((entry) => entry.zenScore));
    const transactionId = `tier-${tierNumber}:concentration-score`;
    const transaction = applyEconomyTransaction(nextEconomy, {
      createdAt: receipt.completedAt,
      mutations: [
        {
          asset: 'concentration-score',
          delta: tierScoreAwarded,
          reason: 'level-reward',
          sessionId: receipt.sessionId,
        },
      ],
      transactionId,
    });
    if (!transaction.applied && transaction.reason !== 'already-applied') {
      throw new Error('Unable to record tier Concentration Score');
    }
    nextEconomy = transaction.state;
    lifetimeConcentrationScoreEarned += tierScoreAwarded;
    tierAwards = [
      ...tierAwards,
      {
        concentrationScore: tierScoreAwarded,
        levelNumbers: tierReceipts.map((entry) => entry.levelNumber),
        schemaVersion: TIER_AWARD_SCHEMA_VERSION,
        tierNumber,
        transactionId,
      },
    ];
  }

  const nextProgression: PlayerProgressionV1 = {
    ...progression,
    completedLevels,
    currentLevelNumber: receipt.levelNumber + 1,
    lifetimeConcentrationScoreEarned,
    tierAwards,
  };
  const rewards = grantEligibleAchievementRewards(nextEconomy, {
    concentrationScore: nextProgression.lifetimeConcentrationScoreEarned,
    createdAt: receipt.completedAt,
    streakDays: nextProgression.streak.current,
  });
  return {
    accepted: true,
    economy: rewards.state,
    grantedAchievementIds: rewards.grantedAchievementIds,
    progression: nextProgression,
    reason: null,
    tierScoreAwarded,
  };
}

export function completeLevel(
  session: ConcentrationSessionV1,
  progression: PlayerProgressionV1,
  economy: LocalEconomyStateV1,
  input: CompleteLevelInput,
): CompleteLevelResult {
  const existing = progression.completedLevels.find((entry) => entry.receiptId === input.receiptId);
  if (existing) {
    return {
      accepted: false,
      breakdown: null,
      economy,
      grantedAchievementIds: [],
      progression,
      reason: 'duplicate-receipt',
      receipt: existing,
      session,
      tierScoreAwarded: null,
    };
  }
  if (session.status !== 'won') {
    return {
      accepted: false,
      breakdown: null,
      economy,
      grantedAchievementIds: [],
      progression,
      reason: 'session-not-won',
      receipt: null,
      session,
      tierScoreAwarded: null,
    };
  }
  if (session.levelNumber !== progression.currentLevelNumber) {
    return {
      accepted: false,
      breakdown: null,
      economy,
      grantedAchievementIds: [],
      progression,
      reason: 'level-not-current',
      receipt: null,
      session,
      tierScoreAwarded: null,
    };
  }

  const stoppedSession = pauseSessionTiming(session, input.completedAt);
  const activeDurationSeconds = getActiveDurationSeconds(stoppedSession);
  const previousDuration = progression.completedLevels.at(-1)?.activeDurationSeconds ?? null;
  const breakdown = calculateZenScore({
    assistUsage: stoppedSession.assistUsage,
    currentActiveDurationSeconds: activeDurationSeconds,
    previousActiveDurationSeconds: previousDuration,
    qualifyingAssistAdCount: input.qualifyingAssistAdCount,
  });
  const receipt: CompletionReceiptV1 = {
    activeDurationSeconds,
    assistUsage: stoppedSession.assistUsage,
    completedAt: input.completedAt,
    levelNumber: stoppedSession.levelNumber,
    qualifyingAssistAdCount: input.qualifyingAssistAdCount,
    receiptId: input.receiptId,
    schemaVersion: COMPLETION_RECEIPT_SCHEMA_VERSION,
    sessionId: stoppedSession.sessionId,
    zenScore: breakdown.finalScore,
  };
  const recorded = recordCompletionReceipt(progression, economy, receipt);
  return {
    ...recorded,
    breakdown,
    receipt,
    session: stoppedSession,
  };
}

function validateTierAward(value: unknown, index: number): value is TierAwardV1 {
  if (typeof value !== 'object' || value === null) return false;
  const award = value as Partial<TierAwardV1>;
  return (
    award.schemaVersion === TIER_AWARD_SCHEMA_VERSION &&
    Number.isInteger(award.concentrationScore) &&
    Number(award.concentrationScore) >= 0 &&
    award.tierNumber === index + 1 &&
    award.transactionId === `tier-${award.tierNumber}:concentration-score` &&
    Array.isArray(award.levelNumbers) &&
    award.levelNumbers.length === 8 &&
    award.levelNumbers.every(
      (levelNumber, levelIndex) => levelNumber === index * 8 + levelIndex + 1,
    )
  );
}

export function validatePlayerProgression(value: unknown): value is PlayerProgressionV1 {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<PlayerProgressionV1>;
  if (
    candidate.schemaVersion !== PLAYER_PROGRESSION_SCHEMA_VERSION ||
    !Number.isInteger(candidate.currentLevelNumber) ||
    Number(candidate.currentLevelNumber) < 1 ||
    !Number.isInteger(candidate.lifetimeConcentrationScoreEarned) ||
    Number(candidate.lifetimeConcentrationScoreEarned) < 0 ||
    !Array.isArray(candidate.completedLevels) ||
    !candidate.completedLevels.every(validateCompletionReceipt) ||
    !Array.isArray(candidate.tierAwards) ||
    typeof candidate.streak !== 'object' ||
    candidate.streak === null
  ) {
    return false;
  }
  if (
    candidate.completedLevels.some((receipt, index) => receipt.levelNumber !== index + 1) ||
    candidate.currentLevelNumber !== candidate.completedLevels.length + 1 ||
    new Set(candidate.completedLevels.map((receipt) => receipt.receiptId)).size !==
      candidate.completedLevels.length
  ) {
    return false;
  }
  if (
    !candidate.tierAwards.every(validateTierAward) ||
    candidate.tierAwards.length !== Math.floor(candidate.completedLevels.length / 8) ||
    candidate.tierAwards.reduce((total, award) => total + award.concentrationScore, 0) !==
      candidate.lifetimeConcentrationScoreEarned
  ) {
    return false;
  }
  const streak = candidate.streak as DailyStreakV1;
  return (
    Number.isInteger(streak.best) &&
    streak.best >= 0 &&
    Number.isInteger(streak.current) &&
    streak.current >= 0 &&
    streak.best >= streak.current &&
    (streak.lastVisitLocalDate !== null || (streak.best === 0 && streak.current === 0)) &&
    (streak.lastVisitLocalDate === null ||
      (() => {
        try {
          localDateDayNumber(streak.lastVisitLocalDate);
          return true;
        } catch {
          return false;
        }
      })())
  );
}

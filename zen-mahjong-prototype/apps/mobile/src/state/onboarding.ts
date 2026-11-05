import {
  validateConcentrationSession,
  type ConcentrationSessionV1,
  type OfflineSaveV2,
} from '@zen-mahjong/game-engine';

export const ONBOARDING_STATE_SCHEMA_VERSION = 1 as const;

export interface OnboardingStateV1 {
  activeTraining: {
    mode: 'practice' | 'tutorial';
    session: ConcentrationSessionV1;
  } | null;
  practiceCompletedAt: string | null;
  schemaVersion: typeof ONBOARDING_STATE_SCHEMA_VERSION;
  tutorialCompletedAt: string | null;
}

export const defaultOnboardingState: OnboardingStateV1 = {
  activeTraining: null,
  practiceCompletedAt: null,
  schemaVersion: ONBOARDING_STATE_SCHEMA_VERSION,
  tutorialCompletedAt: null,
};

export type OnboardingDestination = '/game' | '/practice' | '/tutorial';

export function getOnboardingDestination(
  onboarding: OnboardingStateV1,
  hasActiveNumberedRun = false,
): OnboardingDestination {
  if (hasActiveNumberedRun) return '/game';
  if (onboarding.activeTraining) return `/${onboarding.activeTraining.mode}`;
  if (onboarding.tutorialCompletedAt === null) return '/tutorial';
  if (onboarding.practiceCompletedAt === null) return '/practice';
  return '/game';
}

export function completeOnboardingTraining(
  onboarding: OnboardingStateV1,
  mode: 'practice' | 'tutorial',
  completedAt: string,
): OnboardingStateV1 {
  if (mode === 'tutorial') {
    return {
      ...onboarding,
      activeTraining: null,
      tutorialCompletedAt: onboarding.tutorialCompletedAt ?? completedAt,
    };
  }
  return {
    ...onboarding,
    activeTraining: null,
    practiceCompletedAt: onboarding.practiceCompletedAt ?? completedAt,
    tutorialCompletedAt: onboarding.tutorialCompletedAt ?? completedAt,
  };
}

export function preserveReturningPlayerOnboarding(
  onboarding: OnboardingStateV1,
  offlineSave: OfflineSaveV2,
  restoredAt: string,
): OnboardingStateV1 {
  const hasNumberedPlayEvidence =
    offlineSave.activeRun !== null ||
    offlineSave.progression.completedLevels.length > 0 ||
    offlineSave.progression.currentLevelNumber > 1;
  if (!hasNumberedPlayEvidence) return onboarding;
  if (
    onboarding.activeTraining === null &&
    onboarding.tutorialCompletedAt !== null &&
    onboarding.practiceCompletedAt !== null
  ) {
    return onboarding;
  }

  const evidenceTimestamp =
    offlineSave.progression.completedLevels.at(-1)?.completedAt ??
    offlineSave.activeRun?.session.startedAt ??
    restoredAt;
  return {
    ...onboarding,
    activeTraining: null,
    practiceCompletedAt: onboarding.practiceCompletedAt ?? evidenceTimestamp,
    tutorialCompletedAt: onboarding.tutorialCompletedAt ?? evidenceTimestamp,
  };
}

export function validateOnboardingState(value: unknown): value is OnboardingStateV1 {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<OnboardingStateV1>;
  return (
    candidate.schemaVersion === ONBOARDING_STATE_SCHEMA_VERSION &&
    (candidate.activeTraining === null ||
      (typeof candidate.activeTraining === 'object' &&
        candidate.activeTraining !== null &&
        (candidate.activeTraining.mode === 'practice' ||
          candidate.activeTraining.mode === 'tutorial') &&
        validateConcentrationSession(candidate.activeTraining.session))) &&
    (candidate.tutorialCompletedAt === null || typeof candidate.tutorialCompletedAt === 'string') &&
    (candidate.practiceCompletedAt === null || typeof candidate.practiceCompletedAt === 'string')
  );
}

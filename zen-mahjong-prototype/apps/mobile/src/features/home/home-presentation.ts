import { getTierPosition } from '@zen-mahjong/game-content';

import type { OnboardingDestination } from '@/state/onboarding';

export const DAILY_CHALLENGE_TARGET = 4;

export interface HomePresentationInput {
  achievementUnlockedCount: number;
  achievementTotal: number;
  concentrationScore: number;
  currentLevelNumber: number;
  dailyChallengesCompleted: number;
  hasActiveRun: boolean;
  onboardingDestination: OnboardingDestination;
  streakDays: number;
}

export interface HomePresentation {
  achievementDetail: string;
  dailyCompleted: number;
  dailyDetail: string;
  firstPlay: boolean;
  journeyDetail: string;
  levelNumber: number;
  levelProgress: number;
  primaryLabel: 'Continue' | 'Play' | 'Practice' | 'Resume';
  primaryRoute: '/game' | '/practice' | '/tutorial';
  score: number;
  streakDays: number;
}

export function buildHomePresentation(input: HomePresentationInput): HomePresentation {
  const firstPlay = input.onboardingDestination === '/tutorial';
  const position = getTierPosition(input.currentLevelNumber);
  const dailyCompleted = Math.min(
    DAILY_CHALLENGE_TARGET,
    Math.max(0, input.dailyChallengesCompleted),
  );
  const primaryRoute = input.onboardingDestination;
  const primaryLabel =
    primaryRoute === '/tutorial'
      ? 'Play'
      : primaryRoute === '/practice'
        ? 'Practice'
        : input.hasActiveRun
          ? 'Resume'
          : 'Continue';

  return {
    achievementDetail: `${Math.max(0, input.achievementUnlockedCount)} / ${Math.max(0, input.achievementTotal)}`,
    dailyCompleted,
    dailyDetail: firstPlay
      ? "Today's garden awaits"
      : `${dailyCompleted} / ${DAILY_CHALLENGE_TARGET} complete`,
    firstPlay,
    journeyDetail: `Stage ${position.tierNumber}`,
    levelNumber: input.currentLevelNumber,
    levelProgress: position.levelInTier / 8,
    primaryLabel,
    primaryRoute,
    score: Math.max(0, input.concentrationScore),
    streakDays: Math.max(0, input.streakDays),
  };
}

import { buildHomePresentation, DAILY_CHALLENGE_TARGET } from '../home-presentation';

const returningInput = {
  achievementTotal: 4,
  achievementUnlockedCount: 2,
  concentrationScore: 90,
  currentLevelNumber: 11,
  dailyChallengesCompleted: 2,
  hasActiveRun: false,
  onboardingDestination: '/game' as const,
  streakDays: 3,
};

describe('Home presentation', () => {
  it('presents real first-play values and enters the tutorial', () => {
    expect(
      buildHomePresentation({
        ...returningInput,
        achievementUnlockedCount: 0,
        concentrationScore: 0,
        currentLevelNumber: 1,
        dailyChallengesCompleted: 0,
        onboardingDestination: '/tutorial',
        streakDays: 0,
      }),
    ).toMatchObject({
      achievementDetail: '0 / 4',
      dailyDetail: "Today's garden awaits",
      firstPlay: true,
      journeyDetail: 'Stage 1',
      levelNumber: 1,
      primaryLabel: 'Play',
      primaryRoute: '/tutorial',
      score: 0,
    });
  });

  it('continues to practice after tutorial completion', () => {
    expect(
      buildHomePresentation({
        ...returningInput,
        onboardingDestination: '/practice',
      }),
    ).toMatchObject({ primaryLabel: 'Practice', primaryRoute: '/practice' });
  });

  it('resumes the authoritative active run', () => {
    expect(buildHomePresentation({ ...returningInput, hasActiveRun: true })).toMatchObject({
      primaryLabel: 'Resume',
      primaryRoute: '/game',
    });
  });

  it('derives tier, completion, score, and achievement values from state', () => {
    expect(buildHomePresentation(returningInput)).toMatchObject({
      achievementDetail: '2 / 4',
      dailyCompleted: 2,
      dailyDetail: `2 / ${DAILY_CHALLENGE_TARGET} complete`,
      journeyDetail: 'Stage 2',
      levelNumber: 11,
      levelProgress: 3 / 8,
      primaryLabel: 'Continue',
      score: 90,
      streakDays: 3,
    });
  });

  it('caps only the daily presentation target and keeps the real score uncapped', () => {
    expect(
      buildHomePresentation({
        ...returningInput,
        concentrationScore: 125,
        dailyChallengesCompleted: 12,
      }),
    ).toMatchObject({
      dailyCompleted: DAILY_CHALLENGE_TARGET,
      dailyDetail: `${DAILY_CHALLENGE_TARGET} / ${DAILY_CHALLENGE_TARGET} complete`,
      score: 125,
    });
  });
});

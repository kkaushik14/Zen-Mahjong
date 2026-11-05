import {
  createConcentrationSession,
  createFixtureState,
  createInitialOfflineSave,
} from '@zen-mahjong/game-engine';

import {
  completeOnboardingTraining,
  defaultOnboardingState,
  getOnboardingDestination,
  preserveReturningPlayerOnboarding,
  validateOnboardingState,
} from '../onboarding';

describe('v0.3.0 onboarding state', () => {
  it('starts with tutorial and practice incomplete', () => {
    expect(validateOnboardingState(defaultOnboardingState)).toBe(true);
    expect(defaultOnboardingState).toMatchObject({
      activeTraining: null,
      practiceCompletedAt: null,
      tutorialCompletedAt: null,
    });
  });

  it('validates independently completed tutorial and practice timestamps', () => {
    expect(
      validateOnboardingState({
        ...defaultOnboardingState,
        practiceCompletedAt: '2026-10-02T00:10:00.000Z',
        tutorialCompletedAt: '2026-10-02T00:05:00.000Z',
      }),
    ).toBe(true);
    expect(validateOnboardingState({ ...defaultOnboardingState, practiceCompletedAt: 42 })).toBe(
      false,
    );
  });

  it('moves a first install through tutorial, practice, and numbered play', () => {
    expect(getOnboardingDestination(defaultOnboardingState)).toBe('/tutorial');

    const tutorialComplete = completeOnboardingTraining(
      defaultOnboardingState,
      'tutorial',
      '2026-10-02T00:05:00.000Z',
    );
    expect(getOnboardingDestination(tutorialComplete)).toBe('/practice');

    const practiceComplete = completeOnboardingTraining(
      tutorialComplete,
      'practice',
      '2026-10-02T00:10:00.000Z',
    );
    expect(getOnboardingDestination(practiceComplete)).toBe('/game');
    expect(practiceComplete).toMatchObject({
      activeTraining: null,
      practiceCompletedAt: '2026-10-02T00:10:00.000Z',
      tutorialCompletedAt: '2026-10-02T00:05:00.000Z',
    });
  });

  it('restores active training and lets an active numbered run take precedence', () => {
    const training = {
      ...defaultOnboardingState,
      activeTraining: {
        mode: 'tutorial' as const,
        session: createConcentrationSession({
          category: 'normal',
          game: createFixtureState('flat-introduction', 'restored-tutorial'),
          levelContentVersion: '0.3.0-training',
          levelNumber: 1,
          sessionId: 'restored-tutorial',
          startedAt: '2026-10-02T00:00:00.000Z',
        }),
      },
    };

    expect(getOnboardingDestination(training)).toBe('/tutorial');
    expect(getOnboardingDestination(defaultOnboardingState, true)).toBe('/game');
  });

  it('does not skip onboarding without numbered-play evidence', () => {
    const save = createInitialOfflineSave('2026-10-02T00:00:00.000Z');
    expect(
      preserveReturningPlayerOnboarding(defaultOnboardingState, save, '2026-10-07T00:00:00.000Z'),
    ).toBe(defaultOnboardingState);
  });
});

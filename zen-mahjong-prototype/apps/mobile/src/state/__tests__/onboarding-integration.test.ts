import {
  createConcentrationRun,
  createConcentrationSession,
  createFixtureState,
  createInitialOfflineSave,
  getEconomyBalances,
  recordCompletionReceipt,
  recordDailyVisit,
  validateOfflineSave,
  type CompletionReceiptV1,
} from '@zen-mahjong/game-engine';
import { MemoryKeyValueStore } from '@zen-mahjong/persistence';
import {
  completeOnboardingTraining,
  defaultOnboardingState,
  getOnboardingDestination,
  preserveReturningPlayerOnboarding,
} from '../onboarding';
import { createAppRepositories, defaultPlayerState, defaultSettings } from '../repositories';

jest.mock('react-native-mmkv', () => ({ createMMKV: jest.fn() }));

const STARTED_AT = '2026-10-07T00:00:00.000Z';

function receipt(levelNumber: number): CompletionReceiptV1 {
  return {
    activeDurationSeconds: 120 + levelNumber,
    assistUsage: { hint: 0, shuffle: 0, undo: 0 },
    completedAt: `2026-10-07T00:${String(levelNumber).padStart(2, '0')}:00.000Z`,
    levelNumber,
    qualifyingAssistAdCount: 0,
    receiptId: `completion:level-${levelNumber}`,
    schemaVersion: 1,
    sessionId: `level-${levelNumber}`,
    zenScore: 25,
  };
}

describe('v0.3.0 onboarding and tier integration', () => {
  it('persists first install through tutorial, practice, one tier, and the Level 9 start', () => {
    let onboarding = defaultOnboardingState;
    expect(getOnboardingDestination(onboarding)).toBe('/tutorial');
    onboarding = completeOnboardingTraining(onboarding, 'tutorial', STARTED_AT);
    expect(getOnboardingDestination(onboarding)).toBe('/practice');
    onboarding = completeOnboardingTraining(onboarding, 'practice', '2026-10-07T00:01:00.000Z');
    expect(getOnboardingDestination(onboarding)).toBe('/game');

    let save = createInitialOfflineSave(STARTED_AT);
    const visit = recordDailyVisit(save.progression, save.economy, {
      createdAt: STARTED_AT,
      localDate: '2026-10-07',
    });
    save = { ...save, economy: visit.economy, progression: visit.progression };

    for (let levelNumber = 1; levelNumber <= 8; levelNumber += 1) {
      const completion = recordCompletionReceipt(
        save.progression,
        save.economy,
        receipt(levelNumber),
      );
      expect(completion.accepted).toBe(true);
      save = {
        ...save,
        economy: completion.economy,
        progression: completion.progression,
      };
    }

    const levelNine = createConcentrationSession({
      category: 'normal',
      game: createFixtureState('garden-two', 'level-9-restoration'),
      levelContentVersion: '0.3.0-presentation-fixture',
      levelNumber: 9,
      sessionId: 'level-9-restoration',
      startedAt: '2026-10-07T00:10:00.000Z',
    });
    save = { ...save, activeRun: createConcentrationRun(levelNine) };

    expect(save.progression).toMatchObject({
      currentLevelNumber: 9,
      lifetimeConcentrationScoreEarned: 25,
      streak: { best: 1, current: 1, lastVisitLocalDate: '2026-10-07' },
    });
    expect(save.progression.tierAwards).toHaveLength(1);
    expect(getEconomyBalances(save.economy)).toEqual({
      concentrationScore: 27,
      hint: 6,
      shuffle: 2,
      undo: 5,
    });
    expect(
      save.economy.transactions.filter(
        (transaction) => transaction.transactionId === 'achievement:concentration-25',
      ),
    ).toHaveLength(1);
    expect(validateOfflineSave(save)).toBe(true);

    const reconciledOnboarding = preserveReturningPlayerOnboarding(
      defaultOnboardingState,
      save,
      '2026-10-07T00:11:00.000Z',
    );
    expect(reconciledOnboarding).toMatchObject({
      activeTraining: null,
      practiceCompletedAt: receipt(8).completedAt,
      tutorialCompletedAt: receipt(8).completedAt,
    });
    expect(getOnboardingDestination(reconciledOnboarding, true)).toBe('/game');

    const store = new MemoryKeyValueStore();
    const repositories = createAppRepositories(store, () => new Date('2026-10-07T00:11:00.000Z'));
    repositories.offlineState.write(save);
    repositories.onboarding.write(onboarding);
    repositories.playerState.write({
      ...defaultPlayerState,
      profile: { ...defaultPlayerState.profile, displayName: 'Returning Player' },
    });
    repositories.settings.write({ ...defaultSettings, reducedMotion: true });

    const restored = createAppRepositories(store, () => new Date('2026-10-07T00:12:00.000Z'));
    expect(restored.offlineState.read().document?.payload).toEqual(save);
    expect(restored.onboarding.read().document?.payload).toEqual(onboarding);
    expect(restored.playerState.read().document?.payload.profile.displayName).toBe(
      'Returning Player',
    );
    expect(restored.settings.read().document?.payload.reducedMotion).toBe(true);
    expect(getOnboardingDestination(onboarding, save.activeRun !== null)).toBe('/game');
  });
});

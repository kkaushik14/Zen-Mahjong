/// <reference types="jest" />

import type { CompletionSummary, PlayerState } from '../models';
import { completePlayerSession, defaultAchievements, toLocalDateKey } from '../progress';

function createPlayerState(): PlayerState {
  return {
    achievements: defaultAchievements.map((achievement) => ({ ...achievement })),
    profile: {
      createdAt: '2026-09-25T00:00:00.000Z',
      displayName: 'Test Player',
      id: 'test-player',
    },
    progress: {
      boardsCompleted: 0,
      currentGarden: 1,
      dailyChallengesCompleted: 0,
      lastCompletedSessionId: null,
      totalPairsMatched: 0,
    },
    streak: { activityDates: [], best: 0, current: 0, lastCompletedLocalDate: null },
  };
}

function summary(id: string, completedAt: Date, hints = 0): CompletionSummary {
  return { completedAt, hints, pairs: 7, sessionId: id, shuffles: 0 };
}

describe('player progress', () => {
  it('updates progress, streak, and no-hint achievement atomically', () => {
    const completedAt = new Date(2026, 8, 25, 12);
    const next = completePlayerSession(createPlayerState(), summary('session-1', completedAt));

    expect(next.progress).toMatchObject({
      boardsCompleted: 1,
      currentGarden: 2,
      lastCompletedSessionId: 'session-1',
      totalPairsMatched: 7,
    });
    expect(next.streak).toMatchObject({
      activityDates: [toLocalDateKey(completedAt)],
      best: 1,
      current: 1,
    });
    expect(next.achievements.find((item) => item.id === 'still-mind')).toMatchObject({
      value: 1,
    });
  });

  it('does not count the same completed session twice', () => {
    const first = completePlayerSession(
      createPlayerState(),
      summary('same-session', new Date(2026, 8, 25, 12)),
    );

    expect(completePlayerSession(first, summary('same-session', new Date(2026, 8, 25, 13)))).toBe(
      first,
    );
  });

  it('increments consecutive local days and resets after a gap', () => {
    const first = completePlayerSession(
      createPlayerState(),
      summary('session-1', new Date(2026, 8, 23, 12), 1),
    );
    const second = completePlayerSession(first, summary('session-2', new Date(2026, 8, 24, 12), 1));
    const reset = completePlayerSession(second, summary('session-3', new Date(2026, 8, 26, 12), 1));

    expect(second.streak.current).toBe(2);
    expect(reset.streak.current).toBe(1);
    expect(reset.streak.best).toBe(2);
  });

  it('records only one active day for multiple completions on the same date', () => {
    const date = new Date(2026, 8, 25, 12);
    const first = completePlayerSession(createPlayerState(), summary('session-1', date));
    const second = completePlayerSession(first, summary('session-2', date));

    expect(second.progress.boardsCompleted).toBe(2);
    expect(second.streak.current).toBe(1);
    expect(second.streak.activityDates).toHaveLength(1);
  });
});

import type { AchievementState, CompletionSummary, PlayerState, StreakState } from './models';

export const defaultAchievements: readonly AchievementState[] = [
  { id: 'quiet-beginning', maximum: 10, unlockedAt: null, value: 0 },
  { id: 'still-mind', maximum: 1, unlockedAt: null, value: 0 },
  { id: 'seven-sunrises', maximum: 7, unlockedAt: null, value: 0 },
  { id: 'mountain-path', maximum: 100, unlockedAt: null, value: 0 },
];

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDayCount(value: number): string {
  return `${value} ${value === 1 ? 'day' : 'days'}`;
}

function dayDifference(previous: string, next: string): number {
  const previousDate = new Date(`${previous}T00:00:00Z`);
  const nextDate = new Date(`${next}T00:00:00Z`);
  return Math.round((nextDate.getTime() - previousDate.getTime()) / 86_400_000);
}

function applyStreak(current: StreakState, completedAt: Date): StreakState {
  const localDate = toLocalDateKey(completedAt);
  if (current.lastCompletedLocalDate === localDate) return current;

  const consecutive =
    current.lastCompletedLocalDate !== null &&
    dayDifference(current.lastCompletedLocalDate, localDate) === 1;
  const nextCurrent = consecutive ? current.current + 1 : 1;

  return {
    activityDates: [...current.activityDates.filter((date) => date !== localDate), localDate].slice(
      -90,
    ),
    best: Math.max(current.best, nextCurrent),
    current: nextCurrent,
    lastCompletedLocalDate: localDate,
  };
}

function applyAchievements(
  achievements: readonly AchievementState[],
  boardsCompleted: number,
  streak: number,
  summary: CompletionSummary,
): readonly AchievementState[] {
  return achievements.map((achievement) => {
    let value = achievement.value;
    if (achievement.id === 'quiet-beginning')
      value = Math.min(boardsCompleted, achievement.maximum);
    if (achievement.id === 'mountain-path') value = Math.min(boardsCompleted, achievement.maximum);
    if (achievement.id === 'seven-sunrises') value = Math.min(streak, achievement.maximum);
    if (achievement.id === 'still-mind' && summary.hints === 0) value = 1;

    return {
      ...achievement,
      value,
      unlockedAt:
        achievement.unlockedAt ??
        (value >= achievement.maximum ? summary.completedAt.toISOString() : null),
    };
  });
}

export function completePlayerSession(
  current: PlayerState,
  summary: CompletionSummary,
): PlayerState {
  if (current.progress.lastCompletedSessionId === summary.sessionId) return current;

  const streak = applyStreak(current.streak, summary.completedAt);
  const boardsCompleted = current.progress.boardsCompleted + 1;

  return {
    ...current,
    achievements: applyAchievements(current.achievements, boardsCompleted, streak.current, summary),
    progress: {
      ...current.progress,
      boardsCompleted,
      currentGarden: Math.min(20, current.progress.currentGarden + 1),
      lastCompletedSessionId: summary.sessionId,
      totalPairsMatched: current.progress.totalPairsMatched + summary.pairs,
    },
    streak,
  };
}

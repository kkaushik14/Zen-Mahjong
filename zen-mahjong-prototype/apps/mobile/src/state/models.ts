import type { GameState } from '@zen-mahjong/game-engine';
import type { PlayerProfile, PlayerSettings } from '@zen-mahjong/shared-types';

export type AppSettings = PlayerSettings;

export type LocalProfile = PlayerProfile;

export interface ProgressState {
  boardsCompleted: number;
  currentGarden: number;
  dailyChallengesCompleted: number;
  lastCompletedSessionId: string | null;
  totalPairsMatched: number;
}

export interface AchievementState {
  id: 'quiet-beginning' | 'still-mind' | 'seven-sunrises' | 'mountain-path';
  maximum: number;
  unlockedAt: string | null;
  value: number;
}

export interface StreakState {
  activityDates: readonly string[];
  best: number;
  current: number;
  lastCompletedLocalDate: string | null;
}

export interface PlayerState {
  achievements: readonly AchievementState[];
  profile: LocalProfile;
  progress: ProgressState;
  streak: StreakState;
}

export interface ActiveSession {
  game: GameState;
  hintCount: number;
  id: string;
  startedAt: string;
}

export interface CompletionSummary {
  completedAt: Date;
  hints: number;
  pairs: number;
  sessionId: string;
  shuffles: number;
}

export type StorageStatus = 'loading' | 'ready' | 'recovered' | 'memory-fallback';

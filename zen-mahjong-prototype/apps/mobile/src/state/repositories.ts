import {
  createInitialOfflineSave,
  createInitialAdvertisementState,
  migrateLegacyOfflineState,
  validateOfflineSave,
  type GameState,
  type MahjongTile,
  type OfflineSaveV2,
} from '@zen-mahjong/game-engine';
import {
  MemoryKeyValueStore,
  MmkvKeyValueStore,
  VersionedRepository,
  type KeyValueStore,
} from '@zen-mahjong/persistence';
import { createMMKV } from 'react-native-mmkv';

import { defaultAchievements } from './progress';
import type { ActiveSession, AppSettings, PlayerState } from './models';
import { validateOnboardingState, type OnboardingStateV1 } from './onboarding';

export const defaultSettings: AppSettings = {
  ambienceEnabled: true,
  hapticsEnabled: true,
  musicEnabled: true,
  reducedMotion: false,
  soundEffectsEnabled: true,
  tileStyle: 'ivory-marble',
};

export const defaultPlayerState: PlayerState = {
  achievements: defaultAchievements,
  profile: {
    createdAt: '2026-09-25T00:00:00.000Z',
    displayName: 'Kumar',
    id: 'local-player',
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isSettings(value: unknown): value is AppSettings {
  if (!isRecord(value)) return false;
  return (
    typeof value.ambienceEnabled === 'boolean' &&
    typeof value.hapticsEnabled === 'boolean' &&
    typeof value.musicEnabled === 'boolean' &&
    typeof value.reducedMotion === 'boolean' &&
    typeof value.soundEffectsEnabled === 'boolean' &&
    value.tileStyle === 'ivory-marble'
  );
}

function isTile(value: unknown): value is MahjongTile {
  if (!isRecord(value) || !isRecord(value.position)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.motif === 'string' &&
    typeof value.matchingGroup === 'string' &&
    typeof value.removed === 'boolean' &&
    Number.isInteger(value.position.column) &&
    Number.isInteger(value.position.row) &&
    Number.isInteger(value.position.layer)
  );
}

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  return (
    typeof value.levelId === 'string' &&
    typeof value.seed === 'string' &&
    Array.isArray(value.tiles) &&
    value.tiles.every(isTile) &&
    Array.isArray(value.initialTiles) &&
    value.initialTiles.every(isTile) &&
    Array.isArray(value.history) &&
    value.history.every(
      (move) =>
        isRecord(move) &&
        typeof move.firstTileId === 'string' &&
        typeof move.secondTileId === 'string' &&
        Number.isInteger(move.moveNumber),
    ) &&
    isNonNegativeInteger(value.shuffleCount)
  );
}

function isActiveSession(value: unknown): value is ActiveSession {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.startedAt === 'string' &&
    isNonNegativeInteger(value.hintCount) &&
    isGameState(value.game)
  );
}

function isPlayerState(value: unknown): value is PlayerState {
  if (!isRecord(value) || !isRecord(value.profile) || !isRecord(value.progress)) return false;
  if (!isRecord(value.streak) || !Array.isArray(value.achievements)) return false;

  return (
    typeof value.profile.id === 'string' &&
    typeof value.profile.displayName === 'string' &&
    typeof value.profile.createdAt === 'string' &&
    isNonNegativeInteger(value.progress.boardsCompleted) &&
    isNonNegativeInteger(value.progress.currentGarden) &&
    isNonNegativeInteger(value.progress.dailyChallengesCompleted) &&
    (value.progress.lastCompletedSessionId === null ||
      typeof value.progress.lastCompletedSessionId === 'string') &&
    isNonNegativeInteger(value.progress.totalPairsMatched) &&
    isNonNegativeInteger(value.streak.best) &&
    isNonNegativeInteger(value.streak.current) &&
    (value.streak.lastCompletedLocalDate === null ||
      typeof value.streak.lastCompletedLocalDate === 'string') &&
    Array.isArray(value.streak.activityDates) &&
    value.streak.activityDates.every((date) => typeof date === 'string') &&
    value.achievements.every(
      (achievement) =>
        isRecord(achievement) &&
        typeof achievement.id === 'string' &&
        isNonNegativeInteger(achievement.value) &&
        isNonNegativeInteger(achievement.maximum) &&
        (achievement.unlockedAt === null || typeof achievement.unlockedAt === 'string'),
    )
  );
}

export interface AppRepositories {
  activeSession: VersionedRepository<ActiveSession>;
  offlineState: VersionedRepository<OfflineSaveV2>;
  onboarding: VersionedRepository<OnboardingStateV1>;
  playerState: VersionedRepository<PlayerState>;
  settings: VersionedRepository<AppSettings>;
}

export function createAppRepositories(
  store: KeyValueStore,
  now: () => Date = () => new Date(),
): AppRepositories {
  return {
    activeSession: new VersionedRepository(
      store,
      {
        key: 'active-session',
        schemaVersion: 1,
        validate: isActiveSession,
      },
      now,
    ),
    offlineState: new VersionedRepository(
      store,
      {
        key: 'offline-state:v0.3.0',
        schemaVersion: 2,
        validate: validateOfflineSave,
        migrations: [
          {
            fromVersion: 1,
            migrate: (payload) => ({
              ...(isRecord(payload) ? payload : {}),
              advertisements: createInitialAdvertisementState(),
              schemaVersion: 2,
            }),
          },
        ],
      },
      now,
    ),
    onboarding: new VersionedRepository(
      store,
      {
        key: 'onboarding-state:v0.3.0',
        schemaVersion: 1,
        validate: validateOnboardingState,
      },
      now,
    ),
    playerState: new VersionedRepository(
      store,
      {
        key: 'player-state',
        schemaVersion: 1,
        validate: isPlayerState,
      },
      now,
    ),
    settings: new VersionedRepository(
      store,
      {
        key: 'settings',
        schemaVersion: 3,
        validate: isSettings,
        migrations: [
          {
            fromVersion: 1,
            migrate: (payload) => ({
              ...defaultSettings,
              ...(isRecord(payload) ? payload : {}),
            }),
          },
          {
            fromVersion: 2,
            migrate: (payload) => ({
              ...defaultSettings,
              ...(isRecord(payload) ? payload : {}),
              tileStyle: 'ivory-marble',
            }),
          },
        ],
      },
      now,
    ),
  };
}

export function initializeOfflineState(
  repositories: AppRepositories,
  input: {
    activeSession: ActiveSession | null;
    createdAt: string;
    playerState: PlayerState | null;
  },
) {
  const existing = repositories.offlineState.read();
  if (existing.document) return existing;

  const hasLegacyState = input.activeSession !== null || input.playerState !== null;
  const payload = hasLegacyState
    ? migrateLegacyOfflineState({
        activeSession: input.activeSession,
        migratedAt: input.createdAt,
        playerState: input.playerState,
      }).save
    : createInitialOfflineSave(input.createdAt);
  return { document: repositories.offlineState.write(payload, 0), recovered: false };
}

export function createDefaultRepositories(): {
  persistent: boolean;
  repositories: AppRepositories;
} {
  try {
    const store = new MmkvKeyValueStore(createMMKV({ id: 'zen-mahjong-prototype' }));
    return { persistent: true, repositories: createAppRepositories(store) };
  } catch {
    return {
      persistent: false,
      repositories: createAppRepositories(new MemoryKeyValueStore()),
    };
  }
}

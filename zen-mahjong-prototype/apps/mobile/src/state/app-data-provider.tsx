import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  enqueueFutureSyncEvent,
  pauseSessionTiming,
  recordDailyVisit,
  resumeSessionTiming,
  type OfflineSaveV2,
} from '@zen-mahjong/game-engine';
import { AppState } from 'react-native';

import { completePlayerSession, toLocalDateKey } from './progress';
import {
  createDefaultRepositories,
  defaultPlayerState,
  defaultSettings,
  initializeOfflineState,
  type AppRepositories,
} from './repositories';
import type {
  ActiveSession,
  AppSettings,
  CompletionSummary,
  PlayerState,
  StorageStatus,
} from './models';
import {
  defaultOnboardingState,
  preserveReturningPlayerOnboarding,
  type OnboardingStateV1,
} from './onboarding';

interface AppDataContextValue {
  activeSession: ActiveSession | null;
  completeSession(summary: CompletionSummary): void;
  hydrated: boolean;
  offlineSave: OfflineSaveV2;
  onboarding: OnboardingStateV1;
  pauseActiveRun(): void;
  playerState: PlayerState;
  resumeActiveRun(): void;
  saveActiveSession(session: ActiveSession): void;
  settings: AppSettings;
  storageStatus: StorageStatus;
  updateOfflineSave(update: (save: OfflineSaveV2) => OfflineSaveV2): OfflineSaveV2;
  updateOnboarding(patch: Partial<Omit<OnboardingStateV1, 'schemaVersion'>>): void;
  updateProfile(displayName: string): void;
  updateSettings(patch: Partial<AppSettings>): void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const repositoriesRef = useRef<AppRepositories | null>(null);
  const playerStateRef = useRef(defaultPlayerState);
  const settingsRef = useRef(defaultSettings);
  const offlineSaveRef = useRef<OfflineSaveV2 | null>(null);
  const onboardingRef = useRef(defaultOnboardingState);
  const hydratedRef = useRef(false);
  const manualPauseRef = useRef(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [playerState, setPlayerState] = useState(defaultPlayerState);
  const [settings, setSettings] = useState(defaultSettings);
  const [offlineSave, setOfflineSave] = useState<OfflineSaveV2 | null>(null);
  const [onboarding, setOnboarding] = useState(defaultOnboardingState);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>('loading');

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const { persistent, repositories } = createDefaultRepositories();
    repositoriesRef.current = repositories;
    const settingsResult = repositories.settings.read();
    const playerResult = repositories.playerState.read();
    const sessionResult = repositories.activeSession.read();
    const offlineResult = initializeOfflineState(repositories, {
      activeSession: sessionResult.document?.payload ?? null,
      createdAt: new Date().toISOString(),
      playerState: playerResult.document?.payload ?? null,
    });
    const onboardingResult = repositories.onboarding.readOrCreate(() => defaultOnboardingState);
    let offlineDocument = offlineResult.document;
    if (!offlineDocument) throw new Error('Unable to initialize v0.3.0 offline state');
    const restoredOnboarding = preserveReturningPlayerOnboarding(
      onboardingResult.document.payload,
      offlineDocument.payload,
      new Date().toISOString(),
    );
    if (restoredOnboarding !== onboardingResult.document.payload) {
      repositories.onboarding.write(restoredOnboarding, onboardingResult.document.revision);
    }
    const visitedAt = new Date();
    const localDate = toLocalDateKey(visitedAt);
    if (offlineDocument.payload.progression.streak.lastVisitLocalDate !== localDate) {
      const visit = recordDailyVisit(
        offlineDocument.payload.progression,
        offlineDocument.payload.economy,
        {
          createdAt: visitedAt.toISOString(),
          localDate,
        },
      );
      offlineDocument = repositories.offlineState.write(
        {
          ...offlineDocument.payload,
          economy: visit.economy,
          outbox: enqueueFutureSyncEvent(offlineDocument.payload.outbox, {
            aggregateId: 'local-player',
            eventId: `sync:streak-visit:${localDate}`,
            kind: 'streak-visit',
            occurredAt: visitedAt.toISOString(),
            payload: { localDate, streak: visit.progression.streak.current },
            payloadVersion: 1,
          }),
          progression: visit.progression,
        },
        offlineDocument.revision,
      );
    }
    const restoredSettings = settingsResult.document?.payload ?? defaultSettings;
    const restoredPlayer = playerResult.document?.payload ?? defaultPlayerState;

    if (!settingsResult.document) repositories.settings.write(restoredSettings);
    if (!playerResult.document) repositories.playerState.write(restoredPlayer);

    settingsRef.current = restoredSettings;
    offlineSaveRef.current = offlineDocument.payload;
    onboardingRef.current = restoredOnboarding;
    playerStateRef.current = restoredPlayer;
    setSettings(restoredSettings);
    setOfflineSave(offlineDocument.payload);
    setOnboarding(restoredOnboarding);
    setPlayerState(restoredPlayer);
    setActiveSession(sessionResult.document?.payload ?? null);
    setStorageStatus(
      !persistent
        ? 'memory-fallback'
        : settingsResult.recovered ||
            playerResult.recovered ||
            sessionResult.recovered ||
            offlineResult.recovered ||
            onboardingResult.recovered
          ? 'recovered'
          : 'ready',
    );
    setHydrated(true);
  }, []);

  const updateOfflineSave = useCallback((update: (save: OfflineSaveV2) => OfflineSaveV2) => {
    const repositories = repositoriesRef.current;
    const current = offlineSaveRef.current;
    if (!repositories || !current) throw new Error('Offline state is not hydrated');
    const document = repositories.offlineState.update(() => current, update);
    offlineSaveRef.current = document.payload;
    setOfflineSave(document.payload);
    return document.payload;
  }, []);

  const updateOnboarding = useCallback(
    (patch: Partial<Omit<OnboardingStateV1, 'schemaVersion'>>) => {
      const next = { ...onboardingRef.current, ...patch };
      repositoriesRef.current?.onboarding.write(next);
      onboardingRef.current = next;
      setOnboarding(next);
    },
    [],
  );

  const pauseActiveRun = useCallback(() => {
    manualPauseRef.current = true;
    const pausedAt = new Date().toISOString();
    updateOfflineSave((save) => {
      if (!save.activeRun) return save;
      const session = pauseSessionTiming(save.activeRun.session, pausedAt);
      return session === save.activeRun.session
        ? save
        : { ...save, activeRun: { ...save.activeRun, session } };
    });
  }, [updateOfflineSave]);

  const resumeActiveRun = useCallback(() => {
    manualPauseRef.current = false;
    const resumedAt = new Date().toISOString();
    updateOfflineSave((save) => {
      if (!save.activeRun) return save;
      const session = resumeSessionTiming(save.activeRun.session, resumedAt);
      return session === save.activeRun.session
        ? save
        : { ...save, activeRun: { ...save.activeRun, session } };
    });
  }, [updateOfflineSave]);

  useEffect(() => {
    if (!hydrated) return;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (!offlineSaveRef.current?.activeRun) return;
      const changedAt = new Date().toISOString();
      updateOfflineSave((save) => {
        if (!save.activeRun) return save;
        const session =
          nextState === 'active' && !manualPauseRef.current
            ? resumeSessionTiming(save.activeRun.session, changedAt)
            : pauseSessionTiming(save.activeRun.session, changedAt);
        return session === save.activeRun.session
          ? save
          : { ...save, activeRun: { ...save.activeRun, session } };
      });
    });
    return () => subscription.remove();
  }, [hydrated, updateOfflineSave]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    repositoriesRef.current?.settings.write(next);
    settingsRef.current = next;
    setSettings(next);
  }, []);

  const updateProfile = useCallback((displayName: string) => {
    const next = {
      ...playerStateRef.current,
      profile: { ...playerStateRef.current.profile, displayName },
    };
    repositoriesRef.current?.playerState.write(next);
    playerStateRef.current = next;
    setPlayerState(next);
  }, []);

  const saveActiveSession = useCallback((session: ActiveSession) => {
    repositoriesRef.current?.activeSession.write(session);
    setActiveSession(session);
  }, []);

  const completeSession = useCallback((summary: CompletionSummary) => {
    const next = completePlayerSession(playerStateRef.current, summary);
    if (next !== playerStateRef.current) {
      repositoriesRef.current?.playerState.write(next);
      playerStateRef.current = next;
      setPlayerState(next);
    }
    repositoriesRef.current?.activeSession.remove();
    setActiveSession(null);
  }, []);

  const value = useMemo<AppDataContextValue | null>(
    () =>
      offlineSave
        ? {
            activeSession,
            completeSession,
            hydrated,
            offlineSave,
            onboarding,
            pauseActiveRun,
            playerState,
            resumeActiveRun,
            saveActiveSession,
            settings,
            storageStatus,
            updateOfflineSave,
            updateOnboarding,
            updateProfile,
            updateSettings,
          }
        : null,
    [
      activeSession,
      completeSession,
      hydrated,
      offlineSave,
      onboarding,
      pauseActiveRun,
      playerState,
      resumeActiveRun,
      saveActiveSession,
      settings,
      storageStatus,
      updateOfflineSave,
      updateOnboarding,
      updateProfile,
      updateSettings,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{offlineSave ? children : null}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider');
  return value;
}

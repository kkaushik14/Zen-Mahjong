import { color, typography } from '@zen-mahjong/design-tokens';
import { getTierPosition } from '@zen-mahjong/game-content';
import {
  completeLevel,
  countQualifyingAssistAdvertisements,
  enqueueFutureSyncEvent,
  executeTrackedConcentrationCommand,
  getEconomyBalances,
  getRevivalCost,
  getZenScoreBase,
  grantAdvertisementAssist,
  recordAdvertisementRevival,
  useHint as requestHint,
  useShuffle as applyShuffle,
  useUndo as applyUndo,
  type ConcentrationCommand,
  type ConcentrationEvent,
  type AssistKind,
  type AdvertisementReceiptV1,
  type OfflineSaveV2,
  type TileId,
} from '@zen-mahjong/game-engine';
import {
  ConcentrationTray,
  gameplayAssetSources,
  getTileArtworkSource,
  MahjongBoard,
} from '@zen-mahjong/mahjong-ui';
import { IconActionControl, ZenProgress } from '@zen-mahjong/ui';
import { Image as ExpoImage } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppScreen } from '@/components/app-screen';
import { RewardAdvertisementModal } from '@/features/advertisements/reward-advertisement-modal';
import { advertisementProvider } from '@/services/advertisement-provider';
import { useAppData } from '@/state/app-data-provider';
import { getOnboardingDestination } from '@/state/onboarding';
import { runtimeAssets } from '@/theme/runtime-assets';
import {
  GameplayOverlay,
  type GameplayOverlayAction,
  type GameplayOverlayKind,
} from './gameplay-overlay';
import { getGameplayLayoutMetrics } from './gameplay-layout';
import { createNumberedRun } from './create-numbered-run';
import { getRecoveryOverlayKind } from './overlay-state';
import { categoryNames, remainingTileCount, toBoardTiles, toTrayTiles } from './presentation';

function feedbackForEvents(events: readonly ConcentrationEvent[]): string {
  if (events.some((event) => event.type === 'level-won')) return 'The final pattern is clear.';
  if (events.some((event) => event.type === 'special-pair-resolved')) {
    return 'The Special Concentration slot restored space.';
  }
  if (events.some((event) => event.type === 'pair-resolved')) return 'A matching pair dissolved.';
  if (events.some((event) => event.type === 'session-revived'))
    return 'The tray returned to the board.';
  if (events.some((event) => event.type === 'session-restarted')) return 'The level restarted.';
  return 'The tile entered your Concentration tray.';
}

function GameplayTopControl({
  accessibilityLabel,
  asset,
  onPress,
}: {
  accessibilityLabel: string;
  asset: (typeof gameplayAssetSources)[keyof typeof gameplayAssetSources];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [styles.topControl, pressed && styles.pressed]}
    >
      <Image resizeMode="contain" source={asset} style={styles.topControlImage} />
    </Pressable>
  );
}

export function GameplayScreen() {
  const { offlineSave, onboarding, pauseActiveRun, resumeActiveRun, settings, updateOfflineSave } =
    useAppData();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState('Choose an available tile');
  const [hintedTileIds, setHintedTileIds] = useState<readonly TileId[]>([]);
  const [dismissedRecoveryKey, setDismissedRecoveryKey] = useState<string | null>(null);
  const [assistAdvertisementsAvailable, setAssistAdvertisementsAvailable] = useState(false);
  const [revivalAdvertisementsAvailable, setRevivalAdvertisementsAvailable] = useState(false);
  const [advertisementBusy, setAdvertisementBusy] = useState(false);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [userOverlay, setUserOverlay] = useState<GameplayOverlayKind | null>(null);
  const sequenceRef = useRef(0);
  const completedRef = useRef<string | null>(null);
  const pauseReasonRef = useRef<'overlay' | 'recovery' | null>(null);
  const onboardingDestination = getOnboardingDestination(
    onboarding,
    offlineSave.activeRun !== null,
  );

  useEffect(() => {
    if (onboardingDestination !== '/game') {
      router.replace(onboardingDestination);
      return;
    }
    if (offlineSave.activeRun) return;
    const startedAt = new Date().toISOString();
    updateOfflineSave((save) => ({ ...save, activeRun: createNumberedRun(save, startedAt) }));
  }, [offlineSave.activeRun, onboardingDestination, updateOfflineSave]);

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      advertisementProvider.getAvailability('assist-reward'),
      advertisementProvider.getAvailability('revival'),
    ]).then(([assist, revival]) => {
      if (!mounted) return;
      setAssistAdvertisementsAvailable(assist.available);
      setRevivalAdvertisementsAvailable(revival.available);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const run = offlineSave.activeRun;
  const session = run?.session ?? null;
  const recoveryKind = session ? getRecoveryOverlayKind(session) : null;
  const recoveryKey = session
    ? `${session.sessionId}:${session.status}:${session.regularTray.join(',')}`
    : null;
  const recoveryVisible =
    recoveryKind !== null && dismissedRecoveryKey !== recoveryKey && userOverlay === null;
  const balances = useMemo(() => getEconomyBalances(offlineSave.economy), [offlineSave.economy]);
  const boardTiles = useMemo(
    () => (session ? toBoardTiles(session, hintedTileIds) : []),
    [hintedTileIds, session],
  );
  const trayTiles = useMemo(() => (session ? toTrayTiles(session) : []), [session]);

  useFocusEffect(
    useCallback(() => {
      if (pauseReasonRef.current === null) resumeActiveRun();
      return () => pauseActiveRun();
    }, [pauseActiveRun, resumeActiveRun]),
  );

  useEffect(() => {
    if (recoveryVisible) {
      pauseReasonRef.current = 'recovery';
      pauseActiveRun();
    } else if (pauseReasonRef.current === 'recovery') {
      pauseReasonRef.current = null;
      resumeActiveRun();
    }
  }, [pauseActiveRun, recoveryVisible, resumeActiveRun]);

  useEffect(() => {
    if (!session || session.status !== 'won' || completedRef.current === session.sessionId) return;
    completedRef.current = session.sessionId;
    const completedAt = new Date().toISOString();
    const completionBox: { value: ReturnType<typeof completeLevel> | null } = { value: null };
    updateOfflineSave((save) => {
      if (!save.activeRun || save.activeRun.session.sessionId !== session.sessionId) return save;
      const completion = completeLevel(save.activeRun.session, save.progression, save.economy, {
        completedAt,
        qualifyingAssistAdCount: countQualifyingAssistAdvertisements(
          save.advertisements,
          session.sessionId,
        ),
        receiptId: `completion:${session.sessionId}`,
      });
      completionBox.value = completion;
      if (!completion.accepted || !completion.receipt) return save;
      const receipt = completion.receipt;
      return {
        ...save,
        activeRun: null,
        economy: completion.economy,
        outbox: enqueueFutureSyncEvent(save.outbox, {
          aggregateId: session.sessionId,
          eventId: `sync:${receipt.receiptId}`,
          kind: 'completion-receipt',
          occurredAt: completedAt,
          payload: {
            activeDurationSeconds: receipt.activeDurationSeconds,
            levelNumber: receipt.levelNumber,
            receiptId: receipt.receiptId,
            sessionId: receipt.sessionId,
            zenScore: receipt.zenScore,
          },
          payloadVersion: 1,
        }),
        progression: completion.progression,
      };
    });

    const completion = completionBox.value;
    if (completion?.accepted && completion.receipt && completion.breakdown) {
      router.replace({
        pathname: '/complete',
        params: {
          receipt: completion.receipt.receiptId,
        },
      });
    }
  }, [session, updateOfflineSave]);

  if (onboardingDestination !== '/game' || !run || !session) {
    return (
      <AppScreen contentStyle={styles.loading} scroll={false}>
        <Text style={styles.loadingText}>Preparing your next pattern</Text>
      </AppScreen>
    );
  }

  const nextId = (prefix: string) => {
    sequenceRef.current += 1;
    return `${prefix}:${Date.now()}:${sequenceRef.current}`;
  };

  const enqueueAdvertisementReceipt = (save: OfflineSaveV2, receipt: AdvertisementReceiptV1) =>
    enqueueFutureSyncEvent(save.outbox, {
      aggregateId: receipt.sessionId,
      eventId: `sync:${receipt.receiptId}`,
      kind: 'advertisement-receipt',
      occurredAt: receipt.completedAt,
      payload: {
        impressionId: receipt.impressionId,
        placement: receipt.placement,
        receiptId: receipt.receiptId,
        rewardKind: receipt.reward.kind,
        sessionId: receipt.sessionId,
      },
      payloadVersion: 1,
    });

  const showAssistReward = async (assist: AssistKind) => {
    if (advertisementBusy) return;
    setAdvertisementBusy(true);
    const request = {
      placement: 'assist-reward' as const,
      requestId: nextId(`advertisement-${assist}`),
      sessionId: session.sessionId,
    };
    const result = await advertisementProvider.showRewarded(request);
    let granted = false;
    updateOfflineSave((save) => {
      const reward = grantAdvertisementAssist(
        save.advertisements,
        save.economy,
        request,
        result,
        assist,
      );
      granted = reward.accepted;
      if (!reward.accepted || !reward.receipt) return save;
      return {
        ...save,
        advertisements: reward.advertisements,
        economy: reward.economy,
        outbox: enqueueAdvertisementReceipt(save, reward.receipt),
      };
    });
    setAdvertisementBusy(false);
    setRewardModalVisible(false);
    pauseReasonRef.current = null;
    resumeActiveRun();
    setFeedback(
      granted
        ? `One ${assist} was added. This level earned a +1 Zen bonus.`
        : result.status === 'not-completed' && result.reason === 'cancelled'
          ? 'The reward was cancelled.'
          : 'The reward is unavailable. Gameplay can continue offline.',
    );
  };

  const showRevivalReward = async () => {
    if (advertisementBusy) return;
    setAdvertisementBusy(true);
    const request = {
      placement: 'revival' as const,
      requestId: nextId('advertisement-revival'),
      sessionId: session.sessionId,
    };
    const result = await advertisementProvider.showRewarded(request);
    let revived = false;
    updateOfflineSave((save) => {
      if (!save.activeRun) return save;
      const recorded = recordAdvertisementRevival(save.advertisements, request, result);
      if (!recorded.accepted || !recorded.receipt) return save;
      const transition = executeTrackedConcentrationCommand(
        save.activeRun,
        save.economy,
        { type: 'revive-with-advertisement' },
        {
          createdAt: recorded.receipt.completedAt,
          transactionId: `${recorded.receipt.receiptId}:revival`,
        },
      );
      if (!transition.accepted) return save;
      revived = true;
      return {
        ...save,
        activeRun: transition.run,
        advertisements: recorded.advertisements,
        outbox: enqueueAdvertisementReceipt(save, recorded.receipt),
      };
    });
    setAdvertisementBusy(false);
    setFeedback(
      revived
        ? 'The reward revived this board without spending Zen Score.'
        : result.status === 'not-completed' && result.reason === 'cancelled'
          ? 'The revival reward was cancelled.'
          : 'The reward is unavailable. Restart remains available.',
    );
  };

  const executeCommand = (command: ConcentrationCommand, prefix: string) => {
    const createdAt = new Date().toISOString();
    let events: readonly ConcentrationEvent[] = [];
    let reason: string | null = null;
    updateOfflineSave((save) => {
      if (!save.activeRun) return save;
      const result = executeTrackedConcentrationCommand(save.activeRun, save.economy, command, {
        createdAt,
        transactionId: nextId(prefix),
      });
      reason = result.reason;
      events = result.commandResult?.events ?? [];
      return result.accepted ? { ...save, activeRun: result.run, economy: result.economy } : save;
    });
    setHintedTileIds([]);
    setFeedback(reason ? 'That action is not available now.' : feedbackForEvents(events));
  };

  const handleHint = () => {
    const createdAt = new Date().toISOString();
    const hintBox: { value: ReturnType<typeof requestHint>['hint'] } = { value: null };
    let reason: ReturnType<typeof requestHint>['reason'] = null;
    updateOfflineSave((save) => {
      if (!save.activeRun) return save;
      const result = requestHint(save.activeRun, save.economy, {
        createdAt,
        transactionId: nextId('hint'),
      });
      hintBox.value = result.hint;
      reason = result.reason;
      return result.accepted ? { ...save, activeRun: result.run, economy: result.economy } : save;
    });
    const hint = hintBox.value;
    setHintedTileIds(
      hint?.command.type === 'select-board-tile'
        ? [hint.command.tileId, ...(hint.followUpTileId ? [hint.followUpTileId] : [])]
        : [],
    );
    setFeedback(reason ? 'No Hint is available.' : 'A useful tile is softly outlined.');
  };

  const handleShuffle = () => {
    const createdAt = new Date().toISOString();
    let accepted = false;
    updateOfflineSave((save) => {
      if (!save.activeRun) return save;
      const result = applyShuffle(save.activeRun, save.economy, {
        createdAt,
        transactionId: nextId('shuffle'),
      });
      accepted = result.accepted;
      return result.accepted ? { ...save, activeRun: result.run, economy: result.economy } : save;
    });
    setHintedTileIds([]);
    setFeedback(accepted ? 'The remaining pattern was rearranged.' : 'Shuffle is not available.');
  };

  const handleUndo = () => {
    const createdAt = new Date().toISOString();
    let accepted = false;
    updateOfflineSave((save) => {
      if (!save.activeRun) return save;
      const result = applyUndo(save.activeRun, save.economy, {
        createdAt,
        transactionId: nextId('undo'),
      });
      accepted = result.accepted;
      return result.accepted ? { ...save, activeRun: result.run, economy: result.economy } : save;
    });
    setHintedTileIds([]);
    setFeedback(accepted ? 'The previous move was restored.' : 'There is no move to Undo.');
  };

  const openOverlay = (kind: GameplayOverlayKind) => {
    pauseReasonRef.current = 'overlay';
    pauseActiveRun();
    setUserOverlay(kind);
  };

  const resumeGameplay = () => {
    setUserOverlay(null);
    setRewardModalVisible(false);
    pauseReasonRef.current = null;
    resumeActiveRun();
  };

  const saveAndGoHome = () => {
    setUserOverlay(null);
    setRewardModalVisible(false);
    pauseReasonRef.current = null;
    pauseActiveRun();
    router.replace('/');
  };

  const restartLevel = () => {
    executeCommand({ type: 'restart' }, 'restart');
    setDismissedRecoveryKey(null);
    resumeGameplay();
  };

  const openSettings = () => {
    setUserOverlay(null);
    pauseReasonRef.current = null;
    router.push('/settings');
  };

  const chooseTrayTile = () => {
    if (recoveryKey) setDismissedRecoveryKey(recoveryKey);
    pauseReasonRef.current = null;
    resumeActiveRun();
  };

  const revivalCost = getRevivalCost(session.revivalCount + 1);
  const recoverWithScore = () =>
    executeCommand({ availableConcentrationScore: 0, type: 'revive' }, 'revive');

  let overlayKind: GameplayOverlayKind | null = userOverlay;
  if (recoveryVisible) overlayKind = recoveryKind;

  let overlayTitle = '';
  let overlayBody = '';
  let overlayArtwork: ReturnType<typeof getTileArtworkSource> | undefined;
  let overlayArtworkSize: { height: number; width: number } | undefined;
  let overlayActions: readonly GameplayOverlayAction[] = [];

  if (overlayKind === 'pause') {
    overlayTitle = 'A quiet pause';
    overlayBody = 'Your garden is waiting.';
    overlayArtwork = getTileArtworkSource('04-leaves');
    overlayArtworkSize = { height: 62, width: 72 };
    overlayActions = [
      { label: 'Resume', onPress: resumeGameplay },
      { emphasis: 'quiet', label: 'Save & Home', onPress: saveAndGoHome },
      { emphasis: 'quiet', label: 'Restart Board', onPress: () => setUserOverlay('restart') },
    ];
  } else if (overlayKind === 'more') {
    overlayTitle = 'Your Garden';
    overlayBody = 'Choose how you would like to continue.';
    overlayArtwork = getTileArtworkSource('11-cherry-blossom');
    overlayArtworkSize = { height: 76, width: 138 };
    overlayActions = [
      { label: 'Resume', onPress: resumeGameplay },
      { emphasis: 'quiet', label: 'Settings', onPress: openSettings },
      ...(assistAdvertisementsAvailable
        ? [
            {
              emphasis: 'quiet' as const,
              label: 'Earn an Assist',
              onPress: () => {
                setUserOverlay(null);
                setRewardModalVisible(true);
              },
            },
          ]
        : []),
      { emphasis: 'quiet', label: 'Save & Home', onPress: saveAndGoHome },
    ];
  } else if (overlayKind === 'restart') {
    overlayTitle = 'Restart Board?';
    overlayBody = 'Current board progress will be lost.\nAre you sure you want to restart?';
    overlayActions = [
      { emphasis: 'quiet', label: 'Cancel', onPress: resumeGameplay },
      { label: 'Restart', onPress: restartLevel },
    ];
  } else if (overlayKind === 'no-moves') {
    overlayTitle = 'A new arrangement';
    overlayBody = 'This arrangement cannot continue.';
    overlayActions = [
      ...(balances.shuffle > 0
        ? [{ label: 'Shuffle', onPress: handleShuffle } satisfies GameplayOverlayAction]
        : []),
      { emphasis: 'quiet', label: 'Restart Board', onPress: restartLevel },
      { emphasis: 'quiet', label: 'Save & Home', onPress: saveAndGoHome },
    ];
  } else if (overlayKind === 'full-tray') {
    overlayTitle = 'A moment to reset';
    overlayBody =
      session.status === 'blocked'
        ? 'The holding tray is full. Use the Identity slot to restore space.'
        : 'The holding tray is full.';
    overlayActions =
      session.status === 'blocked'
        ? [
            { label: 'Choose Tray Tile', onPress: chooseTrayTile },
            { emphasis: 'quiet', label: 'Restart Board', onPress: restartLevel },
            { emphasis: 'quiet', label: 'Save & Home', onPress: saveAndGoHome },
          ]
        : [
            ...(balances.concentrationScore >= revivalCost
              ? [
                  {
                    label: `Revive for ${revivalCost}`,
                    onPress: recoverWithScore,
                  } satisfies GameplayOverlayAction,
                ]
              : []),
            ...(revivalAdvertisementsAvailable
              ? [
                  {
                    label: advertisementBusy ? 'Preparing Reward...' : 'Revive after Reward',
                    loading: advertisementBusy,
                    onPress: () => void showRevivalReward(),
                  } satisfies GameplayOverlayAction,
                ]
              : []),
            { emphasis: 'quiet', label: 'Restart Board', onPress: restartLevel },
            { emphasis: 'quiet', label: 'Save & Home', onPress: saveAndGoHome },
          ];
  }

  const position = getTierPosition(session.levelNumber);
  const layout = getGameplayLayoutMetrics(width, height);
  const topControlTop = Math.max(58, insets.top + 8);
  const provisionalZenScore = getZenScoreBase(session.assistUsage);

  return (
    <>
      <View style={styles.gameplayScreen}>
        <ExpoImage
          contentFit="cover"
          pointerEvents="none"
          source={runtimeAssets['background.gameplayAutumn'].source}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityLabel={`Tier ${position.tierNumber}, level ${session.levelNumber}, ${categoryNames[session.category]}`}
          style={[styles.gameplayShell, { height, left: layout.left, width: layout.shellWidth }]}
        >
          <View style={[styles.topBar, { top: topControlTop }]}>
            <GameplayTopControl
              accessibilityLabel="Pause and return"
              asset={gameplayAssetSources.back}
              onPress={() => openOverlay('pause')}
            />
            <View style={styles.zenProgress}>
              <ZenProgress
                accessibilityLabel={`Current base Zen Score ${provisionalZenScore}; completion bonuses are measured after the level`}
                showValue={false}
                value={provisionalZenScore}
              />
            </View>
            <GameplayTopControl
              accessibilityLabel="Restart level"
              asset={gameplayAssetSources.restart}
              onPress={() => openOverlay('restart')}
            />
          </View>

          <View accessibilityLiveRegion="polite" pointerEvents="none" style={styles.feedbackRegion}>
            <Text style={styles.feedback}>{feedback}</Text>
          </View>

          <View
            style={[
              styles.boardFrame,
              {
                height: layout.boardHeight,
                top: layout.boardTop,
                width: layout.contentWidth,
              },
            ]}
          >
            <MahjongBoard
              accessibilityLabel={`Level ${session.levelNumber} board, ${remainingTileCount(session)} tiles remain`}
              onTilePress={(tileId) =>
                executeCommand({ tileId, type: 'select-board-tile' }, 'select')
              }
              reducedMotion={settings.reducedMotion}
              tiles={boardTiles}
              layoutTiles={session.game.initialTiles.map((tile) => tile.position)}
            />
          </View>

          <View
            style={[
              styles.trayPosition,
              {
                left: (layout.shellWidth - layout.trayWidth) / 2,
                top: layout.trayTop,
                width: layout.trayWidth,
              },
            ]}
          >
            <ConcentrationTray
              blocked={session.status === 'blocked'}
              onTilePress={(trayTileId) =>
                session.status === 'blocked'
                  ? executeCommand({ trayTileId, type: 'use-special-slot' }, 'special')
                  : setFeedback('The Special slot becomes active when the regular tray is full.')
              }
              reducedMotion={settings.reducedMotion}
              specialUsesRemaining={session.specialUsesRemaining}
              tiles={trayTiles}
            />
          </View>

          <View
            accessibilityLabel="Game assists"
            style={[styles.dock, { top: layout.dockTop, width: layout.contentWidth }]}
          >
            <IconActionControl
              accessibilityLabel={`Undo, ${balances.undo} available`}
              count={balances.undo}
              onPress={handleUndo}
              reducedMotion={settings.reducedMotion}
              state={balances.undo < 1 ? 'zero' : run.history.length < 1 ? 'disabled' : 'default'}
              type="undo"
            />
            <IconActionControl
              accessibilityLabel={`Hint, ${balances.hint} available`}
              count={balances.hint}
              onPress={handleHint}
              reducedMotion={settings.reducedMotion}
              state={balances.hint < 1 ? 'zero' : 'default'}
              type="hint"
            />
            <IconActionControl
              accessibilityLabel={`Shuffle, ${balances.shuffle} available`}
              count={balances.shuffle}
              onPress={handleShuffle}
              reducedMotion={settings.reducedMotion}
              state={balances.shuffle < 1 ? 'zero' : 'default'}
              type="shuffle"
            />
            <IconActionControl
              accessibilityLabel="More game options"
              onPress={() => openOverlay('more')}
              reducedMotion={settings.reducedMotion}
              type="more"
            />
          </View>
        </View>
      </View>
      <GameplayOverlay
        actions={overlayActions}
        body={overlayBody}
        kind={overlayKind ?? 'pause'}
        onDismissRequest={recoveryVisible ? saveAndGoHome : resumeGameplay}
        reducedMotion={settings.reducedMotion}
        title={overlayTitle}
        visible={overlayKind !== null}
        {...(overlayArtwork === undefined ? {} : { artwork: overlayArtwork })}
        {...(overlayArtworkSize === undefined ? {} : { artworkSize: overlayArtworkSize })}
      />
      <RewardAdvertisementModal
        busy={advertisementBusy}
        onClose={resumeGameplay}
        onSelectAssist={(assist) => void showAssistReward(assist)}
        reducedMotion={settings.reducedMotion}
        visible={rewardModalVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.control, color: color.text.onDark },
  gameplayScreen: { backgroundColor: '#6B2B12', flex: 1, overflow: 'hidden' },
  gameplayShell: { position: 'absolute', top: 0 },
  topBar: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    height: 58,
    justifyContent: 'space-between',
    left: 16,
    position: 'absolute',
    right: 16,
    zIndex: 20,
  },
  topControl: { height: 48, width: 56 },
  topControlImage: { height: 48, width: 56 },
  zenProgress: {
    height: 58,
    left: '50%',
    marginLeft: -115,
    position: 'absolute',
    top: -10,
    width: 230,
  },
  feedbackRegion: {
    height: 1,
    left: 0,
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    width: 1,
  },
  feedback: { ...typography.caption },
  boardFrame: { left: 16, overflow: 'hidden', position: 'absolute' },
  trayPosition: { position: 'absolute', zIndex: 10 },
  dock: {
    flexDirection: 'row',
    height: 112,
    justifyContent: 'space-between',
    left: 16,
    position: 'absolute',
    zIndex: 10,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});

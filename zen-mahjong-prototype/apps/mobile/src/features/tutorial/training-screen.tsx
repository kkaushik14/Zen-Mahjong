import { color, fontFamily, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import {
  createConcentrationSession,
  createFixtureState,
  executeConcentrationCommand,
  getConcentrationHint,
  type ConcentrationSessionV1,
  type TileId,
} from '@zen-mahjong/game-engine';
import { ConcentrationTray, MahjongBoard } from '@zen-mahjong/mahjong-ui';
import { ActionButton } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { Lightbulb, Menu } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { useAppData } from '@/state/app-data-provider';
import { completeOnboardingTraining, getOnboardingDestination } from '@/state/onboarding';
import { remainingTileCount, toBoardTiles, toTrayTiles } from '../gameplay/presentation';

export type TrainingMode = 'practice' | 'tutorial';

function createTrainingSession(mode: TrainingMode): ConcentrationSessionV1 {
  const startedAt = new Date().toISOString();
  return createConcentrationSession({
    activeSince: null,
    category: 'normal',
    game: createFixtureState(
      mode === 'tutorial' ? 'flat-introduction' : 'layered-introduction',
      `v0.3.0-${mode}`,
    ),
    levelContentVersion: '0.3.0-training',
    levelNumber: 1,
    sessionId: `${mode}:${startedAt}`,
    startedAt,
  });
}

function tutorialPrompt(session: ConcentrationSessionV1): string {
  if (session.status === 'won') return 'The practice pattern is clear.';
  if (session.regularTray.length > 0) {
    return 'The tile waits in your regular tray. Choose the same symbol to resolve the pair.';
  }
  if (remainingTileCount(session) < session.game.initialTiles.length) {
    return 'Matching symbols clear automatically. Continue with another open tile.';
  }
  return 'Choose any open tile. Blocked tiles become available as the board clears.';
}

export function TrainingScreen({ mode }: { mode: TrainingMode }) {
  const { onboarding, settings, updateOnboarding } = useAppData();
  const leavingTraining = useRef(false);
  const [session, setSession] = useState(() =>
    onboarding.activeTraining?.mode === mode
      ? onboarding.activeTraining.session
      : createTrainingSession(mode),
  );
  const [hintedTileIds, setHintedTileIds] = useState<readonly TileId[]>([]);
  const [feedback, setFeedback] = useState(
    mode === 'tutorial'
      ? 'This short board introduces the Concentration tray.'
      : 'Clear this layered board with free guidance.',
  );
  const isReview = mode === 'tutorial' && onboarding.tutorialCompletedAt !== null;
  const canEnterTraining =
    mode === 'tutorial' ||
    onboarding.tutorialCompletedAt !== null ||
    onboarding.activeTraining?.mode === 'practice';
  const boardTiles = useMemo(() => toBoardTiles(session, hintedTileIds), [hintedTileIds, session]);
  const trayTiles = useMemo(() => toTrayTiles(session), [session]);

  useEffect(() => {
    if (leavingTraining.current) return;
    if (!canEnterTraining) {
      router.replace('/tutorial');
      return;
    }
    if (isReview) return;
    if (onboarding.activeTraining?.mode === mode) return;
    updateOnboarding({ activeTraining: { mode, session } });
  }, [
    canEnterTraining,
    isReview,
    mode,
    onboarding.activeTraining?.mode,
    session,
    updateOnboarding,
  ]);

  const selectTile = (tileId: TileId) => {
    const result = executeConcentrationCommand(session, { tileId, type: 'select-board-tile' });
    if (!result.accepted) {
      setFeedback('That tile is still covered. Choose an open edge tile.');
      return;
    }
    setSession(result.session);
    if (!isReview) updateOnboarding({ activeTraining: { mode, session: result.session } });
    setHintedTileIds([]);
    setFeedback(
      result.events.some((event) => event.type === 'pair-resolved')
        ? 'The matching pair dissolved from the tray.'
        : 'The tile entered the first open regular slot.',
    );
  };

  const showHint = () => {
    const hint = getConcentrationHint(session);
    if (!hint) return;
    setHintedTileIds(
      hint.command.type === 'select-board-tile'
        ? [hint.command.tileId, ...(hint.followUpTileId ? [hint.followUpTileId] : [])]
        : [],
    );
    setFeedback('The softly outlined tile is available now.');
  };

  const finish = () => {
    leavingTraining.current = true;
    if (isReview) {
      router.replace('/');
      return;
    }
    const completedAt = new Date().toISOString();
    const next = completeOnboardingTraining(onboarding, mode, completedAt);
    updateOnboarding({
      activeTraining: next.activeTraining,
      practiceCompletedAt: next.practiceCompletedAt,
      tutorialCompletedAt: next.tutorialCompletedAt,
    });
    router.replace(getOnboardingDestination(next));
  };

  if (!canEnterTraining) return null;

  return (
    <AppScreen contentStyle={styles.screen} scroll={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{mode === 'tutorial' ? 'GUIDED TUTORIAL' : 'PRACTICE'}</Text>
          <Text style={styles.title}>
            {mode === 'tutorial' ? 'Learn the flow' : 'Quiet rehearsal'}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={() => router.push('/settings')}
          style={styles.iconButton}
        >
          <Menu aria-hidden color={color.surface.ivory} size={21} />
        </Pressable>
      </View>
      <View accessibilityLiveRegion="polite" style={styles.guide}>
        <Text style={styles.guideText}>{tutorialPrompt(session)}</Text>
        <Text style={styles.feedback}>{feedback}</Text>
      </View>
      <View style={styles.boardFrame}>
        <MahjongBoard
          accessibilityLabel={`Training board, ${remainingTileCount(session)} tiles remain`}
          onTilePress={selectTile}
          reducedMotion={settings.reducedMotion}
          tiles={boardTiles}
          layoutTiles={session.game.initialTiles.map((tile) => tile.position)}
        />
      </View>
      <View style={styles.trayBlock}>
        <Text style={styles.trayLabel}>CONCENTRATION TRAY</Text>
        <ConcentrationTray
          blocked={session.status === 'blocked'}
          onTilePress={(trayTileId) => {
            const result = executeConcentrationCommand(session, {
              trayTileId,
              type: 'use-special-slot',
            });
            if (!result.accepted) return;
            setSession(result.session);
            if (!isReview) updateOnboarding({ activeTraining: { mode, session: result.session } });
            setFeedback('The Identity slot restored space in the regular tray.');
          }}
          reducedMotion={settings.reducedMotion}
          specialUsesRemaining={session.specialUsesRemaining}
          tiles={trayTiles}
        />
        <Text style={styles.specialHelp}>
          The S slot is a limited recovery space used when four regular slots are occupied.
        </Text>
      </View>
      {session.status === 'won' ? (
        <ActionButton
          accessibilityLabel={mode === 'tutorial' ? 'Continue to practice' : 'Start level one'}
          fullWidth
          label={mode === 'tutorial' ? 'Continue to Practice' : 'Start Level 1'}
          onPress={finish}
        />
      ) : session.status === 'failed' ? (
        <ActionButton
          accessibilityLabel="Restart training"
          fullWidth
          label="Try Again"
          onPress={() => {
            const next = createTrainingSession(mode);
            setSession(next);
            setHintedTileIds([]);
            if (!isReview) updateOnboarding({ activeTraining: { mode, session: next } });
          }}
        />
      ) : (
        <ActionButton
          accessibilityLabel="Show a free training hint"
          emphasis="quiet"
          fullWidth
          icon={<Lightbulb aria-hidden color={color.accent.goldSoft} size={18} />}
          label="Show Hint"
          onPress={showHint}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.md },
  header: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: { ...typography.caption, color: color.accent.goldSoft },
  title: {
    ...typography.headingMedium,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  guide: {
    minHeight: 76,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    backgroundColor: color.background.elevated,
  },
  guideText: { ...typography.bodySmall, color: color.text.onDark },
  feedback: { ...typography.caption, color: color.text.onDarkSecondary, marginTop: spacing.xs },
  boardFrame: { flex: 1, minHeight: 250, width: '100%' },
  trayBlock: { gap: spacing.xs, marginBottom: spacing.sm },
  trayLabel: { ...typography.caption, color: color.accent.goldSoft },
  specialHelp: { ...typography.caption, color: color.text.onDarkSecondary },
});

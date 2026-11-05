import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { getTileArtworkSource } from '@zen-mahjong/mahjong-ui';
import { ActionButton, ProgressBar } from '@zen-mahjong/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { IvoryPanel } from '@/components/ivory-panel';
import { MoonlitScreenHeader } from '@/components/moonlit-screen-header';
import { useAppData } from '@/state/app-data-provider';

import { getAchievementPresentations } from '../achievements/achievement-presentation';
import { getCompletionPresentation } from './completion-presentation';

export function CompletionScreen() {
  const params = useLocalSearchParams<{ receipt?: string }>();
  const { offlineSave, settings } = useAppData();
  const presentation = useMemo(
    () => getCompletionPresentation(offlineSave.progression, offlineSave.economy, params.receipt),
    [offlineSave.economy, offlineSave.progression, params.receipt],
  );
  const achievements = useMemo(
    () => getAchievementPresentations(offlineSave.progression, offlineSave.economy),
    [offlineSave.economy, offlineSave.progression],
  );
  const [celebration] = useState(() => new Animated.Value(settings.reducedMotion ? 1 : 0));

  useEffect(() => {
    if (settings.reducedMotion) {
      celebration.setValue(1);
      return;
    }
    const animation = Animated.timing(celebration, {
      duration: 480,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [celebration, settings.reducedMotion]);

  if (!presentation) {
    return (
      <AppScreen backgroundAssetId="background.coolGarden" contentStyle={styles.screen}>
        <MoonlitScreenHeader onBack={() => router.replace('/')} title="Board Complete" />
        <IvoryPanel style={styles.emptyPanel}>
          <Text style={styles.panelTitle}>No completed board found</Text>
          <Text style={styles.supporting}>Your saved progression remains unchanged.</Text>
        </IvoryPanel>
        <ActionButton
          accessibilityLabel="Return home"
          fullWidth
          label="Home"
          maximumWidth={294}
          onPress={() => router.replace('/')}
          reducedMotion={settings.reducedMotion}
        />
      </AppScreen>
    );
  }

  const unlockedTitles = presentation.achievementIds
    .map((id) => achievements.find((achievement) => achievement.id === id)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <AppScreen backgroundAssetId="background.coolGarden" contentStyle={styles.screen}>
      <MoonlitScreenHeader onBack={() => router.replace('/')} title="Board Complete" />
      <Animated.View
        style={{
          marginTop: 4,
          marginBottom: 15,
          opacity: celebration,
          transform: [
            {
              scale: celebration.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }),
            },
          ],
        }}
      >
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Lotus completion emblem"
          resizeMode="contain"
          source={getTileArtworkSource('05-lotus')}
          style={styles.lotus}
        />
      </Animated.View>
      <IvoryPanel accessibilityLabel="Completed board summary" style={styles.panel}>
        <Text style={styles.panelTitle}>A moment well spent</Text>
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.score}>{presentation.score}</Text>
            <Text style={styles.metricLabel}>Zen Score</Text>
          </View>
          <Text style={styles.scoreNote}>
            {presentation.scoreOverflow
              ? 'Beyond the 20-point scale'
              : `Tier ${presentation.tierNumber}`}
          </Text>
        </View>
        <ProgressBar
          accessibilityLabel={`Zen Score ${presentation.score}`}
          maximum={20}
          tone="gold"
          value={presentation.score}
        />
        <View style={styles.metrics}>
          <CompletionMetric label="Active time" value={presentation.activeDuration} />
          <CompletionMetric label="Assists used" value={String(presentation.assistCount)} />
          <CompletionMetric label="Tier step" value={`${presentation.tierPosition}/8`} />
        </View>
        <Text style={styles.transition}>
          Level {presentation.levelNumber} → Level {presentation.nextLevelNumber}
        </Text>
        <Text style={styles.supporting}>A new step in your journey</Text>
        {presentation.tierScoreAwarded !== null ? (
          <Text style={styles.reward}>
            Tier reward · {presentation.tierScoreAwarded} Concentration Score
          </Text>
        ) : null}
        {unlockedTitles.length > 0 ? (
          <Text style={styles.reward}>Achievement · {unlockedTitles.join(', ')}</Text>
        ) : null}
        <Text style={styles.breakdown}>
          Base {presentation.breakdown.baseScore} · Time +{presentation.breakdown.timeBonus} · Ads +
          {presentation.breakdown.assistAdBonus}
        </Text>
      </IvoryPanel>
      <View style={styles.actions}>
        <ActionButton
          accessibilityLabel={`Open level ${presentation.nextLevelNumber}`}
          fullWidth
          label="Continue"
          labelStyle={styles.continueLabel}
          style={styles.continueButton}
          maximumWidth={294}
          onPress={() => router.replace('/game')}
          reducedMotion={settings.reducedMotion}
        />
        <Pressable
          accessibilityLabel="Return home"
          accessibilityRole="button"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
        >
          <Text style={styles.homeLabel}>Home</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function CompletionMetric({ label, value }: { label: string; value: string }) {
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', gap: spacing.sm },
  lotus: { alignSelf: 'center', height: 116, width: 116 },
  panel: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: 342,
    minHeight: 389,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    width: '100%',
  },
  emptyPanel: {
    alignSelf: 'center',
    gap: spacing.md,
    maxWidth: 342,
    padding: spacing.xxl,
    width: '100%',
  },
  panelTitle: {
    ...typography.headingMedium,
    color: '#3B2419',
    fontFamily: fontFamily.display,
    textAlign: 'center',
  },
  scoreRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  score: {
    color: '#7B3F22',
    fontFamily: fontFamily.editorial,
    fontSize: 34,
    lineHeight: 40,
  },
  scoreNote: {
    ...typography.caption,
    color: color.text.onLightSecondary,
    maxWidth: 130,
    textAlign: 'right',
  },
  metrics: { flexDirection: 'row' },
  metric: { alignItems: 'center', flex: 1, gap: 2, minWidth: 0 },
  metricValue: {
    ...typography.headingMedium,
    color: '#3B2419',
    fontFamily: fontFamily.editorial,
    fontSize: 20,
  },
  metricLabel: { ...typography.caption, color: color.text.onLightSecondary, textAlign: 'center' },
  transition: {
    ...typography.headingMedium,
    color: '#3B2419',
    fontFamily: fontFamily.display,
    textAlign: 'center',
  },
  supporting: { ...typography.bodySmall, color: color.text.onLightSecondary, textAlign: 'center' },
  reward: { ...typography.caption, color: color.accent.jade, textAlign: 'center' },
  breakdown: { ...typography.caption, color: color.text.onLightSecondary, textAlign: 'center' },
  actions: { alignItems: 'center', gap: spacing.sm, marginTop: 16, width: '100%' },
  continueButton: { minHeight: 52 },
  continueLabel: { fontFamily: fontFamily.display, fontSize: 20, lineHeight: 27 },
  homeButton: {
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
  },
  homeLabel: { ...typography.body, color: color.text.onDark },
  pressed: { opacity: 0.7 },
});

import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { ActionButton, MetricCard, ProgressBar, SurfaceCard } from '@zen-mahjong/ui';
import { getZenProgressPresentation } from '@zen-mahjong/game-engine';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { SectionLabel } from '@/components/section-label';

export function CompletionScreen() {
  const params = useLocalSearchParams<{
    achievements?: string;
    concentration?: string;
    level?: string;
    score?: string;
    time?: string;
  }>();
  const score = Number(params.score ?? 0);
  const presentation = getZenProgressPresentation(Number.isFinite(score) ? score : 0);
  const duration = Number(params.time ?? 0);

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.emblem}>
          <Text style={styles.glyph}>花</Text>
        </View>
        <Text style={styles.title}>Board complete</Text>
        <Text style={styles.subtitle}>Level {params.level ?? '1'} · A quiet pattern revealed</Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MetricCard label="Zen Score" value={String(presentation.actualScore)} />
        </View>
        <View style={styles.metric}>
          <MetricCard
            label="Active time"
            value={`${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`}
          />
        </View>
        <View style={styles.metric}>
          <MetricCard label="Tier step" value={`${Number(params.level ?? 1) % 8 || 8}/8`} />
        </View>
      </View>
      <SurfaceCard>
        <Text style={styles.scoreLabel}>Zen progress</Text>
        <Text style={styles.score}>
          {presentation.overflow
            ? `${score} · Beyond the scale`
            : `${presentation.milestonePercent}%`}
        </Text>
        <View style={styles.scoreProgress}>
          <ProgressBar
            accessibilityLabel={`Zen Score ${score}`}
            maximum={20}
            tone="gold"
            value={Math.min(score, 20)}
          />
        </View>
      </SurfaceCard>
      {params.concentration || params.achievements ? (
        <View>
          <SectionLabel>Reward earned</SectionLabel>
          <SurfaceCard accent="gold">
            <Text style={styles.reward}>
              {params.concentration
                ? `${params.concentration} Concentration Score`
                : 'Achievement unlocked'}
            </Text>
            <Text style={styles.rewardCopy}>
              {params.achievements || 'Eight-level tier completed'}
            </Text>
          </SurfaceCard>
        </View>
      ) : null}
      <View style={styles.actions}>
        <ActionButton
          accessibilityLabel="Open next board"
          fullWidth
          label="Next Level"
          onPress={() => router.replace('/game')}
        />
        <ActionButton
          accessibilityLabel="Return home"
          emphasis="quiet"
          fullWidth
          label="Home"
          onPress={() => router.replace('/')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', gap: spacing.lg },
  hero: { alignItems: 'center', marginBottom: spacing.md },
  emblem: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: color.accent.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glyph: { ...typography.headingLarge, color: color.accent.red },
  title: {
    ...typography.headingLarge,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
  },
  subtitle: { ...typography.bodySmall, color: color.text.onDarkSecondary, marginTop: spacing.xs },
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metric: { flex: 1 },
  scoreLabel: { ...typography.caption, color: color.text.onLightSecondary },
  score: {
    ...typography.headingMedium,
    color: color.accent.jade,
    fontFamily: fontFamily.display,
    marginTop: spacing.xs,
  },
  scoreProgress: { marginTop: spacing.md },
  reward: {
    ...typography.headingMedium,
    fontSize: 20,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  rewardCopy: { ...typography.caption, color: color.text.onLightSecondary, marginTop: spacing.xs },
  actions: { gap: spacing.md },
});

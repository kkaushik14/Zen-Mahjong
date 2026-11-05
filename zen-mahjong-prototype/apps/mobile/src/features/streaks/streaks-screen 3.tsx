import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { MetricCard, ProgressBar, SurfaceCard } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ScreenHeader } from '@/components/screen-header';
import { SectionLabel } from '@/components/section-label';
import { useAppData } from '@/state/app-data-provider';
import { formatDayCount } from '@/state/progress';

export function StreaksScreen() {
  const { offlineSave } = useAppData();
  const streak = offlineSave.progression.streak;
  const milestones = [7, 14, 21] as const;
  const nextMilestone = milestones.find((value) => value > streak.current) ?? 21;

  return (
    <AppScreen contentStyle={styles.screen}>
      <ScreenHeader title="Streaks" onBack={() => router.back()} />
      <View style={styles.hero}>
        <SectionLabel>Current visit streak</SectionLabel>
        <Text style={styles.streak}>{formatDayCount(streak.current)}</Text>
        <Text style={styles.body}>A new device-local calendar day continues the path.</Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MetricCard label="Best streak" value={formatDayCount(streak.best)} />
        </View>
        <View style={styles.metric}>
          <MetricCard label="Last visit" value={streak.lastVisitLocalDate ?? 'Not started'} />
        </View>
      </View>
      <SectionLabel>Next automatic reward</SectionLabel>
      <SurfaceCard accent="gold">
        <Text style={styles.cardTitle}>{nextMilestone} days</Text>
        <Text style={styles.cardBody}>
          {Math.max(0, nextMilestone - streak.current)} days remaining
        </Text>
        <View style={styles.progress}>
          <ProgressBar
            accessibilityLabel={`${streak.current} of ${nextMilestone} streak days`}
            maximum={nextMilestone}
            value={streak.current}
            tone="gold"
          />
        </View>
      </SurfaceCard>
      <SectionLabel>Milestones</SectionLabel>
      <View style={styles.list}>
        {milestones.map((milestone) => (
          <SurfaceCard accent={streak.best >= milestone ? 'jade' : 'none'} key={milestone}>
            <Text style={styles.milestone}>
              {milestone} days · {streak.best >= milestone ? 'Reward granted' : 'In progress'}
            </Text>
          </SurfaceCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md },
  hero: { alignItems: 'center', paddingVertical: spacing.md },
  streak: {
    ...typography.headingLarge,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
  },
  body: { ...typography.caption, color: color.text.onDarkSecondary, textAlign: 'center' },
  metrics: { flexDirection: 'row', gap: spacing.md },
  metric: { flex: 1 },
  cardTitle: {
    ...typography.headingMedium,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  cardBody: { ...typography.caption, color: color.text.onLightSecondary, marginTop: spacing.xs },
  progress: { marginTop: spacing.md },
  list: { gap: spacing.sm },
  milestone: { ...typography.bodySmall, color: color.text.onLight },
});

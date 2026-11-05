import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { MetricCard, ProgressBar, SurfaceCard } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ScreenHeader } from '@/components/screen-header';
import { SectionLabel } from '@/components/section-label';
import { useAppData } from '@/state/app-data-provider';
import { formatDayCount } from '@/state/progress';

export function ProfileScreen() {
  const { playerState } = useAppData();
  const stillMind = playerState.achievements.find((item) => item.id === 'still-mind');

  return (
    <AppScreen contentStyle={styles.screen}>
      <ScreenHeader title="Profile" onBack={() => router.back()} />
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>静</Text>
        </View>
        <Text style={styles.name}>{playerState.profile.displayName}</Text>
        <Text style={styles.subtitle}>
          Garden {playerState.progress.currentGarden} · Moss Sanctuary
        </Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MetricCard label="Boards" value={String(playerState.progress.boardsCompleted)} />
        </View>
        <View style={styles.metric}>
          <MetricCard
            label="Pairs matched"
            value={String(playerState.progress.totalPairsMatched)}
          />
        </View>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MetricCard label="Best streak" value={formatDayCount(playerState.streak.best)} />
        </View>
        <View style={styles.metric}>
          <MetricCard
            label="Daily challenges"
            value={String(playerState.progress.dailyChallengesCompleted)}
          />
        </View>
      </View>
      <SectionLabel>Reward earned</SectionLabel>
      <SurfaceCard accent="gold">
        <Text style={styles.cardTitle}>Still Mind</Text>
        <Text style={styles.body}>Completed a board without hints</Text>
        <ProgressBar
          accessibilityLabel="Still Mind achievement progress"
          value={stillMind?.value ?? 0}
          maximum={stillMind?.maximum ?? 1}
          tone="gold"
        />
      </SurfaceCard>
      <SurfaceCard style={styles.links}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/achievements')}
          style={styles.linkButton}
        >
          <Text style={styles.link}>Achievements</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/streaks')}
          style={styles.linkButton}
        >
          <Text style={styles.link}>Streaks ›</Text>
        </Pressable>
      </SurfaceCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md },
  identity: { alignItems: 'center', paddingVertical: spacing.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: color.accent.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.headingMedium, color: color.accent.jade },
  name: {
    ...typography.headingMedium,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
    marginTop: spacing.md,
  },
  subtitle: { ...typography.caption, color: color.text.onDarkSecondary },
  metrics: { flexDirection: 'row', gap: spacing.md },
  metric: { flex: 1 },
  cardTitle: {
    ...typography.headingMedium,
    fontSize: 20,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  body: { ...typography.caption, color: color.text.onLightSecondary, marginVertical: spacing.sm },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: color.background.elevated,
    borderColor: color.background.elevated,
  },
  linkButton: { minHeight: 44, justifyContent: 'center' },
  link: { ...typography.control, color: color.text.onDark },
});

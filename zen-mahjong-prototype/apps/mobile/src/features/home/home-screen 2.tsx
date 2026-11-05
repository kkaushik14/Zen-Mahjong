import { color, fontFamily, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import { getTierPosition } from '@zen-mahjong/game-content';
import { getEconomyBalances } from '@zen-mahjong/game-engine';
import { ActionButton, MetricCard, ProgressBar, StatusPill, SurfaceCard } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { Award, Flame, Menu, UserRound } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { SectionLabel } from '@/components/section-label';
import { useAppData } from '@/state/app-data-provider';
import { formatDayCount } from '@/state/progress';

function IconButton({
  children,
  label,
  onPress,
}: {
  children: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

export function HomeScreen() {
  const { offlineSave, onboarding, storageStatus } = useAppData();
  const level = offlineSave.progression.currentLevelNumber;
  const position = getTierPosition(level);
  const balances = getEconomyBalances(offlineSave.economy);
  const primaryRoute = !onboarding.tutorialCompletedAt
    ? '/tutorial'
    : !onboarding.practiceCompletedAt
      ? '/practice'
      : '/game';
  const primaryLabel = !onboarding.tutorialCompletedAt
    ? 'Begin Tutorial'
    : !onboarding.practiceCompletedAt
      ? 'Continue to Practice'
      : offlineSave.activeRun
        ? 'Resume Level'
        : 'Play Level';
  const storageLabel =
    storageStatus === 'recovered'
      ? 'Local data recovered'
      : storageStatus === 'memory-fallback'
        ? 'Temporary local session'
        : 'Offline ready';

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.topBar}>
        <IconButton label="Open profile" onPress={() => router.push('/profile')}>
          <UserRound aria-hidden color={color.surface.ivory} size={19} strokeWidth={1.8} />
        </IconButton>
        <IconButton label="Open settings" onPress={() => router.push('/settings')}>
          <Menu aria-hidden color={color.surface.ivory} size={20} strokeWidth={1.8} />
        </IconButton>
      </View>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Text style={styles.brandGlyph}>花</Text>
        </View>
        <Text style={styles.title}>Zen Mahjong</Text>
        <Text style={styles.subtitle}>Breathe · Match · Be Present</Text>
        <View style={styles.status}>
          <StatusPill
            label={storageLabel}
            state={storageStatus === 'memory-fallback' ? 'issue' : 'offline'}
          />
        </View>
      </View>
      <View style={styles.stack}>
        <SectionLabel>Your path</SectionLabel>
        <SurfaceCard>
          <Text style={styles.cardTitle}>
            {onboarding.practiceCompletedAt ? `Level ${level}` : 'Learn the Concentration flow'}
          </Text>
          <Text style={styles.body}>
            {onboarding.practiceCompletedAt
              ? `${position.category === 'normal' ? 'Normal' : position.category === 'high' ? 'High' : position.category === 'super' ? 'Super' : 'Special'} Concentration · Tier ${position.tierNumber}`
              : 'A guided board and assisted practice come before numbered levels.'}
          </Text>
          <View style={styles.progressCopy}>
            <Text style={styles.caption}>Tier {position.tierNumber}</Text>
            <Text style={styles.caption}>{position.levelInTier} / 8</Text>
          </View>
          <ProgressBar
            accessibilityLabel="Current tier progress"
            value={position.levelInTier - 1}
            maximum={8}
          />
        </SurfaceCard>
        <ActionButton
          accessibilityLabel={primaryLabel}
          fullWidth
          label={primaryLabel}
          onPress={() => router.push(primaryRoute as never)}
        />
        <SectionLabel>Daily Challenge</SectionLabel>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/practice' as never)}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <SurfaceCard accent="jade">
            <View style={styles.challengeRow}>
              <View style={styles.challengeCopy}>
                <Text style={styles.cardTitle}>Daily stillness</Text>
                <Text style={styles.caption}>Practice board · assists remain untouched</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </SurfaceCard>
        </Pressable>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <MetricCard
              label="Current streak"
              value={formatDayCount(offlineSave.progression.streak.current)}
            />
          </View>
          <View style={styles.metric}>
            <MetricCard label="Zen Score" value={String(balances.concentrationScore)} />
          </View>
        </View>
        <View style={styles.quickLinks}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/achievements')}
            style={styles.quickLink}
          >
            <Award aria-hidden color={color.accent.goldSoft} size={18} />
            <Text style={styles.quickText}>Achievements</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/streaks')}
            style={styles.quickLink}
          >
            <Flame aria-hidden color={color.accent.goldSoft} size={18} />
            <Text style={styles.quickText}>Streaks</Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  topBar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  brand: { alignItems: 'center', paddingVertical: spacing.lg },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: color.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandGlyph: { ...typography.headingMedium, color: color.accent.goldSoft },
  title: {
    ...typography.headingLarge,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
  },
  subtitle: { ...typography.bodySmall, color: color.text.onDarkSecondary, marginTop: spacing.xs },
  status: { marginTop: spacing.md },
  stack: { gap: spacing.md },
  cardTitle: {
    ...typography.headingMedium,
    fontSize: 21,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  body: {
    ...typography.bodySmall,
    color: color.text.onLightSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  caption: { ...typography.caption, color: color.text.onLightSecondary },
  challengeRow: { flexDirection: 'row', alignItems: 'center' },
  challengeCopy: { flex: 1, gap: spacing.xs },
  chevron: { ...typography.headingMedium, color: color.text.onLightSecondary },
  metrics: { flexDirection: 'row', gap: spacing.md },
  metric: { flex: 1 },
  quickLinks: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  quickLink: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.card,
    backgroundColor: color.background.elevated,
  },
  quickText: { ...typography.control, color: color.text.onDark },
});

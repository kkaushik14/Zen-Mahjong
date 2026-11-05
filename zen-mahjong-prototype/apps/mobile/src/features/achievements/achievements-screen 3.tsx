import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { ProgressBar, SurfaceCard } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { Check, Circle } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ScreenHeader } from '@/components/screen-header';
import { SectionLabel } from '@/components/section-label';
import { useAppData } from '@/state/app-data-provider';

const achievements = [
  {
    id: 'streak-7',
    title: 'Seven Sunrises',
    description: 'Reach a 7-day streak',
    maximum: 7,
    kind: 'streak',
  },
  {
    id: 'streak-14',
    title: 'Two Quiet Weeks',
    description: 'Reach a 14-day streak',
    maximum: 14,
    kind: 'streak',
  },
  {
    id: 'streak-21',
    title: 'Stillness Habit',
    description: 'Reach a 21-day streak',
    maximum: 21,
    kind: 'streak',
  },
  {
    id: 'concentration-25',
    title: 'Focused Beginning',
    description: 'Earn 25 lifetime Concentration Score',
    maximum: 25,
    kind: 'score',
  },
  {
    id: 'concentration-50',
    title: 'Clear Current',
    description: 'Earn 50 lifetime Concentration Score',
    maximum: 50,
    kind: 'score',
  },
  {
    id: 'concentration-100',
    title: 'Mountain Mind',
    description: 'Earn 100 lifetime Concentration Score',
    maximum: 100,
    kind: 'score',
  },
  {
    id: 'concentration-125',
    title: 'Deep Current',
    description: 'Earn 125 lifetime Concentration Score',
    maximum: 125,
    kind: 'score',
  },
  {
    id: 'concentration-150',
    title: 'Quiet Horizon',
    description: 'Earn 150 lifetime Concentration Score',
    maximum: 150,
    kind: 'score',
  },
  {
    id: 'concentration-200',
    title: 'Still Mountain',
    description: 'Earn 200 lifetime Concentration Score',
    maximum: 200,
    kind: 'score',
  },
] as const;

export function AchievementsScreen() {
  const { offlineSave } = useAppData();
  const granted = new Set(
    offlineSave.economy.transactions
      .filter((transaction) => transaction.transactionId.startsWith('achievement:'))
      .map((transaction) => transaction.transactionId.replace('achievement:', '')),
  );
  const unlocked = achievements.filter((achievement) => granted.has(achievement.id)).length;

  return (
    <AppScreen contentStyle={styles.screen}>
      <ScreenHeader title="Achievements" onBack={() => router.back()} />
      <SectionLabel>Automatic rewards</SectionLabel>
      <Text style={styles.progressValue}>
        {unlocked} / {achievements.length}
      </Text>
      <ProgressBar
        accessibilityLabel="Achievement progress"
        maximum={achievements.length}
        value={unlocked}
        tone="gold"
      />
      <View style={styles.list}>
        {achievements.map((achievement) => {
          const complete = granted.has(achievement.id);
          const value =
            achievement.kind === 'streak'
              ? offlineSave.progression.streak.best
              : offlineSave.progression.lifetimeConcentrationScoreEarned;
          return (
            <SurfaceCard accent={complete ? 'jade' : 'none'} key={achievement.id}>
              <View style={styles.row}>
                <View style={[styles.badge, complete && styles.completeBadge]}>
                  {complete ? (
                    <Check aria-hidden color={color.surface.ivory} size={17} />
                  ) : (
                    <Circle aria-hidden color={color.text.onLightSecondary} size={17} />
                  )}
                </View>
                <View style={styles.copy}>
                  <Text style={styles.title}>{achievement.title}</Text>
                  <Text style={styles.description}>{achievement.description}</Text>
                  <ProgressBar
                    accessibilityLabel={`${achievement.title} progress`}
                    maximum={achievement.maximum}
                    value={Math.min(value, achievement.maximum)}
                    tone={complete ? 'jade' : 'gold'}
                  />
                </View>
              </View>
            </SurfaceCard>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md },
  progressValue: {
    ...typography.headingLarge,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
  },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.surface.depth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadge: { backgroundColor: color.accent.jade },
  copy: { flex: 1, gap: spacing.xs },
  title: { ...typography.body, color: color.text.onLight, fontFamily: fontFamily.display },
  description: { ...typography.caption, color: color.text.onLightSecondary },
});

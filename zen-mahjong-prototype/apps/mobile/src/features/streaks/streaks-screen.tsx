import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { getTileArtworkSource } from '@zen-mahjong/mahjong-ui';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { IvoryPanel } from '@/components/ivory-panel';
import { MoonlitScreenHeader } from '@/components/moonlit-screen-header';
import { useAppData } from '@/state/app-data-provider';
import { formatDayCount } from '@/state/progress';

import { buildStreakCalendar, type CalendarDay, type CalendarDayState } from './streak-calendar';

const weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export function StreaksScreen() {
  const { offlineSave } = useAppData();
  const streak = offlineSave.progression.streak;
  const calendar = buildStreakCalendar({
    current: streak.current,
    lastVisitLocalDate: streak.lastVisitLocalDate,
    now: new Date(),
  });

  return (
    <AppScreen backgroundAssetId="background.coolGarden" contentStyle={styles.screen}>
      <MoonlitScreenHeader onBack={() => router.back()} title="Streaks" />
      <IvoryPanel accessibilityLabel="Device-local visit streak calendar" style={styles.panel}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Lotus streak emblem"
          resizeMode="contain"
          source={getTileArtworkSource('05-lotus')}
          style={styles.lotus}
        />
        <Text style={styles.streak}>
          {formatDayCount(streak.current).replace(' day', ' calm day')}
        </Text>
        <Text style={styles.best}>Best streak · {formatDayCount(streak.best)}</Text>

        <Text style={styles.sectionTitle}>This week</Text>
        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label, index) => (
            <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.calendarRow}>
          {calendar.weekDays.map((day) => (
            <DayCell day={day} key={day.dateKey} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{calendar.monthLabel}</Text>
        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label, index) => (
            <Text key={`month-${label}-${index}`} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.monthGrid}>
          {calendar.monthCells.map((day, index) =>
            day ? (
              <DayCell day={day} key={day.dateKey} />
            ) : (
              <View key={`blank-${index}`} style={styles.daySlot} />
            ),
          )}
        </View>

        <Text style={styles.nextMilestone}>
          {calendar.nextMilestone
            ? `Next milestone · ${calendar.nextMilestone} days`
            : 'All confirmed streak milestones earned'}
        </Text>
      </IvoryPanel>
    </AppScreen>
  );
}

function DayCell({ day }: { day: CalendarDay }) {
  return (
    <View style={styles.daySlot}>
      <View
        accessibilityLabel={`${day.dateKey}, ${day.state}`}
        style={[styles.dayCircle, dayStateStyles[day.state]]}
      >
        <Text style={[styles.dayText, day.state === 'played' && styles.playedDayText]}>
          {day.day}
        </Text>
      </View>
    </View>
  );
}

const dayStateStyles: Record<CalendarDayState, object> = {
  played: { backgroundColor: '#DB6E35', borderColor: '#DB6E35' },
  today: { backgroundColor: '#FFF2DE', borderColor: '#9B704A', borderWidth: 1.5 },
  missed: { backgroundColor: '#F8E7CF', borderColor: '#E4CCAE' },
  future: { backgroundColor: '#F8E7CF99', borderColor: '#E4CCAE80' },
};

const styles = StyleSheet.create({
  screen: { gap: spacing.sm },
  panel: {
    alignSelf: 'center',
    gap: spacing.sm,
    maxWidth: 342,
    minHeight: 604,
    paddingHorizontal: 12,
    paddingVertical: spacing.md,
    width: '100%',
  },
  lotus: { alignSelf: 'center', height: 64, width: 64 },
  streak: {
    color: '#3B2419',
    fontFamily: fontFamily.display,
    fontSize: 31,
    lineHeight: 40,
    textAlign: 'center',
  },
  best: { ...typography.bodySmall, color: color.text.onLightSecondary, textAlign: 'center' },
  sectionTitle: {
    ...typography.headingMedium,
    color: '#3B2419',
    fontFamily: fontFamily.display,
    marginTop: spacing.md,
  },
  weekdayRow: { flexDirection: 'row' },
  weekdayLabel: {
    ...typography.caption,
    color: color.text.onLightSecondary,
    textAlign: 'center',
    width: '14.2857%',
  },
  calendarRow: { flexDirection: 'row' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 },
  daySlot: { alignItems: 'center', justifyContent: 'center', width: '14.2857%' },
  dayCircle: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: 'center',
    maxWidth: 40,
    width: '92%',
  },
  dayText: { ...typography.bodySmall, color: '#3B2419' },
  playedDayText: { color: '#FFF8EC' },
  nextMilestone: {
    ...typography.editorial,
    color: '#3B2419',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

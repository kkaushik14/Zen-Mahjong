import { color, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import { StyleSheet, Text, View } from 'react-native';

export interface StatusPillProps {
  label: string;
  state?: 'ready' | 'offline' | 'syncing' | 'issue';
}

const indicatorColors = {
  ready: color.accent.jadeSoft,
  offline: color.accent.gold,
  syncing: color.surface.ivory,
  issue: color.accent.red,
} as const;

export function StatusPill({ label, state = 'ready' }: StatusPillProps) {
  return (
    <View accessibilityLabel={label} style={styles.pill}>
      <View style={[styles.indicator, { backgroundColor: indicatorColors[state] }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: color.background.elevated,
  },
  indicator: { width: 7, height: 7, borderRadius: 4 },
  label: { ...typography.caption, color: color.text.onDark },
});

import { color, fontFamily, radius, spacing } from '@zen-mahjong/design-tokens';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BalanceDisplayProps {
  accessibilityLabel: string;
  icon?: ReactNode;
  label?: string;
  value: number | string;
}

export function BalanceDisplay({ accessibilityLabel, icon, label, value }: BalanceDisplayProps) {
  const zero = Number(value) === 0;
  return (
    <View accessibilityLabel={accessibilityLabel} style={[styles.container, zero && styles.zero]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View>
        <Text style={styles.value}>{value}</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2A1A12D9',
    borderColor: color.accent.gold,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  zero: { opacity: 0.58 },
  icon: { alignItems: 'center', height: 24, justifyContent: 'center', width: 24 },
  value: { color: '#FFF6EC', fontFamily: fontFamily.editorial, fontSize: 16, lineHeight: 19 },
  label: { color: color.accent.goldSoft, fontFamily: fontFamily.body, fontSize: 9, lineHeight: 11 },
});

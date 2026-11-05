import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { StyleSheet, Text, View } from 'react-native';

import { SurfaceCard } from './surface-card';

export interface MetricCardProps {
  label: string;
  value: string;
  inverse?: boolean;
}

export function MetricCard({ inverse = false, label, value }: MetricCardProps) {
  return (
    <SurfaceCard style={inverse ? styles.inverse : undefined}>
      <View style={styles.content}>
        <Text style={[styles.value, inverse && styles.inverseText]}>{value}</Text>
        <Text style={[styles.label, inverse && styles.inverseSecondary]}>{label}</Text>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xs,
  },
  value: {
    ...typography.headingMedium,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  label: {
    ...typography.caption,
    color: color.text.onLightSecondary,
  },
  inverse: {
    backgroundColor: color.background.elevated,
    borderColor: color.background.elevated,
  },
  inverseText: {
    color: color.text.onDark,
  },
  inverseSecondary: {
    color: color.text.onDarkSecondary,
  },
});

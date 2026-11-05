import { color, radius } from '@zen-mahjong/design-tokens';
import { StyleSheet, View } from 'react-native';

export interface ProgressBarProps {
  accessibilityLabel: string;
  value: number;
  maximum?: number;
  tone?: 'jade' | 'gold';
}

export function ProgressBar({
  accessibilityLabel,
  maximum = 100,
  tone = 'jade',
  value,
}: ProgressBarProps) {
  const normalized = maximum <= 0 ? 0 : Math.min(1, Math.max(0, value / maximum));

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: maximum, now: value }}
      style={styles.track}
    >
      <View
        style={[styles.fill, { width: `${normalized * 100}%` }, tone === 'gold' && styles.gold]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 5,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: color.surface.depth,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: color.accent.jade,
  },
  gold: {
    backgroundColor: color.accent.gold,
  },
});

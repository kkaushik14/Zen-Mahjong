import { color, fontFamily, spacing } from '@zen-mahjong/design-tokens';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { getMoonlitAssetSource } from './moonlit-assets';

export interface ZenProgressProps {
  accessibilityLabel: string;
  maximum?: number;
  milestones?: readonly number[];
  showValue?: boolean;
  value: number;
}

export function ZenProgress({
  accessibilityLabel,
  maximum = 20,
  milestones = [3, 6, 10, 20],
  showValue = true,
  value,
}: ZenProgressProps) {
  const normalized = maximum <= 0 ? 0 : Math.min(1, Math.max(0, value / maximum));
  const exceeded = value > maximum;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: maximum, min: 0, now: value }}
      style={styles.container}
    >
      <View style={styles.labels}>
        {milestones.map((milestone) => (
          <Text key={milestone} style={styles.milestone}>
            {milestone}
          </Text>
        ))}
      </View>
      <ImageBackground
        resizeMode="stretch"
        source={getMoonlitAssetSource('progress.branch')}
        style={styles.branch}
      >
        <View style={[styles.fill, { width: `${normalized * 100}%` }]} />
        {exceeded ? (
          <View accessibilityLabel="Zen Score exceeds 20" style={styles.overLimit} />
        ) : null}
      </ImageBackground>
      {showValue ? <Text style={styles.value}>{value}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2, minHeight: 58, width: '100%' },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  milestone: { color: '#FFF6EC', fontFamily: fontFamily.body, fontSize: 10, lineHeight: 14 },
  branch: { height: 23, justifyContent: 'center', overflow: 'visible', width: '100%' },
  fill: {
    backgroundColor: '#8A9C55CC',
    borderColor: '#627065',
    borderRadius: 5,
    borderWidth: 1,
    height: 10,
    marginLeft: spacing.sm,
    maxWidth: '94%',
  },
  overLimit: {
    backgroundColor: color.accent.goldSoft,
    borderColor: color.accent.gold,
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    position: 'absolute',
    right: 1,
    top: 5,
    width: 14,
  },
  value: {
    alignSelf: 'flex-end',
    color: color.accent.goldSoft,
    fontFamily: fontFamily.editorial,
    fontSize: 12,
    lineHeight: 16,
  },
});

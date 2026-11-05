import { color, radius, spacing } from '@zen-mahjong/design-tokens';
import type { PropsWithChildren } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';

import { MoonlitSurface } from './moonlit-surface';

export interface SurfaceCardProps extends PropsWithChildren {
  accent?: 'none' | 'jade' | 'gold' | 'red';
  style?: ViewStyle | undefined;
}

const accentColors = {
  none: 'transparent',
  jade: color.accent.jade,
  gold: color.accent.gold,
  red: color.accent.red,
} as const;

export function SurfaceCard({ accent = 'none', children, style }: SurfaceCardProps) {
  return (
    <MoonlitSurface
      style={[styles.card, accent !== 'none' && { borderLeftColor: accentColors[accent] }, style]}
    >
      {children}
    </MoonlitSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    padding: spacing.lg,
    shadowColor: '#081B15',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 2,
  },
});

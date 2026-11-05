import { color, radius } from '@zen-mahjong/design-tokens';
import type { PropsWithChildren } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { getMoonlitAssetSource } from './moonlit-assets';

const texturedSurfaceAssets = {
  ivory: getMoonlitAssetSource('surface.settingsRow'),
  wood: getMoonlitAssetSource('surface.trayPocket'),
} as const;

export type MoonlitSurfaceProps = PropsWithChildren<Omit<ViewProps, 'style'>> & {
  style?: StyleProp<ViewStyle>;
  variant?: 'ivory' | 'wood' | 'glass';
};

export function MoonlitSurface({
  children,
  style,
  variant = 'ivory',
  ...viewProps
}: MoonlitSurfaceProps) {
  if (variant === 'glass') {
    return (
      <View {...viewProps} style={[styles.base, styles.glass, style]}>
        {children}
      </View>
    );
  }

  const source = texturedSurfaceAssets[variant];

  return (
    <ImageBackground
      {...viewProps}
      imageStyle={styles.image}
      resizeMode="stretch"
      source={source}
      style={[styles.base, style]}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: { borderRadius: radius.card },
  glass: {
    backgroundColor: color.surface.glass,
    borderColor: color.accent.gold,
    borderWidth: 1,
  },
});

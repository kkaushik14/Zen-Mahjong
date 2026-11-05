import { color, fontFamily, radius, spacing } from '@zen-mahjong/design-tokens';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { getMoonlitAssetSource } from './moonlit-assets';

const wideFrameAssets = {
  left: getMoonlitAssetSource('button.wideLeft'),
  middle: getMoonlitAssetSource('button.wideMiddle'),
  right: getMoonlitAssetSource('button.wideRight'),
} as const;

const compactButtonAssets = {
  primary: getMoonlitAssetSource('button.primary'),
  quiet: getMoonlitAssetSource('button.secondary'),
} as const;

export interface ActionButtonProps {
  accessibilityLabel: string;
  disabled?: boolean;
  emphasis?: 'primary' | 'quiet';
  fullWidth?: boolean;
  icon?: ReactNode;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  maximumWidth?: number;
  onPress: () => void;
  reducedMotion?: boolean;
  size?: 'compact' | 'wide';
  style?: StyleProp<ViewStyle>;
}

function WideFrame() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wideFrame]}>
      <Image
        resizeMode="stretch"
        source={wideFrameAssets.left}
        style={[styles.wideImage, styles.wideLeft]}
      />
      <Image
        resizeMode="stretch"
        source={wideFrameAssets.middle}
        style={[styles.wideImage, styles.wideMiddle]}
      />
      <Image
        resizeMode="stretch"
        source={wideFrameAssets.right}
        style={[styles.wideImage, styles.wideRight]}
      />
    </View>
  );
}

export function ActionButton({
  accessibilityLabel,
  disabled = false,
  emphasis = 'primary',
  fullWidth = false,
  icon,
  label,
  labelStyle,
  loading = false,
  maximumWidth,
  onPress,
  reducedMotion = false,
  size = 'compact',
  style,
}: ActionButtonProps) {
  const unavailable = disabled || loading;
  const background = compactButtonAssets[emphasis];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: unavailable }}
      disabled={unavailable}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'wide' ? styles.wide : styles.compact,
        fullWidth && styles.fullWidth,
        fullWidth && maximumWidth !== undefined && { maxWidth: maximumWidth },
        pressed && styles.pressed,
        pressed && !reducedMotion && styles.pressedMotion,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {size === 'wide' ? (
        <WideFrame />
      ) : (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            resizeMode="stretch"
            source={background}
            style={[styles.fillImage, styles.compactImage]}
          />
        </View>
      )}
      {loading ? (
        <ActivityIndicator color={color.text.onLight} size="small" />
      ) : (
        <>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={[styles.label, size === 'wide' && styles.wideLabel, labelStyle]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.card,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compact: { minHeight: 50, minWidth: 158, paddingHorizontal: spacing.xl },
  wide: { minHeight: 86, minWidth: 280, paddingHorizontal: 52 },
  fullWidth: { alignSelf: 'center', maxWidth: 364, width: '100%' },
  compactImage: { borderRadius: radius.card },
  fillImage: { height: '100%', width: '100%' },
  wideFrame: { flexDirection: 'row' },
  wideImage: { height: '100%' },
  wideLeft: { width: 51 },
  wideMiddle: { flex: 1, marginHorizontal: -1 },
  wideRight: { width: 41 },
  pressed: { opacity: 0.86 },
  pressedMotion: { transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.42 },
  icon: { alignItems: 'center', height: 24, justifyContent: 'center', width: 24 },
  label: {
    color: '#2A1A12',
    fontFamily: fontFamily.editorial,
    fontSize: 16,
    lineHeight: 22,
  },
  wideLabel: {
    color: color.text.onLight,
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 30,
  },
});

import { color, fontFamily, size, spacing, typography } from '@zen-mahjong/design-tokens';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getMoonlitAssetSource } from './moonlit-assets';

export type IconActionType = 'undo' | 'hint' | 'shuffle' | 'more';
export type IconActionState = 'default' | 'disabled' | 'loading' | 'zero';

export interface IconActionControlProps {
  accessibilityLabel: string;
  count?: number;
  label?: string;
  onPress: () => void;
  reducedMotion?: boolean;
  state?: IconActionState;
  type: IconActionType;
}

const defaultLabels: Record<IconActionType, string> = {
  hint: 'Hint',
  more: 'More',
  shuffle: 'Shuffle',
  undo: 'Undo',
};

const actionAssets = {
  hint: getMoonlitAssetSource('action.hint'),
  more: getMoonlitAssetSource('action.more'),
  shuffle: getMoonlitAssetSource('action.shuffle'),
  undo: getMoonlitAssetSource('action.undo'),
};

export function IconActionControl({
  accessibilityLabel,
  count,
  label,
  onPress,
  reducedMotion = false,
  state = 'default',
  type,
}: IconActionControlProps) {
  const unavailable = state === 'disabled' || state === 'loading' || state === 'zero';
  const shownCount = state === 'zero' ? 0 : count;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: state === 'loading', disabled: unavailable }}
      disabled={unavailable}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.control,
        pressed && styles.pressed,
        pressed && !reducedMotion && styles.pressedMotion,
        unavailable && styles.unavailable,
      ]}
    >
      <View style={styles.artworkFrame}>
        <Image resizeMode="contain" source={actionAssets[type]} style={styles.artwork} />
        {state === 'loading' ? (
          <View style={styles.loading}>
            <ActivityIndicator color={color.accent.goldSoft} size="small" />
          </View>
        ) : null}
        {typeof shownCount === 'number' ? (
          <View style={[styles.badge, state === 'zero' && styles.zeroBadge]}>
            <Text style={styles.count}>{shownCount}</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.label}>
        {label ?? defaultLabels[type]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 105,
    minWidth: 78,
    paddingBottom: spacing.xs,
  },
  artworkFrame: { height: 68, width: 78 },
  artwork: { height: 64, width: 78 },
  badge: {
    alignItems: 'center',
    backgroundColor: '#A03C12',
    borderColor: color.accent.gold,
    borderRadius: 12,
    borderWidth: 1,
    bottom: 0,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 3,
    width: 24,
  },
  zeroBadge: { backgroundColor: '#5D4A3C' },
  count: { color: '#FFF6EC', fontFamily: fontFamily.body, fontSize: 11, lineHeight: 15 },
  label: { ...typography.caption, color: '#FFF6EC', marginTop: spacing.xs },
  loading: {
    alignItems: 'center',
    backgroundColor: '#2A1A1288',
    borderRadius: size.touchMinimumIos / 2,
    height: size.touchMinimumIos,
    justifyContent: 'center',
    left: 17,
    position: 'absolute',
    top: 10,
    width: size.touchMinimumIos,
  },
  pressed: { opacity: 0.82 },
  pressedMotion: { transform: [{ scale: 0.97 }] },
  unavailable: { opacity: 0.46 },
});

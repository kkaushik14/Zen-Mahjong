import { color, size } from '@zen-mahjong/design-tokens';
import { Pressable, StyleSheet, View } from 'react-native';

export interface MoonlitSwitchProps {
  accessibilityLabel: string;
  disabled?: boolean;
  interactive?: boolean;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

export function MoonlitSwitch({
  accessibilityLabel,
  disabled = false,
  interactive = true,
  onValueChange,
  value,
}: MoonlitSwitchProps) {
  const switchArtwork = (
    <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </View>
  );

  if (!interactive) {
    return (
      <View
        importantForAccessibility="no-hide-descendants"
        style={[styles.touchTarget, disabled && styles.disabled]}
      >
        {switchArtwork}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.touchTarget,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {switchArtwork}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    alignItems: 'center',
    height: size.touchMinimumAndroid,
    justifyContent: 'center',
    width: 56,
  },
  track: {
    borderRadius: 14,
    height: 28,
    padding: 3,
    width: 56,
  },
  trackOn: { backgroundColor: '#DA733B' },
  trackOff: { backgroundColor: '#8A725F' },
  thumb: {
    backgroundColor: '#FAE8D5',
    borderColor: color.accent.goldSoft,
    borderRadius: 11,
    borderWidth: 1,
    height: 22,
    width: 22,
  },
  thumbOn: { alignSelf: 'flex-end' },
  thumbOff: { alignSelf: 'flex-start' },
  pressed: { opacity: 0.74 },
  disabled: { opacity: 0.42 },
});

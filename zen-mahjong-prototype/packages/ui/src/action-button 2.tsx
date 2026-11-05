import { color, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ActionButtonProps {
  accessibilityLabel: string;
  icon?: ReactNode;
  label: string;
  onPress: () => void;
  emphasis?: 'primary' | 'quiet';
  disabled?: boolean;
  fullWidth?: boolean;
}

export function ActionButton({
  accessibilityLabel,
  disabled = false,
  emphasis = 'primary',
  fullWidth = false,
  icon,
  label,
  onPress,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        emphasis === 'quiet' ? styles.quiet : styles.primary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, emphasis === 'quiet' && styles.quietLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: color.surface.ivory,
  },
  quiet: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: color.accent.jadeSoft,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.control,
    color: color.text.onLight,
  },
  quietLabel: {
    color: color.text.onDark,
  },
});

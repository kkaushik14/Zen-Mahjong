import { color, spacing, typography } from '@zen-mahjong/design-tokens';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MoonlitSurface } from './moonlit-surface';
import { MoonlitSwitch } from './moonlit-switch';

export interface SettingRowProps {
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  trailingText?: string;
  value?: boolean;
}

export function SettingRow({
  description,
  disabled = false,
  icon,
  label,
  onPress,
  onValueChange,
  trailingText,
  value,
}: SettingRowProps) {
  const isToggle = typeof value === 'boolean' && Boolean(onValueChange);
  const handlePress = isToggle ? () => onValueChange?.(!value) : onPress;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole={isToggle ? 'switch' : onPress ? 'button' : undefined}
      accessibilityState={isToggle ? { checked: Boolean(value), disabled } : { disabled }}
      disabled={disabled || !handlePress}
      hitSlop={2}
      onPress={handlePress}
      style={({ pressed }) => [styles.touchTarget, pressed && styles.pressed]}
    >
      <MoonlitSurface style={[styles.row, disabled && styles.disabled]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {isToggle ? (
          <View importantForAccessibility="no-hide-descendants" pointerEvents="none">
            <MoonlitSwitch
              accessibilityLabel={label}
              disabled={disabled}
              interactive={false}
              onValueChange={() => undefined}
              value={value}
            />
          </View>
        ) : (
          <View style={styles.trailingGroup}>
            {trailingText ? <Text style={styles.trailingText}>{trailingText}</Text> : null}
            {onPress ? <Text style={styles.chevron}>›</Text> : null}
          </View>
        )}
      </MoonlitSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: { alignSelf: 'stretch' },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    width: '100%',
  },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.45 },
  icon: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  copy: { flex: 1, gap: 1 },
  label: { ...typography.bodySmall, color: color.text.onLight, fontWeight: '600' },
  description: { ...typography.caption, color: color.text.onLightSecondary },
  trailingGroup: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  trailingText: { ...typography.bodySmall, color: color.text.onLightSecondary },
  chevron: { color: color.text.onLight, fontSize: 25, lineHeight: 30 },
});

import { color, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export interface SettingRowProps {
  description?: string;
  label: string;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  value?: boolean;
  trailingText?: string;
}

export function SettingRow({
  description,
  label,
  onPress,
  onValueChange,
  trailingText,
  value,
}: SettingRowProps) {
  const isToggle = typeof value === 'boolean' && onValueChange;

  return (
    <Pressable
      accessibilityRole={isToggle ? 'switch' : onPress ? 'button' : undefined}
      accessibilityState={isToggle ? { checked: value } : undefined}
      disabled={!onPress && !isToggle}
      onPress={isToggle ? () => onValueChange(!value) : onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {isToggle ? (
        <Switch
          accessibilityElementsHidden
          onValueChange={onValueChange}
          thumbColor={color.surface.ivory}
          trackColor={{ false: color.surface.depth, true: color.accent.jade }}
          value={value}
        />
      ) : (
        <Text style={styles.trailing}>{trailingText ?? '›'}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface.ivory,
  },
  pressed: {
    opacity: 0.76,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: color.text.onLight,
  },
  description: {
    ...typography.caption,
    color: color.text.onLightSecondary,
  },
  trailing: {
    ...typography.body,
    color: color.text.onLightSecondary,
  },
});

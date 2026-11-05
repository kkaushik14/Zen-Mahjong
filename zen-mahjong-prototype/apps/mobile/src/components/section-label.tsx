import { color, spacing, typography } from '@zen-mahjong/design-tokens';
import { StyleSheet, Text } from 'react-native';

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    color: color.accent.jadeSoft,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
});

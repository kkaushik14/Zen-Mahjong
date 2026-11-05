import { color, fontFamily, typography } from '@zen-mahjong/design-tokens';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}

export function ScreenHeader({ action, onBack, title }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={6}
            onPress={onBack}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <ArrowLeft aria-hidden color={color.surface.ivory} size={21} strokeWidth={1.8} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.side, styles.action]}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: { width: 48, minHeight: 48, justifyContent: 'center' },
  action: { alignItems: 'flex-end' },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.background.elevated,
  },
  pressed: { opacity: 0.68 },
  title: {
    ...typography.headingMedium,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
    textAlign: 'center',
  },
});

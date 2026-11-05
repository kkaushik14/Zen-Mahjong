import { color, layout, spacing } from '@zen-mahjong/design-tokens';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface AppScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export function AppScreen({ children, contentStyle, scroll = true }: AppScreenProps) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <View style={styles.background}>
      <View pointerEvents="none" style={styles.lightPatch} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: color.background.base, overflow: 'hidden' },
  lightPatch: {
    position: 'absolute',
    width: 260,
    height: 520,
    right: -170,
    top: 100,
    backgroundColor: color.background.elevated,
    opacity: 0.2,
    transform: [{ rotate: '18deg' }],
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: layout.tabletContentMaximum,
    alignSelf: 'center',
  },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
});

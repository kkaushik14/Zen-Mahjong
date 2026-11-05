import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { ProgressBar, StatusPill } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';

export function LoadingScreen() {
  return (
    <AppScreen contentStyle={styles.screen} scroll={false}>
      <Pressable
        accessibilityLabel="Continue to home"
        accessibilityRole="button"
        onPress={() => router.replace('/')}
        style={styles.center}
      >
        <View style={styles.mark}>
          <Text style={styles.glyph}>花</Text>
        </View>
        <Text style={styles.title}>Zen Mahjong</Text>
        <Text style={styles.subtitle}>Breathe · Match · Be Present</Text>
      </Pressable>
      <View style={styles.status}>
        <Text style={styles.preparing}>Preparing your garden</Text>
        <ProgressBar accessibilityLabel="Preparing local game" value={72} />
        <StatusPill label="Offline play is available" state="offline" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: color.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glyph: { ...typography.headingMedium, color: color.accent.goldSoft },
  title: {
    ...typography.headingLarge,
    color: color.text.onDark,
    fontFamily: fontFamily.display,
  },
  subtitle: { ...typography.bodySmall, color: color.text.onDarkSecondary, marginTop: spacing.xs },
  status: { width: '100%', gap: spacing.md },
  preparing: { ...typography.control, color: color.text.onDark, textAlign: 'center' },
});

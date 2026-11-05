import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { getTileArtworkSource } from '@zen-mahjong/mahjong-ui';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { IvoryPanel } from '@/components/ivory-panel';
import { MoonlitScreenHeader } from '@/components/moonlit-screen-header';
import { useAppData } from '@/state/app-data-provider';

import { AchievementDetailModal } from './achievement-detail-modal';
import {
  getAchievementPresentations,
  type AchievementPresentation,
} from './achievement-presentation';

export function AchievementsScreen() {
  const { offlineSave, settings } = useAppData();
  const [selected, setSelected] = useState<AchievementPresentation | null>(null);
  const achievements = useMemo(
    () => getAchievementPresentations(offlineSave.progression, offlineSave.economy),
    [offlineSave.economy, offlineSave.progression],
  );

  return (
    <>
      <AppScreen backgroundAssetId="background.coolGarden" contentStyle={styles.screen}>
        <MoonlitScreenHeader onBack={() => router.back()} title="Achievements" />
        <IvoryPanel
          accessibilityLabel="Automatic achievement rewards"
          style={[styles.panel, { minHeight: Math.max(604, achievements.length * 113 + 48) }]}
        >
          {achievements.map((achievement, index) => (
            <View key={achievement.id}>
              <Pressable
                accessibilityLabel={`${achievement.title}. ${achievement.description}. ${achievement.status}. ${achievement.progress} of ${achievement.maximum}`}
                accessibilityRole="button"
                onPress={() => setSelected(achievement)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={getTileArtworkSource(achievement.artworkId)}
                  style={styles.artwork}
                />
                <View style={styles.copy}>
                  <Text style={styles.title}>{achievement.title}</Text>
                  <Text style={styles.description}>{achievement.description}</Text>
                  <Text style={[styles.status, achievement.unlocked && styles.unlocked]}>
                    {achievement.status}
                  </Text>
                </View>
              </Pressable>
              {index < achievements.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </IvoryPanel>
      </AppScreen>
      <AchievementDetailModal
        achievement={selected}
        onDismiss={() => setSelected(null)}
        reducedMotion={settings.reducedMotion}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.sm },
  panel: {
    alignSelf: 'center',
    maxWidth: 342,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: '100%',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    minHeight: 112,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.72 },
  artwork: { height: 66, width: 66 },
  copy: { flex: 1, gap: spacing.xs },
  title: {
    ...typography.headingMedium,
    color: '#3B2419',
    fontFamily: fontFamily.display,
  },
  description: { ...typography.bodySmall, color: color.text.onLight },
  status: { ...typography.bodySmall, color: color.text.onLightSecondary },
  unlocked: { color: color.accent.jade },
  divider: { backgroundColor: '#BDAF94', height: 1, opacity: 0.48 },
});

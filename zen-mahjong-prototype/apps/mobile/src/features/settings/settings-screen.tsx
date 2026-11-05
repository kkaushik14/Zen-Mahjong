import { fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { SettingRow } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { MoonlitScreenHeader } from '@/components/moonlit-screen-header';
import { useAppData } from '@/state/app-data-provider';

import { AppearanceModal } from './appearance-modal';

export function SettingsScreen() {
  const { settings, updateSettings } = useAppData();
  const [appearanceVisible, setAppearanceVisible] = useState(false);

  return (
    <>
      <AppScreen backgroundAssetId="background.moonlitGarden" contentStyle={styles.screen}>
        <MoonlitScreenHeader onBack={() => router.back()} title="Settings" />
        <View style={styles.group}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <SettingRow
            description="Autumn garden · Ivory marble"
            label="Atmosphere"
            onPress={() => setAppearanceVisible(true)}
            trailingText="Current"
          />
          <SettingRow
            description="Simplify decorative and gameplay motion"
            label="Reduced motion"
            onValueChange={(reducedMotion) => updateSettings({ reducedMotion })}
            value={settings.reducedMotion}
          />
        </View>
        <View style={styles.group}>
          <Text style={styles.sectionLabel}>Learning</Text>
          <SettingRow
            description="Replay the guided board without changing progress"
            label="Tutorial"
            onPress={() => router.push('/tutorial')}
            trailingText="Review"
          />
        </View>
        <View style={styles.footer}>
          <Text style={styles.appName}>Zen Mahjong</Text>
          <Text style={styles.localNote}>Preferences are stored on this device.</Text>
        </View>
      </AppScreen>
      <AppearanceModal
        onApply={() => {
          updateSettings({ tileStyle: 'ivory-marble' });
          setAppearanceVisible(false);
        }}
        onDismiss={() => setAppearanceVisible(false)}
        reducedMotion={settings.reducedMotion}
        visible={appearanceVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl, paddingHorizontal: spacing.lg },
  group: { gap: spacing.sm },
  sectionLabel: {
    color: '#FFF8EC',
    fontFamily: fontFamily.accent,
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
    paddingVertical: spacing.xxl,
  },
  appName: {
    ...typography.headingMedium,
    color: '#FFF8EC',
    fontFamily: fontFamily.display,
  },
  localNote: { ...typography.caption, color: '#E5D8C4', textAlign: 'center' },
});

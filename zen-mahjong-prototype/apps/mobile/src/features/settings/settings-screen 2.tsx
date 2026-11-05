import { spacing } from '@zen-mahjong/design-tokens';
import { SettingRow } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ScreenHeader } from '@/components/screen-header';
import { SectionLabel } from '@/components/section-label';
import { useAppData } from '@/state/app-data-provider';

export function SettingsScreen() {
  const { settings, storageStatus, updateSettings } = useAppData();

  return (
    <AppScreen contentStyle={styles.screen}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />
      <View style={styles.group}>
        <SectionLabel>Audio</SectionLabel>
        <SettingRow
          description="Soft instrumental score"
          label="Music"
          onValueChange={(musicEnabled) => updateSettings({ musicEnabled })}
          value={settings.musicEnabled}
        />
        <SettingRow
          description="Garden atmosphere"
          label="Ambient sound"
          onValueChange={(ambienceEnabled) => updateSettings({ ambienceEnabled })}
          value={settings.ambienceEnabled}
        />
        <SettingRow
          description="Tile and control feedback"
          label="Sound effects"
          onValueChange={(soundEffectsEnabled) => updateSettings({ soundEffectsEnabled })}
          value={settings.soundEffectsEnabled}
        />
      </View>
      <View style={styles.group}>
        <SectionLabel>Gameplay</SectionLabel>
        <SettingRow
          description="Gentle tactile feedback"
          label="Haptics"
          onValueChange={(hapticsEnabled) => updateSettings({ hapticsEnabled })}
          value={settings.hapticsEnabled}
        />
        <SettingRow
          description="Simplify decorative motion"
          label="Reduced motion"
          onValueChange={(reducedMotion) => updateSettings({ reducedMotion })}
          value={settings.reducedMotion}
        />
      </View>
      <View style={styles.group}>
        <SectionLabel>Preferences</SectionLabel>
        <SettingRow label="Tile style" trailingText="Classic" onPress={() => undefined} />
      </View>
      <View style={styles.group}>
        <SectionLabel>Privacy & data</SectionLabel>
        <SettingRow
          description="Progress stays on this device"
          label="Local game data"
          trailingText={
            storageStatus === 'recovered'
              ? 'Recovered'
              : storageStatus === 'memory-fallback'
                ? 'Temporary'
                : storageStatus === 'ready'
                  ? 'Ready'
                  : 'Loading'
          }
        />
      </View>
      <View style={styles.group}>
        <SectionLabel>Prototype</SectionLabel>
        <SettingRow
          description="Replay the guided Concentration board"
          label="Tutorial"
          onPress={() => router.push('/tutorial' as never)}
        />
        <SettingRow
          description="Review offline-capable startup feedback"
          label="Loading state"
          onPress={() => router.push('/loading')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ screen: { gap: spacing.xl }, group: { gap: spacing.sm } });

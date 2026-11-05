import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { MahjongTile } from '@zen-mahjong/mahjong-ui';
import {
  ActionButton,
  MetricCard,
  ProgressBar,
  SettingRow,
  StatusPill,
  SurfaceCard,
} from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ScreenHeader } from '@/components/screen-header';
import { SectionLabel } from '@/components/section-label';

export function ComponentGalleryScreen() {
  const [enabled, setEnabled] = useState(true);
  return (
    <AppScreen contentStyle={styles.screen}>
      <ScreenHeader title="Components" onBack={() => router.back()} />
      <View>
        <SectionLabel>Mahjong tile states</SectionLabel>
        <View style={styles.tiles}>
          <MahjongTile accessibilityLabel="Available lotus tile" motif="lotus" />
          <MahjongTile accessibilityLabel="Selected sun tile" motif="sun" state="selected" />
          <MahjongTile accessibilityLabel="Hinted crane tile" motif="crane" state="hinted" />
          <MahjongTile accessibilityLabel="Blocked bamboo tile" motif="bamboo" state="blocked" />
        </View>
      </View>
      <View style={styles.group}>
        <SectionLabel>Actions</SectionLabel>
        <ActionButton
          accessibilityLabel="Primary action example"
          fullWidth
          label="Continue"
          onPress={() => undefined}
        />
        <ActionButton
          accessibilityLabel="Quiet action example"
          emphasis="quiet"
          fullWidth
          label="Maybe later"
          onPress={() => undefined}
        />
        <ActionButton
          accessibilityLabel="Disabled action example"
          disabled
          fullWidth
          label="Unavailable"
          onPress={() => undefined}
        />
      </View>
      <View>
        <SectionLabel>Metrics and progress</SectionLabel>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <MetricCard label="Boards completed" value="24" />
          </View>
          <View style={styles.metric}>
            <MetricCard inverse label="Boards completed" value="24" />
          </View>
        </View>
        <SurfaceCard style={styles.progressCard}>
          <Text style={styles.cardTitle}>Quiet Beginning</Text>
          <Text style={styles.cardBody}>Complete 10 boards</Text>
          <ProgressBar accessibilityLabel="Example progress" value={7} maximum={10} tone="gold" />
        </SurfaceCard>
      </View>
      <View style={styles.group}>
        <SectionLabel>Settings</SectionLabel>
        <SettingRow
          description="Quiet garden ambience"
          label="Ambient sound"
          onValueChange={setEnabled}
          value={enabled}
        />
        <SettingRow label="Tile style" onPress={() => undefined} trailingText="Classic" />
      </View>
      <View>
        <SectionLabel>Connection states</SectionLabel>
        <View style={styles.statuses}>
          <StatusPill label="Device ready" />
          <StatusPill label="Offline ready" state="offline" />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  group: { gap: spacing.sm },
  tiles: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  metrics: { flexDirection: 'row', gap: spacing.md },
  statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: { flex: 1 },
  progressCard: { marginTop: spacing.md },
  cardTitle: {
    ...typography.body,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  cardBody: {
    ...typography.caption,
    color: color.text.onLightSecondary,
    marginVertical: spacing.sm,
  },
});

import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { MahjongTile } from '@zen-mahjong/mahjong-ui';
import {
  ActionButton,
  BalanceDisplay,
  IconActionControl,
  MetricCard,
  ModalShell,
  ProgressBar,
  SettingRow,
  StatusPill,
  SurfaceCard,
  ZenProgress,
} from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { Flower2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ScreenHeader } from '@/components/screen-header';
import { SectionLabel } from '@/components/section-label';

export function ComponentGalleryScreen() {
  const [enabled, setEnabled] = useState(true);
  return (
    <AppScreen backgroundAssetId="background.moonlitGarden" contentStyle={styles.screen}>
      <ScreenHeader title="Moonlit Components" onBack={() => router.back()} />
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
        <SectionLabel>Framed actions</SectionLabel>
        <ActionButton
          accessibilityLabel="Wide Continue example"
          fullWidth
          label="Continue"
          onPress={() => undefined}
          size="wide"
        />
        <View style={styles.twoColumns}>
          <ActionButton
            accessibilityLabel="Compact primary example"
            label="Resume"
            onPress={() => undefined}
          />
          <ActionButton
            accessibilityLabel="Compact secondary example"
            emphasis="quiet"
            label="Cancel"
            onPress={() => undefined}
          />
        </View>
        <ActionButton
          accessibilityLabel="Loading example"
          fullWidth
          label="Loading"
          loading
          onPress={() => undefined}
        />
      </View>

      <View>
        <SectionLabel>Gameplay controls</SectionLabel>
        <View style={styles.iconActions}>
          <IconActionControl
            accessibilityLabel="Undo, 3 remaining"
            count={3}
            onPress={() => undefined}
            type="undo"
          />
          <IconActionControl
            accessibilityLabel="Hint, 2 remaining"
            count={2}
            onPress={() => undefined}
            type="hint"
          />
          <IconActionControl
            accessibilityLabel="Shuffle unavailable"
            onPress={() => undefined}
            state="zero"
            type="shuffle"
          />
          <IconActionControl
            accessibilityLabel="More options loading"
            onPress={() => undefined}
            state="loading"
            type="more"
          />
        </View>
      </View>

      <View>
        <SectionLabel>Status and progress</SectionLabel>
        <View style={styles.statuses}>
          <BalanceDisplay
            accessibilityLabel="1,250 Concentration Score"
            icon={<Flower2 aria-hidden color={color.accent.goldSoft} size={20} />}
            label="Concentration"
            value="1,250"
          />
          <StatusPill label="Offline ready" state="offline" />
        </View>
        <SurfaceCard style={styles.progressCard}>
          <Text style={styles.cardTitle}>Quiet Beginning</Text>
          <Text style={styles.cardBody}>Complete 10 boards</Text>
          <ProgressBar accessibilityLabel="Example progress" maximum={10} tone="gold" value={7} />
          <ZenProgress accessibilityLabel="22 Zen Score, above the 20 marker" value={22} />
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
        <SectionLabel>Modal shell</SectionLabel>
        <ModalShell
          accessibilityLabel="Example pause dialog"
          actions={
            <>
              <ActionButton
                accessibilityLabel="Resume example"
                fullWidth
                label="Resume"
                onPress={() => undefined}
              />
              <ActionButton
                accessibilityLabel="Save and Home example"
                emphasis="quiet"
                fullWidth
                label="Save & Home"
                onPress={() => undefined}
              />
            </>
          }
          body="Your garden is waiting."
          title="A quiet pause"
        />
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <MetricCard label="Boards completed" value="24" />
        </View>
        <View style={styles.metric}>
          <MetricCard inverse label="Best streak" value="7 days" />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  group: { gap: spacing.sm },
  tiles: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  twoColumns: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  iconActions: { flexDirection: 'row', justifyContent: 'space-between' },
  metrics: { flexDirection: 'row', gap: spacing.md },
  statuses: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: { flex: 1 },
  progressCard: { gap: spacing.sm, marginTop: spacing.md },
  cardTitle: {
    ...typography.body,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  cardBody: { ...typography.caption, color: color.text.onLightSecondary },
});

import { color, fontFamily, spacing, typography } from '@zen-mahjong/design-tokens';
import { getTileArtworkSource } from '@zen-mahjong/mahjong-ui';
import { ActionButton } from '@zen-mahjong/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { IvoryPanel } from '@/components/ivory-panel';
import { MoonlitScreenHeader } from '@/components/moonlit-screen-header';
import { useAppData } from '@/state/app-data-provider';
import { formatDayCount } from '@/state/progress';

import { ProfileEditModal } from './profile-edit-modal';

export function ProfileScreen() {
  const { offlineSave, playerState, settings, updateProfile } = useAppData();
  const [editing, setEditing] = useState(false);
  const boardsCompleted = offlineSave.progression.completedLevels.length;
  const streak = offlineSave.progression.streak;

  return (
    <>
      <AppScreen backgroundAssetId="background.coolGarden" contentStyle={styles.screen}>
        <MoonlitScreenHeader onBack={() => router.back()} title="Profile" />
        <IvoryPanel
          accessibilityLabel="Local player profile"
          imageStyle={styles.profileCardImage}
          style={styles.profileCard}
        >
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel="Bonsai profile emblem"
            resizeMode="contain"
            source={getTileArtworkSource('12-bonsai')}
            style={styles.emblem}
          />
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.name}>
            {playerState.profile.displayName}
          </Text>
          <View style={styles.metricsGrid}>
            <ProfileMetric label="Boards completed" value={String(boardsCompleted)} />
            <ProfileMetric label="Current streak" value={formatDayCount(streak.current)} />
            <ProfileMetric label="Best streak" value={formatDayCount(streak.best)} />
            <ProfileMetric
              label="Daily challenges"
              value={String(playerState.progress.dailyChallengesCompleted)}
            />
          </View>
          <ActionButton
            accessibilityLabel="Edit local profile"
            fullWidth
            label="Edit Profile"
            maximumWidth={260}
            onPress={() => setEditing(true)}
            reducedMotion={settings.reducedMotion}
          />
        </IvoryPanel>
      </AppScreen>
      {editing ? (
        <ProfileEditModal
          currentName={playerState.profile.displayName}
          onDismiss={() => setEditing(false)}
          onSave={(displayName) => {
            updateProfile(displayName);
            setEditing(false);
          }}
          reducedMotion={settings.reducedMotion}
          visible
        />
      ) : null}
    </>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.sm },
  profileCard: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: '#D3A55F',
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 342,
    minHeight: 570,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    width: '100%',
  },
  profileCardImage: { borderRadius: 8 },
  emblem: { height: 76, width: 76 },
  name: {
    color: '#4D2C19',
    fontFamily: fontFamily.display,
    fontSize: 30,
    lineHeight: 38,
    textAlign: 'center',
    width: '100%',
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 24, width: '100%' },
  metric: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    paddingHorizontal: spacing.xs,
    width: '50%',
  },
  metricValue: {
    ...typography.headingMedium,
    color: '#7B3F22',
    fontFamily: fontFamily.editorial,
  },
  metricLabel: {
    ...typography.bodySmall,
    color: color.text.onLightSecondary,
    textAlign: 'center',
  },
});

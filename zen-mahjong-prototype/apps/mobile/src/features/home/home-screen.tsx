import { getEconomyBalances } from '@zen-mahjong/game-engine';
import { ActionButton } from '@zen-mahjong/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Play } from 'lucide-react-native';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '@/state/app-data-provider';
import { getAchievementPresentations } from '@/features/achievements/achievement-presentation';
import { getOnboardingDestination } from '@/state/onboarding';
import { runtimeAssets } from '@/theme/runtime-assets';

import {
  HomeHud,
  HomeLogo,
  MiniDestination,
  OrganicDestination,
  SettingsControl,
  homeDestinationIcons,
} from './home-components';
import { getHomeLayoutMetrics } from './home-layout';
import { buildHomePresentation } from './home-presentation';

const HOME_FEATURE_GATES = {
  dailyChallenge: false,
  journey: false,
} as const;

export function HomeScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { offlineSave, onboarding, playerState, settings } = useAppData();
  const balances = getEconomyBalances(offlineSave.economy);
  const achievements = getAchievementPresentations(offlineSave.progression, offlineSave.economy);
  const layout = getHomeLayoutMetrics(width, height);
  const presentation = buildHomePresentation({
    achievementTotal: achievements.length,
    achievementUnlockedCount: achievements.filter((achievement) => achievement.unlocked).length,
    concentrationScore: balances.concentrationScore,
    currentLevelNumber: offlineSave.progression.currentLevelNumber,
    dailyChallengesCompleted: playerState.progress.dailyChallengesCompleted,
    hasActiveRun: offlineSave.activeRun !== null,
    onboardingDestination: getOnboardingDestination(onboarding, offlineSave.activeRun !== null),
    streakDays: offlineSave.progression.streak.current,
  });
  const hudTop = Math.max(56, insets.top + 8);
  const settingsTop = Math.min(layout.settingsTop, height - insets.bottom - 62);

  return (
    <View style={styles.screen}>
      <Image
        contentFit="cover"
        pointerEvents="none"
        source={runtimeAssets['background.moonlitGarden'].source}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.shell, { height, left: layout.left, width: layout.shellWidth }]}>
        <View style={[styles.hudPosition, { top: hudTop, width: layout.contentWidth }]}>
          <HomeHud
            levelNumber={presentation.levelNumber}
            levelProgress={presentation.levelProgress}
            onProfilePress={() => router.push('/profile')}
            score={presentation.score}
          />
        </View>

        <View style={styles.logoPosition}>
          <HomeLogo />
        </View>

        <View style={[styles.destinations, { width: layout.contentWidth }]}>
          <OrganicDestination
            accessibilityLabel={
              HOME_FEATURE_GATES.dailyChallenge
                ? `Open Daily Challenge, ${presentation.dailyDetail}`
                : `Daily Challenge, ${presentation.dailyDetail}, coming later`
            }
            activeDots={presentation.dailyCompleted}
            body={presentation.dailyDetail}
            onPress={undefined}
            title="Daily Challenge"
            variant="daily"
          />
          <OrganicDestination
            accessibilityLabel={`Open streak, ${presentation.streakDays} day streak`}
            activeDots={presentation.streakDays}
            body={`${presentation.streakDays} day streak`}
            onPress={() => router.push('/streaks')}
            title="Streak"
            variant="streak"
          />
          <View style={styles.miniRow}>
            <View style={styles.miniItem}>
              <MiniDestination
                accessibilityLabel={
                  HOME_FEATURE_GATES.journey
                    ? `Open Journey, ${presentation.journeyDetail}`
                    : `Journey, ${presentation.journeyDetail}, coming later`
                }
                detail={presentation.journeyDetail}
                icon={homeDestinationIcons.journey}
                onPress={undefined}
                title="Journey"
              />
            </View>
            <View style={styles.miniItem}>
              <MiniDestination
                accessibilityLabel={`Open achievements, ${presentation.achievementDetail}`}
                detail={presentation.achievementDetail}
                icon={homeDestinationIcons.achievement}
                onPress={() => router.push('/achievements')}
                title="Achievements"
              />
            </View>
          </View>
        </View>

        <View style={[styles.primary, { width: layout.primaryWidth }]}>
          <ActionButton
            accessibilityLabel={`${presentation.primaryLabel} ${presentation.primaryRoute === '/game' ? `level ${presentation.levelNumber}` : presentation.primaryRoute.slice(1)}`}
            fullWidth
            icon={
              presentation.primaryLabel === 'Play' ? (
                <Play aria-hidden color="#71372A" fill="#71372A" size={18} strokeWidth={1.5} />
              ) : undefined
            }
            label={presentation.primaryLabel}
            maximumWidth={layout.primaryWidth}
            onPress={() => router.push(presentation.primaryRoute as never)}
            reducedMotion={settings.reducedMotion}
            size="wide"
          />
        </View>

        <View style={[styles.settingsPosition, { top: settingsTop }]}>
          <SettingsControl onPress={() => router.push('/settings')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#132D24', flex: 1, overflow: 'hidden' },
  shell: { position: 'absolute', top: 0 },
  hudPosition: { left: 16, position: 'absolute' },
  logoPosition: { alignItems: 'center', left: 0, position: 'absolute', right: 0, top: 124 },
  destinations: { gap: 7, left: 16, position: 'absolute', top: 278 },
  miniRow: { flexDirection: 'row', gap: 8 },
  miniItem: { flex: 1, minWidth: 0 },
  primary: { alignSelf: 'center', position: 'absolute', top: 592 },
  settingsPosition: { alignSelf: 'center', position: 'absolute' },
});

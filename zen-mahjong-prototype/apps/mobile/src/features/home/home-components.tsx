import { color, fontFamily } from '@zen-mahjong/design-tokens';
import { getMoonlitAssetSource } from '@zen-mahjong/ui';
import { Image as ExpoImage } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { homeAssets } from './home-assets.generated';

const marbleFrameAssets = {
  left: getMoonlitAssetSource('button.wideLeft'),
  middle: getMoonlitAssetSource('button.wideMiddle'),
  right: getMoonlitAssetSource('button.wideRight'),
} as const;

interface DestinationProps {
  accessibilityLabel: string;
  children: ReactNode;
  onPress?: (() => void) | undefined;
}

interface OrganicDestinationProps extends Omit<DestinationProps, 'children'> {
  activeDots: number;
  body: string;
  title: string;
  variant: 'daily' | 'streak';
}

interface MiniDestinationProps extends Omit<DestinationProps, 'children'> {
  detail: string;
  icon: ImageSourcePropType;
  title: string;
}

function DestinationControl({ accessibilityLabel, children, onPress }: DestinationProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.control, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

function ThreeSliceFrame({ variant }: { variant: 'daily' | 'streak' }) {
  const sources =
    variant === 'daily'
      ? [homeAssets.dailyStart, homeAssets.dailyMiddle, homeAssets.dailyEnd]
      : [homeAssets.streakStart, homeAssets.streakMiddle, homeAssets.streakEnd];

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.frameRow]}>
      <ExpoImage
        contentFit="fill"
        source={sources[0]}
        style={[styles.frameImage, styles.organicStart]}
      />
      <ExpoImage
        contentFit="fill"
        source={sources[1]}
        style={[styles.frameImage, styles.frameMiddle]}
      />
      <ExpoImage
        contentFit="fill"
        source={sources[2]}
        style={[styles.frameImage, styles.organicEnd]}
      />
    </View>
  );
}

function MarbleFrame() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        resizeMode="stretch"
        source={marbleFrameAssets.left}
        style={[styles.frameImage, styles.marbleLeft]}
      />
      <Image
        resizeMode="stretch"
        source={marbleFrameAssets.middle}
        style={[styles.frameImage, styles.marbleMiddle]}
      />
      <Image
        resizeMode="stretch"
        source={marbleFrameAssets.right}
        style={[styles.frameImage, styles.marbleRight]}
      />
    </View>
  );
}

export function HomeHud({
  levelNumber,
  levelProgress,
  onProfilePress,
  score,
}: {
  levelNumber: number;
  levelProgress: number;
  onProfilePress: () => void;
  score: number;
}) {
  return (
    <View style={styles.hud}>
      <Pressable
        accessibilityLabel="Open profile"
        accessibilityRole="button"
        hitSlop={6}
        onPress={onProfilePress}
        style={({ pressed }) => [styles.profile, pressed && styles.pressed]}
      >
        <Image
          accessible={false}
          resizeMode="contain"
          source={homeAssets.avatar}
          style={styles.avatar}
        />
        <Text style={styles.level}>Lv. {levelNumber}</Text>
        <View
          accessibilityLabel={`Level path progress ${Math.round(levelProgress * 100)} percent`}
          accessibilityRole="progressbar"
          accessibilityValue={{ max: 100, min: 0, now: Math.round(levelProgress * 100) }}
          style={styles.levelTrack}
        >
          <View style={[styles.levelFill, { width: `${Math.round(levelProgress * 100)}%` }]} />
        </View>
      </Pressable>
      <View accessibilityLabel={`${score} Concentration Score`} style={styles.currency}>
        <Image
          accessible={false}
          resizeMode="stretch"
          source={homeAssets.currency}
          style={styles.currencyImage}
        />
        <Text numberOfLines={1} style={styles.currencyValue}>
          {score}
        </Text>
      </View>
    </View>
  );
}

export function HomeLogo() {
  return (
    <View accessibilityLabel="Zen Mahjong" style={styles.logo}>
      <Image
        accessible={false}
        resizeMode="contain"
        source={homeAssets.logoUpper}
        style={styles.logoUpper}
      />
      <Image
        accessible={false}
        resizeMode="contain"
        source={homeAssets.logoLower}
        style={styles.logoLower}
      />
    </View>
  );
}

export function OrganicDestination({
  accessibilityLabel,
  activeDots,
  body,
  onPress,
  title,
  variant,
}: OrganicDestinationProps) {
  return (
    <DestinationControl accessibilityLabel={accessibilityLabel} onPress={onPress}>
      <View style={styles.organicCard}>
        <ThreeSliceFrame variant={variant} />
        <View pointerEvents="none" style={styles.organicCopy}>
          <Text numberOfLines={1} style={styles.organicTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.organicBody}>
            {body}
          </Text>
          {variant === 'streak' ? (
            <View style={styles.dots}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[styles.dot, index < Math.min(activeDots, 4) && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>
        <ChevronRight
          aria-hidden
          color="#F7E7C9"
          size={22}
          strokeWidth={2.2}
          style={styles.organicChevron}
        />
      </View>
    </DestinationControl>
  );
}

export function MiniDestination({
  accessibilityLabel,
  detail,
  icon,
  onPress,
  title,
}: MiniDestinationProps) {
  return (
    <DestinationControl accessibilityLabel={accessibilityLabel} onPress={onPress}>
      <View style={styles.miniCard}>
        <MarbleFrame />
        <Image accessible={false} resizeMode="contain" source={icon} style={styles.miniIcon} />
        <View pointerEvents="none" style={styles.miniCopy}>
          <Text numberOfLines={1} style={styles.miniTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.miniDetail}>
            {detail}
          </Text>
        </View>
        <ChevronRight
          aria-hidden
          color={color.text.onLightSecondary}
          size={17}
          strokeWidth={2}
          style={styles.miniChevron}
        />
      </View>
    </DestinationControl>
  );
}

export const homeDestinationIcons = {
  achievement: homeAssets.achievementIcon,
  journey: homeAssets.journeyIcon,
} as const;

export function SettingsControl({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Open settings"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
    >
      <Image
        accessible={false}
        resizeMode="contain"
        source={homeAssets.settings}
        style={styles.settingsImage}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: { width: '100%' },
  frameImage: { height: '100%' },
  frameMiddle: { flex: 1, marginHorizontal: -1 },
  frameRow: { flexDirection: 'row' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  hud: { alignItems: 'center', flexDirection: 'row', height: 52, justifyContent: 'space-between' },
  profile: { height: 52, position: 'relative', width: 118 },
  avatar: { height: 48, left: 0, position: 'absolute', top: 0, width: 48 },
  level: {
    color: '#FFF7E8',
    fontFamily: fontFamily.body,
    fontSize: 15,
    left: 55,
    lineHeight: 18,
    position: 'absolute',
    textShadowColor: '#102119A6',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
    top: 9,
  },
  levelTrack: {
    backgroundColor: '#102B21B8',
    borderColor: '#D3B77C8F',
    borderRadius: 3,
    borderWidth: 0.5,
    height: 5,
    left: 55,
    overflow: 'hidden',
    position: 'absolute',
    top: 31,
    width: 48,
  },
  levelFill: { backgroundColor: '#F5D58D', height: '100%' },
  currency: { height: 49, position: 'relative', width: 136 },
  currencyImage: { height: '100%', width: '100%' },
  currencyValue: {
    color: '#F8EBD3',
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
    left: 49,
    lineHeight: 20,
    position: 'absolute',
    right: 39,
    textAlign: 'center',
    textShadowColor: '#000000B0',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
    top: 14,
  },
  logo: { height: 148, position: 'relative', width: 196 },
  logoUpper: { height: 78, left: 4.5, position: 'absolute', top: 0, width: 187 },
  logoLower: { bottom: 0, height: 71, left: 0, position: 'absolute', width: 196 },
  organicCard: { height: 90, overflow: 'hidden', position: 'relative', width: '100%' },
  organicStart: { width: 35 },
  organicEnd: { width: 20 },
  organicCopy: { bottom: 14, left: 28, position: 'absolute', right: 54, top: 14 },
  organicTitle: {
    fontFamily: fontFamily.display,
    color: '#FFF4DE',
    fontSize: 24,
    lineHeight: 32,
    textShadowColor: '#2A100BCC',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
  },
  organicBody: {
    color: '#F1D3AA',
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 17,
    marginTop: 1,
  },
  dots: { flexDirection: 'row', gap: 5, marginTop: 5 },
  dot: {
    backgroundColor: '#3A1F18A8',
    borderColor: '#F1D3AA',
    borderWidth: 1,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  dotActive: { backgroundColor: '#4C8B72' },
  organicChevron: { position: 'absolute', right: 25, top: 34 },
  miniCard: { height: 78, overflow: 'hidden', position: 'relative', width: '100%' },
  marbleLeft: { left: 0, position: 'absolute', width: 46 },
  marbleMiddle: { left: 45, position: 'absolute', right: 36 },
  marbleRight: { position: 'absolute', right: 0, width: 37 },
  miniIcon: { height: 48, left: 10, position: 'absolute', top: 15, width: 48 },
  miniCopy: { left: 59, position: 'absolute', right: 21, top: 19 },
  miniTitle: {
    color: color.text.onLight,
    fontFamily: fontFamily.display,
    fontSize: 16,
    lineHeight: 21,
  },
  miniDetail: {
    color: color.text.onLightSecondary,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 17,
    marginTop: 1,
  },
  miniChevron: { position: 'absolute', right: 7, top: 30 },
  settings: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  settingsImage: { height: 48, width: 48 },
});

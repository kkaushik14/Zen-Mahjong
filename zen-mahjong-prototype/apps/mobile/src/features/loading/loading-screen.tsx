import { fontFamily } from '@zen-mahjong/design-tokens';
import { getMoonlitAssetSource } from '@zen-mahjong/ui';
import { Image as ExpoImage } from 'expo-image';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { runtimeAssets } from '@/theme/runtime-assets';

export interface LoadingScreenProps {
  progress?: number;
}

export function LoadingScreen({ progress = 72 }: LoadingScreenProps) {
  const { height } = useWindowDimensions();
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.screen}>
      <ExpoImage
        contentFit="cover"
        pointerEvents="none"
        source={runtimeAssets['background.loadingSage'].source}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.wash} />
      <Text style={[styles.tagline, { top: height * 0.515 }]}>Breathe · Match · Be Present</Text>
      <View style={[styles.status, { top: height * 0.672 }]}>
        <Text style={styles.preparing}>Preparing your garden...</Text>
        <View
          accessibilityLabel="Preparing local game"
          accessibilityRole="progressbar"
          accessibilityValue={{ max: 100, min: 0, now: normalizedProgress }}
          style={styles.progress}
        >
          <Image
            resizeMode="stretch"
            source={getMoonlitAssetSource('progress.branch')}
            style={[styles.branch, styles.branchMuted]}
          />
          <View style={[styles.progressClip, { width: `${normalizedProgress}%` }]}>
            <Image
              resizeMode="stretch"
              source={getMoonlitAssetSource('progress.branch')}
              style={styles.branch}
            />
          </View>
        </View>
        <View pointerEvents="none" style={styles.milestones}>
          {[20, 40, 60, 80].map((milestone) => (
            <Text key={milestone} style={styles.milestone}>
              {milestone}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#8B9C7E', flex: 1, overflow: 'hidden' },
  wash: { ...StyleSheet.absoluteFill, backgroundColor: '#EAF0DF12' },
  tagline: {
    color: '#F8F2E2',
    fontFamily: fontFamily.editorial,
    fontSize: 19,
    left: 20,
    lineHeight: 25,
    position: 'absolute',
    right: 20,
    textAlign: 'center',
    textShadowColor: '#243A2DB8',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  status: { alignItems: 'center', left: 0, position: 'absolute', right: 0 },
  preparing: {
    color: '#F7F0DE',
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
    textShadowColor: '#294235A6',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2,
  },
  progress: { height: 28, overflow: 'hidden', position: 'relative', width: 230 },
  branch: { height: 28, left: 0, position: 'absolute', top: 0, width: 230 },
  branchMuted: { opacity: 0.34 },
  progressClip: { height: 28, left: 0, overflow: 'hidden', position: 'absolute', top: 0 },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -1,
    paddingHorizontal: 16,
    width: 230,
  },
  milestone: {
    color: '#E5E8D599',
    fontFamily: fontFamily.body,
    fontSize: 8,
    lineHeight: 10,
  },
});

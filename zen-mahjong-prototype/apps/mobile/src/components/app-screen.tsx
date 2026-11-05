import { color, layout, spacing } from '@zen-mahjong/design-tokens';
import { Image } from 'expo-image';
import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { getResponsivePhoneMetrics } from '@/theme/responsive';
import { runtimeAssets, type RuntimeAssetId } from '@/theme/runtime-assets';

export interface AppScreenProps extends PropsWithChildren {
  backgroundAssetId?: RuntimeAssetId;
  contentStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: readonly Edge[];
  scroll?: boolean;
}

export function AppScreen({
  backgroundAssetId,
  children,
  contentStyle,
  safeAreaEdges = ['top', 'bottom'],
  scroll = true,
}: AppScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const metrics = getResponsivePhoneMetrics(width);
  const webViewportStyle =
    Platform.OS === 'web' ? ({ minHeight: '100vh' } as unknown as ViewStyle) : undefined;
  const content = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal: metrics.gutter,
          paddingTop: backgroundAssetId ? Math.max(0, 56 - insets.top) : 0,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.background, webViewportStyle]}>
      {backgroundAssetId ? (
        <>
          <Image
            contentFit="cover"
            pointerEvents="none"
            source={runtimeAssets[backgroundAssetId].source}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={styles.scrim} />
        </>
      ) : (
        <View pointerEvents="none" style={styles.lightPatch} />
      )}
      <SafeAreaView edges={safeAreaEdges} style={styles.safeArea}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: color.background.base, flex: 1, overflow: 'hidden' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: '#10251D4D' },
  lightPatch: {
    backgroundColor: color.background.elevated,
    height: 520,
    opacity: 0.2,
    position: 'absolute',
    right: -170,
    top: 100,
    transform: [{ rotate: '18deg' }],
    width: 260,
  },
  safeArea: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: layout.phoneMaximumWidth,
    width: '100%',
  },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingBottom: spacing.xl },
});

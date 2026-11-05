import { color, fontFamily, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { getMoonlitAssetSource } from './moonlit-assets';

const modalFrameAssets = {
  bottom: getMoonlitAssetSource('popup.bottom'),
  left: getMoonlitAssetSource('popup.left'),
  right: getMoonlitAssetSource('popup.right'),
  surface: getMoonlitAssetSource('popup.surface'),
  top: getMoonlitAssetSource('popup.top'),
} as const;

export interface ModalShellProps extends PropsWithChildren {
  accessibilityLabel: string;
  actions?: ReactNode;
  body?: string;
  bodyStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  title: string;
  titleStyle?: StyleProp<TextStyle>;
}

export function ModalShell({
  accessibilityLabel,
  actions,
  body,
  bodyStyle,
  children,
  contentStyle,
  style,
  title,
  titleStyle,
}: ModalShellProps) {
  'use no memo';

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
      style={[styles.shell, style]}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={StyleSheet.absoluteFill}>
          <Image
            resizeMode="stretch"
            source={modalFrameAssets.surface}
            style={[styles.fillImage, styles.surfaceImage]}
          />
        </View>
        <View style={styles.top}>
          <Image resizeMode="stretch" source={modalFrameAssets.top} style={styles.fillImage} />
        </View>
        <View style={styles.bottom}>
          <Image resizeMode="stretch" source={modalFrameAssets.bottom} style={styles.fillImage} />
        </View>
        <View style={styles.left}>
          <Image resizeMode="stretch" source={modalFrameAssets.left} style={styles.fillImage} />
        </View>
        <View style={styles.right}>
          <Image resizeMode="stretch" source={modalFrameAssets.right} style={styles.fillImage} />
        </View>
      </View>
      <View style={[styles.content, contentStyle]}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {body ? <Text style={[styles.body, bodyStyle]}>{body}</Text> : null}
        {children}
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'center',
    borderRadius: radius.card,
    maxWidth: 520,
    minHeight: 280,
    overflow: 'visible',
    paddingHorizontal: 28,
    paddingVertical: 24,
    width: '100%',
  },
  surfaceImage: { borderRadius: radius.card },
  fillImage: { height: '100%', width: '100%' },
  top: { height: 20, left: 18, position: 'absolute', right: 18, top: 0 },
  bottom: { bottom: 0, height: 20, left: 18, position: 'absolute', right: 18 },
  left: { bottom: 0, left: 0, position: 'absolute', top: 0, width: 38 },
  right: { bottom: 0, position: 'absolute', right: 0, top: 0, width: 38 },
  content: { flex: 1, gap: spacing.md, justifyContent: 'flex-start', paddingTop: spacing.sm },
  title: {
    color: '#2A1A12',
    fontFamily: fontFamily.display,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  body: { ...typography.bodySmall, color: color.text.onLight, textAlign: 'center' },
  actions: { gap: spacing.sm, marginTop: 'auto' },
});

import { getMoonlitAssetSource } from '@zen-mahjong/ui';
import { Image } from 'expo-image';
import type { PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

const ivoryPanelSource = getMoonlitAssetSource('popup.surface') as number;

export type IvoryPanelProps = PropsWithChildren<
  Omit<ViewProps, 'style'> & {
    imageStyle?: StyleProp<ImageStyle>;
    style?: StyleProp<ViewStyle>;
  }
>;

export function IvoryPanel({ children, imageStyle, style, ...props }: IvoryPanelProps) {
  return (
    <View {...props} style={[styles.panel, style]}>
      <Image
        contentFit="fill"
        pointerEvents="none"
        source={ivoryPanelSource}
        style={[StyleSheet.absoluteFill, styles.image, imageStyle]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 8, flexShrink: 0, overflow: 'hidden' },
  image: { borderRadius: 8 },
});

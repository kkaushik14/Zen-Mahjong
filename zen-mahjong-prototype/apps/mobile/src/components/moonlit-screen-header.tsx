import { fontFamily, typography } from '@zen-mahjong/design-tokens';
import { gameplayAssetSources } from '@zen-mahjong/mahjong-ui';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export interface MoonlitScreenHeaderProps {
  onBack: () => void;
  title: string;
}

export function MoonlitScreenHeader({ onBack, title }: MoonlitScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={6}
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Image resizeMode="contain" source={gameplayAssetSources.back} style={styles.backImage} />
      </Pressable>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'flex-start', flexDirection: 'row', minHeight: 72, width: '100%' },
  back: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  backImage: { height: 48, width: 48 },
  pressed: { opacity: 0.72 },
  title: {
    ...typography.headingLarge,
    color: '#FFF8EC',
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 46,
    marginTop: 5,
    textAlign: 'center',
  },
  side: { height: 48, width: 48 },
});

import { color, fontFamily, motion, radius } from '@zen-mahjong/design-tokens';
import { getMoonlitAssetSource, MoonlitSurface } from '@zen-mahjong/ui';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';

import { gameplayAssetSources } from './gameplay-assets.generated';
import { MahjongTile } from './mahjong-tile';

export interface ConcentrationTrayTile {
  accessibilityLabel: string;
  id: string;
  motif: string;
}

export interface ConcentrationTrayProps {
  blocked?: boolean;
  onTilePress?: (tileId: string) => void;
  reducedMotion?: boolean;
  specialUsesRemaining: number;
  tiles: readonly ConcentrationTrayTile[];
}

const REGULAR_SLOT_COUNT = 4;

export function ConcentrationTray({
  blocked = false,
  onTilePress,
  reducedMotion = false,
  specialUsesRemaining,
  tiles,
}: ConcentrationTrayProps) {
  return (
    <View
      accessibilityLabel={`Concentration tray, ${tiles.length} of ${REGULAR_SLOT_COUNT} regular slots filled, ${specialUsesRemaining} special uses remaining`}
      style={styles.container}
    >
      <View style={styles.regularArea}>
        <View pointerEvents="none" style={styles.slotRow}>
          {Array.from({ length: REGULAR_SLOT_COUNT }, (_, index) => (
            <MoonlitSurface
              accessibilityLabel={
                tiles[index] ? undefined : `Regular tray slot ${index + 1}, empty`
              }
              key={`slot-${index + 1}`}
              style={styles.slot}
              variant="wood"
            />
          ))}
        </View>
        <View style={styles.tileRow}>
          {tiles.map((tile, index) => (
            <Animated.View
              {...(reducedMotion
                ? {}
                : {
                    entering: FadeInDown.duration(motion.selectionMs),
                    exiting: FadeOutDown.duration(motion.removalMs),
                    layout: LinearTransition.duration(motion.modalMs),
                  })}
              key={tile.id}
              style={[styles.tilePosition, { left: `${index * 25}%` }]}
            >
              <MahjongTile
                accessibilityLabel={`${tile.accessibilityLabel}, regular tray position ${index + 1}${blocked ? ', activate to use the Special Concentration slot' : ''}`}
                motif={tile.motif}
                reducedMotion={reducedMotion}
                size={44}
                state="available"
                {...(onTilePress ? { onPress: () => onTilePress(tile.id) } : {})}
              />
            </Animated.View>
          ))}
        </View>
      </View>
      <View pointerEvents="none" style={styles.separator} />
      <View
        accessibilityLabel={`Special Concentration slot, ${specialUsesRemaining} uses remaining${blocked && specialUsesRemaining > 0 ? ', ready' : ''}`}
        style={[styles.specialSlot, blocked && specialUsesRemaining > 0 && styles.specialReady]}
      >
        <ImageBackground
          imageStyle={styles.specialMarbleImage}
          resizeMode="stretch"
          source={getMoonlitAssetSource('surface.tileMarble')}
          style={styles.specialMarble}
        >
          <Image
            resizeMode="contain"
            source={gameplayAssetSources.identityEmblem}
            style={styles.specialEmblem}
          />
          <Text style={styles.specialLabel}>Identity</Text>
          {specialUsesRemaining > 0 ? (
            <View style={styles.specialBadge}>
              <Text style={styles.specialCount}>{specialUsesRemaining}</Text>
            </View>
          ) : null}
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    height: 78,
    maxWidth: 342,
    width: '100%',
  },
  regularArea: { flex: 1, height: 78, position: 'relative' },
  slotRow: {
    bottom: 0,
    flexDirection: 'row',
    gap: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  slot: { flex: 1, height: 78 },
  tileRow: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  tilePosition: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: '25%',
  },
  separator: {
    backgroundColor: '#E8DDBD8F',
    height: 62,
    marginHorizontal: 7,
    width: 1,
  },
  specialSlot: {
    borderColor: 'transparent',
    borderRadius: radius.tile,
    borderWidth: 2,
    height: 78,
    width: 64,
  },
  specialReady: { borderColor: color.accent.gold },
  specialMarble: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  specialMarbleImage: { borderRadius: radius.tile },
  specialEmblem: { height: 38, marginTop: 5, width: 38 },
  specialLabel: {
    color: '#2A1A12',
    fontFamily: fontFamily.body,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 1,
  },
  specialBadge: {
    alignItems: 'center',
    backgroundColor: '#9A3718',
    borderColor: color.accent.gold,
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 1,
    top: 1,
    width: 18,
  },
  specialCount: { color: '#FFF6EC', fontFamily: fontFamily.body, fontSize: 9, lineHeight: 12 },
});

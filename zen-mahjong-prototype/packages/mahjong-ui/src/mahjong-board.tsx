import { motion } from '@zen-mahjong/design-tokens';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';

import { calculateBoardLayout, type BoardGeometryTile } from './board-geometry';
import { MahjongTile, type MahjongTileState } from './mahjong-tile';

export interface MahjongBoardTile {
  accessibilityLabel: string;
  blockedReason: 'covered' | 'sides-blocked' | null;
  column: number;
  id: string;
  layer: number;
  motif: string;
  row: number;
  state: MahjongTileState;
}

export interface MahjongBoardProps {
  accessibilityLabel: string;
  onTilePress: (tileId: string) => void;
  reducedMotion?: boolean;
  tiles: readonly MahjongBoardTile[];
  layoutTiles?: readonly BoardGeometryTile[];
}

export function MahjongBoard({
  accessibilityLabel,
  onTilePress,
  reducedMotion = false,
  tiles,
  layoutTiles = tiles,
}: MahjongBoardProps) {
  const [size, setSize] = useState({ height: 0, width: 0 });
  const orderedTiles = useMemo(
    () =>
      [...tiles].sort(
        (first, second) =>
          first.layer - second.layer || first.row - second.row || first.column - second.column,
      ),
    [tiles],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setSize((current) =>
      current.height === height && current.width === width ? current : { height, width },
    );
  };

  const layout = useMemo(
    () => calculateBoardLayout(size.width, size.height, layoutTiles),
    [size.height, size.width, layoutTiles],
  );

  return (
    <View accessibilityLabel={accessibilityLabel} onLayout={handleLayout} style={styles.board}>
      {size.width > 0 &&
        orderedTiles.map((tile, index) => (
          <Animated.View
            {...(reducedMotion
              ? {}
              : {
                  entering: FadeInDown.duration(260).delay(Math.min(180, index * 10)),
                  exiting: FadeOutDown.duration(motion.removalMs),
                  layout: LinearTransition.duration(220),
                })}
            key={tile.id}
            style={[
              styles.positionedTile,
              {
                left:
                  layout.originX +
                  tile.column * (layout.tileWidth + layout.gap) +
                  tile.layer * layout.layerOffset,
                top:
                  layout.originY +
                  tile.row * (layout.tileHeight + layout.gap) -
                  tile.layer * layout.layerOffset,
                zIndex: tile.layer * 1000 + tile.row * 100 + tile.column,
              },
            ]}
          >
            <MahjongTile
              accessibilityLabel={tile.accessibilityLabel}
              blockedReason={tile.blockedReason}
              motif={tile.motif}
              onPress={() => onTilePress(tile.id)}
              reducedMotion={reducedMotion}
              size={layout.tileWidth}
              state={tile.state}
            />
          </Animated.View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1, width: '100%' },
  positionedTile: { position: 'absolute' },
});

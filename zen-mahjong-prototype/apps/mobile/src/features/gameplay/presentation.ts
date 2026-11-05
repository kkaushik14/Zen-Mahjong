import type { ConcentrationSessionV1, TileId } from '@zen-mahjong/game-engine';
import {
  getTileMotif,
  type ConcentrationTrayTile,
  type MahjongBoardTile,
} from '@zen-mahjong/mahjong-ui';
import { getTileBlockReason } from '@zen-mahjong/game-engine';

export const categoryNames = {
  high: 'High Concentration',
  normal: 'Normal Concentration',
  special: 'Special Concentration',
  super: 'Super Concentration',
} as const;

export function toBoardTiles(
  session: ConcentrationSessionV1,
  hintedTileIds: readonly TileId[] = [],
): readonly MahjongBoardTile[] {
  return session.game.tiles
    .filter((tile) => !tile.removed)
    .map((tile) => {
      const blockedReason = getTileBlockReason(tile, session.game.tiles);
      const available = blockedReason === null;
      const motif = getTileMotif(tile.motif);
      const blockedDescription =
        blockedReason === 'covered'
          ? 'blocked by a tile above'
          : blockedReason === 'sides-blocked'
            ? 'blocked on both sides'
            : 'blocked';
      return {
        accessibilityLabel: `${motif.label} tile, ${available ? 'available' : blockedDescription}`,
        blockedReason:
          blockedReason === 'covered' || blockedReason === 'sides-blocked' ? blockedReason : null,
        column: tile.position.column,
        id: tile.id,
        layer: tile.position.layer,
        motif: motif.id,
        row: tile.position.row,
        state: hintedTileIds.includes(tile.id) ? 'hinted' : available ? 'available' : 'blocked',
      };
    });
}

export function toTrayTiles(session: ConcentrationSessionV1): readonly ConcentrationTrayTile[] {
  const tilesById = new Map(session.game.tiles.map((tile) => [tile.id, tile]));
  return session.regularTray.flatMap((tileId) => {
    const tile = tilesById.get(tileId);
    if (!tile) return [];
    const motif = getTileMotif(tile.motif);
    return [{ accessibilityLabel: `${motif.label} tile`, id: tile.id, motif: motif.id }];
  });
}

export function remainingTileCount(session: ConcentrationSessionV1): number {
  return session.game.tiles.filter((tile) => !tile.removed).length;
}

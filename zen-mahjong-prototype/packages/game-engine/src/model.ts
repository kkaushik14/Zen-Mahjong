export type TileId = string;

export interface TilePosition {
  column: number;
  row: number;
  layer: number;
}

export interface MahjongTile {
  id: TileId;
  motif: string;
  matchingGroup: string;
  position: TilePosition;
  removed: boolean;
}

export interface GameMove {
  firstTileId: TileId;
  secondTileId: TileId;
  moveNumber: number;
}

export interface TilePair {
  firstTileId: TileId;
  secondTileId: TileId;
}

export type GameStatus = 'in-progress' | 'won' | 'stalled';

export interface GameState {
  levelId: string;
  seed: string;
  tiles: readonly MahjongTile[];
  initialTiles: readonly MahjongTile[];
  history: readonly GameMove[];
  shuffleCount: number;
}

export interface GameStateInput {
  levelId: string;
  seed: string;
  tiles: readonly MahjongTile[];
}

export interface BoardFixture {
  id: string;
  tiles: readonly MahjongTile[];
}

export type AvailabilityRule = (tile: MahjongTile, tiles: readonly MahjongTile[]) => boolean;

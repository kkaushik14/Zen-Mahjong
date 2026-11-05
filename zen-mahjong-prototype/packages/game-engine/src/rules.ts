import type {
  AvailabilityRule,
  GameMove,
  GameState,
  GameStateInput,
  GameStatus,
  MahjongTile,
  TileId,
  TilePair,
  TilePosition,
} from './model';

function clonePosition(position: TilePosition): TilePosition {
  return { ...position };
}

function cloneTile(tile: MahjongTile): MahjongTile {
  return { ...tile, position: clonePosition(tile.position) };
}

function positionsEqual(first: TilePosition, second: TilePosition): boolean {
  return first.column === second.column && first.row === second.row && first.layer === second.layer;
}

function intervalsOverlap(firstStart: number, secondStart: number): boolean {
  const epsilon = 0.001;
  return firstStart < secondStart + 1 - epsilon && secondStart < firstStart + 1 - epsilon;
}

function edgesTouch(firstEdge: number, secondEdge: number): boolean {
  return Math.abs(firstEdge - secondEdge) < 0.001;
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: string): () => number {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGameState(input: GameStateInput): GameState {
  const initialTiles = input.tiles.map((tile) => ({ ...cloneTile(tile), removed: false }));

  return {
    levelId: input.levelId,
    seed: input.seed,
    tiles: initialTiles.map(cloneTile),
    initialTiles: initialTiles.map(cloneTile),
    history: [],
    shuffleCount: 0,
  };
}

export function getTile(state: GameState, tileId: TileId): MahjongTile | undefined {
  return state.tiles.find((tile) => tile.id === tileId);
}

export type TileBlockReason = 'covered' | 'removed' | 'sides-blocked';

export function getTileBlockReason(
  tile: MahjongTile,
  tiles: readonly MahjongTile[],
): TileBlockReason | null {
  if (tile.removed) return 'removed';

  const activeTiles = tiles.filter((candidate) => !candidate.removed && candidate.id !== tile.id);
  const covered = activeTiles.some(
    (candidate) =>
      candidate.position.layer > tile.position.layer &&
      intervalsOverlap(candidate.position.column, tile.position.column) &&
      intervalsOverlap(candidate.position.row, tile.position.row),
  );
  if (covered) return 'covered';

  const leftBlocked = activeTiles.some(
    (candidate) =>
      candidate.position.layer === tile.position.layer &&
      intervalsOverlap(candidate.position.row, tile.position.row) &&
      edgesTouch(candidate.position.column + 1, tile.position.column),
  );
  const rightBlocked = activeTiles.some(
    (candidate) =>
      candidate.position.layer === tile.position.layer &&
      intervalsOverlap(candidate.position.row, tile.position.row) &&
      edgesTouch(tile.position.column + 1, candidate.position.column),
  );

  return leftBlocked && rightBlocked ? 'sides-blocked' : null;
}

export const standardAvailabilityRule: AvailabilityRule = (tile, tiles) =>
  getTileBlockReason(tile, tiles) === null;

export function canMatch(
  state: GameState,
  firstTileId: TileId,
  secondTileId: TileId,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): boolean {
  if (firstTileId === secondTileId) return false;

  const first = getTile(state, firstTileId);
  const second = getTile(state, secondTileId);

  if (!first || !second || first.removed || second.removed) return false;

  return (
    first.matchingGroup === second.matchingGroup &&
    isAvailable(first, state.tiles) &&
    isAvailable(second, state.tiles)
  );
}

export function findLegalPairs(
  state: GameState,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): readonly TilePair[] {
  const availableTiles = state.tiles.filter(
    (tile) => !tile.removed && isAvailable(tile, state.tiles),
  );
  const pairs: TilePair[] = [];

  for (let firstIndex = 0; firstIndex < availableTiles.length; firstIndex += 1) {
    const first = availableTiles[firstIndex];
    if (!first) continue;

    for (let secondIndex = firstIndex + 1; secondIndex < availableTiles.length; secondIndex += 1) {
      const second = availableTiles[secondIndex];
      if (second && first.matchingGroup === second.matchingGroup) {
        pairs.push({ firstTileId: first.id, secondTileId: second.id });
      }
    }
  }

  return pairs;
}

export function getHint(
  state: GameState,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): TilePair | undefined {
  return findLegalPairs(state, isAvailable)[0];
}

export function hasLegalMoves(
  state: GameState,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): boolean {
  return getHint(state, isAvailable) !== undefined;
}

export function applyMatch(
  state: GameState,
  firstTileId: TileId,
  secondTileId: TileId,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): GameState {
  if (!canMatch(state, firstTileId, secondTileId, isAvailable)) return state;

  const move: GameMove = {
    firstTileId,
    secondTileId,
    moveNumber: state.history.length + 1,
  };

  return {
    ...state,
    tiles: state.tiles.map((tile) =>
      tile.id === firstTileId || tile.id === secondTileId ? { ...tile, removed: true } : tile,
    ),
    history: [...state.history, move],
  };
}

export function undoLastMove(state: GameState): GameState {
  const move = state.history.at(-1);
  if (!move) return state;

  return {
    ...state,
    tiles: state.tiles.map((tile) =>
      tile.id === move.firstTileId || tile.id === move.secondTileId
        ? { ...tile, removed: false }
        : tile,
    ),
    history: state.history.slice(0, -1),
  };
}

export function shuffleRemainingTiles(state: GameState): GameState {
  const activeTiles = state.tiles.filter((tile) => !tile.removed);
  if (activeTiles.length < 2) return state;

  const random = createSeededRandom(`${state.seed}:shuffle:${state.shuffleCount + 1}`);
  const positions = activeTiles.map((tile) => clonePosition(tile.position));

  for (let index = positions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = positions[index];
    const swap = positions[swapIndex];
    if (!current || !swap) continue;
    positions[index] = swap;
    positions[swapIndex] = current;
  }

  const unchanged = activeTiles.every((tile, index) => {
    const position = positions[index];
    return position ? positionsEqual(tile.position, position) : true;
  });
  if (unchanged) positions.push(positions.shift() as TilePosition);

  let activeIndex = 0;
  const tiles = state.tiles.map((tile) => {
    if (tile.removed) return tile;
    const position = positions[activeIndex];
    activeIndex += 1;
    return position ? { ...tile, position } : tile;
  });

  return { ...state, tiles, shuffleCount: state.shuffleCount + 1 };
}

export function restartGame(state: GameState): GameState {
  return {
    ...state,
    tiles: state.initialTiles.map(cloneTile),
    history: [],
    shuffleCount: 0,
  };
}

export function isLevelComplete(state: GameState): boolean {
  return state.tiles.every((tile) => tile.removed);
}

export function getGameStatus(
  state: GameState,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): GameStatus {
  if (isLevelComplete(state)) return 'won';
  return hasLegalMoves(state, isAvailable) ? 'in-progress' : 'stalled';
}

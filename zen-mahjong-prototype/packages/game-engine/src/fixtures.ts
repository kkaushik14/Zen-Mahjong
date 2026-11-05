import { requireTileDesign } from '@zen-mahjong/game-content';

import type { BoardFixture, MahjongTile } from './model';
import { createGameState } from './rules';

function tile(
  id: string,
  matchingGroup: string,
  column: number,
  row: number,
  layer = 0,
): MahjongTile {
  const design = requireTileDesign(matchingGroup);
  return {
    id,
    motif: design.designId,
    matchingGroup: design.matchIdentity,
    position: { column, row, layer },
    removed: false,
  };
}

function pair(
  motif: string,
  stage: string,
  first: readonly [column: number, row: number, layer: number],
  second: readonly [column: number, row: number, layer: number],
): readonly [MahjongTile, MahjongTile] {
  return [
    tile(`${stage}-${motif}-left`, motif, ...first),
    tile(`${stage}-${motif}-right`, motif, ...second),
  ];
}

export const boardFixtures = {
  'flat-introduction': {
    id: 'flat-introduction',
    tiles: [
      tile('lotus-left', 'lotus', 0, 0),
      tile('bamboo-left', 'bamboo', 1, 0),
      tile('bamboo-right', 'bamboo', 2, 0),
      tile('lotus-right', 'lotus', 3, 0),
    ],
  },
  'layered-introduction': {
    id: 'layered-introduction',
    tiles: [
      tile('lotus-left', 'lotus', 0, 0),
      tile('bamboo-left', 'bamboo', 1, 0),
      tile('bamboo-right', 'bamboo', 2, 0),
      tile('lotus-right', 'lotus', 3, 0),
      tile('crane-left', 'crane', 1, 0, 1),
      tile('crane-right', 'crane', 2, 0, 1),
    ],
  },
  'garden-one': {
    id: 'garden-one',
    tiles: [
      tile('lotus-left', 'lotus', 0, 0),
      tile('bamboo-left', 'bamboo', 1, 0),
      tile('bamboo-right', 'bamboo', 2, 0),
      tile('lotus-right', 'lotus', 3, 0),
      tile('sun-left', 'sun', 0, 1),
      tile('crane-left', 'crane', 1, 1),
      tile('crane-right', 'crane', 2, 1),
      tile('sun-right', 'sun', 3, 1),
      tile('gate-left', 'gate', 0, 2),
      tile('leaf-left', 'leaf', 1, 2),
      tile('leaf-right', 'leaf', 2, 2),
      tile('gate-right', 'gate', 3, 2),
      tile('moon-left', 'moon', 1, 1, 1),
      tile('moon-right', 'moon', 2, 1, 1),
    ],
  },
  'garden-two': {
    id: 'garden-two',
    tiles: [
      ...pair('lotus', 'base-row-one-outer', [0, 0, 0], [5, 0, 0]),
      ...pair('bamboo', 'base-row-one-middle', [1, 0, 0], [4, 0, 0]),
      ...pair('crane', 'base-row-one-inner', [2, 0, 0], [3, 0, 0]),
      ...pair('sun', 'base-row-two-outer', [0, 1, 0], [5, 1, 0]),
      ...pair('moon', 'base-row-two-middle', [1, 1, 0], [4, 1, 0]),
      ...pair('leaf', 'base-row-two-inner', [2, 1, 0], [3, 1, 0]),
      ...pair('gate', 'base-row-three-outer', [0, 2, 0], [5, 2, 0]),
      ...pair('water', 'base-row-three-middle', [1, 2, 0], [4, 2, 0]),
      ...pair('mountain', 'base-row-three-inner', [2, 2, 0], [3, 2, 0]),
      ...pair('sun', 'middle-row-one-outer', [1, 0, 1], [4, 0, 1]),
      ...pair('moon', 'middle-row-one-inner', [2, 0, 1], [3, 0, 1]),
      ...pair('leaf', 'middle-row-two-outer', [1, 1, 1], [4, 1, 1]),
      ...pair('gate', 'middle-row-two-inner', [2, 1, 1], [3, 1, 1]),
      ...pair('water', 'middle-row-three-outer', [1, 2, 1], [4, 2, 1]),
      ...pair('mountain', 'middle-row-three-inner', [2, 2, 1], [3, 2, 1]),
      ...pair('lotus', 'crown-row-one', [2, 0, 2], [3, 0, 2]),
      ...pair('bamboo', 'crown-row-two', [2, 1, 2], [3, 1, 2]),
      ...pair('crane', 'crown-row-three', [2, 2, 2], [3, 2, 2]),
    ],
  },
} as const satisfies Record<string, BoardFixture>;

export type BoardFixtureId = keyof typeof boardFixtures;

export function createFixtureState(fixtureId: BoardFixtureId, seed: string = fixtureId) {
  const fixture = boardFixtures[fixtureId];
  return createGameState({ levelId: fixture.id, seed, tiles: fixture.tiles });
}

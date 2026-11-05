import { createFixtureState } from '../fixtures';
import type { GameState, MahjongTile } from '../model';
import {
  applyMatch,
  canMatch,
  createGameState,
  findLegalPairs,
  getGameStatus,
  getHint,
  getTileBlockReason,
  restartGame,
  shuffleRemainingTiles,
  standardAvailabilityRule,
  undoLastMove,
} from '../rules';

function tile(id: string, group: string, column: number, layer = 0): MahjongTile {
  return {
    id,
    motif: group,
    matchingGroup: group,
    position: { column, row: 0, layer },
    removed: false,
  };
}

function createState(tiles: readonly MahjongTile[]): GameState {
  return createGameState({ levelId: 'test-level', seed: 'fixed-seed', tiles });
}

describe('prototype availability geometry', () => {
  it('reports the reason an unavailable tile cannot be selected', () => {
    const left = tile('left', 'a', 0);
    const middle = tile('middle', 'b', 1);
    const right = tile('right', 'a', 2);
    const covered = tile('covered', 'c', 4);
    const cover = tile('cover', 'd', 4, 1);

    expect(getTileBlockReason(middle, [left, middle, right])).toBe('sides-blocked');
    expect(getTileBlockReason(covered, [covered, cover])).toBe('covered');
    expect(getTileBlockReason({ ...left, removed: true }, [left, middle, right])).toBe('removed');
    expect(getTileBlockReason(left, [left, middle, right])).toBeNull();
  });

  it('opens either edge while blocking a tile enclosed on both sides', () => {
    const state = createState([
      tile('left', 'a', 0),
      tile('middle', 'b', 1),
      tile('right', 'a', 2),
    ]);

    expect(standardAvailabilityRule(state.tiles[0] as MahjongTile, state.tiles)).toBe(true);
    expect(standardAvailabilityRule(state.tiles[1] as MahjongTile, state.tiles)).toBe(false);
    expect(standardAvailabilityRule(state.tiles[2] as MahjongTile, state.tiles)).toBe(true);
  });

  it('blocks a tile covered by a higher layer', () => {
    const state = createState([tile('base', 'lotus', 0), tile('top', 'lotus', 0, 1)]);

    expect(standardAvailabilityRule(state.tiles[0] as MahjongTile, state.tiles)).toBe(false);
    expect(standardAvailabilityRule(state.tiles[1] as MahjongTile, state.tiles)).toBe(true);
  });

  it('detects covering and side contact on half-grid positions', () => {
    const base = tile('base', 'lotus', 0);
    const partialCover = {
      ...tile('partial-cover', 'sun', 0.5, 1),
      position: { column: 0.5, row: 0.5, layer: 1 },
    };
    const side = {
      ...tile('side', 'bamboo', 1),
      position: { column: 1, row: 0.5, layer: 0 },
    };

    expect(standardAvailabilityRule(base, [base, partialCover])).toBe(false);
    expect(standardAvailabilityRule(base, [base, side])).toBe(true);
  });
});

describe('matching and status', () => {
  it('accepts matching available tiles and rejects self-matches without mutation', () => {
    const state = createFixtureState('flat-introduction');

    expect(canMatch(state, 'lotus-left', 'lotus-right')).toBe(true);
    expect(applyMatch(state, 'lotus-left', 'lotus-left')).toBe(state);
  });

  it('returns legal pairs and a deterministic first hint', () => {
    const state = createFixtureState('flat-introduction');

    expect(findLegalPairs(state)).toEqual([
      { firstTileId: 'lotus-left', secondTileId: 'lotus-right' },
    ]);
    expect(getHint(state)).toEqual({
      firstTileId: 'lotus-left',
      secondTileId: 'lotus-right',
    });
  });

  it('distinguishes an active, stalled, and won board', () => {
    const active = createFixtureState('flat-introduction');
    const stalled = createState([tile('lotus', 'lotus', 0), tile('bamboo', 'bamboo', 1)]);
    const won = applyMatch(
      createState([tile('first', 'lotus', 0), tile('second', 'lotus', 1)]),
      'first',
      'second',
    );

    expect(getGameStatus(active)).toBe('in-progress');
    expect(getGameStatus(stalled)).toBe('stalled');
    expect(getGameStatus(won)).toBe('won');
  });

  it('solves the playable fixture through legal hints', () => {
    let state = createFixtureState('garden-one');

    while (getGameStatus(state) === 'in-progress') {
      const hint = getHint(state);
      expect(hint).toBeDefined();
      state = applyMatch(state, hint?.firstTileId ?? '', hint?.secondTileId ?? '');
    }

    expect(getGameStatus(state)).toBe('won');
    expect(state.history).toHaveLength(7);
  });

  it('solves the 36-tile garden through legal hints', () => {
    let state = createFixtureState('garden-two');

    while (getGameStatus(state) === 'in-progress') {
      const hint = getHint(state);
      expect(hint).toBeDefined();
      state = applyMatch(state, hint?.firstTileId ?? '', hint?.secondTileId ?? '');
    }

    expect(getGameStatus(state)).toBe('won');
    expect(state.history).toHaveLength(18);
  });
});

describe('session controls', () => {
  it('undoes the latest accepted match', () => {
    const initial = createFixtureState('flat-introduction');
    const matched = applyMatch(initial, 'lotus-left', 'lotus-right');
    const restored = undoLastMove(matched);

    expect(restored.tiles).toEqual(initial.tiles);
    expect(restored.history).toHaveLength(0);
  });

  it('shuffles remaining positions deterministically without changing tile identity', () => {
    const initial = createFixtureState('layered-introduction', 'repeatable-seed');
    const first = shuffleRemainingTiles(initial);
    const second = shuffleRemainingTiles(initial);

    expect(first).toEqual(second);
    expect(first.shuffleCount).toBe(1);
    expect(first.tiles.map((entry) => entry.id)).toEqual(initial.tiles.map((entry) => entry.id));
    expect(first.tiles.map((entry) => entry.matchingGroup)).toEqual(
      initial.tiles.map((entry) => entry.matchingGroup),
    );
    expect(first.tiles.map((entry) => entry.position)).not.toEqual(
      initial.tiles.map((entry) => entry.position),
    );
    expect(first.tiles.map((entry) => entry.position)).toEqual(
      expect.arrayContaining(initial.tiles.map((entry) => entry.position)),
    );
  });

  it('restarts from the immutable initial snapshot', () => {
    const initial = createFixtureState('flat-introduction');
    const played = shuffleRemainingTiles(applyMatch(initial, 'lotus-left', 'lotus-right'));
    const restarted = restartGame(played);

    expect(restarted.tiles).toEqual(initial.tiles);
    expect(restarted.history).toEqual([]);
    expect(restarted.shuffleCount).toBe(0);
  });
});

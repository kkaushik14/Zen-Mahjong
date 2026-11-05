import {
  canUseSpecialSlot,
  createConcentrationSession,
  deriveConcentrationStatus,
  executeConcentrationCommand,
} from '../concentration-engine';
import type { ConcentrationSessionV1 } from '../concentration-model';
import type { GameState, MahjongTile } from '../model';
import { createGameState } from '../rules';

function tile(id: string, matchingGroup: string, row: number): MahjongTile {
  return {
    id,
    matchingGroup,
    motif: matchingGroup,
    position: { column: 0, layer: 0, row },
    removed: false,
  };
}

function pairedGame(groups: readonly string[]): GameState {
  const tiles = groups.flatMap((group, index) => [
    tile(`${group}-one`, group, index * 2),
    tile(`${group}-two`, group, index * 2 + 1),
  ]);
  return createGameState({ levelId: 'concentration-test', seed: 'fixed-seed', tiles });
}

function session(
  category: ConcentrationSessionV1['category'] = 'normal',
  game: GameState = pairedGame(['lotus', 'bamboo', 'crane', 'sun']),
): ConcentrationSessionV1 {
  return createConcentrationSession({
    category,
    game,
    levelContentVersion: '0.3.0',
    levelNumber: 1,
    sessionId: 'session-1',
    startedAt: '2026-10-02T00:00:00.000Z',
  });
}

function select(current: ConcentrationSessionV1, tileId: string): ConcentrationSessionV1 {
  const result = executeConcentrationCommand(current, { tileId, type: 'select-board-tile' });
  expect(result.accepted).toBe(true);
  return result.session;
}

describe('v0.3.0 Concentration Tray', () => {
  it.each([
    ['normal', 2],
    ['high', 1],
    ['super', 0],
    ['special', 2],
  ] as const)('starts %s sessions with %i included special uses', (category, expected) => {
    expect(session(category).specialUsesRemaining).toBe(expected);
  });

  it('preserves insertion order and compacts after automatic pair resolution', () => {
    let current = session();
    current = select(current, 'lotus-one');
    current = select(current, 'bamboo-one');
    const result = executeConcentrationCommand(current, {
      tileId: 'lotus-two',
      type: 'select-board-tile',
    });

    expect(result.accepted).toBe(true);
    expect(result.session.regularTray).toEqual(['bamboo-one']);
    expect(result.events).toEqual([
      { tileId: 'lotus-two', trayIndex: 2, type: 'tile-inserted' },
      { firstTileId: 'lotus-one', secondTileId: 'lotus-two', type: 'pair-resolved' },
    ]);
  });

  it('wins only after the board and tray are both empty', () => {
    let current = session('normal', pairedGame(['lotus', 'bamboo']));
    current = select(current, 'lotus-one');
    current = select(current, 'lotus-two');
    current = select(current, 'bamboo-one');
    const result = executeConcentrationCommand(current, {
      tileId: 'bamboo-two',
      type: 'select-board-tile',
    });

    expect(result.session.status).toBe('won');
    expect(result.events).toContainEqual({ type: 'level-won' });
  });

  it('blocks a full tray when the special slot can recover it', () => {
    let current = session('normal');
    current = select(current, 'lotus-one');
    current = select(current, 'bamboo-one');
    current = select(current, 'crane-one');
    const result = executeConcentrationCommand(current, {
      tileId: 'sun-one',
      type: 'select-board-tile',
    });

    expect(result.session.regularTray).toEqual(['lotus-one', 'bamboo-one', 'crane-one', 'sun-one']);
    expect(result.session.status).toBe('blocked');
    expect(canUseSpecialSlot(result.session)).toBe(true);
    expect(result.events).toContainEqual({ type: 'session-blocked' });
  });

  it('fails a full tray when no special use is available', () => {
    let current = session('super');
    current = select(current, 'lotus-one');
    current = select(current, 'bamboo-one');
    current = select(current, 'crane-one');
    const result = executeConcentrationCommand(current, {
      tileId: 'sun-one',
      type: 'select-board-tile',
    });

    expect(result.session.status).toBe('failed');
    expect(result.events).toContainEqual({ type: 'session-failed' });
    expect(canUseSpecialSlot(result.session)).toBe(false);
  });

  it('uses the special slot to resolve a tray tile with an available board match', () => {
    let current = session('normal');
    current = select(current, 'lotus-one');
    current = select(current, 'bamboo-one');
    current = select(current, 'crane-one');
    current = select(current, 'sun-one');
    const result = executeConcentrationCommand(current, {
      trayTileId: 'bamboo-one',
      type: 'use-special-slot',
    });

    expect(result.accepted).toBe(true);
    expect(result.session.regularTray).toEqual(['lotus-one', 'crane-one', 'sun-one']);
    expect(result.session.game.tiles.find((entry) => entry.id === 'bamboo-two')?.removed).toBe(
      true,
    );
    expect(result.session.specialUsesRemaining).toBe(1);
    expect(result.session.status).toBe('active');
  });

  it('does not consume a special use when no matching board tile is available', () => {
    const unmatchedGame = createGameState({
      levelId: 'unmatched',
      seed: 'unmatched',
      tiles: [tile('lotus-only', 'lotus', 0), ...pairedGame(['bamboo']).tiles],
    });
    const selected = select(session('normal', unmatchedGame), 'lotus-only');
    const result = executeConcentrationCommand(selected, {
      trayTileId: 'lotus-only',
      type: 'use-special-slot',
    });

    expect(result).toMatchObject({ accepted: false, reason: 'no-special-match' });
    expect(result.session).toBe(selected);
    expect(result.session.specialUsesRemaining).toBe(2);
  });

  it('rejects special-slot use when the category includes no uses', () => {
    const selected = select(session('super'), 'lotus-one');
    const result = executeConcentrationCommand(selected, {
      trayTileId: 'lotus-one',
      type: 'use-special-slot',
    });

    expect(result).toMatchObject({ accepted: false, reason: 'no-special-use' });
    expect(result.session).toBe(selected);
  });

  it('rejects unavailable tiles and invalid special-slot requests without mutation', () => {
    const enclosedGame = createGameState({
      levelId: 'enclosed',
      seed: 'enclosed',
      tiles: [
        { ...tile('left', 'lotus', 0), position: { column: 0, layer: 0, row: 0 } },
        { ...tile('middle', 'bamboo', 0), position: { column: 1, layer: 0, row: 0 } },
        { ...tile('right', 'lotus', 0), position: { column: 2, layer: 0, row: 0 } },
      ],
    });
    const initial = session('normal', enclosedGame);
    const unavailable = executeConcentrationCommand(initial, {
      tileId: 'middle',
      type: 'select-board-tile',
    });
    const special = executeConcentrationCommand(initial, {
      trayTileId: 'missing',
      type: 'use-special-slot',
    });

    expect(unavailable).toMatchObject({ accepted: false, reason: 'tile-not-available' });
    expect(unavailable.session).toBe(initial);
    expect(special).toMatchObject({ accepted: false, reason: 'tile-not-in-tray' });
    expect(special.session).toBe(initial);
  });
});

describe('v0.3.0 Concentration recovery', () => {
  function failedSession(): ConcentrationSessionV1 {
    let current = session('super');
    current = select(current, 'lotus-one');
    current = select(current, 'bamboo-one');
    current = select(current, 'crane-one');
    return select(current, 'sun-one');
  }

  it('rejects an unaffordable revival and preserves the same session', () => {
    const current = failedSession();
    const result = executeConcentrationCommand(current, {
      availableConcentrationScore: 9,
      type: 'revive',
    });

    expect(result).toMatchObject({
      accepted: false,
      reason: 'insufficient-concentration-score',
      scoreCost: 0,
    });
    expect(result.session).toBe(current);
  });

  it('revives by returning unresolved tray tiles to the board', () => {
    const current = failedSession();
    const result = executeConcentrationCommand(current, {
      availableConcentrationScore: 10,
      type: 'revive',
    });

    expect(result.accepted).toBe(true);
    expect(result.scoreCost).toBe(10);
    expect(result.session.regularTray).toEqual([]);
    expect(result.session.revivalCount).toBe(1);
    expect(result.session.status).toBe('active');
    expect(
      result.session.game.tiles
        .filter((entry) => ['lotus-one', 'bamboo-one', 'crane-one', 'sun-one'].includes(entry.id))
        .every((entry) => !entry.removed),
    ).toBe(true);
  });

  it('revives from a completed advertisement without spending score', () => {
    const result = executeConcentrationCommand(failedSession(), {
      type: 'revive-with-advertisement',
    });

    expect(result.accepted).toBe(true);
    expect(result.scoreCost).toBe(0);
    expect(result.session.regularTray).toEqual([]);
    expect(result.session.revivalCount).toBe(1);
    expect(result.events).toContainEqual({
      revivalNumber: 1,
      scoreCost: 0,
      type: 'session-revived',
    });
  });

  it('advances to the second revival price within the same attempt', () => {
    const firstRevival = executeConcentrationCommand(failedSession(), {
      availableConcentrationScore: 10,
      type: 'revive',
    }).session;
    let failedAgain = select(firstRevival, 'lotus-one');
    failedAgain = select(failedAgain, 'bamboo-one');
    failedAgain = select(failedAgain, 'crane-one');
    failedAgain = select(failedAgain, 'sun-one');
    const result = executeConcentrationCommand(failedAgain, {
      availableConcentrationScore: 15,
      type: 'revive',
    });

    expect(result.accepted).toBe(true);
    expect(result.scoreCost).toBe(15);
    expect(result.session.revivalCount).toBe(2);
  });

  it('restarts the board, tray, revival counter, and included special uses', () => {
    const revived = executeConcentrationCommand(failedSession(), {
      availableConcentrationScore: 10,
      type: 'revive',
    }).session;
    const selected = select(revived, 'lotus-one');
    const result = executeConcentrationCommand(selected, { type: 'restart' });

    expect(result.accepted).toBe(true);
    expect(result.session.game.tiles).toEqual(result.session.game.initialTiles);
    expect(result.session.regularTray).toEqual([]);
    expect(result.session.revivalCount).toBe(0);
    expect(result.session.specialUsesRemaining).toBe(0);
    expect(result.session.status).toBe('active');
  });

  it('derives failure when neither board selection nor special recovery is possible', () => {
    const current = failedSession();
    expect(deriveConcentrationStatus(current)).toBe('failed');
  });
});

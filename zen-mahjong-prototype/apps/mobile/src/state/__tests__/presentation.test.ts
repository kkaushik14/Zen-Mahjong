import {
  createConcentrationSession,
  createFixtureState,
  executeConcentrationCommand,
} from '@zen-mahjong/game-engine';

import { toBoardTiles, toTrayTiles } from '../../features/gameplay/presentation';

jest.mock('@zen-mahjong/mahjong-ui', () => ({
  getTileMotif: (motif: string) => ({
    id: motif,
    label: motif.charAt(0).toUpperCase() + motif.slice(1),
  }),
}));

function session() {
  return createConcentrationSession({
    activeSince: null,
    category: 'normal',
    game: createFixtureState('flat-introduction', 'presentation-test'),
    levelContentVersion: '0.3.0-test',
    levelNumber: 1,
    sessionId: 'presentation-test',
    startedAt: '2026-10-02T00:00:00.000Z',
  });
}

describe('Concentration presentation mapping', () => {
  it('announces identity and availability without relying on color', () => {
    const tiles = toBoardTiles(session());

    expect(tiles.find((tile) => tile.id === 'lotus-left')).toMatchObject({
      accessibilityLabel: 'Lotus tile, available',
      state: 'available',
    });
    expect(tiles.find((tile) => tile.id === 'bamboo-left')).toMatchObject({
      accessibilityLabel: 'Bamboo tile, blocked on both sides',
      blockedReason: 'sides-blocked',
      state: 'blocked',
    });
  });

  it('preserves regular tray order and position-ready labels', () => {
    const selected = executeConcentrationCommand(session(), {
      tileId: 'lotus-left',
      type: 'select-board-tile',
    });

    expect(selected.accepted).toBe(true);
    expect(toTrayTiles(selected.session)).toEqual([
      { accessibilityLabel: 'Lotus tile', id: 'lotus-left', motif: 'lotus' },
    ]);
  });
});

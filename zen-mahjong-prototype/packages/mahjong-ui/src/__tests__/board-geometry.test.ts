import { calculateBoardLayout, type BoardGeometryTile } from '../board-geometry';

function createLayeredTiles(layerRows: readonly number[]): readonly BoardGeometryTile[] {
  return layerRows.flatMap((rowCount, layer) =>
    Array.from({ length: rowCount }, (_, row) =>
      Array.from({ length: 6 }, (_, column) => ({ column, layer, row })),
    ).flat(),
  );
}

describe('gameplay board geometry', () => {
  it.each([
    [328, 440, [4, 2]],
    [358, 482, [6, 4, 2]],
    [398, 570, [12, 8, 4]],
  ] as const)(
    'contains a layered board inside a %sx%s gameplay frame',
    (width, height, layerRows) => {
      const tiles = createLayeredTiles(layerRows);
      const layout = calculateBoardLayout(width, height, tiles);

      expect(tiles).toHaveLength(layerRows.reduce((total, rows) => total + rows * 6, 0));
      expect(layout.contentWidth).toBeLessThanOrEqual(width);
      expect(layout.contentHeight).toBeLessThanOrEqual(height);
      expect(layout.tileWidth).toBeGreaterThan(0);
      expect(layout.tileHeight).toBeGreaterThan(layout.tileWidth);
    },
  );

  it('keeps the same board deterministic and reduces tile size as density grows', () => {
    const compact = createLayeredTiles([4, 2]);
    const dense = createLayeredTiles([12, 8, 4]);

    expect(calculateBoardLayout(380, 553, compact)).toEqual(
      calculateBoardLayout(380, 553, compact),
    );
    expect(calculateBoardLayout(380, 553, dense).tileWidth).toBeLessThan(
      calculateBoardLayout(380, 553, compact).tileWidth,
    );
  });
});

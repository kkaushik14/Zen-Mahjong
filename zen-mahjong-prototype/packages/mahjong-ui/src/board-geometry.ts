export interface BoardGeometryTile {
  column: number;
  layer: number;
  row: number;
}

export interface BoardLayout {
  contentHeight: number;
  contentWidth: number;
  gap: number;
  layerOffset: number;
  originX: number;
  originY: number;
  tileHeight: number;
  tileWidth: number;
}

interface BoardBounds {
  columnMaximum: number;
  columnMinimum: number;
  layerMaximum: number;
  layerMinimum: number;
  rowMaximum: number;
  rowMinimum: number;
}

export function getBoardBounds(tiles: readonly BoardGeometryTile[]): BoardBounds {
  if (tiles.length === 0) {
    return {
      columnMaximum: 0,
      columnMinimum: 0,
      layerMaximum: 0,
      layerMinimum: 0,
      rowMaximum: 0,
      rowMinimum: 0,
    };
  }

  return {
    columnMaximum: Math.max(...tiles.map((tile) => tile.column)),
    columnMinimum: Math.min(...tiles.map((tile) => tile.column)),
    layerMaximum: Math.max(...tiles.map((tile) => tile.layer)),
    layerMinimum: Math.min(...tiles.map((tile) => tile.layer)),
    rowMaximum: Math.max(...tiles.map((tile) => tile.row)),
    rowMinimum: Math.min(...tiles.map((tile) => tile.row)),
  };
}

export function calculateBoardLayout(
  width: number,
  height: number,
  tiles: readonly BoardGeometryTile[],
): BoardLayout {
  const bounds = getBoardBounds(tiles);
  const columnSpan = bounds.columnMaximum - bounds.columnMinimum;
  const rowSpan = bounds.rowMaximum - bounds.rowMinimum;
  const layerSpan = bounds.layerMaximum - bounds.layerMinimum;
  const horizontalPadding = 16;
  const verticalPadding = 12;
  const gap = tiles.length > 72 ? 1 : tiles.length > 36 ? 2 : width < 380 ? 4 : 6;
  const widthUnits = columnSpan + 1 + layerSpan * 0.1;
  const heightUnits = (rowSpan + 1) / 0.72 + layerSpan * 0.1;
  const maximumByWidth = (width - horizontalPadding * 2 - columnSpan * gap) / widthUnits;
  const maximumByHeight = (height - verticalPadding * 2 - rowSpan * gap) / heightUnits;
  const tileWidth = Math.max(14, Math.min(64, maximumByWidth, maximumByHeight));
  const tileHeight = tileWidth / 0.72;
  const layerOffset = Math.max(4, Math.round(tileWidth * 0.1));
  const contentWidth = tileWidth + columnSpan * (tileWidth + gap) + layerSpan * layerOffset;
  const contentHeight = tileHeight + rowSpan * (tileHeight + gap) + layerSpan * layerOffset;

  return {
    contentHeight,
    contentWidth,
    gap,
    layerOffset,
    originX: Math.max(0, (width - contentWidth) / 2) - bounds.columnMinimum * (tileWidth + gap),
    originY:
      Math.max(layerOffset, (height - contentHeight) / 2 + layerSpan * layerOffset) -
      bounds.rowMinimum * (tileHeight + gap),
    tileHeight,
    tileWidth,
  };
}

import {
  hashSeed,
  tileCatalogueV030,
  validateLevelDefinitionAgainstCatalogue,
  type BoardSize,
  type LevelDefinitionV1,
  type TileCatalogueV1,
} from '@zen-mahjong/game-content';

import type { GameState, MahjongTile, TilePair, TilePosition } from './model';
import { applyMatch, canMatch, createGameState, isLevelComplete } from './rules';

export const BOARD_SOLUTION_EVIDENCE_SCHEMA_VERSION = 1 as const;

export interface BoardSolutionEvidenceV1 {
  contentVersion: string;
  levelNumber: number;
  schemaVersion: typeof BOARD_SOLUTION_EVIDENCE_SCHEMA_VERSION;
  seed: string;
  solutionId: string;
  steps: readonly TilePair[];
  tileCount: BoardSize;
}

export interface GeneratedLevelV1 {
  definition: LevelDefinitionV1;
  evidence: BoardSolutionEvidenceV1;
  initialState: GameState;
}

interface PairedDesigns {
  firstDesignId: string;
  matchIdentity: string;
  secondDesignId: string;
}

const ROW_WIDTHS_BY_LAYER: Readonly<Record<BoardSize, readonly (readonly number[])[]>> = {
  36: [
    [2, 4, 4, 4, 2],
    [2, 4, 4, 2],
    [2, 2, 2, 2],
  ],
  72: [
    [2, 4, 6, 8, 6, 4, 2],
    [2, 4, 6, 6, 4, 2],
    [2, 4, 4, 4, 2],
  ],
  144: [
    [4, 6, 8, 10, 12, 10, 8, 6, 4],
    [2, 4, 6, 8, 8, 6, 4, 2],
    [2, 4, 6, 6, 6, 6, 4, 2],
  ],
};

function pairDesigns(
  definition: LevelDefinitionV1,
  catalogue: TileCatalogueV1,
): readonly PairedDesigns[] {
  const designsById = new Map(catalogue.designs.map((design) => [design.designId, design]));
  const pendingByIdentity = new Map<string, string>();
  const pairs: PairedDesigns[] = [];

  for (const designId of definition.tileDesignIds) {
    const design = designsById.get(designId);
    if (!design) throw new RangeError(`Unknown tile design in level: ${designId}`);

    const pending = pendingByIdentity.get(design.matchIdentity);
    if (pending) {
      pairs.push({
        firstDesignId: pending,
        matchIdentity: design.matchIdentity,
        secondDesignId: designId,
      });
      pendingByIdentity.delete(design.matchIdentity);
    } else {
      pendingByIdentity.set(design.matchIdentity, designId);
    }
  }

  if (pendingByIdentity.size > 0) {
    throw new RangeError('Every match identity must have an even number of tile instances');
  }
  return pairs;
}

function createSolutionPositions(boardSize: BoardSize): readonly [TilePosition, TilePosition][] {
  const rowsByLayer = ROW_WIDTHS_BY_LAYER[boardSize];
  const maximumRows = rowsByLayer[0]?.length ?? 0;
  const maximumColumns = Math.max(...rowsByLayer.flat());
  const pairs: [TilePosition, TilePosition][] = [];

  for (let layer = rowsByLayer.length - 1; layer >= 0; layer -= 1) {
    const rows = rowsByLayer[layer];
    if (!rows) continue;
    const rowOffset = (maximumRows - rows.length) / 2;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rowOffset + rowIndex;
      const rowWidth = rows[rowIndex] ?? 0;
      const columnOffset = (maximumColumns - rowWidth) / 2;
      for (let inset = 0; inset < rowWidth / 2; inset += 1) {
        pairs.push([
          { column: columnOffset + inset, layer, row },
          { column: columnOffset + rowWidth - 1 - inset, layer, row },
        ]);
      }
    }
  }

  if (pairs.length * 2 !== boardSize) {
    throw new Error(`Layout produced ${pairs.length * 2} positions for a ${boardSize}-tile board`);
  }
  return pairs;
}

function solutionId(definition: LevelDefinitionV1, steps: readonly TilePair[]): string {
  const serialized = steps.map((step) => `${step.firstTileId}:${step.secondTileId}`).join('|');
  return `solution-${hashSeed(`${definition.contentVersion}:${definition.levelNumber}:${definition.seed}:${serialized}`).toString(16).padStart(8, '0')}`;
}

export function generateLevelBoard(
  definition: LevelDefinitionV1,
  catalogue: TileCatalogueV1 = tileCatalogueV030,
): GeneratedLevelV1 {
  if (!validateLevelDefinitionAgainstCatalogue(definition, catalogue)) {
    throw new RangeError(`Level ${definition.levelNumber} is invalid for its tile catalogue`);
  }

  const designs = pairDesigns(definition, catalogue);
  const positionPairs = createSolutionPositions(definition.boardSize);
  if (designs.length !== positionPairs.length) {
    throw new Error('Tile pair count does not match generated board geometry');
  }

  const tiles: MahjongTile[] = [];
  const steps: TilePair[] = [];
  designs.forEach((pair, pairIndex) => {
    const positions = positionPairs[pairIndex];
    if (!positions) throw new Error(`Missing positions for pair ${pairIndex}`);
    const firstTileId = `level-${definition.levelNumber}-tile-${pairIndex * 2 + 1}`;
    const secondTileId = `level-${definition.levelNumber}-tile-${pairIndex * 2 + 2}`;
    tiles.push(
      {
        id: firstTileId,
        matchingGroup: pair.matchIdentity,
        motif: pair.firstDesignId,
        position: positions[0],
        removed: false,
      },
      {
        id: secondTileId,
        matchingGroup: pair.matchIdentity,
        motif: pair.secondDesignId,
        position: positions[1],
        removed: false,
      },
    );
    steps.push({ firstTileId, secondTileId });
  });

  const initialState = createGameState({
    levelId: `level-${definition.levelNumber}`,
    seed: definition.seed,
    tiles,
  });
  const evidence: BoardSolutionEvidenceV1 = {
    contentVersion: definition.contentVersion,
    levelNumber: definition.levelNumber,
    schemaVersion: BOARD_SOLUTION_EVIDENCE_SCHEMA_VERSION,
    seed: definition.seed,
    solutionId: solutionId(definition, steps),
    steps,
    tileCount: definition.boardSize,
  };
  const generated = { definition, evidence, initialState };

  if (!validateGeneratedLevel(generated, catalogue)) {
    throw new Error(`Generated board for level ${definition.levelNumber} failed solution replay`);
  }
  return generated;
}

export function validateGeneratedLevel(
  generated: GeneratedLevelV1,
  catalogue: TileCatalogueV1 = tileCatalogueV030,
): boolean {
  const { definition, evidence, initialState } = generated;
  if (!validateLevelDefinitionAgainstCatalogue(definition, catalogue)) return false;
  if (
    evidence.schemaVersion !== BOARD_SOLUTION_EVIDENCE_SCHEMA_VERSION ||
    evidence.contentVersion !== definition.contentVersion ||
    evidence.levelNumber !== definition.levelNumber ||
    evidence.seed !== definition.seed ||
    evidence.tileCount !== definition.boardSize ||
    evidence.steps.length * 2 !== definition.boardSize ||
    initialState.tiles.length !== definition.boardSize ||
    initialState.levelId !== `level-${definition.levelNumber}` ||
    initialState.seed !== definition.seed ||
    initialState.history.length !== 0 ||
    initialState.shuffleCount !== 0 ||
    evidence.solutionId !== solutionId(definition, evidence.steps)
  ) {
    return false;
  }

  const expectedDesignIds = [...definition.tileDesignIds].sort();
  const actualDesignIds = initialState.tiles.map((tile) => tile.motif).sort();
  if (JSON.stringify(actualDesignIds) !== JSON.stringify(expectedDesignIds)) return false;

  const designsById = new Map(catalogue.designs.map((design) => [design.designId, design]));
  if (
    initialState.tiles.some(
      (tile) => designsById.get(tile.motif)?.matchIdentity !== tile.matchingGroup,
    )
  ) {
    return false;
  }

  let state = initialState;
  for (const step of evidence.steps) {
    if (!canMatch(state, step.firstTileId, step.secondTileId)) return false;
    state = applyMatch(state, step.firstTileId, step.secondTileId);
  }
  return isLevelComplete(state);
}

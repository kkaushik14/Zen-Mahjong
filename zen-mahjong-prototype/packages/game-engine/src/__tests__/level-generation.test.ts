import {
  createLevelDefinition,
  createTierDefinitions,
  tileCatalogueV030,
  type TileCatalogueV1,
  type TileDesign,
} from '@zen-mahjong/game-content';

import { createConcentrationSession, executeConcentrationCommand } from '../concentration-engine';
import { generateLevelBoard, validateGeneratedLevel } from '../level-generation';

function specialDesign(index: number): TileDesign {
  const designId = `special-${index}`;
  return {
    accessibilityLabel: `Special tile ${index}`,
    colorIndependentMarker: `special marker ${index}`,
    compactMotifAsset: `component:${designId}`,
    contentVersion: '0.3.0',
    designId,
    displayName: `Special ${index}`,
    eligibleCategories: ['special'],
    familyId: 'special',
    introducedAtLevel: 7,
    kind: 'special',
    matchIdentity: designId,
    motifAsset: `component:${designId}`,
    releaseRole: 'special',
    similarityGroup: null,
    status: 'approved',
    visualTags: ['special'],
  };
}

describe('v0.3.0 generated level boards', () => {
  it.each([36, 72, 144] as const)(
    'replays validated solution evidence for a %i-tile board',
    (boardSize) => {
      const definition = createLevelDefinition({
        boardSize,
        levelNumber: 1,
        seed: `board-${boardSize}`,
      });
      const generated = generateLevelBoard(definition);

      expect(generated.initialState.tiles).toHaveLength(boardSize);
      expect(generated.evidence.steps).toHaveLength(boardSize / 2);
      expect(validateGeneratedLevel(generated)).toBe(true);
    },
  );

  it('produces identical content, geometry, and evidence from the same inputs', () => {
    const input = { boardSize: 72 as const, levelNumber: 4, seed: 'repeatable-level' };
    const first = generateLevelBoard(createLevelDefinition(input));
    const second = generateLevelBoard(createLevelDefinition(input));

    expect(first).toEqual(second);
  });

  it('rejects tampered solution evidence', () => {
    const generated = generateLevelBoard(
      createLevelDefinition({ boardSize: 36, levelNumber: 2, seed: 'tamper-check' }),
    );
    const [first, second, ...remaining] = generated.evidence.steps;
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    expect(
      validateGeneratedLevel({
        ...generated,
        evidence: {
          ...generated.evidence,
          steps:
            second && first
              ? [{ ...first, secondTileId: second.firstTileId }, second, ...remaining]
              : [],
        },
      }),
    ).toBe(false);
  });

  it('supports approved special content without adding placeholders to production data', () => {
    const catalogue: TileCatalogueV1 = {
      ...tileCatalogueV030,
      designs: [
        ...tileCatalogueV030.designs,
        ...Array.from({ length: 8 }, (_, index) => specialDesign(index + 1)),
      ],
    };
    const definition = createLevelDefinition({
      boardSize: 36,
      catalogue,
      levelNumber: 7,
      seed: 'special-level',
    });

    expect(definition.difficultyContract.specialDesignCount).toBe(4);
    expect(validateGeneratedLevel(generateLevelBoard(definition, catalogue), catalogue)).toBe(true);
  });

  it('generates and validates every board in a complete eight-level tier', () => {
    const catalogue: TileCatalogueV1 = {
      ...tileCatalogueV030,
      designs: [
        ...tileCatalogueV030.designs,
        ...Array.from({ length: 8 }, (_, index) => specialDesign(index + 1)),
      ],
    };
    const definitions = createTierDefinitions({
      boardSizes: [36, 36, 36, 36, 72, 72, 144, 144],
      catalogue,
      seed: 'complete-tier',
      tierNumber: 1,
    });

    expect(
      definitions.every((definition) =>
        validateGeneratedLevel(generateLevelBoard(definition, catalogue), catalogue),
      ),
    ).toBe(true);
  });

  it('plays generated solution evidence through the Concentration Tray to completion', () => {
    const definition = createLevelDefinition({
      boardSize: 36,
      levelNumber: 1,
      seed: 'concentration-replay',
    });
    const generated = generateLevelBoard(definition);
    let current = createConcentrationSession({
      category: definition.category,
      game: generated.initialState,
      levelContentVersion: definition.contentVersion,
      levelNumber: definition.levelNumber,
      sessionId: 'generated-session',
      startedAt: '2026-10-02T00:00:00.000Z',
    });

    for (const step of generated.evidence.steps) {
      const first = executeConcentrationCommand(current, {
        tileId: step.firstTileId,
        type: 'select-board-tile',
      });
      expect(first.accepted).toBe(true);
      const second = executeConcentrationCommand(first.session, {
        tileId: step.secondTileId,
        type: 'select-board-tile',
      });
      expect(second.accepted).toBe(true);
      current = second.session;
    }

    expect(current.status).toBe('won');
    expect(current.regularTray).toEqual([]);
  });
});

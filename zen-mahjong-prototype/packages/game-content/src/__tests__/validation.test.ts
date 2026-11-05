import { validateLevelDefinition, validateTileCatalogue } from '../validation';

const tileDesign = {
  accessibilityLabel: 'Apple tile',
  colorIndependentMarker: 'apple-shape',
  compactMotifAsset: 'tiles/apple-compact',
  contentVersion: '0.3.0',
  designId: 'fruit.apple',
  displayName: 'Apple',
  eligibleCategories: ['normal', 'high', 'super', 'special'],
  familyId: 'fruit',
  introducedAtLevel: 1,
  kind: 'regular',
  matchIdentity: 'fruit.apple',
  motifAsset: 'tiles/apple',
  releaseRole: 'regular',
  similarityGroup: null,
  status: 'approved',
  visualTags: ['fruit', 'red'],
} as const;

describe('v0.3.0 content validation', () => {
  it('accepts a versioned catalogue and rejects duplicate stable IDs', () => {
    expect(
      validateTileCatalogue({
        contentVersion: '0.3.0',
        designs: [tileDesign],
        schemaVersion: 1,
      }),
    ).toBe(true);

    expect(
      validateTileCatalogue({
        contentVersion: '0.3.0',
        designs: [tileDesign, tileDesign],
        schemaVersion: 1,
      }),
    ).toBe(false);
  });

  it('requires declared board size and tile count to agree', () => {
    const valid = {
      assistRequirement: null,
      boardSize: 36,
      category: 'normal',
      contentVersion: '0.3.0',
      difficultyContract: {
        categoryLevel: 1,
        guarantee: 'validated-solution',
        regularDesignCount: 1,
        specialDesignCount: 0,
        tierNumber: 1,
      },
      levelNumber: 1,
      schemaVersion: 1,
      seed: 'tier-1-level-1',
      tileDesignIds: Array.from({ length: 36 }, () => tileDesign.designId),
    };

    expect(validateLevelDefinition(valid)).toBe(true);
    expect(validateLevelDefinition({ ...valid, tileDesignIds: valid.tileDesignIds.slice(1) })).toBe(
      false,
    );
  });
});

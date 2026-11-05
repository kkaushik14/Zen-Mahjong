import { tileCatalogueV030 } from '../catalogue';
import { createLevelDefinition, createTierDefinitions } from '../level-generation';
import type { TileCatalogueV1, TileDesign } from '../model';
import { validateLevelDefinitionAgainstCatalogue } from '../level-generation';

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

function catalogueWithSpecials(): TileCatalogueV1 {
  return {
    ...tileCatalogueV030,
    designs: [
      ...tileCatalogueV030.designs,
      ...Array.from({ length: 8 }, (_, index) => specialDesign(index + 1)),
    ],
  };
}

describe('v0.3.0 level definition generation', () => {
  it('is deterministic and produces complete pairs from approved content', () => {
    const input = { boardSize: 36 as const, levelNumber: 1, seed: 'tier-one-normal-one' };
    const first = createLevelDefinition(input);
    const second = createLevelDefinition(input);

    expect(first).toEqual(second);
    expect(first.category).toBe('normal');
    expect(first.difficultyContract).toEqual({
      categoryLevel: 1,
      guarantee: 'validated-solution',
      regularDesignCount: 4,
      specialDesignCount: 0,
      tierNumber: 1,
    });
    expect(validateLevelDefinitionAgainstCatalogue(first)).toBe(true);
  });

  it('removes an unavailable requested assist from an offline contract', () => {
    const unavailable = createLevelDefinition({
      boardSize: 36,
      levelNumber: 5,
      requestedAssistRequirement: { assist: 'shuffle', quantity: 1 },
      seed: 'offline-without-assists',
    });
    const available = createLevelDefinition({
      availableAssists: ['shuffle'],
      boardSize: 36,
      levelNumber: 5,
      requestedAssistRequirement: { assist: 'shuffle', quantity: 1 },
      seed: 'offline-with-shuffle',
    });

    expect(unavailable.assistRequirement).toBeNull();
    expect(available.assistRequirement).toEqual({ assist: 'shuffle', quantity: 1 });
  });

  it('gates Special Concentration until four approved special designs exist', () => {
    expect(() =>
      createLevelDefinition({ boardSize: 36, levelNumber: 7, seed: 'special-not-approved' }),
    ).toThrow('requires 4 eligible designs');
  });

  it('builds one complete tier with explicit board sizes and category order', () => {
    const definitions = createTierDefinitions({
      boardSizes: [36, 36, 36, 36, 72, 72, 72, 72],
      catalogue: catalogueWithSpecials(),
      seed: 'tier-one',
      tierNumber: 1,
    });

    expect(definitions.map((definition) => definition.levelNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    expect(definitions.map((definition) => definition.category)).toEqual([
      'normal',
      'normal',
      'high',
      'high',
      'super',
      'super',
      'special',
      'special',
    ]);
    const firstSpecialIds = new Set(
      definitions[6]?.tileDesignIds.filter((id) => id.startsWith('special-')),
    );
    const secondSpecialIds = new Set(
      definitions[7]?.tileDesignIds.filter((id) => id.startsWith('special-')),
    );
    expect(firstSpecialIds).toHaveProperty('size', 4);
    expect(secondSpecialIds).toHaveProperty('size', 4);
    expect(firstSpecialIds).not.toEqual(secondSpecialIds);
    expect(
      definitions.every((definition) =>
        validateLevelDefinitionAgainstCatalogue(definition, catalogueWithSpecials()),
      ),
    ).toBe(true);
  });
});

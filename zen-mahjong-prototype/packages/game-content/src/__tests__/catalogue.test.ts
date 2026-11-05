import {
  classifyTileDesigns,
  getTileDesign,
  regularTileDesigns,
  reserveEventTileDesigns,
  requireTileDesign,
  specialTileDesigns,
  tileCatalogueV030,
} from '../catalogue';
import type { TileCatalogueV1, TileDesign } from '../model';
import { selectSpecialTileDesigns } from '../special-selection';
import { validateTileCatalogue } from '../validation';

function specialDesign(index: number): TileDesign {
  const id = `special-${index}`;
  return {
    accessibilityLabel: `Special tile ${index}`,
    colorIndependentMarker: `special marker ${index}`,
    compactMotifAsset: `component:${id}`,
    contentVersion: '0.3.0',
    designId: id,
    displayName: `Special ${index}`,
    eligibleCategories: ['special'],
    familyId: 'special',
    introducedAtLevel: 7,
    kind: 'special',
    matchIdentity: id,
    motifAsset: `component:${id}`,
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
      ...regularTileDesigns,
      ...Array.from({ length: 8 }, (_, index) => specialDesign(index)),
    ],
  };
}

describe('v0.3.0 tile catalogue', () => {
  it('provides the complete classified catalogue with stable matching identities', () => {
    expect(validateTileCatalogue(tileCatalogueV030)).toBe(true);
    expect(tileCatalogueV030.designs).toHaveLength(50);
    expect(regularTileDesigns).toHaveLength(36);
    expect(specialTileDesigns).toHaveLength(8);
    expect(reserveEventTileDesigns).toHaveLength(6);
    expect(new Set(tileCatalogueV030.designs.map((design) => design.designId))).toHaveProperty(
      'size',
      50,
    );
    expect(getTileDesign('lotus')?.matchIdentity).toBe('lotus');
    expect(getTileDesign('gate')?.designId).toBe('garden-gate');
    expect(getTileDesign('unknown')).toBeUndefined();
  });

  it('classifies catalogue identities without treating visual similarity as a match', () => {
    expect(classifyTileDesigns('lotus', 'lotus')).toBe('same');
    expect(classifyTileDesigns('gate', 'garden-gate')).toBe('same');
    expect(classifyTileDesigns('rock-stone', 'zen-stone-arrangement')).toBe('similar');
    expect(classifyTileDesigns('lotus', 'leaf')).toBe('different');
    expect(() => requireTileDesign('unknown')).toThrow(RangeError);
  });

  it('keeps reserve/event designs draft and outside release generation', () => {
    expect(reserveEventTileDesigns.every((design) => design.status === 'draft')).toBe(true);
    expect(
      tileCatalogueV030.designs.every(
        (design) =>
          design.compactMotifAsset.length > 0 &&
          design.motifAsset.length > 0 &&
          design.matchIdentity === design.designId,
      ),
    ).toBe(true);
  });

  it('selects four special designs deterministically', () => {
    const catalogue = catalogueWithSpecials();
    const input = { levelNumber: 15, seed: 'tier-two-special-one' };

    const first = selectSpecialTileDesigns(catalogue, input);
    const second = selectSpecialTileDesigns(catalogue, input);

    expect(first).toEqual(second);
    expect(first).toHaveLength(4);
    expect(new Set(first)).toHaveProperty('size', 4);
  });

  it('avoids repeating the exact previous combination when alternatives exist', () => {
    const catalogue = catalogueWithSpecials();
    const input = { levelNumber: 15, seed: 'tier-two-special-two' };
    const previousDesignIds = selectSpecialTileDesigns(catalogue, input);
    const next = selectSpecialTileDesigns(catalogue, { ...input, previousDesignIds });

    expect(new Set(next)).not.toEqual(new Set(previousDesignIds));
    expect(next).toHaveLength(4);
  });

  it('rejects selection before enough special designs are introduced', () => {
    expect(() =>
      selectSpecialTileDesigns(catalogueWithSpecials(), { levelNumber: 6, seed: 'too-early' }),
    ).toThrow(RangeError);
  });
});

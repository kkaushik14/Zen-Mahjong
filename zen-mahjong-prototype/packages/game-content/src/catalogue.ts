import { catalogueData } from './catalogue.v0.3.0.full';
import type { TileCatalogueV1, TileDesign } from './model';
import { validateTileCatalogue } from './validation';

if (!validateTileCatalogue(catalogueData)) {
  throw new Error('Invalid bundled v0.3.0 tile catalogue');
}

export const tileCatalogueV030: TileCatalogueV1 = catalogueData;
export const regularTileDesigns: readonly TileDesign[] = tileCatalogueV030.designs.filter(
  (design) => design.releaseRole === 'regular',
);
export const specialTileDesigns: readonly TileDesign[] = tileCatalogueV030.designs.filter(
  (design) => design.releaseRole === 'special',
);
export const reserveEventTileDesigns: readonly TileDesign[] = tileCatalogueV030.designs.filter(
  (design) => design.releaseRole === 'reserve-event',
);
export const releaseActiveTileDesigns: readonly TileDesign[] = tileCatalogueV030.designs.filter(
  (design) => design.releaseRole !== 'reserve-event' && design.status === 'approved',
);

const designsById = new Map(
  tileCatalogueV030.designs.flatMap((design) => [
    [design.designId, design] as const,
    ...(design.legacyDesignIds ?? []).map((id) => [id, design] as const),
  ]),
);

export function resolveTileDesignId(designId: string): string | undefined {
  return designsById.get(designId)?.designId;
}

export function getTileDesign(designId: string): TileDesign | undefined {
  return designsById.get(designId);
}

export function requireTileDesign(designId: string): TileDesign {
  const design = getTileDesign(designId);
  if (!design) throw new RangeError(`Unknown tile design: ${designId}`);
  return design;
}

export type TileDesignRelationship = 'different' | 'same' | 'similar';

export function classifyTileDesigns(
  firstDesignId: string,
  secondDesignId: string,
): TileDesignRelationship {
  const first = requireTileDesign(firstDesignId);
  const second = requireTileDesign(secondDesignId);

  if (first.matchIdentity === second.matchIdentity) return 'same';
  if (first.similarityGroup && first.similarityGroup === second.similarityGroup) return 'similar';
  return 'different';
}

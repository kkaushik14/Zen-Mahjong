import { tileArtworkSources } from './tile-artwork.generated';

export function getTileArtworkSource(artworkId: string) {
  return tileArtworkSources[artworkId];
}

export const tileArtworkIds = Object.freeze(Object.keys(tileArtworkSources));

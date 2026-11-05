import { moonlitAssetSources, type MoonlitAssetId } from './moonlit-assets.generated';

export function getMoonlitAssetSource(assetId: MoonlitAssetId) {
  return moonlitAssetSources[assetId];
}

export { moonlitAssetSources };
export type { MoonlitAssetId };

import { Image, type ImageRef } from 'expo-image';

export type RuntimeAssetId =
  | 'background.coolGarden'
  | 'background.gameplayAutumn'
  | 'background.loadingSage'
  | 'background.moonlitGarden';

export interface SourceCrop {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface RuntimeAssetRecord {
  aspectRatio: number;
  crop: SourceCrop | null;
  figmaNodeId: string;
  height: number;
  id: RuntimeAssetId;
  readiness: 'runtime-ready';
  source: number;
  sourceHash: string;
  width: number;
}

export const runtimeAssets: Record<RuntimeAssetId, RuntimeAssetRecord> = {
  'background.moonlitGarden': {
    id: 'background.moonlitGarden',
    figmaNodeId: '70:18517',
    sourceHash: 'a8fba51984c7ccdb4129747462a04dc4d72ea0a9',
    crop: null,
    width: 941,
    height: 1672,
    aspectRatio: 941 / 1672,
    readiness: 'runtime-ready',
    source: require('../../assets/artwork/backgrounds/moonlit-garden.png'),
  },
  'background.gameplayAutumn': {
    id: 'background.gameplayAutumn',
    figmaNodeId: '55:16434',
    sourceHash: 'dfd385e3da0bf0fadb08174211375d6261de1a52',
    crop: { x: 58, y: 33, width: 141, height: 305 },
    width: 141,
    height: 305,
    aspectRatio: 141 / 305,
    readiness: 'runtime-ready',
    source: require('../../assets/artwork/backgrounds/gameplay-autumn.png'),
  },
  'background.coolGarden': {
    id: 'background.coolGarden',
    figmaNodeId: '55:16436',
    sourceHash: 'dfd385e3da0bf0fadb08174211375d6261de1a52',
    crop: { x: 286, y: 33, width: 141, height: 305 },
    width: 141,
    height: 305,
    aspectRatio: 141 / 305,
    readiness: 'runtime-ready',
    source: require('../../assets/artwork/backgrounds/cool-garden.png'),
  },
  'background.loadingSage': {
    id: 'background.loadingSage',
    figmaNodeId: '55:16438',
    sourceHash: 'dfd385e3da0bf0fadb08174211375d6261de1a52',
    crop: { x: 492, y: 33, width: 141, height: 305 },
    width: 141,
    height: 305,
    aspectRatio: 141 / 305,
    readiness: 'runtime-ready',
    source: require('../../assets/artwork/backgrounds/loading-sage.png'),
  },
};

export const criticalRuntimeAssetIds = [
  'background.moonlitGarden',
  'background.gameplayAutumn',
  'background.loadingSage',
] as const satisfies readonly RuntimeAssetId[];

let criticalImageRefs: ImageRef[] = [];
let criticalPreload: Promise<void> | null = null;

export function preloadCriticalRuntimeAssets(): Promise<void> {
  criticalPreload ??= Promise.all(
    criticalRuntimeAssetIds.map((id) => Image.loadAsync(runtimeAssets[id].source)),
  ).then((imageRefs) => {
    criticalImageRefs = imageRefs;
  });

  return criticalPreload;
}

export function getPreloadedRuntimeAssetCount(): number {
  return criticalImageRefs.length;
}

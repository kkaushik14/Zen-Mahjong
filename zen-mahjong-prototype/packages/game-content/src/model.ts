export const GAME_CONTENT_SCHEMA_VERSION = 1 as const;

export type ConcentrationCategory = 'normal' | 'high' | 'super' | 'special';

export type BoardSize = 36 | 72 | 144;
export type TileKind = 'regular' | 'special';
export type TileDesignStatus = 'draft' | 'approved' | 'retired';
export type TileReleaseRole = 'regular' | 'reserve-event' | 'special';
export type RequiredAssist = 'hint' | 'shuffle' | 'undo' | 'special-slot';

export interface TileDesign {
  accessibilityLabel: string;
  colorIndependentMarker: string;
  compactMotifAsset: string;
  contentVersion: string;
  designId: string;
  displayName: string;
  eligibleCategories: readonly ConcentrationCategory[];
  familyId: string;
  introducedAtLevel: number;
  kind: TileKind;
  legacyDesignIds?: readonly string[];
  matchIdentity: string;
  motifAsset: string;
  releaseRole: TileReleaseRole;
  similarityGroup: string | null;
  status: TileDesignStatus;
  visualTags: readonly string[];
}

export interface TileCatalogueV1 {
  contentVersion: string;
  designs: readonly TileDesign[];
  schemaVersion: typeof GAME_CONTENT_SCHEMA_VERSION;
}

export interface AssistRequirement {
  assist: RequiredAssist;
  quantity: number;
}

export interface DifficultyContractV1 {
  categoryLevel: 1 | 2;
  guarantee: 'validated-solution';
  regularDesignCount: number;
  specialDesignCount: number;
  tierNumber: number;
}

export interface LevelDefinitionV1 {
  assistRequirement: AssistRequirement | null;
  boardSize: BoardSize;
  category: ConcentrationCategory;
  contentVersion: string;
  difficultyContract: DifficultyContractV1;
  levelNumber: number;
  schemaVersion: typeof GAME_CONTENT_SCHEMA_VERSION;
  seed: string;
  tileDesignIds: readonly string[];
}

export interface TierPosition {
  category: ConcentrationCategory;
  categoryLevel: 1 | 2;
  levelInTier: number;
  levelNumber: number;
  tierNumber: number;
}

import {
  GAME_CONTENT_SCHEMA_VERSION,
  type AssistRequirement,
  type ConcentrationCategory,
  type DifficultyContractV1,
  type LevelDefinitionV1,
  type TileCatalogueV1,
  type TileDesign,
} from './model';

const CATEGORIES: readonly ConcentrationCategory[] = ['normal', 'high', 'super', 'special'];
const BOARD_SIZES = [36, 72, 144] as const;
const ASSISTS = ['hint', 'shuffle', 'undo', 'special-slot'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isCategory(value: unknown): value is ConcentrationCategory {
  return CATEGORIES.some((category) => category === value);
}

function isCategoryArray(value: unknown): value is readonly ConcentrationCategory[] {
  return Array.isArray(value) && value.length > 0 && value.every(isCategory);
}

function isTileDesign(value: unknown): value is TileDesign {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.accessibilityLabel) &&
    isNonEmptyString(value.colorIndependentMarker) &&
    isNonEmptyString(value.compactMotifAsset) &&
    isNonEmptyString(value.contentVersion) &&
    isNonEmptyString(value.designId) &&
    isNonEmptyString(value.displayName) &&
    isCategoryArray(value.eligibleCategories) &&
    isNonEmptyString(value.familyId) &&
    Number.isInteger(value.introducedAtLevel) &&
    Number(value.introducedAtLevel) >= 1 &&
    (value.kind === 'regular' || value.kind === 'special') &&
    (value.legacyDesignIds === undefined || isStringArray(value.legacyDesignIds)) &&
    isNonEmptyString(value.matchIdentity) &&
    isNonEmptyString(value.motifAsset) &&
    (value.releaseRole === 'regular' ||
      value.releaseRole === 'special' ||
      value.releaseRole === 'reserve-event') &&
    (value.similarityGroup === null || isNonEmptyString(value.similarityGroup)) &&
    (value.status === 'draft' || value.status === 'approved' || value.status === 'retired') &&
    isStringArray(value.visualTags)
  );
}

function isAssistRequirement(value: unknown): value is AssistRequirement {
  if (!isRecord(value)) return false;
  return (
    ASSISTS.some((assist) => assist === value.assist) &&
    Number.isInteger(value.quantity) &&
    Number(value.quantity) > 0
  );
}

function isDifficultyContract(value: unknown): value is DifficultyContractV1 {
  if (!isRecord(value)) return false;
  return (
    (value.categoryLevel === 1 || value.categoryLevel === 2) &&
    value.guarantee === 'validated-solution' &&
    Number.isInteger(value.regularDesignCount) &&
    Number(value.regularDesignCount) > 0 &&
    Number.isInteger(value.specialDesignCount) &&
    Number(value.specialDesignCount) >= 0 &&
    Number.isInteger(value.tierNumber) &&
    Number(value.tierNumber) >= 1
  );
}

export function validateTileCatalogue(value: unknown): value is TileCatalogueV1 {
  if (!isRecord(value)) return false;
  if (
    value.schemaVersion !== GAME_CONTENT_SCHEMA_VERSION ||
    !isNonEmptyString(value.contentVersion) ||
    !Array.isArray(value.designs) ||
    !value.designs.every(isTileDesign)
  ) {
    return false;
  }

  const ids = value.designs.flatMap((design) => [
    design.designId,
    ...(design.legacyDesignIds ?? []),
  ]);
  return new Set(ids).size === ids.length;
}

export function validateLevelDefinition(value: unknown): value is LevelDefinitionV1 {
  if (!isRecord(value)) return false;
  if (
    value.schemaVersion !== GAME_CONTENT_SCHEMA_VERSION ||
    !BOARD_SIZES.some((size) => size === value.boardSize) ||
    !isCategory(value.category) ||
    !isNonEmptyString(value.contentVersion) ||
    !isDifficultyContract(value.difficultyContract) ||
    !Number.isInteger(value.levelNumber) ||
    Number(value.levelNumber) < 1 ||
    !isNonEmptyString(value.seed) ||
    !isStringArray(value.tileDesignIds) ||
    value.tileDesignIds.length !== value.boardSize
  ) {
    return false;
  }

  if (value.assistRequirement !== null && !isAssistRequirement(value.assistRequirement)) {
    return false;
  }

  const expectedTier = Math.floor((Number(value.levelNumber) - 1) / 8) + 1;
  const expectedLevelInTier = ((Number(value.levelNumber) - 1) % 8) + 1;
  const expectedCategoryLevel = ((expectedLevelInTier - 1) % 2) + 1;
  const expectedCategory = CATEGORIES[Math.floor((expectedLevelInTier - 1) / 2)];
  return (
    value.difficultyContract.tierNumber === expectedTier &&
    value.difficultyContract.categoryLevel === expectedCategoryLevel &&
    value.category === expectedCategory
  );
}

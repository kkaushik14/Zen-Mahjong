import { resolveTileDesignId, tileCatalogueV030 } from './catalogue';
import type {
  AssistRequirement,
  BoardSize,
  LevelDefinitionV1,
  RequiredAssist,
  TileCatalogueV1,
  TileDesign,
} from './model';
import { getTierPosition } from './progression';
import { createSeededRandom, shuffleSeeded } from './random';
import { selectSpecialTileDesigns } from './special-selection';
import { validateLevelDefinition } from './validation';

const REGULAR_VARIETY = {
  high: [6, 7],
  normal: [4, 5],
  special: [9, 9],
  super: [8, 9],
} as const;

export interface LevelGenerationInput {
  availableAssists?: readonly RequiredAssist[];
  boardSize: BoardSize;
  catalogue?: TileCatalogueV1;
  levelNumber: number;
  previousSpecialDesignIds?: readonly string[];
  requestedAssistRequirement?: AssistRequirement | null;
  seed: string;
}

export interface TierGenerationInput {
  availableAssists?: readonly RequiredAssist[];
  boardSizes: readonly [
    BoardSize,
    BoardSize,
    BoardSize,
    BoardSize,
    BoardSize,
    BoardSize,
    BoardSize,
    BoardSize,
  ];
  catalogue?: TileCatalogueV1;
  requestedAssistRequirements?: readonly (AssistRequirement | null)[];
  seed: string;
  tierNumber: number;
}

function eligibleDesigns(
  catalogue: TileCatalogueV1,
  levelNumber: number,
  kind: TileDesign['kind'],
): readonly TileDesign[] {
  const category = getTierPosition(levelNumber).category;
  return catalogue.designs
    .filter(
      (design) =>
        design.kind === kind &&
        design.releaseRole === kind &&
        design.status === 'approved' &&
        design.introducedAtLevel <= levelNumber &&
        design.eligibleCategories.includes(category),
    )
    .sort((first, second) => first.designId.localeCompare(second.designId));
}

function resolveAssistRequirement(
  requested: AssistRequirement | null | undefined,
  availableAssists: readonly RequiredAssist[],
): AssistRequirement | null {
  if (!requested) return null;
  return availableAssists.includes(requested.assist) ? requested : null;
}

function buildPairSequence(
  pool: readonly string[],
  required: readonly string[],
  pairCount: number,
  seed: string,
): readonly string[] {
  if (pool.length === 0) throw new RangeError('Level generation requires an eligible tile pool');
  if (required.length > pairCount) {
    throw new RangeError('Board is too small for its required tile designs');
  }

  const random = createSeededRandom(seed);
  const pairDesigns = [...required];
  while (pairDesigns.length < pairCount) {
    const designId = pool[Math.floor(random() * pool.length)];
    if (designId) pairDesigns.push(designId);
  }

  return shuffleSeeded(pairDesigns, `${seed}:pair-order`).flatMap((designId) => [
    designId,
    designId,
  ]);
}

export function createLevelDefinition(input: LevelGenerationInput): LevelDefinitionV1 {
  if (input.seed.trim().length === 0) throw new RangeError('seed must not be empty');

  const catalogue = input.catalogue ?? tileCatalogueV030;
  const position = getTierPosition(input.levelNumber);
  const regular = eligibleDesigns(catalogue, input.levelNumber, 'regular');
  const requestedVariety = REGULAR_VARIETY[position.category][position.categoryLevel - 1];
  if (!requestedVariety) throw new Error('Unable to resolve regular design variety');
  const regularPool = shuffleSeeded(
    regular,
    `${catalogue.contentVersion}:${input.levelNumber}:${input.seed}:regular-pool`,
  ).slice(0, Math.min(requestedVariety, regular.length));

  if (regularPool.length === 0) {
    throw new RangeError(`No approved regular designs are eligible for level ${input.levelNumber}`);
  }

  let selectedSpecialDesignIds: readonly string[] = [];
  if (position.category === 'special') {
    const selectionInput = {
      levelNumber: input.levelNumber,
      seed: input.seed,
      ...(input.previousSpecialDesignIds
        ? { previousDesignIds: input.previousSpecialDesignIds }
        : {}),
    };
    selectedSpecialDesignIds = selectSpecialTileDesigns(catalogue, selectionInput);
  }

  const pool = [...regularPool.map((design) => design.designId), ...selectedSpecialDesignIds];
  const pairCount = input.boardSize / 2;
  const levelSeed = `${catalogue.contentVersion}:${input.levelNumber}:${input.seed}`;
  const definition: LevelDefinitionV1 = {
    assistRequirement: resolveAssistRequirement(
      input.requestedAssistRequirement,
      input.availableAssists ?? [],
    ),
    boardSize: input.boardSize,
    category: position.category,
    contentVersion: catalogue.contentVersion,
    difficultyContract: {
      categoryLevel: position.categoryLevel,
      guarantee: 'validated-solution',
      regularDesignCount: regularPool.length,
      specialDesignCount: selectedSpecialDesignIds.length,
      tierNumber: position.tierNumber,
    },
    levelNumber: input.levelNumber,
    schemaVersion: 1,
    seed: input.seed,
    tileDesignIds: buildPairSequence(
      pool,
      [...regularPool.map((design) => design.designId), ...selectedSpecialDesignIds],
      pairCount,
      `${levelSeed}:pairs`,
    ),
  };

  if (!validateLevelDefinition(definition)) {
    throw new Error(`Generated level ${input.levelNumber} failed schema validation`);
  }
  return definition;
}

export function createTierDefinitions(input: TierGenerationInput): readonly LevelDefinitionV1[] {
  if (!Number.isInteger(input.tierNumber) || input.tierNumber < 1) {
    throw new RangeError('tierNumber must be a positive integer');
  }
  if (input.requestedAssistRequirements && input.requestedAssistRequirements.length !== 8) {
    throw new RangeError('requestedAssistRequirements must contain exactly eight entries');
  }

  const definitions: LevelDefinitionV1[] = [];
  let previousSpecialDesignIds: readonly string[] = [];
  const firstLevel = (input.tierNumber - 1) * 8 + 1;

  for (let offset = 0; offset < 8; offset += 1) {
    const boardSize = input.boardSizes[offset];
    if (!boardSize) throw new RangeError('boardSizes must contain exactly eight entries');
    const requestedAssistRequirement = input.requestedAssistRequirements?.[offset];
    const definition = createLevelDefinition({
      boardSize,
      levelNumber: firstLevel + offset,
      previousSpecialDesignIds,
      seed: `${input.seed}:level-${firstLevel + offset}`,
      ...(input.availableAssists ? { availableAssists: input.availableAssists } : {}),
      ...(input.catalogue ? { catalogue: input.catalogue } : {}),
      ...(requestedAssistRequirement !== undefined ? { requestedAssistRequirement } : {}),
    });
    definitions.push(definition);

    if (definition.category === 'special') {
      const catalogue = input.catalogue ?? tileCatalogueV030;
      previousSpecialDesignIds = catalogue.designs
        .filter(
          (design) =>
            design.kind === 'special' && definition.tileDesignIds.includes(design.designId),
        )
        .map((design) => design.designId);
    }
  }

  return definitions;
}

export function validateLevelDefinitionAgainstCatalogue(
  definition: LevelDefinitionV1,
  catalogue: TileCatalogueV1 = tileCatalogueV030,
): boolean {
  if (!validateLevelDefinition(definition)) return false;
  if (definition.contentVersion !== catalogue.contentVersion) return false;

  const designsById = new Map(catalogue.designs.map((design) => [design.designId, design]));
  const identityCounts = new Map<string, number>();
  for (const designId of definition.tileDesignIds) {
    const canonicalDesignId =
      catalogue === tileCatalogueV030 ? resolveTileDesignId(designId) : designId;
    const design = canonicalDesignId ? designsById.get(canonicalDesignId) : undefined;
    if (
      !design ||
      design.status !== 'approved' ||
      design.releaseRole === 'reserve-event' ||
      design.introducedAtLevel > definition.levelNumber ||
      !design.eligibleCategories.includes(definition.category)
    ) {
      return false;
    }
    identityCounts.set(design.matchIdentity, (identityCounts.get(design.matchIdentity) ?? 0) + 1);
  }

  if ([...identityCounts.values()].some((count) => count % 2 !== 0)) return false;
  const specialCount = new Set(
    definition.tileDesignIds.filter((id) => designsById.get(id)?.kind === 'special'),
  ).size;
  const regularCount = new Set(
    definition.tileDesignIds.filter((id) => designsById.get(id)?.kind === 'regular'),
  ).size;
  return (
    specialCount === definition.difficultyContract.specialDesignCount &&
    regularCount === definition.difficultyContract.regularDesignCount
  );
}

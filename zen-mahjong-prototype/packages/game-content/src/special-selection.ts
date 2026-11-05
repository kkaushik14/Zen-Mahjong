import type { TileCatalogueV1, TileDesign } from './model';
import { shuffleSeeded } from './random';

export interface SpecialTileSelectionInput {
  count?: number;
  levelNumber: number;
  previousDesignIds?: readonly string[];
  seed: string;
}

function sameDesignSet(first: readonly string[], second: readonly string[]): boolean {
  if (first.length !== second.length) return false;
  const secondSet = new Set(second);
  return first.every((id) => secondSet.has(id));
}

function getEligibleSpecialDesigns(
  catalogue: TileCatalogueV1,
  levelNumber: number,
): readonly TileDesign[] {
  return catalogue.designs
    .filter(
      (design) =>
        design.kind === 'special' &&
        design.releaseRole === 'special' &&
        design.status === 'approved' &&
        design.introducedAtLevel <= levelNumber &&
        design.eligibleCategories.includes('special'),
    )
    .sort((first, second) => first.designId.localeCompare(second.designId));
}

export function selectSpecialTileDesigns(
  catalogue: TileCatalogueV1,
  input: SpecialTileSelectionInput,
): readonly string[] {
  if (!Number.isInteger(input.levelNumber) || input.levelNumber < 1) {
    throw new RangeError('levelNumber must be a positive integer');
  }
  if (input.seed.trim().length === 0) throw new RangeError('seed must not be empty');

  const count = input.count ?? 4;
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('count must be a positive integer');
  }

  const eligible = [...getEligibleSpecialDesigns(catalogue, input.levelNumber)];
  if (eligible.length < count) {
    throw new RangeError(`Special tile selection requires ${count} eligible designs`);
  }

  const shuffled = shuffleSeeded(
    eligible,
    `${catalogue.contentVersion}:${input.levelNumber}:${input.seed}:${count}`,
  );
  const selected = shuffled.slice(0, count).map((design) => design.designId);
  const previous = input.previousDesignIds ?? [];
  if (sameDesignSet(selected, previous) && eligible.length > count) {
    const replacement = shuffled[count];
    if (replacement) selected[selected.length - 1] = replacement.designId;
  }

  return selected;
}

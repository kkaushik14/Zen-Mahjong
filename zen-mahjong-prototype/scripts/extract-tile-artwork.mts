import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

interface ExportFill {
  imageHash?: string;
  imageTransform?: readonly [readonly [number, number, number], readonly [number, number, number]];
  type?: string;
}

interface ExportNode {
  children?: readonly ExportNode[];
  fills?: readonly ExportFill[];
  id?: string;
  name?: string;
  [key: string]: unknown;
}

interface ArtworkCrop {
  artworkId: string;
  crop: { height: number; width: number; x: number; y: number };
  figmaNodeId: string;
  imageHash: string;
  name: string;
  outputDimensions: { height: number; width: number };
  outputPath: string;
  sourceDimensions: { height: number; width: number };
}

const repositoryRoot = resolve(import.meta.dirname, '..');
const baselineRoot = resolve(repositoryRoot, 'docs/v0.3.0/design-baseline/2026-10-07/export');
const reviewPath = resolve(baselineRoot, 'design-review.json');
const outputRoot = resolve(repositoryRoot, 'packages/mahjong-ui/assets/tiles/v3');
const manifestPath = resolve(outputRoot, 'manifest.json');
const artworkRegistryPath = resolve(
  repositoryRoot,
  'packages/mahjong-ui/src/tile-artwork.generated.ts',
);
const review = JSON.parse(readFileSync(reviewPath, 'utf8')) as ExportNode;

function findArtworkComponents(value: unknown, result = new Map<string, ExportNode>()) {
  if (!value || typeof value !== 'object') return result;
  const node = value as ExportNode;
  if (typeof node.name === 'string' && /^V2\/Artwork\/\d{2} /.test(node.name)) {
    result.set(node.name, node);
  }
  for (const child of Object.values(node)) {
    if (child && typeof child === 'object') findArtworkComponents(child, result);
  }
  return result;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function sourceDimensions(path: string): { height: number; width: number } {
  const output = execFileSync('/usr/bin/sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], {
    encoding: 'utf8',
  });
  const width = Number(/pixelWidth: (\d+)/.exec(output)?.[1]);
  const height = Number(/pixelHeight: (\d+)/.exec(output)?.[1]);
  if (!width || !height) throw new Error(`Unable to read source dimensions for ${path}`);
  return { height, width };
}

const components = [...findArtworkComponents(review).values()]
  .filter((node) => node.name && node.id && node.name.startsWith('V2/Artwork/'))
  .sort((first, second) => String(first.name).localeCompare(String(second.name)));

if (components.length !== 50) {
  throw new Error(`Expected 50 artwork components, found ${components.length}`);
}

mkdirSync(outputRoot, { recursive: true });
const crops: ArtworkCrop[] = [];

for (const component of components) {
  const match = /^V2\/Artwork\/(\d{2}) (.+)$/.exec(component.name ?? '');
  const suppliedArtwork = component.children?.find((child) => child.name === 'Supplied artwork');
  const fill = suppliedArtwork?.fills?.find((candidate) => candidate.type === 'IMAGE');
  if (!match || !component.id || !fill?.imageHash || !fill.imageTransform) {
    throw new Error(`Incomplete artwork metadata for ${component.name ?? 'unknown component'}`);
  }

  const [, sequence, displayName] = match;
  const sourcePath = resolve(baselineRoot, `assets/${fill.imageHash}.png`);
  if (!existsSync(sourcePath)) throw new Error(`Missing source atlas: ${sourcePath}`);
  const dimensions = sourceDimensions(sourcePath);
  const [[scaleX, , translateX], [, scaleY, translateY]] = fill.imageTransform;
  const crop = {
    height: Math.round(scaleY * dimensions.height),
    width: Math.round(scaleX * dimensions.width),
    x: Math.round(translateX * dimensions.width),
    y: Math.round(translateY * dimensions.height),
  };
  const artworkId = `${sequence}-${slugify(displayName)}`;
  const outputPath = resolve(outputRoot, `${artworkId}.png`);

  execFileSync('/usr/bin/sips', [
    '--cropToHeightWidth',
    String(crop.height),
    String(crop.width),
    '--cropOffset',
    String(crop.y),
    String(crop.x),
    sourcePath,
    '--out',
    outputPath,
  ]);
  execFileSync('python3', [resolve(import.meta.dirname, 'isolate-tile-artwork.py'), outputPath]);
  execFileSync('/usr/bin/sips', ['--resampleHeightWidthMax', '256', outputPath]);

  crops.push({
    artworkId,
    crop,
    figmaNodeId: component.id,
    imageHash: fill.imageHash,
    name: displayName,
    outputDimensions: { height: 256, width: 256 },
    outputPath: `packages/mahjong-ui/assets/tiles/v3/${basename(outputPath)}`,
    sourceDimensions: dimensions,
  });
}

writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      contentVersion: '0.3.0',
      generatedFrom: 'docs/v0.3.0/design-baseline/2026-10-07/export/design-review.json',
      items: crops,
      schemaVersion: 1,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

const sourceEntries = crops
  .map(({ artworkId }) => `  '${artworkId}': require('../assets/tiles/v3/${artworkId}.png'),`)
  .join('\n');
writeFileSync(
  artworkRegistryPath,
  `// Generated by scripts/extract-tile-artwork.mts. Do not edit manually.\nimport type { ImageSourcePropType } from 'react-native';\n\nexport const tileArtworkSources: Readonly<Record<string, ImageSourcePropType>> = {\n${sourceEntries}\n};\n`,
  'utf8',
);

console.log(`Extracted ${crops.length} tile artworks to ${dirname(manifestPath)}`);

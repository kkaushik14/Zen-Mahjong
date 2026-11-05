import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const root = process.cwd();
const registryFiles = [
  'apps/mobile/src/theme/runtime-assets.ts',
  'apps/mobile/src/features/home/home-assets.generated.ts',
  'packages/ui/src/moonlit-assets.generated.ts',
  'packages/mahjong-ui/src/gameplay-assets.generated.ts',
  'packages/mahjong-ui/src/tile-artwork.generated.ts',
];
const manifestFiles = [
  'apps/mobile/assets/artwork/home/v3/manifest.json',
  'packages/ui/assets/moonlit/v3/manifest.json',
  'packages/mahjong-ui/assets/gameplay/v3/manifest.json',
  'packages/mahjong-ui/assets/tiles/v3/manifest.json',
];
const assetRoots = [
  'apps/mobile/assets/artwork',
  'apps/mobile/assets/expo.icon',
  'apps/mobile/assets/images',
  'packages/ui/assets',
  'packages/mahjong-ui/assets',
];
const runtimeSourceRoots = ['apps/mobile/src', 'packages/ui/src', 'packages/mahjong-ui/src'];
const removedStarterNames = new Set([
  'expo-badge-white.png',
  'expo-badge.png',
  'expo-logo.png',
  'logo-glow.png',
  'react-logo.png',
  'react-logo@2x.png',
  'react-logo@3x.png',
  'tutorial-web.png',
]);
const binaryExtensions = new Set([
  '.gif',
  '.jpeg',
  '.jpg',
  '.otf',
  '.png',
  '.svg',
  '.ttf',
  '.webp',
]);
const errors = [];

function walk(relativeDirectory) {
  const directory = resolve(root, relativeDirectory);
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = join(relativeDirectory, entry.name);
    return entry.isDirectory() ? walk(relativePath) : [relativePath];
  });
}

function requirePaths(relativeFile) {
  const source = readFileSync(resolve(root, relativeFile), 'utf8');
  return [...source.matchAll(/require\(['"]([^'"]+)['"]\)/g)].map((match) =>
    resolve(root, dirname(relativeFile), match[1]),
  );
}

for (const registry of registryFiles) {
  for (const assetPath of requirePaths(registry)) {
    if (!existsSync(assetPath)) errors.push(`${registry} references missing ${assetPath}`);
  }
}

const appConfig = JSON.parse(readFileSync(resolve(root, 'apps/mobile/app.json'), 'utf8')).expo;
const configuredAssets = [
  appConfig.icon,
  appConfig.ios.icon,
  appConfig.android.adaptiveIcon.foregroundImage,
  appConfig.android.adaptiveIcon.backgroundImage,
  appConfig.android.adaptiveIcon.monochromeImage,
  appConfig.web.favicon,
  appConfig.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
  )?.[1]?.image,
].filter(Boolean);
for (const configuredAsset of configuredAssets) {
  const assetPath = resolve(root, 'apps/mobile', configuredAsset);
  if (!existsSync(assetPath)) errors.push(`app.json references missing ${assetPath}`);
}

for (const manifestFile of manifestFiles) {
  const manifest = JSON.parse(readFileSync(resolve(root, manifestFile), 'utf8'));
  if (manifest.contentVersion !== '0.3.0') {
    errors.push(`${manifestFile} has unexpected content version ${manifest.contentVersion}`);
  }
  for (const item of manifest.items ?? []) {
    if (!existsSync(resolve(root, item.outputPath))) {
      errors.push(`${manifestFile} references missing ${item.outputPath}`);
    }
  }
}

const assetFiles = assetRoots.flatMap(walk);
for (const assetFile of assetFiles) {
  const name = assetFile.split('/').at(-1);
  if (name && (removedStarterNames.has(name) || assetFile.includes('/tabIcons/'))) {
    errors.push(`Removed starter asset returned: ${assetFile}`);
  }
}

for (const sourceFile of runtimeSourceRoots.flatMap(walk)) {
  if (!/\.[jt]sx?$/.test(sourceFile)) continue;
  const source = readFileSync(resolve(root, sourceFile), 'utf8');
  if (/docs\/|Downloads\/|\/tmp\/|\/var\/folders\//.test(source)) {
    errors.push(`Runtime source contains a forbidden external asset path: ${sourceFile}`);
  }
}

const hashes = new Map();
let binaryBytes = 0;
for (const assetFile of assetFiles.filter((file) => binaryExtensions.has(extname(file)))) {
  const bytes = readFileSync(resolve(root, assetFile));
  binaryBytes += bytes.byteLength;
  const hash = createHash('sha256').update(bytes).digest('hex');
  hashes.set(hash, [...(hashes.get(hash) ?? []), assetFile]);
}
for (const [hash, paths] of hashes) {
  if (paths.length > 1) errors.push(`Duplicate binary hash ${hash}: ${paths.join(', ')}`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Runtime asset audit passed: ${assetFiles.length} files, ${hashes.size} binaries, ${binaryBytes} binary bytes.`,
  );
}

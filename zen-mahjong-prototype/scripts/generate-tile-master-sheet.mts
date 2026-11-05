import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { format } from 'prettier';

import { catalogueData as tileCatalogueV030 } from '../packages/game-content/src/catalogue.v0.3.0.full.ts';

const outputPath = resolve(
  import.meta.dirname,
  '../docs/v0.3.0/generated/V0.3.0-V3-13-TILE-MASTER-SHEET.md',
);

if (
  tileCatalogueV030?.schemaVersion !== 1 ||
  tileCatalogueV030?.contentVersion !== '0.3.0' ||
  !Array.isArray(tileCatalogueV030?.designs)
) {
  throw new Error('The v0.3.0 tile catalogue is invalid');
}

const header = `# v0.3.0 Tile Master Sheet

Generated from \`packages/game-content/src/catalogue.v0.3.0.full.ts\`. Do not edit this artifact manually.

Content version: \`${tileCatalogueV030.contentVersion}\`

## Regular Tiles

| Design ID | Display name | Match identity | Family | Marker | Artwork | Status |
| --- | --- | --- | --- | --- | --- | --- |`;

const regularRows = tileCatalogueV030.designs
  .filter((design) => design.releaseRole === 'regular')
  .map(
    (design) =>
      `| \`${design.designId}\` | ${design.displayName} | \`${design.matchIdentity}\` | ${design.familyId} | ${design.colorIndependentMarker} | \`${design.motifAsset}\` | ${design.status} |`,
  );

function roleRows(role: 'reserve-event' | 'special'): string {
  return tileCatalogueV030.designs
    .filter((design) => design.releaseRole === role)
    .map(
      (design) =>
        `| \`${design.designId}\` | ${design.displayName} | ${design.colorIndependentMarker} | \`${design.motifAsset}\` | ${design.status} |`,
    )
    .join('\n');
}

const document = await format(
  `${header}
${regularRows.join('\n')}

## Matching Review

- Tiles match only when their configured \`matchIdentity\` values are equal.
- Every approved regular design currently uses one stable design and match identity.
- Similarity groups never change exact-match identity.
- The legacy \`gate\` ID resolves to \`garden-gate\`; new content emits only the canonical ID.

## Special Tiles

| Design ID | Display name | Marker | Artwork | Status |
| --- | --- | --- | --- | --- |
${roleRows('special')}

## Reserve and Event Tiles

| Design ID | Display name | Marker | Artwork | Status |
| --- | --- | --- | --- | --- |
${roleRows('reserve-event')}

## Review Checklist

- Confirm each motif remains identifiable at board and tray sizes.
- Confirm the marker works without color.
- Confirm display and accessibility names.
- Approve only artwork that satisfies the marker and compact-size checks.
- Keep draft and reserve/event designs out of production level generation.
`,
  { parser: 'markdown' },
);

mkdirSync(dirname(outputPath), { recursive: true });
if (existsSync(outputPath)) {
  if (readFileSync(outputPath, 'utf8') !== document) {
    throw new Error(`Refusing to overwrite changed versioned master sheet: ${outputPath}`);
  }
  console.log(`Tile master sheet is current: ${outputPath}`);
} else {
  writeFileSync(outputPath, document, 'utf8');
  console.log(`Created tile master sheet: ${outputPath}`);
}

import { getTileDesign, requireTileDesign } from '@zen-mahjong/game-content';

export interface TileMotifPalette {
  accent: string;
  primary: string;
  secondary: string;
}

export interface TileMotifDefinition {
  artworkId?: string;
  id: string;
  label: string;
  palette: TileMotifPalette;
}

export const tileMotifs = {
  bamboo: {
    id: 'bamboo',
    label: requireTileDesign('bamboo').displayName,
    palette: { primary: '#26735B', secondary: '#85B85B', accent: '#D5A63B' },
  },
  crane: {
    id: 'crane',
    label: requireTileDesign('crane').displayName,
    palette: { primary: '#334E84', secondary: '#7C92BD', accent: '#D95C42' },
  },
  gate: {
    id: 'gate',
    label: requireTileDesign('gate').displayName,
    palette: { primary: '#A64335', secondary: '#D56D4C', accent: '#D7A942' },
  },
  leaf: {
    id: 'leaf',
    label: requireTileDesign('leaf').displayName,
    palette: { primary: '#397B4B', secondary: '#75AD63', accent: '#C9A33D' },
  },
  lotus: {
    id: 'lotus',
    label: requireTileDesign('lotus').displayName,
    palette: { primary: '#C94F6D', secondary: '#E68CA0', accent: '#D6A43C' },
  },
  moon: {
    id: 'moon',
    label: requireTileDesign('moon').displayName,
    palette: { primary: '#446CA8', secondary: '#83A8D5', accent: '#D4A63D' },
  },
  mountain: {
    id: 'mountain',
    label: requireTileDesign('mountain').displayName,
    palette: { primary: '#52695F', secondary: '#83A090', accent: '#D68E45' },
  },
  sun: {
    id: 'sun',
    label: requireTileDesign('sun').displayName,
    palette: { primary: '#D9852F', secondary: '#F1B84A', accent: '#B94B37' },
  },
  water: {
    id: 'water',
    label: requireTileDesign('water').displayName,
    palette: { primary: '#287B92', secondary: '#62AEC0', accent: '#D1A63C' },
  },
} as const satisfies Record<string, TileMotifDefinition>;

export type TileMotifId = keyof typeof tileMotifs;

const fallbackMotif = tileMotifs.mountain;

export function getTileMotif(motif: string): TileMotifDefinition {
  const design = getTileDesign(motif);
  if (!design) return fallbackMotif;
  const known =
    design.designId in tileMotifs ? tileMotifs[design.designId as TileMotifId] : fallbackMotif;
  const artworkId = design.motifAsset.startsWith('artwork:v3:')
    ? design.motifAsset.slice('artwork:v3:'.length)
    : undefined;
  return {
    id: design.designId,
    label: design.displayName,
    palette: known.palette,
    ...(artworkId ? { artworkId } : {}),
  };
}

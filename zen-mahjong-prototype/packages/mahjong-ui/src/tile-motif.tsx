import { Image } from 'react-native';
import { Circle, G, Line, Path, Rect, Svg } from 'react-native-svg';

import { getTileMotif, type TileMotifPalette } from './motif-catalog';
import { getTileArtworkSource } from './tile-artwork';

export interface TileMotifProps {
  motif: string;
  size: number;
}

function Artwork({ motif, palette }: { motif: string; palette: TileMotifPalette }) {
  const stroke = palette.primary;
  const soft = palette.secondary;
  const accent = palette.accent;

  switch (motif) {
    case 'lotus':
      return (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M32 47C22 42 17 34 20 25c7 2 11 8 12 15 1-7 5-13 12-15 3 9-2 17-12 22Z"
            fill={soft}
            stroke={stroke}
            strokeWidth="2.4"
          />
          <Path
            d="M32 42c-7-6-8-15 0-23 8 8 7 17 0 23Z"
            fill={accent}
            stroke={stroke}
            strokeWidth="2.4"
          />
          <Path d="M17 47h30" stroke={stroke} strokeWidth="2.4" />
        </G>
      );
    case 'bamboo':
      return (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path d="M25 50 29 14M39 50l-3-36" stroke={stroke} strokeWidth="5" />
          <Path d="m19 24 9 4m8 8 10-5M23 39l-8 5" stroke={accent} strokeWidth="3" />
          <Path
            d="M29 20c-7-5-12-4-15 0 7 4 11 4 15 0Zm8 4c7-5 12-4 15 0-7 4-11 4-15 0Z"
            fill={soft}
            stroke={stroke}
            strokeWidth="1.8"
          />
        </G>
      );
    case 'crane':
      return (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M18 42c8-13 18-15 29-7-7 1-12 4-16 9 8-2 14-1 19 3-13 4-24 2-32-5Z"
            fill={soft}
            stroke={stroke}
            strokeWidth="2.5"
          />
          <Path
            d="M25 37c1-10 6-17 15-21l7 2-6 3c-3 6-3 12 1 18"
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
          />
          <Circle cx="42" cy="18" fill={accent} r="1.8" />
        </G>
      );
    case 'sun':
      return (
        <G strokeLinecap="round">
          <Circle cx="32" cy="32" fill={soft} r="11" stroke={stroke} strokeWidth="2.5" />
          {[0, 45, 90, 135].map((rotation) => (
            <Line
              key={rotation}
              x1="32"
              x2="32"
              y1="10"
              y2="17"
              stroke={accent}
              strokeWidth="3"
              transform={`rotate(${rotation} 32 32)`}
            />
          ))}
        </G>
      );
    case 'moon':
      return (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M43 45A20 20 0 1 1 29 13c-3 18 2 28 14 32Z"
            fill={soft}
            stroke={stroke}
            strokeWidth="2.8"
          />
          <Circle cx="44" cy="20" fill={accent} r="3" />
        </G>
      );
    case 'leaf':
      return (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M16 47c1-20 11-30 32-30-1 20-11 30-32 30Z"
            fill={soft}
            stroke={stroke}
            strokeWidth="2.6"
          />
          <Path d="m18 46 25-23M27 38l-1-10m8 3 9 1" stroke={accent} strokeWidth="2.4" />
        </G>
      );
    case 'gate':
      return (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M14 24h36M18 18h28M21 50V25h22v25M28 50V31h8v19"
            fill="none"
            stroke={stroke}
            strokeWidth="3.4"
          />
          <Path d="m14 24 7-8m29 8-7-8" stroke={accent} strokeWidth="3" />
          <Rect x="31" y="37" width="2" height="2" rx="1" fill={soft} />
        </G>
      );
    case 'water':
      return (
        <G fill="none" strokeLinecap="round">
          <Path
            d="M12 24c6-5 12-5 18 0s12 5 22 0M12 34c6-5 12-5 18 0s12 5 22 0M16 44c6-4 11-4 16 0s10 4 16 0"
            stroke={stroke}
            strokeWidth="3"
          />
          <Circle cx="18" cy="17" fill={accent} r="3" stroke="none" />
        </G>
      );
    default:
      return (
        <G strokeLinecap="round" strokeLinejoin="round">
          <Path
            d="M11 47 26 22l8 13 7-10 12 22H11Z"
            fill={soft}
            stroke={stroke}
            strokeWidth="2.6"
          />
          <Path d="m21 31 5-9 5 8m7 1 3-6 4 7" stroke={accent} strokeWidth="2.4" />
          <Circle cx="17" cy="17" fill={accent} r="4" />
        </G>
      );
  }
}

export function TileMotif({ motif, size }: TileMotifProps) {
  const definition = getTileMotif(motif);
  const artworkSource = definition.artworkId
    ? getTileArtworkSource(definition.artworkId)
    : undefined;

  if (artworkSource) {
    return (
      <Image resizeMode="contain" source={artworkSource} style={{ height: size, width: size }} />
    );
  }

  return (
    <Svg height={size} viewBox="0 0 64 64" width={size}>
      <Artwork motif={definition.id} palette={definition.palette} />
    </Svg>
  );
}

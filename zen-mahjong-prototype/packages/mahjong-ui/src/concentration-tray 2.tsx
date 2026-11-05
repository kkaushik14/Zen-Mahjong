import { color, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import { MoonlitSurface } from '@zen-mahjong/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MahjongTile } from './mahjong-tile';

export interface ConcentrationTrayTile {
  accessibilityLabel: string;
  id: string;
  motif: string;
}

export interface ConcentrationTrayProps {
  blocked?: boolean;
  onTilePress?: (tileId: string) => void;
  reducedMotion?: boolean;
  specialUsesRemaining: number;
  tiles: readonly ConcentrationTrayTile[];
}

export function ConcentrationTray({
  blocked = false,
  onTilePress,
  reducedMotion = false,
  specialUsesRemaining,
  tiles,
}: ConcentrationTrayProps) {
  return (
    <View
      accessibilityLabel={`Concentration tray, ${tiles.length} of 4 regular slots filled, ${specialUsesRemaining} special uses remaining`}
      style={[styles.container, blocked && styles.blockedContainer]}
    >
      <View style={styles.regularSlots}>
        {Array.from({ length: 4 }, (_, index) => {
          const tile = tiles[index];
          return (
            <MoonlitSurface
              accessibilityLabel={tile ? undefined : `Regular tray slot ${index + 1}, empty`}
              key={tile?.id ?? `empty-${index}`}
              style={styles.slot}
              variant="wood"
            >
              {tile ? (
                <MahjongTile
                  accessibilityLabel={`${tile.accessibilityLabel}, regular tray position ${index + 1}${blocked ? ', activate to use the special slot' : ''}`}
                  motif={tile.motif}
                  reducedMotion={reducedMotion}
                  size={34}
                  state="available"
                  {...(onTilePress ? { onPress: () => onTilePress(tile.id) } : {})}
                />
              ) : (
                <Text style={styles.slotNumber}>{index + 1}</Text>
              )}
            </MoonlitSurface>
          );
        })}
      </View>
      <Pressable
        accessibilityLabel={`Special Concentration slot, ${specialUsesRemaining} uses remaining`}
        accessibilityRole="button"
        disabled={!blocked || specialUsesRemaining < 1}
        style={[styles.specialSlot, blocked && specialUsesRemaining > 0 && styles.specialReady]}
      >
        <Text style={styles.specialMark}>S</Text>
        <Text style={styles.specialCount}>{specialUsesRemaining}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.background.elevated,
    backgroundColor: color.surface.glass,
  },
  blockedContainer: { borderColor: color.accent.gold },
  regularSlots: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  slot: {
    width: 43,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: color.background.elevated,
    backgroundColor: color.background.deep,
  },
  slotNumber: { ...typography.caption, color: color.text.onDarkSecondary },
  specialSlot: {
    width: 48,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: color.accent.jadeSoft,
    backgroundColor: color.background.deep,
  },
  specialReady: { borderColor: color.accent.gold, backgroundColor: color.accent.jade },
  specialMark: { fontSize: 20, lineHeight: 22, color: color.accent.goldSoft },
  specialCount: { ...typography.caption, color: color.text.onDark },
});

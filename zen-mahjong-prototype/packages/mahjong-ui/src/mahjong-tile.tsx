import { color, motion, radius } from '@zen-mahjong/design-tokens';
import { getMoonlitAssetSource } from '@zen-mahjong/ui';
import { useEffect, useRef } from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { getTileMotif } from './motif-catalog';
import { TileMotif } from './tile-motif';

export type MahjongTileState = 'available' | 'blocked' | 'selected' | 'hinted' | 'disabled';

export interface MahjongTileProps {
  accessibilityLabel: string;
  blockedReason?: 'covered' | 'sides-blocked' | null;
  motif: string;
  onPress?: () => void;
  reducedMotion?: boolean;
  state?: MahjongTileState;
  size?: number;
}

export function MahjongTile({
  accessibilityLabel,
  blockedReason = null,
  motif,
  onPress,
  reducedMotion = false,
  size = 48,
  state = 'available',
}: MahjongTileProps) {
  const disabled = state === 'blocked' || state === 'disabled';
  const height = Math.round(size / 0.72);
  const definition = getTileMotif(motif);
  const stateScale = useSharedValue(1);
  const lift = useSharedValue(0);
  const pulse = useSharedValue(1);
  const pressScale = useSharedValue(1);
  const revealScale = useSharedValue(1);
  const previousState = useRef(state);

  useEffect(() => {
    const targetScale = state === 'selected' ? 1.055 : state === 'hinted' ? 1.025 : 1;
    const targetLift = state === 'selected' ? -5 : state === 'hinted' ? -2 : 0;
    const newlyAvailable = previousState.current === 'blocked' && state === 'available';
    cancelAnimation(pulse);

    if (reducedMotion) {
      stateScale.value = targetScale;
      lift.value = targetLift;
      pulse.value = 1;
      revealScale.value = 1;
      previousState.current = state;
      return;
    }

    stateScale.value = withSpring(targetScale, { damping: 15, stiffness: 220 });
    lift.value = withSpring(targetLift, { damping: 16, stiffness: 210 });
    pulse.value =
      state === 'hinted'
        ? withRepeat(
            withSequence(withTiming(1.055, { duration: 520 }), withTiming(1, { duration: 520 })),
            -1,
          )
        : withTiming(1, { duration: motion.selectionMs });
    revealScale.value = newlyAvailable
      ? withSequence(withTiming(1.07, { duration: 120 }), withSpring(1, { damping: 14 }))
      : withTiming(1, { duration: motion.selectionMs });
    previousState.current = state;
  }, [lift, pulse, reducedMotion, revealScale, state, stateScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value },
      { scale: stateScale.value * pulse.value * pressScale.value * revealScale.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: state === 'selected' }}
        disabled={disabled}
        hitSlop={Math.max(4, Math.ceil((44 - size) / 2))}
        onPress={onPress}
        onPressIn={() => {
          if (!reducedMotion) pressScale.value = withTiming(0.965, { duration: motion.pressMs });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, { damping: 16, stiffness: 260 });
        }}
        style={({ pressed }) => [
          styles.shadow,
          { width: size, height },
          state === 'selected' && styles.selectedShadow,
          pressed && reducedMotion && styles.pressed,
        ]}
      >
        <ImageBackground
          imageStyle={styles.faceImage}
          resizeMode="stretch"
          source={getMoonlitAssetSource('surface.tileMarble')}
          style={[
            styles.face,
            state === 'blocked' && styles.blocked,
            state === 'hinted' && styles.hinted,
            state === 'selected' && styles.selected,
          ]}
        >
          <View pointerEvents="none" style={styles.highlight} />
          <View pointerEvents="none" style={styles.cornerMark} />
          {state === 'blocked' && blockedReason === 'covered' ? (
            <View pointerEvents="none" style={styles.coveredMark} />
          ) : null}
          {state === 'blocked' && blockedReason === 'sides-blocked' ? (
            <>
              <View pointerEvents="none" style={[styles.sideMark, styles.sideMarkLeft]} />
              <View pointerEvents="none" style={[styles.sideMark, styles.sideMarkRight]} />
            </>
          ) : null}
          <TileMotif motif={definition.id} size={Math.round(size * 0.72)} />
        </ImageBackground>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.tile,
    backgroundColor: '#B8AA8D',
    paddingBottom: 5,
    paddingRight: 3,
    shadowColor: '#081B15',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
    elevation: 5,
  },
  selectedShadow: {
    transform: [{ translateY: -3 }],
    shadowColor: color.accent.gold,
    shadowOpacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  face: {
    flex: 1,
    borderRadius: radius.tile,
    backgroundColor: '#FFFDF6',
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faceImage: { borderRadius: radius.tile },
  blocked: {
    opacity: 0.84,
  },
  hinted: {
    borderColor: color.accent.jadeSoft,
    borderWidth: 2,
  },
  selected: {
    borderColor: color.accent.gold,
    borderWidth: 2,
  },
  highlight: {
    position: 'absolute',
    height: 2,
    left: 6,
    right: 6,
    top: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  cornerMark: {
    position: 'absolute',
    width: 5,
    height: 5,
    right: 5,
    bottom: 6,
    borderRadius: 3,
    backgroundColor: color.accent.gold,
    opacity: 0.5,
  },
  coveredMark: {
    backgroundColor: '#203C3199',
    borderBottomColor: '#E8DDBD99',
    borderBottomWidth: 1,
    height: 8,
    left: 3,
    position: 'absolute',
    right: 3,
    top: 3,
    zIndex: 2,
  },
  sideMark: {
    backgroundColor: '#203C31A6',
    bottom: 7,
    position: 'absolute',
    top: 7,
    width: 4,
    zIndex: 2,
  },
  sideMarkLeft: { left: 2 },
  sideMarkRight: { right: 2 },
});

import { fontFamily, spacing } from '@zen-mahjong/design-tokens';
import { ActionButton, ModalShell } from '@zen-mahjong/ui';
import { useRef } from 'react';
import {
  AccessibilityInfo,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  findNodeHandle,
  type ImageSourcePropType,
} from 'react-native';

export type GameplayOverlayKind = 'full-tray' | 'more' | 'no-moves' | 'pause' | 'restart';

export interface GameplayOverlayAction {
  accessibilityLabel?: string;
  disabled?: boolean;
  emphasis?: 'primary' | 'quiet';
  label: string;
  loading?: boolean;
  onPress: () => void;
}

interface GameplayOverlayProps {
  actions: readonly GameplayOverlayAction[];
  artwork?: ImageSourcePropType;
  artworkSize?: { height: number; width: number };
  body: string;
  kind: GameplayOverlayKind;
  onDismissRequest: () => void;
  reducedMotion: boolean;
  title: string;
  visible: boolean;
}

const shellHeights: Record<GameplayOverlayKind, number> = {
  'full-tray': 340,
  more: 410,
  'no-moves': 340,
  pause: 410,
  restart: 310,
};

export function GameplayOverlay({
  actions,
  artwork,
  artworkSize,
  body,
  kind,
  onDismissRequest,
  reducedMotion,
  title,
  visible,
}: GameplayOverlayProps) {
  const focusTarget = useRef<View>(null);
  const menuTitle = kind === 'pause' || kind === 'more';
  const horizontalActions = kind === 'restart';
  const actionHeight = horizontalActions ? 50 : actions.length * 52 + (actions.length - 1) * 12;
  const requiredHeight = 150 + actionHeight + (artwork ? (artworkSize?.height ?? 72) : 0);
  const shellHeight = Math.max(shellHeights[kind], requiredHeight);

  const focusDialog = () => {
    if (Platform.OS === 'web') return;
    const handle = findNodeHandle(focusTarget.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onDismissRequest}
      onShow={focusDialog}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <Pressable onPress={onDismissRequest} style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          accessible
          onStartShouldSetResponder={() => true}
          ref={focusTarget}
          style={styles.dialog}
        >
          <ModalShell
            accessibilityLabel={`${title}. ${body}`}
            actions={
              <View style={[styles.actions, horizontalActions && styles.horizontalActions]}>
                {actions.map((action) => (
                  <ActionButton
                    accessibilityLabel={action.accessibilityLabel ?? action.label}
                    fullWidth={!horizontalActions}
                    key={action.label}
                    label={action.label}
                    labelStyle={styles.actionLabel}
                    onPress={action.onPress}
                    reducedMotion={reducedMotion}
                    {...(action.disabled === undefined ? {} : { disabled: action.disabled })}
                    {...(action.emphasis === undefined ? {} : { emphasis: action.emphasis })}
                    {...(action.loading === undefined ? {} : { loading: action.loading })}
                    style={[styles.actionButton, horizontalActions && styles.horizontalButton]}
                  />
                ))}
              </View>
            }
            body={body}
            bodyStyle={styles.body}
            contentStyle={styles.content}
            style={[styles.shell, { minHeight: shellHeight }]}
            title={title}
            titleStyle={menuTitle ? styles.menuTitle : undefined}
          >
            {artwork ? (
              <Image resizeMode="contain" source={artwork} style={[styles.artwork, artworkSize]} />
            ) : null}
          </ModalShell>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 9, 5, 0.66)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dialog: { maxWidth: 358, width: '100%' },
  shell: { maxWidth: 358, paddingBottom: 36, paddingTop: 24, paddingHorizontal: 32 },
  content: { gap: 6 },
  body: {
    alignSelf: 'center',
    fontFamily: fontFamily.accent,
    fontSize: 16,
    lineHeight: 22,
    width: '100%',
  },
  menuTitle: { fontFamily: fontFamily.accent, fontSize: 33, lineHeight: 45 },
  actionButton: { minHeight: 52 },
  actionLabel: { fontFamily: fontFamily.display, fontSize: 20, lineHeight: 27 },
  artwork: { alignSelf: 'center', height: 72, marginTop: 2, width: 100 },
  actions: { gap: 12, width: '100%' },
  horizontalActions: { flexDirection: 'row' },
  horizontalButton: { flex: 1, minWidth: 0, paddingHorizontal: spacing.sm },
});

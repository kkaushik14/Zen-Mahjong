import { spacing } from '@zen-mahjong/design-tokens';
import { ActionButton, ModalShell } from '@zen-mahjong/ui';
import { useRef } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  findNodeHandle,
} from 'react-native';

interface AppearanceModalProps {
  onApply: () => void;
  onDismiss: () => void;
  reducedMotion: boolean;
  visible: boolean;
}

export function AppearanceModal({
  onApply,
  onDismiss,
  reducedMotion,
  visible,
}: AppearanceModalProps) {
  const focusTarget = useRef<View>(null);

  const focusDialog = () => {
    if (Platform.OS === 'web') return;
    const handle = findNodeHandle(focusTarget.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onDismiss}
      onShow={focusDialog}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityLabel="Close appearance dialog"
        onPress={onDismiss}
        style={styles.backdrop}
      >
        <View
          accessibilityViewIsModal
          accessible
          onStartShouldSetResponder={() => true}
          ref={focusTarget}
          style={styles.dialog}
        >
          <ModalShell
            accessibilityLabel="Your Atmosphere. Autumn garden, Ivory marble"
            actions={
              <View style={styles.actions}>
                <ActionButton
                  accessibilityLabel="Apply Autumn garden and Ivory marble"
                  fullWidth
                  label="Apply"
                  onPress={onApply}
                  reducedMotion={reducedMotion}
                />
                <ActionButton
                  accessibilityLabel="Cancel appearance change"
                  emphasis="quiet"
                  fullWidth
                  label="Cancel"
                  onPress={onDismiss}
                  reducedMotion={reducedMotion}
                />
              </View>
            }
            body="Autumn garden · Ivory marble"
            contentStyle={styles.content}
            style={styles.shell}
            title="Your Atmosphere"
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 9, 5, 0.68)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dialog: { maxWidth: 358, width: '100%' },
  shell: { minHeight: 340, paddingBottom: 28, paddingTop: 28 },
  content: { gap: spacing.lg },
  actions: { gap: spacing.md },
});

import { color, fontFamily, radius, spacing, typography } from '@zen-mahjong/design-tokens';
import type { AssistKind } from '@zen-mahjong/game-engine';
import { Lightbulb, Shuffle, Undo2, X } from 'lucide-react-native';
import { useRef } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  findNodeHandle,
} from 'react-native';

const assistOptions = [
  { assist: 'hint' as const, icon: Lightbulb, label: 'Hint' },
  { assist: 'undo' as const, icon: Undo2, label: 'Undo' },
  { assist: 'shuffle' as const, icon: Shuffle, label: 'Shuffle' },
];

export interface RewardAdvertisementModalProps {
  busy: boolean;
  onClose: () => void;
  onSelectAssist: (assist: AssistKind) => void;
  reducedMotion: boolean;
  visible: boolean;
}

export function RewardAdvertisementModal({
  busy,
  onClose,
  onSelectAssist,
  reducedMotion,
  visible,
}: RewardAdvertisementModalProps) {
  const focusTarget = useRef<View>(null);

  const focusDialog = () => {
    if (Platform.OS === 'web') return;
    const handle = findNodeHandle(focusTarget.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
      onShow={focusDialog}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal accessible ref={focusTarget} style={styles.panel}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>REWARDED VIDEO</Text>
              <Text style={styles.title}>Choose one assist</Text>
            </View>
            <Pressable
              accessibilityLabel="Close reward options"
              accessibilityRole="button"
              disabled={busy}
              onPress={onClose}
              style={styles.close}
            >
              <X aria-hidden color={color.text.onLight} size={20} />
            </Pressable>
          </View>
          <Text style={styles.body}>
            A completed reward adds one assist and one Zen Score bonus to this level.
          </Text>
          <View style={styles.options}>
            {assistOptions.map(({ assist, icon: Icon, label }) => (
              <Pressable
                accessibilityLabel={`Watch reward for one ${label}`}
                accessibilityRole="button"
                disabled={busy}
                key={assist}
                onPress={() => onSelectAssist(assist)}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                <Icon aria-hidden color={color.accent.jade} size={21} />
                <Text style={styles.optionText}>+1 {label}</Text>
              </Pressable>
            ))}
          </View>
          {busy ? (
            <Text accessibilityLiveRegion="polite" style={styles.status}>
              Preparing reward...
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(6, 19, 15, 0.68)' },
  panel: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    backgroundColor: color.surface.ivory,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { ...typography.caption, color: color.accent.red },
  title: {
    ...typography.headingMedium,
    color: color.text.onLight,
    fontFamily: fontFamily.display,
  },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { ...typography.bodySmall, color: color.text.onLightSecondary, marginTop: spacing.sm },
  options: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  option: {
    flex: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface.subtle,
  },
  optionText: { ...typography.control, color: color.text.onLight },
  status: { ...typography.caption, color: color.text.onLightSecondary, marginTop: spacing.md },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});

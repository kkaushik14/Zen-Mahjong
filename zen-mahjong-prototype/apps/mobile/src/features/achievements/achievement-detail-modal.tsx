import { color, spacing, typography } from '@zen-mahjong/design-tokens';
import { getTileArtworkSource } from '@zen-mahjong/mahjong-ui';
import { ActionButton, ModalShell } from '@zen-mahjong/ui';
import { useRef } from 'react';
import {
  AccessibilityInfo,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  findNodeHandle,
} from 'react-native';

import type { AchievementPresentation } from './achievement-presentation';

interface AchievementDetailModalProps {
  achievement: AchievementPresentation | null;
  onDismiss: () => void;
  reducedMotion: boolean;
}

export function AchievementDetailModal({
  achievement,
  onDismiss,
  reducedMotion,
}: AchievementDetailModalProps) {
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
      visible={achievement !== null}
    >
      <Pressable
        accessibilityLabel="Close achievement details"
        onPress={onDismiss}
        style={styles.backdrop}
      >
        {achievement ? (
          <View
            accessibilityViewIsModal
            onStartShouldSetResponder={() => true}
            ref={focusTarget}
            style={styles.dialog}
          >
            <ModalShell
              accessibilityLabel={`${achievement.title}. ${achievement.description}. ${achievement.status}`}
              actions={
                <ActionButton
                  accessibilityLabel="Back to Achievements"
                  fullWidth
                  label="Back to Achievements"
                  onPress={onDismiss}
                  reducedMotion={reducedMotion}
                />
              }
              body={achievement.description}
              contentStyle={styles.content}
              style={styles.shell}
              title={achievement.title}
            >
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel={`${achievement.title} artwork`}
                resizeMode="contain"
                source={getTileArtworkSource(achievement.artworkId)}
                style={styles.artwork}
              />
              <Text style={styles.status}>{achievement.status}</Text>
              <Text style={styles.reward}>Automatic reward · {achievement.reward}</Text>
            </ModalShell>
          </View>
        ) : null}
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
  content: { gap: spacing.sm },
  artwork: { alignSelf: 'center', height: 72, width: 72 },
  status: { ...typography.bodySmall, color: color.accent.jade, textAlign: 'center' },
  reward: {
    ...typography.caption,
    color: color.text.onLightSecondary,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
});

import { color, spacing, typography } from '@zen-mahjong/design-tokens';
import { ActionButton, ModalShell } from '@zen-mahjong/ui';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  isValidProfileName,
  normalizeProfileName,
  PROFILE_NAME_MAX_LENGTH,
} from './profile-presentation';

interface ProfileEditModalProps {
  currentName: string;
  onDismiss: () => void;
  onSave: (displayName: string) => void;
  reducedMotion: boolean;
  visible: boolean;
}

export function ProfileEditModal({
  currentName,
  onDismiss,
  onSave,
  reducedMotion,
  visible,
}: ProfileEditModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState(currentName);
  const normalized = normalizeProfileName(draft);
  const valid = isValidProfileName(draft);

  const save = () => {
    if (!valid) return;
    onSave(normalized);
  };

  return (
    <Modal
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onDismiss}
      onShow={() => inputRef.current?.focus()}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <Pressable
          accessibilityLabel="Close profile editor"
          onPress={onDismiss}
          style={styles.backdrop}
        >
          <View
            accessibilityViewIsModal
            onStartShouldSetResponder={() => true}
            style={styles.dialog}
          >
            <ModalShell
              accessibilityLabel="Edit local profile"
              actions={
                <View style={styles.actions}>
                  <ActionButton
                    accessibilityLabel="Save profile name"
                    disabled={!valid}
                    fullWidth
                    label="Save"
                    onPress={save}
                    reducedMotion={reducedMotion}
                  />
                  <ActionButton
                    accessibilityLabel="Cancel profile editing"
                    emphasis="quiet"
                    fullWidth
                    label="Cancel"
                    onPress={onDismiss}
                    reducedMotion={reducedMotion}
                  />
                </View>
              }
              contentStyle={styles.content}
              style={styles.shell}
              title="Your Profile"
            >
              <View style={styles.field}>
                <Text nativeID="profile-name-label" style={styles.fieldLabel}>
                  Garden name
                </Text>
                <TextInput
                  accessibilityLabelledBy="profile-name-label"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={PROFILE_NAME_MAX_LENGTH}
                  onChangeText={setDraft}
                  onSubmitEditing={save}
                  ref={inputRef}
                  returnKeyType="done"
                  selectTextOnFocus
                  style={styles.input}
                  value={draft}
                />
              </View>
            </ModalShell>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 9, 5, 0.68)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dialog: { maxWidth: 358, width: '100%' },
  shell: { minHeight: 340, paddingBottom: 28, paddingTop: 28 },
  content: { gap: spacing.md },
  field: { gap: spacing.xs, marginHorizontal: spacing.sm },
  fieldLabel: { ...typography.caption, color: color.text.onLightSecondary },
  input: {
    ...typography.body,
    backgroundColor: '#FFF9ED',
    borderColor: '#B99A58',
    borderRadius: 8,
    borderWidth: 1,
    color: color.text.onLight,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  actions: { gap: spacing.md },
});

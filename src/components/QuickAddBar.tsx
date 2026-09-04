import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { colors, radius, shadows, spacing } from '../theme';

type Props = {
  placeholder?: string;
  onSubmit: (title: string) => Promise<void> | void;
  bottomInset?: number;
};

export function QuickAddBar({
  placeholder = 'Add a task...',
  onSubmit,
  bottomInset = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    const title = value.trim();
    if (!title || saving) return;
    setSaving(true);
    Keyboard.dismiss();
    try {
      await onSubmit(title);
      setValue('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View
      style={[
        styles.wrap,
        shadows.float,
        { paddingBottom: Math.max(insets.bottom, 8) + bottomInset },
      ]}>
      <View style={styles.bar}>
        <Pressable style={styles.plusBtn} onPress={submit} disabled={saving || !value.trim()}>
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <AppIcon name="plus" size={20} color="#fff" />
          )}
        </Pressable>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={submit}
          editable={!saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 6,
    paddingRight: spacing.md,
    minHeight: 52,
  },
  plusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
});

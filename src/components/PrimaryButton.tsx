import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'danger' | 'ghost' | 'success' | 'navy';
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const bg =
    variant === 'danger'
      ? colors.danger
      : variant === 'ghost'
        ? 'transparent'
        : variant === 'success'
          ? colors.success
          : variant === 'navy'
            ? colors.navy
            : colors.primary;
  const textColor = variant === 'ghost' ? colors.primaryDeep : '#fff';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: pressed || disabled || loading ? 0.72 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

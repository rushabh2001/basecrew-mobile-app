import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { AppIcon } from './AppIcon';
import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'warning' | 'success' | 'danger' | 'navy';

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle;
};

const variantStyles: Record<
  Variant,
  { bg: string; text: string; sub: string; iconBg: string }
> = {
  primary: {
    bg: colors.primary,
    text: '#fff',
    sub: 'rgba(255,255,255,0.82)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
  navy: {
    bg: colors.navy,
    text: '#fff',
    sub: 'rgba(255,255,255,0.75)',
    iconBg: 'rgba(255,255,255,0.12)',
  },
  warning: {
    bg: colors.warning,
    text: '#fff',
    sub: 'rgba(255,255,255,0.85)',
    iconBg: 'rgba(255,255,255,0.2)',
  },
  success: {
    bg: colors.success,
    text: '#fff',
    sub: 'rgba(255,255,255,0.85)',
    iconBg: 'rgba(255,255,255,0.2)',
  },
  danger: {
    bg: colors.danger,
    text: '#fff',
    sub: 'rgba(255,255,255,0.85)',
    iconBg: 'rgba(255,255,255,0.2)',
  },
};

export function ActionButton({
  title,
  subtitle,
  icon,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  const v = variantStyles[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg },
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: v.iconBg }]}>{icon}</View>
      ) : null}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: v.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: v.sub }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <AppIcon name="chevron-right" size={22} color={v.text} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    shadowColor: '#0B1226',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  disabled: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
  },
});

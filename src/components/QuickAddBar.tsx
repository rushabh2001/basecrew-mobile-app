import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors, radius, shadows, spacing } from '../theme';

type Props = {
  placeholder?: string;
  /** Kept for compatibility; expand path is preferred. */
  onSubmit?: (title: string) => Promise<void> | void;
  onExpand: (draftTitle?: string) => void;
  /** Small gap above the tab bar (tab screens already sit above the bar). */
  gapAboveTab?: number;
};

/**
 * Floating add bar.
 * Tab screen content already ends above the tab bar, so we only need a tiny gap
 * (`gapAboveTab`) - do not add `useBottomTabBarHeight()` or the bar floats too high.
 */
export function QuickAddBar({
  placeholder = 'Add a task...',
  onExpand,
  gapAboveTab = 12,
}: Props) {
  return (
    <View style={[styles.wrap, shadows.float, { bottom: gapAboveTab }]}>
      <Pressable style={styles.bar} onPress={() => onExpand('')}>
        <View style={styles.plusBtn}>
          <AppIcon name="plus" size={20} color="#fff" />
        </View>
        <Text style={styles.placeholder}>{placeholder}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
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
    minHeight: 48,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: colors.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
});

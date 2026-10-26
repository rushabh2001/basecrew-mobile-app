import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { useDateTimePicker } from './DateTimePickerHost';
import { colors, radius, spacing } from '../theme';

type Mode = 'date' | 'time' | 'datetime';

type Props = {
  label: string;
  value: Date;
  onChange: (next: Date) => void;
  mode?: Mode;
  minimumDate?: Date;
  maximumDate?: Date;
};

function safeDate(value: Date | null | undefined) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  return new Date();
}

function formatDisplay(value: Date, mode: Mode) {
  const d = safeDate(value);
  if (mode === 'date') {
    return d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (mode === 'time') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Shared date / time field used by Reminders, Tasks, and Projects.
 * Opens the root-level picker host (never nests a Modal inside form sheets).
 */
export function DateTimeField({
  label,
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
  maximumDate,
}: Props) {
  const { openPicker } = useDateTimePicker();
  const current = useMemo(() => safeDate(value), [value]);

  function onPress() {
    openPicker({
      value: current,
      mode,
      minimumDate,
      maximumDate,
      title: label,
      onConfirm: onChange,
    });
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
        onPress={onPress}>
        <View style={styles.iconWrap}>
          <AppIcon name="calendar" size={18} color="#fff" />
        </View>
        <Text style={styles.value} numberOfLines={1}>
          {formatDisplay(current, mode)}
        </Text>
        <AppIcon name="chevron-right" size={16} color={colors.navyMid} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navyMid,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.navySoft,
  },
  fieldPressed: {
    borderColor: colors.navy,
    backgroundColor: colors.primarySoft,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
  },
});

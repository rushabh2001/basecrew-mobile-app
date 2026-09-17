import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { AppIcon } from './AppIcon';
import { colors, radius, spacing } from '../theme';

type Mode = 'date' | 'time' | 'datetime';

type Props = {
  label: string;
  value: Date;
  onChange: (next: Date) => void;
  mode?: Mode;
  minimumDate?: Date;
};

function formatDisplay(value: Date, mode: Mode) {
  if (mode === 'date') {
    return value.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (mode === 'time') {
    return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return value.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Native date / time / datetime field.
 * Android datetime opens date then time dialogs in sequence.
 * iOS uses an inline spinner with Date / Time tabs.
 */
export function DateTimeField({
  label,
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
}: Props) {
  const [open, setOpen] = useState(false);
  /** Which native picker is currently shown (date or time). */
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>(
    mode === 'time' ? 'time' : 'date',
  );

  function mergeDatePart(base: Date, selected: Date) {
    const next = new Date(base);
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    return next;
  }

  function mergeTimePart(base: Date, selected: Date) {
    const next = new Date(base);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    return next;
  }

  function apply(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      // Android always dismisses the dialog first.
      setOpen(false);
      if (event.type === 'dismissed' || !selected) {
        setPickerMode(mode === 'time' ? 'time' : 'date');
        return;
      }

      if (mode === 'datetime' && pickerMode === 'date') {
        onChange(mergeDatePart(value, selected));
        setPickerMode('time');
        // Re-open time picker after the date dialog fully closes.
        setTimeout(() => setOpen(true), 50);
        return;
      }

      if (mode === 'datetime' && pickerMode === 'time') {
        onChange(mergeTimePart(value, selected));
        setPickerMode('date');
        return;
      }

      onChange(mode === 'time' ? mergeTimePart(value, selected) : mergeDatePart(value, selected));
      setPickerMode(mode === 'time' ? 'time' : 'date');
      return;
    }

    // iOS spinner updates live.
    if (!selected) return;
    if (pickerMode === 'date') onChange(mergeDatePart(value, selected));
    else onChange(mergeTimePart(value, selected));
  }

  function openPicker() {
    setPickerMode(mode === 'time' ? 'time' : 'date');
    setOpen(true);
  }

  const activeMode = mode === 'datetime' ? pickerMode : mode;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={openPicker}>
        <AppIcon name="calendar" size={18} color={colors.primaryDeep} />
        <Text style={styles.value}>{formatDisplay(value, mode)}</Text>
        <AppIcon name="chevron-right" size={16} color={colors.muted} />
      </Pressable>

      {open ? (
        <View style={Platform.OS === 'ios' ? styles.iosSheet : undefined}>
          {Platform.OS === 'ios' ? (
            <View style={styles.iosToolbar}>
              {mode === 'datetime' ? (
                <View style={styles.stepRow}>
                  <Pressable
                    style={[styles.stepChip, pickerMode === 'date' && styles.stepChipOn]}
                    onPress={() => setPickerMode('date')}>
                    <Text
                      style={[
                        styles.stepText,
                        pickerMode === 'date' && styles.stepTextOn,
                      ]}>
                      Date
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.stepChip, pickerMode === 'time' && styles.stepChipOn]}
                    onPress={() => setPickerMode('time')}>
                    <Text
                      style={[
                        styles.stepText,
                        pickerMode === 'time' && styles.stepTextOn,
                      ]}>
                      Time
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View />
              )}
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.done}>Done</Text>
              </Pressable>
            </View>
          ) : null}
          <DateTimePicker
            value={value}
            mode={activeMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={apply}
            minimumDate={minimumDate}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  value: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  iosSheet: {
    marginTop: 8,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  iosToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  stepRow: { flexDirection: 'row', gap: 8 },
  stepChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepChipOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  stepText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  stepTextOn: { color: colors.primaryDeep },
  done: { fontSize: 15, fontWeight: '700', color: colors.primaryDeep },
});

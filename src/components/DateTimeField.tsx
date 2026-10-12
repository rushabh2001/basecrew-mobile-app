import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
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

function mergeDatePart(base: Date, selected: Date) {
  const next = new Date(safeDate(base));
  next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
  return next;
}

function mergeTimePart(base: Date, selected: Date) {
  const next = new Date(safeDate(base));
  next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
  return next;
}

/**
 * Shared date / time field used by Reminders, Tasks, and Projects.
 * Opens in its own Modal so it works when nested inside other form modals.
 */
export function DateTimeField({
  label,
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
  maximumDate,
}: Props) {
  const insets = useSafeAreaInsets();
  const current = useMemo(() => safeDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(current);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>(
    mode === 'time' ? 'time' : 'date',
  );
  /** Android remount key so date -> time dialog sequence always shows. */
  const [androidKey, setAndroidKey] = useState(0);

  useEffect(() => {
    if (!open) setDraft(safeDate(value));
  }, [value, open]);

  function close() {
    setOpen(false);
    setPickerMode(mode === 'time' ? 'time' : 'date');
  }

  function confirm(next = draft) {
    onChange(safeDate(next));
    close();
  }

  function openPicker() {
    setDraft(current);
    setPickerMode(mode === 'time' ? 'time' : 'date');
    setAndroidKey(k => k + 1);
    setOpen(true);
  }

  function onAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    if (event.type === 'dismissed') {
      close();
      return;
    }
    if (!selected) {
      close();
      return;
    }

    if (mode === 'datetime' && pickerMode === 'date') {
      const next = mergeDatePart(draft, selected);
      setDraft(next);
      setPickerMode('time');
      setAndroidKey(k => k + 1);
      // Keep open=true; remount with time mode via key.
      return;
    }

    if (mode === 'datetime' && pickerMode === 'time') {
      confirm(mergeTimePart(draft, selected));
      return;
    }

    if (mode === 'time') {
      confirm(mergeTimePart(draft, selected));
      return;
    }

    confirm(mergeDatePart(draft, selected));
  }

  function onIosChange(_event: DateTimePickerEvent, selected?: Date) {
    if (!selected) return;
    if (pickerMode === 'date') setDraft(mergeDatePart(draft, selected));
    else setDraft(mergeTimePart(draft, selected));
  }

  const activeMode = mode === 'datetime' ? pickerMode : mode;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.field}
        onPress={openPicker}>
        <AppIcon name="calendar" size={18} color={colors.primaryDeep} />
        <Text style={styles.value}>{formatDisplay(current, mode)}</Text>
        <AppIcon name="chevron-right" size={16} color={colors.muted} />
      </Pressable>

      {/* Android: system dialog (must not sit inside a nested ScrollView/Modal tree). */}
      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          key={`android-${androidKey}-${activeMode}`}
          value={draft}
          mode={activeMode}
          display="default"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {/* iOS: dedicated sheet above any parent reminder/task modal. */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={close}>
          <View style={styles.iosBackdrop}>
            <Pressable style={styles.iosDismissArea} onPress={close} />
            <View style={[styles.iosSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <View style={styles.iosToolbar}>
                <Pressable onPress={close} hitSlop={12}>
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
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
                  <Text style={styles.sheetTitle}>
                    {mode === 'time' ? 'Time' : 'Date'}
                  </Text>
                )}
                <Pressable onPress={() => confirm()} hitSlop={12}>
                  <Text style={styles.done}>Done</Text>
                </Pressable>
              </View>

              <Text style={styles.preview}>{formatDisplay(draft, mode)}</Text>

              <DateTimePicker
                value={draft}
                mode={activeMode}
                display="spinner"
                themeVariant="light"
                onChange={onIosChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
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
  iosBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11,18,38,0.45)',
  },
  iosDismissArea: { flex: 1 },
  iosSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iosToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.navy },
  cancel: { fontSize: 15, fontWeight: '600', color: colors.muted },
  done: { fontSize: 15, fontWeight: '700', color: colors.primaryDeep },
  stepRow: { flexDirection: 'row', gap: 8 },
  stepChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepChipOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  stepText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  stepTextOn: { color: colors.primaryDeep },
  preview: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  iosPicker: {
    alignSelf: 'stretch',
    height: 216,
  },
});

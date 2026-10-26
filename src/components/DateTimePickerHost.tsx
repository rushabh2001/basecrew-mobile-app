import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
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
import { colors, radius, spacing } from '../theme';

type Mode = 'date' | 'time' | 'datetime';

export type DateTimePickerRequest = {
  value: Date;
  mode?: Mode;
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
  onConfirm: (next: Date) => void;
};

type HostApi = {
  openPicker: (request: DateTimePickerRequest) => void;
};

const DateTimePickerContext = createContext<HostApi | null>(null);

function safeDate(value: Date | null | undefined) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  return new Date();
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

function formatPreview(value: Date, mode: Mode) {
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
 * Renders the native date/time UI at the app root so it is never nested
 * inside reminder/task/project Modals (which breaks iOS + Android pickers).
 */
export function DateTimePickerProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [request, setRequest] = useState<DateTimePickerRequest | null>(null);
  const [draft, setDraft] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [androidKey, setAndroidKey] = useState(0);

  const close = useCallback(() => {
    setRequest(null);
    setPickerMode('date');
  }, []);

  const openPicker = useCallback((next: DateTimePickerRequest) => {
    const mode = next.mode ?? 'datetime';
    setRequest(next);
    setDraft(safeDate(next.value));
    setPickerMode(mode === 'time' ? 'time' : 'date');
    setAndroidKey(k => k + 1);
  }, []);

  const confirm = useCallback(
    (value?: Date) => {
      if (!request) return;
      request.onConfirm(safeDate(value ?? draft));
      close();
    },
    [request, draft, close],
  );

  const onAndroidChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (!request) return;
      const mode = request.mode ?? 'datetime';
      if (event.type === 'dismissed' || !selected) {
        close();
        return;
      }
      if (mode === 'datetime' && pickerMode === 'date') {
        setDraft(mergeDatePart(draft, selected));
        setPickerMode('time');
        setAndroidKey(k => k + 1);
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
    },
    [request, pickerMode, draft, close, confirm],
  );

  const onIosChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      if (!selected) return;
      if (pickerMode === 'date') setDraft(mergeDatePart(draft, selected));
      else setDraft(mergeTimePart(draft, selected));
    },
    [pickerMode, draft],
  );

  const api = useMemo(() => ({ openPicker }), [openPicker]);
  const mode = request?.mode ?? 'datetime';
  const activeMode = mode === 'datetime' ? pickerMode : mode;
  const open = request != null;

  return (
    <DateTimePickerContext.Provider value={api}>
      {children}

      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          key={`android-root-${androidKey}-${activeMode}`}
          value={draft}
          mode={activeMode}
          display="default"
          onChange={onAndroidChange}
          minimumDate={request?.minimumDate}
          maximumDate={request?.maximumDate}
        />
      ) : null}

      {Platform.OS === 'ios' && open ? (
        <Modal
          visible
          transparent
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={close}>
          <View style={styles.backdrop}>
            <Pressable style={styles.dismiss} onPress={close} />
            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <View style={styles.navyBar} />
              <View style={styles.toolbar}>
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
                    {request?.title || (mode === 'time' ? 'Time' : 'Date')}
                  </Text>
                )}
                <Pressable onPress={() => confirm()} hitSlop={12}>
                  <Text style={styles.done}>Done</Text>
                </Pressable>
              </View>

              <Text style={styles.preview}>{formatPreview(draft, mode)}</Text>

              <DateTimePicker
                value={draft}
                mode={activeMode}
                display="spinner"
                themeVariant="light"
                onChange={onIosChange}
                minimumDate={request?.minimumDate}
                maximumDate={request?.maximumDate}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </DateTimePickerContext.Provider>
  );
}

export function useDateTimePicker() {
  const ctx = useContext(DateTimePickerContext);
  if (!ctx) {
    throw new Error('useDateTimePicker must be used within DateTimePickerProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  dismiss: { flex: 1 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  navyBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.navyMid,
    marginBottom: spacing.md,
    opacity: 0.35,
  },
  toolbar: {
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
    backgroundColor: colors.navySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepChipOn: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  stepText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  stepTextOn: { color: '#fff' },
  preview: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  picker: {
    alignSelf: 'stretch',
    height: 216,
  },
});

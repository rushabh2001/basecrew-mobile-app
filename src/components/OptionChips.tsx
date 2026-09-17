import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export type ChipOption = { value: string; label: string };

type Props = {
  label?: string;
  options: ChipOption[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  allowClear?: boolean;
  clearLabel?: string;
};

/** Horizontal chip picker used in task / project forms and filters. */
export function OptionChips({
  label,
  options,
  value,
  onChange,
  allowClear,
  clearLabel = 'Any',
}: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {allowClear ? (
          <Pressable
            onPress={() => onChange('')}
            style={[styles.chip, !value && styles.chipOn]}>
            <Text style={[styles.chipText, !value && styles.chipTextOn]}>{clearLabel}</Text>
          </Pressable>
        ) : null}
        {options.map(opt => {
          const on = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

type MultiProps = {
  label?: string;
  options: ChipOption[];
  values: string[];
  onChange: (values: string[]) => void;
};

export function MultiOptionChips({ label, options, values, onChange }: MultiProps) {
  function toggle(id: string) {
    if (values.includes(id)) onChange(values.filter(v => v !== id));
    else onChange([...values, id]);
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.wrapRow}>
        {options.map(opt => {
          const on = values.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => toggle(opt.value)}
              style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8, paddingRight: spacing.md },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipTextOn: { color: colors.primaryDeep },
});

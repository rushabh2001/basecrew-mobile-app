import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  labelActive: {
    color: colors.primaryDeep,
  },
});

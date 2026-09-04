import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatTodayLong, greetingForHour } from '../utils/taskGroups';
import { colors, typography } from '../theme';

type Props = {
  name?: string | null;
  subtitle?: string;
};

export function DayGreeting({ name, subtitle }: Props) {
  const first = name?.split(' ')[0] || 'there';
  return (
    <View style={styles.wrap}>
      <Text style={styles.date}>{formatTodayLong()}</Text>
      <Text style={styles.greeting}>
        {greetingForHour()}, {first}
      </Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  date: {
    ...typography.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  greeting: {
    ...typography.hero,
    color: colors.text,
  },
  sub: {
    marginTop: 6,
    fontSize: 15,
    color: colors.muted,
    lineHeight: 20,
  },
});

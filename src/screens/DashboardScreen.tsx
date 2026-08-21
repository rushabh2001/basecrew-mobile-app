import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';

export function DashboardScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setData(await api.fetchDashboard(token));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const stats = [
    { label: 'My tasks', value: data?.myTasks?.length ?? data?.tasks?.length ?? '-' },
    { label: 'Overdue', value: data?.overdueCount ?? data?.overdue?.length ?? '-' },
    { label: 'Projects', value: data?.projects?.length ?? '-' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.sub}>Same live data as the web app.</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <View style={styles.grid}>
          {stats.map(s => (
            <View key={s.label} style={styles.card}>
              <Text style={styles.value}>{String(s.value)}</Text>
              <Text style={styles.label}>{s.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  sub: { color: colors.muted, marginBottom: spacing.lg, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { fontSize: 28, fontWeight: '700', color: colors.primary },
  label: { color: colors.muted, marginTop: 4 },
  err: { color: colors.danger, marginBottom: spacing.md },
});

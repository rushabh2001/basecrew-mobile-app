import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import type { TaskItem } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';

export function TasksScreen() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rows = await api.fetchTasks(token);
      setTasks(Array.isArray(rows) ? rows : (rows as any)?.tasks ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Tasks</Text>
            {error ? <Text style={styles.err}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No tasks assigned.</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.status}
              {item.project?.name ? ` · ${item.project.name}` : ''}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  taskTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  empty: { color: colors.muted },
  err: { color: colors.danger, marginBottom: spacing.sm },
});

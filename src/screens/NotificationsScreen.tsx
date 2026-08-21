import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import type { NotificationItem } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

export function NotificationsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const rows = await api.fetchNotifications(token);
      setItems(Array.isArray(rows) ? rows : []);
    } catch {
      // ignore transient errors on refresh
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
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <PrimaryButton
              label="Mark all read"
              variant="ghost"
              onPress={async () => {
                if (!token) return;
                await api.markNotificationsRead(token);
                await load();
              }}
              style={{ alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: 12 }}
            />
          </View>
        }
        ListEmptyComponent={!loading ? <Text style={styles.empty}>You're all caught up.</Text> : null}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.unread]}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.msg}>{item.message}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingBottom: 40 },
  header: { marginBottom: spacing.md, gap: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  unread: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cardTitle: { fontWeight: '600', color: colors.text },
  msg: { color: colors.muted, marginTop: 4, fontSize: 13 },
  empty: { color: colors.muted },
});

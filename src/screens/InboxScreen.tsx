import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import type { NotificationItem, ReminderItem } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { AlertCard } from '../components/AlertCard';
import { DateTimeField } from '../components/DateTimeField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { colors, radius, spacing } from '../theme';

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function InboxScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [tab, setTab] = useState('Reminders');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ReminderItem | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [remindAtDate, setRemindAtDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [n, r] = await Promise.all([
        api.fetchNotifications(token),
        api.fetchReminders(token, true),
      ]);
      setNotifications(Array.isArray(n) ? n : []);
      setReminders(Array.isArray(r) ? r : []);
    } catch {
      // keep prior data
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort(
        (a, b) => new Date(b.remindAt).getTime() - new Date(a.remindAt).getTime(),
      ),
    [reminders],
  );

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  async function markOneRead(item: NotificationItem) {
    if (!token || item.read) return;
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n)),
    );
    try {
      await api.markNotificationRead(token, item.id);
    } catch {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, read: false } : n)),
      );
    }
  }

  const data = tab === 'Reminders' ? sortedReminders : sortedNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  function openCreate() {
    setEditItem(null);
    setTitle('');
    setMessage('');
    setRemindAtDate(new Date(Date.now() + 60 * 60 * 1000));
    setCreateOpen(true);
  }

  function openEdit(item: ReminderItem) {
    setEditItem(item);
    setTitle(item.title);
    setMessage(item.message || '');
    setRemindAtDate(new Date(item.remindAt));
    setCreateOpen(true);
  }

  async function saveReminder() {
    if (!token || !title.trim()) return;
    setSaving(true);
    try {
      const iso = remindAtDate.toISOString();
      if (editItem) {
        await api.updateReminder(token, editItem.id, {
          title: title.trim(),
          message: message.trim() || null,
          remindAt: iso,
        });
      } else {
        await api.createReminder(token, {
          title: title.trim(),
          message: message.trim() || undefined,
          remindAt: iso,
          type: 'custom',
          pushNotify: true,
        });
      }
      setCreateOpen(false);
      await load();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again');
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(item: ReminderItem) {
    if (!token) return;
    try {
      await api.completeReminder(token, item.id, !item.isDone);
      await load();
    } catch (e) {
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Try again');
    }
  }

  function confirmDelete(item: ReminderItem) {
    Alert.alert('Delete reminder', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          try {
            await api.deleteReminder(token, item.id);
            await load();
          } catch (e) {
            Alert.alert('Delete failed', e instanceof Error ? e.message : 'Try again');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={data as any[]}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <Text style={styles.title}>Inbox</Text>
              <View style={styles.topActions}>
                {tab === 'Reminders' ? (
                  <Pressable style={styles.addBtn} onPress={openCreate}>
                    <AppIcon name="plus" size={16} color="#fff" />
                    <Text style={styles.addLabel}>Add</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.ghostBtn}
                    onPress={async () => {
                      if (!token || unreadCount === 0) return;
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      await api.markNotificationsRead(token);
                      await load();
                    }}>
                    <Text style={styles.ghostLabel}>
                      {unreadCount > 0 ? `Mark all read (${unreadCount})` : 'All read'}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  onPress={() => navigation.goBack()}
                  style={styles.closeBtn}>
                  <AppIcon name="x" size={20} color={colors.navy} />
                </Pressable>
              </View>
            </View>
            <SegmentedControl
              options={['Reminders', 'Alerts']}
              value={tab}
              onChange={setTab}
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            tab === 'Reminders' ? (
              <Text style={styles.empty}>No reminders yet.</Text>
            ) : (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <AppIcon name="inbox" size={28} color={colors.primaryDeep} />
                </View>
                <Text style={styles.emptyTitle}>You're all caught up</Text>
                <Text style={styles.emptySub}>
                  New task, deadline, and team alerts will show up here.
                </Text>
              </View>
            )
          ) : null
        }
        renderItem={({ item }) =>
          tab === 'Reminders' ? (
            <View style={[styles.card, (item as ReminderItem).isDone && styles.doneCard]}>
              <Text style={styles.cardTitle}>{(item as ReminderItem).title}</Text>
              {(item as ReminderItem).message ? (
                <Text style={styles.msg}>{(item as ReminderItem).message}</Text>
              ) : null}
              <Text style={styles.meta}>{formatWhen((item as ReminderItem).remindAt)}</Text>
              <View style={styles.actions}>
                <Pressable style={styles.chip} onPress={() => toggleDone(item as ReminderItem)}>
                  <Text style={styles.chipText}>
                    {(item as ReminderItem).isDone ? 'Reopen' : 'Complete'}
                  </Text>
                </Pressable>
                <Pressable style={styles.chip} onPress={() => openEdit(item as ReminderItem)}>
                  <Text style={styles.chipText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, styles.dangerChip]}
                  onPress={() => confirmDelete(item as ReminderItem)}>
                  <Text style={[styles.chipText, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <AlertCard
              item={item as NotificationItem}
              onPress={markOneRead}
            />
          )
        }
      />

      <Modal visible={createOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScroll}
            bounces={false}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {editItem ? 'Edit reminder' : 'Custom reminder'}
              </Text>
              <Text style={styles.label}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Follow up with client"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Details"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
              <DateTimeField
                label="Remind at"
                value={remindAtDate}
                onChange={setRemindAtDate}
                mode="datetime"
              />
              <PrimaryButton label="Save" onPress={saveReminder} loading={saving} />
              <PrimaryButton
                label="Cancel"
                variant="ghost"
                onPress={() => setCreateOpen(false)}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 40 },
  sep: { height: 12 },
  header: { marginBottom: spacing.md, gap: 12 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  addLabel: { color: '#fff', fontWeight: '700', fontSize: 13 },
  ghostBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  ghostLabel: { color: colors.primaryDeep, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneCard: { opacity: 0.65 },
  cardTitle: { fontWeight: '700', color: colors.text, fontSize: 16 },
  msg: { color: colors.muted, marginTop: 4, fontSize: 13, lineHeight: 18 },
  meta: { color: colors.muted, marginTop: 8, fontSize: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  dangerChip: { backgroundColor: colors.dangerSoft },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.primaryDeep },
  empty: { color: colors.muted },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptySub: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,18,38,0.45)',
    justifyContent: 'flex-end',
  },
  modalScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
});

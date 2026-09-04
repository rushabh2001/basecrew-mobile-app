import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import type { ProjectItem, TaskItem } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { QuickAddBar } from '../components/QuickAddBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { animateListChange } from '../utils/animations';
import { groupTasks, type TaskSection } from '../utils/taskGroups';
import { colors, radius, spacing, typography } from '../theme';

type ViewMode = 'tasks' | 'projects';

export function TasksScreen() {
  const { token } = useAuth();
  const [view, setView] = useState<ViewMode>('tasks');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayOnly, setTodayOnly] = useState(false);
  const [clearing, setClearing] = useState(false);

  const clearableCount = useMemo(() => {
    const taskCount = tasks.filter(
      t => (t.status === 'completed' || t.status === 'hold') && !t.archivedAt,
    ).length;
    const projectCount = projects.filter(
      p => p.status === 'on-hold' && !p.clearedAt,
    ).length;
    return taskCount + projectCount;
  }, [tasks, projects]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [taskRows, projectRows] = await Promise.all([
        api.fetchTasks(token, '?myTasks=true'),
        api.fetchProjects(token),
      ]);
      setTasks(Array.isArray(taskRows) ? taskRows : []);
      setProjects(
        (Array.isArray(projectRows) ? projectRows : []).filter(p => p.hasAccess !== false),
      );
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

  const sections = useMemo(() => {
    let list = tasks;
    if (todayOnly) {
      list = tasks.filter(t => {
        if (t.status === 'completed') return false;
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        const today = new Date();
        return (
          due.getFullYear() === today.getFullYear() &&
          due.getMonth() === today.getMonth() &&
          due.getDate() === today.getDate()
        );
      });
    }
    return groupTasks(list);
  }, [tasks, todayOnly]);

  async function clearCompletedHold() {
    if (!token || clearableCount === 0) return;
    Alert.alert(
      'Clear completed / hold',
      `Hide ${clearableCount} completed, on-hold task${clearableCount === 1 ? '' : 's'}, and on-hold projects from your active lists?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            setClearing(true);
            try {
              animateListChange();
              await api.clearCompletedAndHold(token);
              await load();
            } catch (e) {
              Alert.alert('Clear failed', e instanceof Error ? e.message : 'Try again');
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  }

  async function toggleTask(task: TaskItem) {
    if (!token) return;
    const completing = task.status !== 'completed';
    animateListChange();
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              status: completing ? 'completed' : 'todo',
            }
          : t,
      ),
    );
    try {
      await api.updateTask(token, task.id, {
        status: completing ? 'completed' : 'todo',
        ...(completing ? { progress: 100 } : { progress: 0 }),
      });
    } catch (e) {
      animateListChange();
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? task : t)),
      );
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Try again');
    }
  }

  async function quickAdd(title: string) {
    if (!token) return;
    animateListChange();
    const optimistic: TaskItem = {
      id: `tmp-${Date.now()}`,
      title,
      status: 'todo',
    };
    setTasks(prev => [optimistic, ...prev]);
    try {
      const created = await api.createTask(token, { title, status: 'todo' });
      setTasks(prev => prev.map(t => (t.id === optimistic.id ? created : t)));
    } catch (e) {
      setTasks(prev => prev.filter(t => t.id !== optimistic.id));
      Alert.alert('Create failed', e instanceof Error ? e.message : 'Try again');
    }
  }

  function confirmDelete(task: TaskItem) {
    Alert.alert('Delete task', `Remove "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) return;
          animateListChange();
          setTasks(prev => prev.filter(t => t.id !== task.id));
          try {
            await api.deleteTask(token, task.id);
          } catch (e) {
            await load();
            Alert.alert('Delete failed', e instanceof Error ? e.message : 'Try again');
          }
        },
      },
    ]);
  }

  const openCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {view === 'tasks' ? (
        <>
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            stickySectionHeadersEnabled
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
            ListHeaderComponent={
              <View style={styles.header}>
                <ScreenHeader
                  showLogo={false}
                  title="My Tasks"
                  rightAction={
                    clearableCount > 0 ? (
                      <Pressable
                        style={[styles.clearBtn, clearing && { opacity: 0.6 }]}
                        disabled={clearing}
                        onPress={clearCompletedHold}>
                        <AppIcon name="check" size={14} color={colors.primaryDeep} />
                        <Text style={styles.clearLabel}>Clear ({clearableCount})</Text>
                      </Pressable>
                    ) : undefined
                  }
                />
                <Text style={styles.count}>
                  {openCount} open {openCount === 1 ? 'task' : 'tasks'}
                </Text>
                <View style={styles.filters}>
                  <FilterChip
                    label="All"
                    active={!todayOnly && view === 'tasks'}
                    onPress={() => {
                      setView('tasks');
                      setTodayOnly(false);
                    }}
                  />
                  <FilterChip
                    label="Today"
                    active={todayOnly}
                    onPress={() => {
                      setView('tasks');
                      setTodayOnly(true);
                    }}
                  />
                  <FilterChip
                    label="Projects"
                    active={false}
                    onPress={() => setView('projects')}
                  />
                </View>
                {error ? <Text style={styles.err}>{error}</Text> : null}
                <Text style={styles.hint}>Swipe right or tap the circle to complete</Text>
              </View>
            }
            renderSectionHeader={({ section }: { section: TaskSection }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionCount}>{section.data.length}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <SwipeableTaskRow task={item} onToggle={toggleTask} />
            )}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyWrap}>
                  <AppIcon name="check-square" size={48} color={colors.borderStrong} />
                  <Text style={styles.emptyTitle}>All clear</Text>
                  <Text style={styles.emptySub}>
                    Add a task below to get started on your day.
                  </Text>
                </View>
              ) : null
            }
          />
          <QuickAddBar onSubmit={quickAdd} bottomInset={56} />
        </>
      ) : (
        <SectionList
          sections={[{ key: 'projects', title: 'Projects', data: projects }]}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <ScreenHeader showLogo={false} title="Projects" />
              <View style={styles.filters}>
                <FilterChip label="All" active={false} onPress={() => setView('tasks')} />
                <FilterChip label="Today" active={false} onPress={() => setView('tasks')} />
                <FilterChip label="Projects" active onPress={() => setView('projects')} />
              </View>
            </View>
          }
          renderSectionHeader={() => null}
          renderItem={({ item }) => (
            <View style={styles.projectRow}>
              <View style={styles.projectIcon}>
                <AppIcon name="briefcase" size={18} color={colors.primaryDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.projectTitle}>{item.name}</Text>
                <Text style={styles.projectMeta}>
                  {item.status === 'on-hold' ? 'On hold · ' : ''}
                  {item.status || 'active'}
                  {item.totalTasks != null
                    ? ` · ${item.completedTasks ?? 0}/${item.totalTasks} done`
                    : item._count?.tasks != null
                      ? ` · ${item._count.tasks} tasks`
                      : ''}
                </Text>
                {item.progress != null ? (
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(100, item.progress || 0)}%` },
                      ]}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? <Text style={styles.emptySub}>No accessible projects.</Text> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingBottom: 120, paddingHorizontal: spacing.md },
  header: { paddingTop: spacing.xs, paddingBottom: spacing.sm },
  count: { color: colors.muted, fontSize: 14, marginBottom: spacing.md },
  filters: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipLabel: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chipLabelActive: { color: colors.primaryDeep },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clearLabel: { fontSize: 12, fontWeight: '700', color: colors.primaryDeep },
  hint: { fontSize: 12, color: colors.muted, marginTop: 4 },
  err: { color: colors.danger, marginTop: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.bg,
  },
  sectionTitle: { ...typography.section, color: colors.muted },
  sectionCount: { fontSize: 12, fontWeight: '700', color: colors.muted },
  emptyWrap: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptySub: { color: colors.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  projectMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
});

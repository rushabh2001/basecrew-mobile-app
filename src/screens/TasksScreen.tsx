import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
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
import type { OrgUser, ProjectItem, TaskItem } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { OptionChips } from '../components/OptionChips';
import { ProjectFormModal, type ProjectFormValues } from '../components/ProjectFormModal';
import { QuickAddBar } from '../components/QuickAddBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { TaskFormModal, type TaskFormValues } from '../components/TaskFormModal';
import { animateListChange } from '../utils/animations';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../utils/formOptions';
import { groupTasks, type TaskSection } from '../utils/taskGroups';
import { colors, radius, spacing, typography } from '../theme';

type ViewMode = 'tasks' | 'projects';

type TaskFilters = {
  status: string;
  priority: string;
  projectId: string;
  assignee: string;
  overdueOnly: boolean;
};

const EMPTY_FILTERS: TaskFilters = {
  status: '',
  priority: '',
  projectId: '',
  assignee: '',
  overdueOnly: false,
};

export function TasksScreen() {
  const { token, user } = useAuth();
  const [view, setView] = useState<ViewMode>('tasks');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayOnly, setTodayOnly] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskDraft, setTaskDraft] = useState<Partial<TaskFormValues> | null>(null);
  const [taskSaving, setTaskSaving] = useState(false);

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [projectSaving, setProjectSaving] = useState(false);

  const clearableCount = useMemo(() => {
    const taskCount = tasks.filter(
      t => (t.status === 'completed' || t.status === 'hold') && !t.archivedAt,
    ).length;
    const projectCount = projects.filter(
      p => p.status === 'on-hold' && !p.clearedAt,
    ).length;
    return taskCount + projectCount;
  }, [tasks, projects]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.status) n += 1;
    if (filters.priority) n += 1;
    if (filters.projectId) n += 1;
    if (filters.assignee) n += 1;
    if (filters.overdueOnly) n += 1;
    return n;
  }, [filters]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [taskRows, projectRows, userRows] = await Promise.all([
        api.fetchTasks(token, '?myTasks=true'),
        api.fetchProjects(token),
        api.fetchUsers(token, true).catch(() => [] as OrgUser[]),
      ]);
      setTasks(Array.isArray(taskRows) ? taskRows : []);
      setProjects(
        (Array.isArray(projectRows) ? projectRows : []).filter(p => p.hasAccess !== false),
      );
      setUsers(Array.isArray(userRows) ? userRows : []);
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (todayOnly) {
      list = list.filter(t => {
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

    if (filters.status) list = list.filter(t => t.status === filters.status);
    if (filters.priority) list = list.filter(t => t.priority === filters.priority);
    if (filters.projectId) {
      list = list.filter(
        t => (t.projectId || t.project?.id) === filters.projectId,
      );
    }
    if (filters.assignee === 'me' && user?.id) {
      list = list.filter(
        t =>
          t.assignedTo === user.id ||
          t.assigneeIds?.includes(user.id) ||
          t.assignees?.some(a => a.id === user.id),
      );
    } else if (filters.assignee) {
      list = list.filter(
        t =>
          t.assignedTo === filters.assignee ||
          t.assigneeIds?.includes(filters.assignee) ||
          t.assignees?.some(a => a.id === filters.assignee),
      );
    }
    if (filters.overdueOnly) {
      list = list.filter(
        t =>
          t.dueDate &&
          t.status !== 'completed' &&
          new Date(t.dueDate) < startOfToday,
      );
    }

    return groupTasks(list);
  }, [filters, tasks, todayOnly, user?.id]);

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
          ? { ...t, status: completing ? 'completed' : 'todo' }
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
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));
      Alert.alert('Update failed', e instanceof Error ? e.message : 'Try again');
    }
  }

  function openCreateTask(draftTitle = '') {
    setTaskFormMode('create');
    setEditingTask(null);
    setTaskDraft(draftTitle ? { title: draftTitle } : null);
    setTaskFormOpen(true);
  }

  function openEditTask(task: TaskItem) {
    setTaskFormMode('edit');
    setEditingTask(task);
    setTaskDraft(null);
    setTaskFormOpen(true);
  }

  async function saveTask(values: TaskFormValues) {
    if (!token) return;
    setTaskSaving(true);
    try {
      const tags = values.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const estimatedHours = values.estimatedHours
        ? Number(values.estimatedHours)
        : null;
      const progress = Math.min(100, Math.max(0, Number(values.progress || 0)));
      const body = {
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        projectId: values.projectId || null,
        dueDate: values.dueDate,
        estimatedHours,
        progress,
        tags,
        assigneeIds: values.assigneeIds,
        assignedTo: values.assigneeIds[0] || null,
      };

      if (taskFormMode === 'edit' && editingTask) {
        await api.updateTask(token, editingTask.id, body);
      } else {
        await api.createTask(token, body);
      }
      setTaskFormOpen(false);
      await load();
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setTaskSaving(false);
    }
  }

  function confirmDeleteTask() {
    if (!editingTask) return;
    Alert.alert('Delete task', `Remove "${editingTask.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token || !editingTask) return;
          try {
            await api.deleteTask(token, editingTask.id);
            setTaskFormOpen(false);
            await load();
          } catch (e) {
            Alert.alert('Delete failed', e instanceof Error ? e.message : 'Try again');
          }
        },
      },
    ]);
  }

  function openCreateProject() {
    setProjectFormMode('create');
    setEditingProject(null);
    setProjectFormOpen(true);
  }

  function openEditProject(project: ProjectItem) {
    setProjectFormMode('edit');
    setEditingProject(project);
    setProjectFormOpen(true);
  }

  async function saveProject(values: ProjectFormValues) {
    if (!token) return;
    setProjectSaving(true);
    try {
      const body = {
        name: values.name,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        type: values.type,
        parentId: values.parentId || null,
        startDate: values.startDate,
        dueDate: values.dueDate,
        memberIds: values.memberIds,
      };
      if (projectFormMode === 'edit' && editingProject) {
        await api.updateProject(token, editingProject.id, body);
      } else {
        await api.createProject(token, body);
      }
      setProjectFormOpen(false);
      await load();
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setProjectSaving(false);
    }
  }

  const openCount = tasks.filter(t => t.status !== 'completed').length;

  const listHeader = (
    <View style={styles.header}>
      <ScreenHeader
        showLogo={false}
        title={view === 'tasks' ? 'My Tasks' : 'Projects'}
        rightAction={
          <View style={styles.headerActions}>
            {view === 'tasks' ? (
              <Pressable
                style={[styles.iconBtn, activeFilterCount > 0 && styles.iconBtnActive]}
                onPress={() => setFilterOpen(true)}>
                <AppIcon
                  name="filter"
                  size={18}
                  color={activeFilterCount > 0 ? colors.primaryDeep : colors.navy}
                />
                {activeFilterCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeFilterCount}</Text>
                  </View>
                ) : null}
              </Pressable>
            ) : (
              <Pressable style={styles.addPill} onPress={openCreateProject}>
                <AppIcon name="plus" size={14} color="#fff" />
                <Text style={styles.addPillText}>Add</Text>
              </Pressable>
            )}
            {clearableCount > 0 ? (
              <Pressable
                style={[styles.clearBtn, clearing && { opacity: 0.6 }]}
                disabled={clearing}
                onPress={clearCompletedHold}>
                <AppIcon name="check" size={14} color={colors.primaryDeep} />
                <Text style={styles.clearLabel}>Clear ({clearableCount})</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />

      <SegmentedControl
        options={['Tasks', 'Projects']}
        value={view === 'tasks' ? 'Tasks' : 'Projects'}
        onChange={label => {
          setView(label === 'Projects' ? 'projects' : 'tasks');
          if (label === 'Projects') setTodayOnly(false);
        }}
      />

      {view === 'tasks' ? (
        <>
          <Text style={styles.count}>
            {openCount} open {openCount === 1 ? 'task' : 'tasks'}
            {activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'}` : ''}
          </Text>
          <View style={styles.filters}>
            <FilterChip
              label="All"
              active={!todayOnly}
              onPress={() => setTodayOnly(false)}
            />
            <FilterChip
              label="Today"
              active={todayOnly}
              onPress={() => setTodayOnly(true)}
            />
          </View>
          <Text style={styles.hint}>Tap a task to edit · swipe right to complete</Text>
        </>
      ) : (
        <Text style={styles.count}>{projects.length} projects</Text>
      )}

      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );

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
            ListHeaderComponent={listHeader}
            renderSectionHeader={({ section }: { section: TaskSection }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionCount}>{section.data.length}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <SwipeableTaskRow
                task={item}
                onToggle={toggleTask}
                onPress={openEditTask}
              />
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
          <QuickAddBar onExpand={draft => openCreateTask(draft || '')} />
        </>
      ) : (
        <SectionList
          sections={[{ key: 'projects', title: 'Projects', data: projects }]}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentProjects}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListHeaderComponent={listHeader}
          renderSectionHeader={() => null}
          renderItem={({ item }) => (
            <Pressable style={styles.projectRow} onPress={() => openEditProject(item)}>
              <View style={styles.projectIcon}>
                <AppIcon name="folder" size={18} color={colors.primaryDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.projectTitle}>{item.name}</Text>
                <Text style={styles.projectMeta}>
                  {item.status === 'on-hold' ? 'On hold · ' : ''}
                  {item.status || 'active'}
                  {item.type ? ` · ${item.type}` : ''}
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
              <AppIcon name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          )}
          ListEmptyComponent={
            !loading ? <Text style={styles.emptySub}>No accessible projects.</Text> : null
          }
        />
      )}

      <TaskFormModal
        visible={taskFormOpen}
        mode={taskFormMode}
        task={editingTask}
        initial={taskDraft}
        projects={projects}
        users={users}
        saving={taskSaving}
        onClose={() => setTaskFormOpen(false)}
        onSubmit={saveTask}
        onDelete={taskFormMode === 'edit' ? confirmDeleteTask : undefined}
      />

      <ProjectFormModal
        visible={projectFormOpen}
        mode={projectFormMode}
        project={editingProject}
        projects={projects}
        users={users}
        saving={projectSaving}
        onClose={() => setProjectFormOpen(false)}
        onSubmit={saveProject}
      />

      <Modal visible={filterOpen} animationType="slide" transparent>
        <View style={styles.filterBackdrop}>
          <View style={styles.filterSheet}>
            <View style={styles.filterHead}>
              <Text style={styles.filterTitle}>Filter tasks</Text>
              <Pressable onPress={() => setFilterOpen(false)}>
                <AppIcon name="x" size={20} color={colors.navy} />
              </Pressable>
            </View>
            <OptionChips
              label="Status"
              options={[...TASK_STATUSES]}
              value={filters.status}
              onChange={v => setFilters(f => ({ ...f, status: v }))}
              allowClear
            />
            <OptionChips
              label="Priority"
              options={[...TASK_PRIORITIES]}
              value={filters.priority}
              onChange={v => setFilters(f => ({ ...f, priority: v }))}
              allowClear
            />
            <OptionChips
              label="Project"
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              value={filters.projectId}
              onChange={v => setFilters(f => ({ ...f, projectId: v }))}
              allowClear
            />
            <OptionChips
              label="Assignee"
              options={[
                { value: 'me', label: 'Me' },
                ...users.map(u => ({ value: u.id, label: u.name })),
              ]}
              value={filters.assignee}
              onChange={v => setFilters(f => ({ ...f, assignee: v }))}
              allowClear
            />
            <View style={styles.filters}>
              <FilterChip
                label="Overdue only"
                active={filters.overdueOnly}
                onPress={() =>
                  setFilters(f => ({ ...f, overdueOnly: !f.overdueOnly }))
                }
              />
            </View>
            <View style={styles.filterActions}>
              <Pressable
                style={styles.resetBtn}
                onPress={() => setFilters(EMPTY_FILTERS)}>
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
              <Pressable
                style={styles.applyBtn}
                onPress={() => setFilterOpen(false)}>
                <Text style={styles.applyText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingBottom: 72, paddingHorizontal: spacing.md },
  listContentProjects: { paddingBottom: 48, paddingHorizontal: spacing.md },
  header: { paddingTop: spacing.xs, paddingBottom: spacing.sm, gap: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  addPillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  count: { color: colors.muted, fontSize: 14 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
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
  hint: { fontSize: 12, color: colors.muted },
  err: { color: colors.danger },
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
  emptySub: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
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
  filterBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,18,38,0.45)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  filterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.md,
  },
  resetBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: { fontWeight: '700', color: colors.muted },
  applyBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  applyText: { fontWeight: '700', color: '#fff' },
});

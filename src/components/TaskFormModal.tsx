import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import type { OrgUser, ProjectItem, TaskItem } from '../api/types';
import { DateTimeField } from './DateTimeField';
import { MultiOptionChips, OptionChips } from './OptionChips';
import { PrimaryButton } from './PrimaryButton';
import { AppIcon } from './AppIcon';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  toDateOnlyIso,
} from '../utils/formOptions';
import { colors, radius, spacing } from '../theme';

// RN Slider types can disagree with React 19 JSX; cast keeps the runtime component.
const ProgressSlider = Slider as unknown as React.ComponentType<{
  style?: object;
  minimumValue: number;
  maximumValue: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
}>;

export type TaskFormValues = {
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeIds: string[];
  dueDate: string | null;
  estimatedHours: string;
  progress: string;
  tags: string;
};

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<TaskFormValues> | null;
  task?: TaskItem | null;
  projects: ProjectItem[];
  users: OrgUser[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  onDelete?: () => void;
};

function emptyValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    projectId: '',
    assigneeIds: [],
    dueDate: null,
    estimatedHours: '',
    progress: '0',
    tags: '',
  };
}

function fromTask(task: TaskItem): TaskFormValues {
  const assigneeIds =
    task.assigneeIds?.length
      ? task.assigneeIds
      : task.assignees?.map(a => a.id) ||
        (task.assignedTo ? [task.assignedTo] : []);
  return {
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    projectId: task.projectId || task.project?.id || '',
    assigneeIds,
    dueDate: task.dueDate ? toDateOnlyIso(new Date(task.dueDate)) : null,
    estimatedHours:
      task.estimatedHours != null && task.estimatedHours !== undefined
        ? String(task.estimatedHours)
        : '',
    progress: String(task.progress ?? 0),
    tags: Array.isArray(task.tags)
      ? task.tags.join(', ')
      : typeof task.tags === 'string'
        ? task.tags
        : '',
  };
}

export function TaskFormModal({
  visible,
  mode,
  initial,
  task,
  projects,
  users,
  saving,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [values, setValues] = useState<TaskFormValues>(emptyValues());
  const [hasDue, setHasDue] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());

  useEffect(() => {
    if (!visible) return;
    const base = task ? fromTask(task) : { ...emptyValues(), ...(initial || {}) };
    setValues(base);
    if (base.dueDate) {
      setHasDue(true);
      setDueDate(new Date(`${base.dueDate}T12:00:00`));
    } else {
      setHasDue(false);
      setDueDate(new Date());
    }
  }, [visible, task, initial]);

  const projectOptions = useMemo(
    () => [
      { value: '', label: 'No project' },
      ...projects.map(p => ({ value: p.id, label: p.name })),
    ],
    [projects],
  );

  const userOptions = useMemo(
    () => users.map(u => ({ value: u.id, label: u.name })),
    [users],
  );

  function patch<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues(prev => ({ ...prev, [key]: value }));
  }

  function submit() {
    if (!values.title.trim()) return;
    onSubmit({
      ...values,
      title: values.title.trim(),
      dueDate: hasDue ? toDateOnlyIso(dueDate) : null,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{mode === 'edit' ? 'Edit task' : 'New task'}</Text>
            <Pressable onPress={onClose} style={styles.close}>
              <AppIcon name="x" size={20} color={colors.navy} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={values.title}
              onChangeText={t => patch('title', t)}
              placeholder="What needs doing?"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoFocus={mode === 'create'}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={values.description}
              onChangeText={t => patch('description', t)}
              placeholder="Optional details"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.multiline]}
              multiline
            />

            <OptionChips
              label="Status"
              options={[...TASK_STATUSES]}
              value={values.status}
              onChange={v => patch('status', v)}
            />
            <OptionChips
              label="Priority"
              options={[...TASK_PRIORITIES]}
              value={values.priority}
              onChange={v => patch('priority', v)}
            />
            <OptionChips
              label="Project"
              options={projectOptions}
              value={values.projectId}
              onChange={v => patch('projectId', v)}
            />
            <MultiOptionChips
              label="Assignees"
              options={userOptions}
              values={values.assigneeIds}
              onChange={v => patch('assigneeIds', v)}
            />

            <View style={styles.dueRow}>
              <Text style={styles.labelInline}>Due date</Text>
              <Switch
                value={hasDue}
                onValueChange={setHasDue}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
            {hasDue ? (
              <DateTimeField
                label="Due on"
                value={dueDate}
                onChange={setDueDate}
                mode="date"
              />
            ) : null}

            <Text style={styles.label}>Est. hours</Text>
            <TextInput
              value={values.estimatedHours}
              onChangeText={t => patch('estimatedHours', t.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 2"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <View style={styles.progressHead}>
              <Text style={styles.labelInline}>Progress</Text>
              <Text style={styles.progressValue}>{Number(values.progress) || 0}%</Text>
            </View>
            <ProgressSlider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={Math.min(100, Math.max(0, Number(values.progress) || 0))}
              onValueChange={v => patch('progress', String(Math.round(v)))}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primaryDeep}
            />

            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              value={values.tags}
              onChangeText={t => patch('tags', t)}
              placeholder="client, design"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />

            <PrimaryButton
              label={mode === 'edit' ? 'Save changes' : 'Create task'}
              onPress={submit}
              loading={saving}
            />
            {mode === 'edit' && onDelete ? (
              <PrimaryButton
                label="Delete task"
                variant="danger"
                onPress={onDelete}
                style={{ marginTop: spacing.sm }}
              />
            ) : null}
            <PrimaryButton
              label="Cancel"
              variant="ghost"
              onPress={onClose}
              style={{ marginTop: spacing.sm }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,18,38,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 6,
  },
  labelInline: { fontSize: 12, fontWeight: '700', color: colors.muted },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: spacing.md,
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
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});

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
import type { OrgUser, ProjectItem } from '../api/types';
import { AppIcon } from './AppIcon';
import { DateTimeField } from './DateTimeField';
import { MultiOptionChips, OptionChips } from './OptionChips';
import { PrimaryButton } from './PrimaryButton';
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  toDateOnlyIso,
} from '../utils/formOptions';
import { colors, radius, spacing } from '../theme';

export type ProjectFormValues = {
  name: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  parentId: string;
  startDate: string | null;
  dueDate: string | null;
  memberIds: string[];
};

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  project?: ProjectItem | null;
  projects: ProjectItem[];
  users: OrgUser[];
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void;
};

function emptyValues(): ProjectFormValues {
  return {
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    type: 'other',
    parentId: '',
    startDate: null,
    dueDate: null,
    memberIds: [],
  };
}

function fromProject(project: ProjectItem): ProjectFormValues {
  const memberIds =
    project.members
      ?.map(m => m.user?.id || m.userId)
      .filter((id): id is string => !!id) || [];
  return {
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'active',
    priority: project.priority || 'medium',
    type: project.type || 'other',
    parentId: project.parentId || '',
    startDate: project.startDate ? toDateOnlyIso(new Date(project.startDate)) : null,
    dueDate: project.dueDate ? toDateOnlyIso(new Date(project.dueDate)) : null,
    memberIds,
  };
}

export function ProjectFormModal({
  visible,
  mode,
  project,
  projects,
  users,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ProjectFormValues>(emptyValues());
  const [hasStart, setHasStart] = useState(false);
  const [hasDue, setHasDue] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());

  useEffect(() => {
    if (!visible) return;
    const base = project ? fromProject(project) : emptyValues();
    setValues(base);
    if (base.startDate) {
      setHasStart(true);
      setStartDate(new Date(`${base.startDate}T12:00:00`));
    } else {
      setHasStart(false);
    }
    if (base.dueDate) {
      setHasDue(true);
      setDueDate(new Date(`${base.dueDate}T12:00:00`));
    } else {
      setHasDue(false);
    }
  }, [visible, project]);

  const parentOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...projects
        .filter(p => p.id !== project?.id)
        .map(p => ({ value: p.id, label: p.name })),
    ],
    [project?.id, projects],
  );

  const userOptions = useMemo(
    () => users.map(u => ({ value: u.id, label: u.name })),
    [users],
  );

  function patch<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues(prev => ({ ...prev, [key]: value }));
  }

  function submit() {
    if (!values.name.trim()) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      startDate: hasStart ? toDateOnlyIso(startDate) : null,
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
            <Text style={styles.sheetTitle}>
              {mode === 'edit' ? 'Edit project' : 'New project'}
            </Text>
            <Pressable onPress={onClose} style={styles.close}>
              <AppIcon name="x" size={20} color={colors.navy} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={values.name}
              onChangeText={t => patch('name', t)}
              placeholder="Project name"
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
              label="Department / type"
              options={[...PROJECT_TYPES]}
              value={values.type}
              onChange={v => patch('type', v)}
            />
            <OptionChips
              label="Status"
              options={[...PROJECT_STATUSES]}
              value={values.status}
              onChange={v => patch('status', v)}
            />
            <OptionChips
              label="Priority"
              options={[...PROJECT_PRIORITIES]}
              value={values.priority}
              onChange={v => patch('priority', v)}
            />
            <OptionChips
              label="Parent project"
              options={parentOptions}
              value={values.parentId}
              onChange={v => patch('parentId', v)}
            />
            <MultiOptionChips
              label="Team members"
              options={userOptions}
              values={values.memberIds}
              onChange={v => patch('memberIds', v)}
            />

            <View style={styles.dueRow}>
              <Text style={styles.labelInline}>Start date</Text>
              <Switch
                value={hasStart}
                onValueChange={setHasStart}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
            {hasStart ? (
              <DateTimeField label="Starts on" value={startDate} onChange={setStartDate} mode="date" />
            ) : null}

            <View style={styles.dueRow}>
              <Text style={styles.labelInline}>Due date</Text>
              <Switch
                value={hasDue}
                onValueChange={setHasDue}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
            {hasDue ? (
              <DateTimeField label="Due on" value={dueDate} onChange={setDueDate} mode="date" />
            ) : null}

            <PrimaryButton
              label={mode === 'edit' ? 'Save changes' : 'Create project'}
              onPress={submit}
              loading={saving}
            />
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

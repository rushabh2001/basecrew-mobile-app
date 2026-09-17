import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { TaskItem } from '../api/types';
import { formatDueLabel } from '../utils/taskGroups';
import { AppIcon } from './AppIcon';
import { TaskCheckbox } from './TaskCheckbox';
import { colors, radius, spacing } from '../theme';

type Props = {
  task: TaskItem;
  onToggle: (task: TaskItem) => void;
  onPress?: (task: TaskItem) => void;
  showProject?: boolean;
};

const SWIPE_THRESHOLD = 72;

function priorityAccent(priority?: string | null) {
  if (priority === 'urgent' || priority === 'high') return colors.danger;
  if (priority === 'medium') return colors.warning;
  return 'transparent';
}

export function SwipeableTaskRow({
  task,
  onToggle,
  onPress,
  showProject = true,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const completed = task.status === 'completed';
  const tapStart = useRef({ x: 0, y: 0, t: 0 });

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !completed && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: evt => {
        tapStart.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          t: Date.now(),
        };
      },
      onPanResponderMove: (_, g) => {
        if (g.dx > 0) translateX.setValue(Math.min(g.dx, 100));
      },
      onPanResponderRelease: (evt, g) => {
        if (g.dx >= SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: 120,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            onToggle(task);
          });
          return;
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
        }).start();

        const dx = Math.abs(evt.nativeEvent.pageX - tapStart.current.x);
        const dy = Math.abs(evt.nativeEvent.pageY - tapStart.current.y);
        const dt = Date.now() - tapStart.current.t;
        if (onPress && dx < 8 && dy < 8 && dt < 280 && Math.abs(g.dx) < 8) {
          onPress(task);
        }
      },
    }),
  ).current;

  const due = formatDueLabel(task.dueDate);
  const overdue =
    task.dueDate &&
    task.status !== 'completed' &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <View style={styles.wrap}>
      <View style={styles.completeBg}>
        <AppIcon name="check" size={22} color="#fff" />
        <Text style={styles.completeLabel}>Done</Text>
      </View>
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...pan.panHandlers}>
        <View style={[styles.accent, { backgroundColor: priorityAccent(task.priority) }]} />
        <TaskCheckbox
          checked={completed}
          onToggle={() => onToggle(task)}
        />
        <View style={styles.body}>
          <Text
            style={[styles.title, completed && styles.titleDone]}
            numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            {showProject && task.project?.name ? (
              <View style={styles.chip}>
                <AppIcon name="briefcase" size={11} color={colors.primaryDeep} />
                <Text style={styles.chipText}>{task.project.name}</Text>
              </View>
            ) : null}
            {due ? (
              <View style={[styles.chip, overdue && styles.chipOverdue]}>
                <AppIcon
                  name="calendar"
                  size={11}
                  color={overdue ? colors.danger : colors.muted}
                />
                <Text style={[styles.chipText, overdue && { color: colors.danger }]}>
                  {due}
                </Text>
              </View>
            ) : null}
            {task.status === 'in-progress' && !completed ? (
              <View style={[styles.chip, styles.chipProgress]}>
                <Text style={[styles.chipText, { color: colors.primaryDeep }]}>
                  In progress
                </Text>
              </View>
            ) : null}
            {task.status === 'hold' && !completed ? (
              <View style={[styles.chip, styles.chipHold]}>
                <Text style={[styles.chipText, { color: colors.warning }]}>On hold</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 2,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  completeBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    gap: 8,
  },
  completeLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: spacing.md,
    paddingLeft: 4,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  accent: { width: 3, alignSelf: 'stretch', borderRadius: 2, marginRight: 8 },
  body: { flex: 1, marginLeft: spacing.sm },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
  },
  chipOverdue: { backgroundColor: colors.dangerSoft },
  chipProgress: { backgroundColor: colors.primarySoft },
  chipHold: { backgroundColor: colors.warningSoft },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.muted },
});

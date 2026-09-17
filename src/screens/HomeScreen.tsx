import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import type { ClockSession, TaskItem } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { AppIcon, type AppIconName } from '../components/AppIcon';
import { DayGreeting } from '../components/DayGreeting';
import { ScreenHeader } from '../components/ScreenHeader';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { getClockGeo } from '../geo/location';
import { animateListChange } from '../utils/animations';
import { todayFocusTasks } from '../utils/taskGroups';
import { colors, radius, shadows, spacing } from '../theme';

function formatTime(iso: string | null | undefined) {
  if (!iso) return '--:--';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

function elapsedLabel(fromIso: string | null | undefined, now: number) {
  if (!fromIso) return '0h 00m';
  const ms = Math.max(0, now - new Date(fromIso).getTime());
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { token, user } = useAuth();
  const [session, setSession] = useState<ClockSession | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [clockRow, dash, taskRows] = await Promise.all([
        api.fetchClock(token),
        api.fetchDashboard(token),
        api.fetchTasks(token, '?myTasks=true'),
      ]);
      setSession(clockRow);
      setDashboard(dash);
      setTasks(Array.isArray(taskRows) ? taskRows : []);
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

  const onLunch = !!session?.lunchStart && !session?.lunchEnd;
  const clockedIn = !!session?.clockIn && !session?.clockOut;
  const done = !!session?.clockIn && !!session?.clockOut;

  const focusTasks = useMemo(() => todayFocusTasks(tasks, 5), [tasks]);

  const statsData = dashboard?.stats || dashboard || {};
  const openTasks = statsData.myTasks ?? tasks.filter(t => t.status !== 'completed').length;
  const overdue = statsData.overdueTasksCount ?? 0;
  const hoursValue =
    statsData.todayHours != null ? Number(statsData.todayHours).toFixed(1) : '-';

  async function runAction(action: 'clock-in' | 'clock-out' | 'lunch-start' | 'lunch-end') {
    if (!token || busy) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      let geo = null;
      if (action === 'clock-in' || action === 'clock-out') geo = await getClockGeo();
      const row = await api.postClock(token, action, geo);
      setSession(row);
      setMessage(
        action === 'clock-in'
          ? 'Clocked in'
          : action === 'clock-out'
            ? 'Clocked out'
            : action === 'lunch-start'
              ? 'Lunch started'
              : 'Back from lunch',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(task: TaskItem) {
    if (!token) return;
    const completing = task.status !== 'completed';
    animateListChange();
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, status: completing ? 'completed' : 'todo' } : t,
      ),
    );
    try {
      await api.updateTask(token, task.id, {
        status: completing ? 'completed' : 'todo',
        ...(completing ? { progress: 100 } : {}),
      });
    } catch {
      await load();
    }
  }

  const primaryClockAction = !session?.clockIn
    ? { label: 'Clock in', action: 'clock-in' as const, icon: 'log-in' as const }
    : !session.clockOut && !onLunch
      ? { label: 'Start lunch', action: 'lunch-start' as const, icon: 'coffee' as const }
      : onLunch
        ? { label: 'End lunch', action: 'lunch-end' as const, icon: 'rotate-ccw' as const }
        : !session.clockOut
          ? { label: 'Clock out', action: 'clock-out' as const, icon: 'log-out' as const }
          : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topPad}>
          <ScreenHeader showLogo={false} />
          <DayGreeting name={user?.name} subtitle="Plan your day and stay on track" />
        </View>

        <View style={[styles.clockStrip, shadows.sm]}>
          <View style={styles.clockLeft}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: done
                    ? colors.success
                    : clockedIn
                      ? colors.primary
                      : colors.muted,
                },
              ]}
            />
            <View>
              <Text style={styles.clockLabel}>
                {done
                  ? 'Day complete'
                  : onLunch
                    ? 'On lunch'
                    : clockedIn
                      ? 'Working'
                      : 'Not clocked in'}
              </Text>
              <Text style={styles.clockTime}>
                {clockedIn
                  ? elapsedLabel(onLunch ? session?.lunchStart : session?.clockIn, now)
                  : done
                    ? `${formatTime(session?.clockIn)} - ${formatTime(session?.clockOut)}`
                    : 'Tap to start your day'}
              </Text>
            </View>
          </View>
          {primaryClockAction ? (
            <Pressable
              style={[styles.clockBtn, busy && { opacity: 0.6 }]}
              disabled={busy}
              onPress={() => runAction(primaryClockAction.action)}>
              <AppIcon name={primaryClockAction.icon} size={18} color="#fff" />
              <Text style={styles.clockBtnText}>{primaryClockAction.label}</Text>
            </Pressable>
          ) : (
            <AppIcon name="check" size={24} color={colors.success} />
          )}
        </View>

        {message ? <Text style={styles.ok}>{message}</Text> : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}

        <View style={styles.statsRow}>
          <StatCard
            icon="list"
            label="Open"
            value={String(openTasks)}
            hint="View all tasks"
            onPress={() => navigation.navigate('Tasks')}
          />
          <StatCard
            icon="alert-circle"
            label="Overdue"
            value={String(overdue)}
            hint="Review overdue"
            accent={overdue > 0}
            onPress={() => navigation.navigate('Tasks')}
          />
          <StatCard
            icon="hourglass"
            label="Hours"
            value={hoursValue}
            hint="Team activity"
            onPress={() => navigation.navigate('Team')}
          />
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Focus today</Text>
          <Pressable onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <View style={[styles.taskCard, shadows.sm]}>
          {focusTasks.length === 0 ? (
            <View style={styles.emptyFocus}>
              <AppIcon name="check" size={36} color={colors.success} />
              <Text style={styles.emptyFocusTitle}>You're all set for today</Text>
              <Pressable onPress={() => navigation.navigate('Tasks')}>
                <Text style={styles.seeAll}>Add tasks</Text>
              </Pressable>
            </View>
          ) : (
            focusTasks.map(task => (
              <SwipeableTaskRow
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onPress={() => navigation.navigate('Tasks')}
                showProject
              />
            ))
          )}
        </View>

        {clockedIn && !done && primaryClockAction?.action !== 'clock-out' ? (
          <View style={styles.secondaryActions}>
            <SecondaryBtn
              icon="log-out"
              label="Clock out"
              onPress={() => runAction('clock-out')}
              disabled={busy}
              danger
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.statCard, accent && styles.statCardAccent]}>
      <View style={[styles.statIconWrap, accent && styles.statIconWrapAccent]}>
        <AppIcon
          name={icon}
          size={20}
          color={accent ? colors.danger : colors.primaryDeep}
        />
      </View>
      <Text style={[styles.statValue, accent && { color: colors.danger }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statHint} numberOfLines={1}>
        {hint}
      </Text>
    </Pressable>
  );
}

function SecondaryBtn({
  icon,
  label,
  onPress,
  disabled,
  danger,
}: {
  icon: 'coffee' | 'log-out';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.secondaryBtn, danger && styles.secondaryBtnDanger]}>
      <AppIcon name={icon} size={18} color={danger ? colors.danger : colors.primaryDeep} />
      <Text style={[styles.secondaryLabel, danger && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { paddingBottom: 32 },
  topPad: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  clockStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clockLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  clockLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  clockTime: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 2 },
  clockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  clockBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  ok: {
    color: colors.success,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    fontWeight: '600',
  },
  err: { color: colors.danger, marginTop: spacing.sm, paddingHorizontal: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statCardAccent: {
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: 2,
  },
  statIconWrapAccent: { backgroundColor: '#fff' },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
  statHint: { fontSize: 10, fontWeight: '500', color: colors.muted, textAlign: 'center' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.primaryDeep },
  taskCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyFocus: { alignItems: 'center', paddingVertical: spacing.xl, gap: 8 },
  emptyFocusTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
  },
  secondaryLabel: { fontWeight: '700', color: colors.primaryDeep, fontSize: 14 },
});

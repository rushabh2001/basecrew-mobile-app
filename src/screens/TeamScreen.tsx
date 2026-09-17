import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import type { TeamClockRow, WorklogUser } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import {
  formatDateOnlyLabel,
  shiftDateOnly,
  toDateOnlyIso,
} from '../utils/formOptions';
import { colors, radius, spacing } from '../theme';

function formatTime(iso: string | null | undefined) {
  if (!iso) return '--:--';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function canViewTeam(role?: string | null) {
  return role === 'admin' || role === 'team_leader' || role === 'super_admin';
}

export function TeamScreen() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('Activity');
  const [selectedDate, setSelectedDate] = useState(() => toDateOnlyIso(new Date()));
  const [clockRows, setClockRows] = useState<TeamClockRow[]>([]);
  const [worklog, setWorklog] = useState<WorklogUser[]>([]);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const leader = canViewTeam(user?.role);
  const todayIso = toDateOnlyIso(new Date());
  const isToday = selectedDate === todayIso;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      if (leader) {
        const [clock, log] = await Promise.all([
          api.fetchTeamClock(token, selectedDate),
          api.fetchDailyWorklog(token, selectedDate),
        ]);
        setClockRows(clock.rows || []);
        setWorklog(log.users || []);
      } else {
        const entries = await api.fetchMyTimeEntries(token, 80);
        setMyEntries(Array.isArray(entries) ? entries : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [leader, selectedDate, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const dayMine = useMemo(() => {
    return myEntries.filter(e => {
      const start = e.startedAt ? new Date(e.startedAt).toISOString().slice(0, 10) : '';
      return start === selectedDate || (!e.endedAt && isToday && start === todayIso);
    });
  }, [isToday, myEntries, selectedDate, todayIso]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <ScreenHeader
          showLogo={false}
          title="Team"
          subtitle={isToday ? 'Activity and attendance' : formatDateOnlyLabel(selectedDate)}
        />

        <View style={styles.dateNav}>
          <Pressable
            style={styles.dateBtn}
            onPress={() => setSelectedDate(d => shiftDateOnly(d, -1))}
            accessibilityLabel="Previous day">
            <AppIcon name="chevron-left" size={20} color={colors.navy} />
          </Pressable>
          <View style={styles.dateCenter}>
            <Text style={styles.dateLabel}>{formatDateOnlyLabel(selectedDate)}</Text>
            {!isToday ? (
              <Pressable onPress={() => setSelectedDate(todayIso)}>
                <Text style={styles.todayLink}>Jump to today</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable
            style={[styles.dateBtn, selectedDate >= todayIso && styles.dateBtnDisabled]}
            disabled={selectedDate >= todayIso}
            onPress={() => setSelectedDate(d => shiftDateOnly(d, 1))}
            accessibilityLabel="Next day">
            <AppIcon
              name="chevron-right"
              size={20}
              color={selectedDate >= todayIso ? colors.borderStrong : colors.navy}
            />
          </Pressable>
        </View>

        {leader ? (
          <SegmentedControl options={['Activity', 'Clock']} value={tab} onChange={setTab} />
        ) : null}

        {error ? <Text style={styles.err}>{error}</Text> : null}

        {leader && tab === 'Clock' ? (
          <View style={{ marginTop: spacing.md, gap: 12 }}>
            {clockRows.map(row => (
              <View key={row.userId} style={styles.card}>
                <Text style={styles.name}>{row.name}</Text>
                <Text style={styles.meta}>
                  {row.departmentType || row.role} · In {formatTime(row.clockIn)} · Out{' '}
                  {formatTime(row.clockOut)}
                </Text>
                <Text style={styles.meta}>
                  Lunch {formatTime(row.lunchStart)}
                  {row.lunchEnd
                    ? ` - ${formatTime(row.lunchEnd)}`
                    : row.lunchStart
                      ? ' (open)'
                      : ''}
                </Text>
              </View>
            ))}
            {!loading && clockRows.length === 0 ? (
              <Text style={styles.empty}>No team clock data for this day.</Text>
            ) : null}
          </View>
        ) : null}

        {leader && tab === 'Activity' ? (
          <View style={{ marginTop: spacing.md, gap: 12 }}>
            {worklog.map(u => (
              <View key={u.userId} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Text style={styles.hours}>{formatDuration(u.totalSeconds)}</Text>
                </View>
                {u.department ? <Text style={styles.meta}>{u.department}</Text> : null}
                {u.entries.map(entry => (
                  <View key={entry.entryId} style={styles.entry}>
                    <View style={styles.entryTitleRow}>
                      <Text style={styles.entryTitle} numberOfLines={2}>
                        {entry.taskTitle}
                      </Text>
                      {entry.running ? (
                        <View style={styles.liveBadge}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>Live</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.meta}>
                      {entry.projectName || 'No project'} · {formatDuration(entry.durationSeconds)}
                    </Text>
                  </View>
                ))}
                {u.entries.length === 0 ? (
                  <Text style={styles.meta}>No task time logged this day.</Text>
                ) : null}
              </View>
            ))}
            {!loading && worklog.length === 0 ? (
              <Text style={styles.empty}>No task activity for this day.</Text>
            ) : null}
          </View>
        ) : null}

        {!leader ? (
          <View style={{ marginTop: spacing.md, gap: 12 }}>
            <Text style={styles.section}>Your day</Text>
            {dayMine.map(e => (
              <View key={e.id} style={styles.card}>
                <Text style={styles.name}>{e.task?.title || 'Task'}</Text>
                <Text style={styles.meta}>
                  {e.task?.project?.name || 'No project'} ·{' '}
                  {e.endedAt
                    ? formatDuration(
                        Math.max(
                          0,
                          Math.round(
                            (new Date(e.endedAt).getTime() - new Date(e.startedAt).getTime()) /
                              1000,
                          ),
                        ),
                      )
                    : 'Running'}
                </Text>
              </View>
            ))}
            {!loading && dayMine.length === 0 ? (
              <Text style={styles.empty}>No task timers for this day yet.</Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: 48 },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    gap: 8,
  },
  dateBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBtnDisabled: { opacity: 0.45 },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  todayLink: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontWeight: '700', color: colors.text, fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  hours: { fontWeight: '700', color: colors.primaryDeep },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entry: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryTitle: { flex: 1, fontWeight: '600', color: colors.text, fontSize: 13 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.2,
  },
  empty: { color: colors.muted },
  err: { color: colors.danger, marginTop: spacing.sm },
});

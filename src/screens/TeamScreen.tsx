import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
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
  const [clockRows, setClockRows] = useState<TeamClockRow[]>([]);
  const [worklog, setWorklog] = useState<WorklogUser[]>([]);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [dateLabel, setDateLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const leader = canViewTeam(user?.role);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      if (leader) {
        const [clock, log] = await Promise.all([
          api.fetchTeamClock(token),
          api.fetchDailyWorklog(token),
        ]);
        setClockRows(clock.rows || []);
        setWorklog(log.users || []);
        setDateLabel(log.date || clock.date || '');
      } else {
        const entries = await api.fetchMyTimeEntries(token, 50);
        setMyEntries(Array.isArray(entries) ? entries : []);
        setDateLabel(new Date().toISOString().slice(0, 10));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [leader, token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const todayMine = useMemo(() => {
    const day = dateLabel || new Date().toISOString().slice(0, 10);
    return myEntries.filter(e => {
      const start = e.startedAt ? new Date(e.startedAt).toISOString().slice(0, 10) : '';
      return start === day || !e.endedAt;
    });
  }, [dateLabel, myEntries]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <ScreenHeader showLogo title="Team today" subtitle={dateLabel ? `Activity for ${dateLabel}` : 'Live attendance and task time'} />

        {leader ? (
          <SegmentedControl
            options={['Activity', 'Clock']}
            value={tab}
            onChange={setTab}
          />
        ) : null}

        {error ? <Text style={styles.err}>{error}</Text> : null}

        {leader && tab === 'Clock' ? (
          <View style={{ marginTop: spacing.md }}>
            {clockRows.map(row => (
              <View key={row.userId} style={styles.card}>
                <Text style={styles.name}>{row.name}</Text>
                <Text style={styles.meta}>
                  {row.departmentType || row.role} · In {formatTime(row.clockIn)} · Out{' '}
                  {formatTime(row.clockOut)}
                </Text>
                <Text style={styles.meta}>
                  Lunch {formatTime(row.lunchStart)}
                  {row.lunchEnd ? ` - ${formatTime(row.lunchEnd)}` : row.lunchStart ? ' (open)' : ''}
                </Text>
              </View>
            ))}
            {!loading && clockRows.length === 0 ? (
              <Text style={styles.empty}>No team clock data.</Text>
            ) : null}
          </View>
        ) : null}

        {leader && tab === 'Activity' ? (
          <View style={{ marginTop: spacing.md }}>
            {worklog.map(u => (
              <View key={u.userId} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Text style={styles.hours}>{formatDuration(u.totalSeconds)}</Text>
                </View>
                {u.department ? <Text style={styles.meta}>{u.department}</Text> : null}
                {u.entries.map(entry => (
                  <View key={entry.entryId} style={styles.entry}>
                    <Text style={styles.entryTitle}>
                      {entry.taskTitle}
                      {entry.running ? ' · live' : ''}
                    </Text>
                    <Text style={styles.meta}>
                      {entry.projectName || 'No project'} · {formatDuration(entry.durationSeconds)}
                    </Text>
                  </View>
                ))}
                {u.entries.length === 0 ? (
                  <Text style={styles.meta}>No task time logged today.</Text>
                ) : null}
              </View>
            ))}
            {!loading && worklog.length === 0 ? (
              <Text style={styles.empty}>No task activity recorded today.</Text>
            ) : null}
          </View>
        ) : null}

        {!leader ? (
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.section}>Your day</Text>
            {todayMine.map(e => (
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
            {!loading && todayMine.length === 0 ? (
              <Text style={styles.empty}>No task timers for today yet.</Text>
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
  title: { fontSize: 28, fontWeight: '700', color: colors.navy },
  sub: { color: colors.muted, marginBottom: spacing.md, marginTop: 4 },
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
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  hours: { fontSize: 14, fontWeight: '700', color: colors.primaryDeep },
  meta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  entry: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  entryTitle: { fontWeight: '600', color: colors.text, fontSize: 14 },
  empty: { color: colors.muted, marginTop: spacing.md },
  err: { color: colors.danger, marginTop: spacing.sm },
});

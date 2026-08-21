import React, { useCallback, useState } from 'react';
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
import type { ClockSession } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { getClockGeo } from '../geo/location';
import { colors, spacing } from '../theme';

function formatTime(iso: string | null | undefined) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '-';
  }
}

export function ClockScreen() {
  const { token, user } = useAuth();
  const [session, setSession] = useState<ClockSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const row = await api.fetchClock(token);
      setSession(row);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load clock');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function runAction(action: 'clock-in' | 'clock-out' | 'lunch-start' | 'lunch-end') {
    if (!token) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      let geo = null;
      if (action === 'clock-in' || action === 'clock-out') {
        geo = await getClockGeo();
      }
      const row = await api.postClock(token, action, geo);
      setSession(row);
      if (action === 'clock-in') {
        setMessage(
          row.clockInLabel
            ? `Clocked in near ${row.clockInLabel}`
            : 'Clocked in with location captured',
        );
      } else if (action === 'clock-out') {
        setMessage(
          row.clockOutLabel
            ? `Clocked out near ${row.clockOutLabel}`
            : 'Clocked out with location captured',
        );
      } else {
        setMessage(action === 'lunch-start' ? 'Lunch started' : 'Lunch ended');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  const onLunch = !!session?.lunchStart && !session?.lunchEnd;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <Text style={styles.hello}>Hi, {user?.name?.split(' ')[0] || 'there'}</Text>
        <Text style={styles.title}>Today's clock</Text>

        <View style={styles.card}>
          <Row label="Clock in" value={formatTime(session?.clockIn)} />
          <Row label="Clock out" value={formatTime(session?.clockOut)} />
          <Row label="Lunch" value={
            session?.lunchStart
              ? `${formatTime(session.lunchStart)} - ${formatTime(session.lunchEnd)}`
              : '-'
          } />
          {session?.clockInLabel ? (
            <Text style={styles.geo}>In: {session.clockInLabel}</Text>
          ) : null}
          {session?.clockOutLabel ? (
            <Text style={styles.geo}>Out: {session.clockOutLabel}</Text>
          ) : null}
        </View>

        {message ? <Text style={styles.ok}>{message}</Text> : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {!session?.clockIn ? (
          <PrimaryButton
            label="Clock in"
            onPress={() => runAction('clock-in')}
            loading={busy}
            style={{ marginTop: spacing.md }}
          />
        ) : !session.clockOut ? (
          <View style={styles.actions}>
            {!onLunch ? (
              <PrimaryButton
                label="Start lunch"
                variant="ghost"
                onPress={() => runAction('lunch-start')}
                loading={busy}
              />
            ) : (
              <PrimaryButton
                label="End lunch"
                variant="ghost"
                onPress={() => runAction('lunch-end')}
                loading={busy}
              />
            )}
            <PrimaryButton
              label="Clock out"
              variant="danger"
              onPress={() => runAction('clock-out')}
              loading={busy}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        ) : (
          <Text style={styles.done}>You are clocked out for today.</Text>
        )}

        <Text style={styles.hint}>
          Location is captured on clock in and clock out and syncs to the web attendance record.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: 48 },
  hello: { color: colors.muted, fontSize: 14 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rowLabel: { color: colors.muted, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  geo: { color: colors.primary, marginTop: spacing.xs, fontSize: 13 },
  actions: { marginTop: spacing.md },
  ok: { color: colors.success, marginTop: spacing.md },
  err: { color: colors.danger, marginTop: spacing.md },
  done: { marginTop: spacing.lg, color: colors.muted, fontSize: 15 },
  hint: {
    marginTop: spacing.xl,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});

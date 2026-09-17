import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { API_BASE_URL } from '../config';
import {
  enableAndRegisterPush,
  isPushSdkAvailable,
  startPushTokenSync,
  unregisterPush,
} from '../push/pushNotifications';
import { colors, radius, spacing } from '../theme';

function roleLabel(role?: string | null) {
  if (role === 'admin') return 'Admin';
  if (role === 'team_leader') return 'Team leader';
  if (role === 'super_admin') return 'Super admin';
  return 'Team member';
}

export function ProfileScreen() {
  const { user, token, signOut } = useAuth();
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [pushReminders, setPushReminders] = useState(false);

  const loadPrefs = useCallback(async () => {
    if (!token) return;
    setLoadingPrefs(true);
    try {
      const profile = await api.fetchMyProfile(token);
      setPushNotifications(!!profile.pushNotificationEnabled);
      setPushReminders(!!profile.pushReminderEnabled);
    } catch {
      // keep defaults
    } finally {
      setLoadingPrefs(false);
    }
  }, [token]);

  useEffect(() => {
    void loadPrefs();
  }, [loadPrefs]);

  useEffect(() => {
    if (!token || (!pushNotifications && !pushReminders)) return;
    return startPushTokenSync(token);
  }, [token, pushNotifications, pushReminders]);

  async function setPushPref(
    field: 'pushNotificationEnabled' | 'pushReminderEnabled',
    next: boolean,
  ) {
    if (!token) return;
    const previousNotifications = pushNotifications;
    const previousReminders = pushReminders;

    if (field === 'pushNotificationEnabled') setPushNotifications(next);
    else setPushReminders(next);

    setSaving(true);
    try {
      if (next) {
        if (!isPushSdkAvailable()) {
          Alert.alert(
            'Push not configured',
            'Firebase is not set up in this build yet. Add google-services.json / GoogleService-Info.plist, then rebuild.',
          );
          if (field === 'pushNotificationEnabled') setPushNotifications(previousNotifications);
          else setPushReminders(previousReminders);
          return;
        }
        const result = await enableAndRegisterPush(token);
        if (!result.ok) {
          const detail =
            result.reason === 'denied'
              ? 'Allow notifications in iOS Settings → BaseCrew to receive alerts.'
              : result.reason === 'api_missing'
                ? result.message ||
                  'Push API is not on the server yet. Deploy the latest web app, then try again.'
                : result.message ||
                  'Could not register this device for push. Check Firebase / APNs setup and try again.';
          Alert.alert(
            result.reason === 'denied' ? 'Permission needed' : 'Could not enable alerts',
            detail,
          );
          if (field === 'pushNotificationEnabled') setPushNotifications(previousNotifications);
          else setPushReminders(previousReminders);
          return;
        }
      }

      await api.updateMyProfile(token, { [field]: next });

      const notificationsOn =
        field === 'pushNotificationEnabled' ? next : previousNotifications;
      const remindersOn = field === 'pushReminderEnabled' ? next : previousReminders;
      if (!notificationsOn && !remindersOn) {
        await unregisterPush(token);
      }
    } catch (e) {
      if (field === 'pushNotificationEnabled') setPushNotifications(previousNotifications);
      else setPushReminders(previousReminders);
      Alert.alert('Could not update', e instanceof Error ? e.message : 'Try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <ScreenHeader showLogo={false} title="Profile" />
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || '?').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{roleLabel(user?.role)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mobile alerts</Text>
          <Text style={styles.sectionHint}>
            Turn these on to get push alerts on this phone. Automatic alerts cover task and team
            notifications. Reminder alerts cover your custom inbox reminders.
          </Text>
          {loadingPrefs ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>Automatic notifications</Text>
                  <Text style={styles.rowMeta}>Tasks, deadlines, assignments</Text>
                </View>
                <Switch
                  value={pushNotifications}
                  disabled={saving}
                  onValueChange={v => void setPushPref('pushNotificationEnabled', v)}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>Custom reminders</Text>
                  <Text style={styles.rowMeta}>Push when a reminder is due</Text>
                </View>
                <Switch
                  value={pushReminders}
                  disabled={saving}
                  onValueChange={v => void setPushPref('pushReminderEnabled', v)}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
            </>
          )}
        </View>

        <Text style={styles.api}>Connected to {API_BASE_URL.replace(/^https?:\/\//, '')}</Text>
        <PrimaryButton label="Sign out" variant="danger" onPress={() => signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  meta: { color: colors.muted, marginTop: 4 },
  rolePill: {
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  roleText: { color: colors.primaryDeep, fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.navy },
  sectionHint: { color: colors.muted, fontSize: 13, marginTop: 6, lineHeight: 18 },
  row: {
    width: '100%',
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: { flex: 1 },
  rowTitle: { fontWeight: '600', color: colors.text },
  rowMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  api: { color: colors.muted, fontSize: 12, marginBottom: spacing.lg },
});

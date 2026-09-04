import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { API_BASE_URL } from '../config';
import { colors, radius, spacing } from '../theme';

function roleLabel(role?: string | null) {
  if (role === 'admin') return 'Admin';
  if (role === 'team_leader') return 'Team leader';
  if (role === 'super_admin') return 'Super admin';
  return 'Team member';
}

export function ProfileScreen() {
  const { user, signOut } = useAuth();

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
        <Text style={styles.api}>Connected to {API_BASE_URL.replace(/^https?:\/\//, '')}</Text>
        <PrimaryButton label="Sign out" variant="danger" onPress={() => signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.lg,
  },
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
  api: { color: colors.muted, fontSize: 12, marginBottom: spacing.lg },
});

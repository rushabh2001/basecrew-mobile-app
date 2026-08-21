import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { API_BASE_URL } from '../config';
import { colors, spacing } from '../theme';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.meta}>{user?.email}</Text>
          <Text style={styles.meta}>Role: {user?.role}</Text>
        </View>
        <Text style={styles.api}>API: {API_BASE_URL}</Text>
        <PrimaryButton label="Sign out" variant="danger" onPress={() => signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  meta: { color: colors.muted, marginTop: 4 },
  api: { color: colors.muted, fontSize: 12, marginBottom: spacing.lg },
});

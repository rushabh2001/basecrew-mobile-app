import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../theme';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [organizationCode, setOrganizationCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn({
        organizationCode: organizationCode.trim(),
        email: email.trim(),
        password,
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Unable to sign in';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <BrandLogo variant="dark" height={42} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in with your organization to clock in, manage tasks, and stay aligned with your team.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Organization code</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              value={organizationCode}
              onChangeText={setOrganizationCode}
              placeholder="acme"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Sign in"
            onPress={onSubmit}
            loading={loading}
            disabled={!email || !password}
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hero: {
    backgroundColor: colors.navy,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

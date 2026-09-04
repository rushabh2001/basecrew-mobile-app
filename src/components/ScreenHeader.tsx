import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { AppIcon } from './AppIcon';
import { BrandLogo } from './BrandLogo';
import { colors, radius, spacing } from '../theme';

type Props = {
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
  /** Use on navy hero backgrounds */
  tone?: 'light' | 'dark';
  /** Optional action rendered before the notification bell */
  rightAction?: React.ReactNode;
};

export function ScreenHeader({
  showLogo = true,
  title,
  subtitle,
  tone = 'light',
  rightAction,
}: Props) {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);

  const loadUnread = useCallback(async () => {
    if (!token) {
      setUnread(0);
      return;
    }
    try {
      const rows = await api.fetchNotifications(token);
      const list = Array.isArray(rows) ? rows : [];
      setUnread(list.filter(n => !n.read).length);
    } catch {
      // keep prior count
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadUnread();
    }, [loadUnread]),
  );

  const onDark = tone === 'dark';
  const bellColor = onDark ? '#fff' : colors.navy;

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {showLogo ? <BrandLogo variant="dark" height={28} /> : null}
        {title ? (
          <View style={showLogo ? styles.titleBlock : undefined}>
            <Text style={[styles.title, onDark && styles.titleDark]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, onDark && styles.subtitleDark]}>{subtitle}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.right}>
        {rightAction}
        <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={() => navigation.navigate('Inbox')}
        style={({ pressed }) => [
          styles.bellBtn,
          onDark && styles.bellBtnDark,
          pressed && styles.bellPressed,
        ]}>
        <AppIcon name="bell" size={22} color={bellColor} />
        {unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleBlock: { marginLeft: spacing.xs },
  title: { fontSize: 18, fontWeight: '700', color: colors.navy },
  titleDark: { color: '#fff' },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  subtitleDark: { color: colors.glow },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  bellPressed: { opacity: 0.75 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NotificationItem } from '../api/types';
import { AppIcon, type AppIconName } from './AppIcon';
import { colors, radius, shadows, spacing } from '../theme';

type Tone = {
  icon: AppIconName;
  label: string;
  accent: string;
  soft: string;
};

function alertTone(type?: string): Tone {
  switch (type) {
    case 'urgent_task':
      return { icon: 'alert-circle', label: 'Urgent', accent: colors.danger, soft: colors.dangerSoft };
    case 'deadline_today':
    case 'project_due_today':
    case 'deadline_warning':
      return { icon: 'calendar', label: 'Deadline', accent: colors.warning, soft: colors.warningSoft };
    case 'task_assigned':
      return { icon: 'check-square', label: 'Task', accent: colors.primaryDeep, soft: colors.primarySoft };
    case 'project_assigned':
    case 'project_update':
      return { icon: 'folder', label: 'Project', accent: colors.primaryDeep, soft: colors.primarySoft };
    case 'birthday':
      return { icon: 'bell', label: 'Birthday', accent: '#C026D3', soft: '#FAE8FF' };
    case 'announcement':
      return { icon: 'inbox', label: 'Announcement', accent: colors.navy, soft: '#EEF2FF' };
    case 'clock_in_nudge':
    case 'clock_out_nudge':
      return { icon: 'clock', label: 'Attendance', accent: colors.success, soft: colors.successSoft };
    case 'amc_reminder':
      return { icon: 'flag', label: 'AMC', accent: colors.warning, soft: colors.warningSoft };
    case 'new_member':
      return { icon: 'users', label: 'Team', accent: colors.primaryDeep, soft: colors.primarySoft };
    default:
      return { icon: 'bell', label: 'Alert', accent: colors.primaryDeep, soft: colors.primarySoft };
  }
}

function relativeTime(iso: string) {
  try {
    const then = new Date(iso).getTime();
    const diff = Math.max(0, Date.now() - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

type Props = {
  item: NotificationItem;
  onPress?: (item: NotificationItem) => void;
};

export function AlertCard({ item, onPress }: Props) {
  const tone = alertTone(item.type);
  const unread = !item.read;

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        shadows.sm,
        unread && styles.cardUnread,
        pressed && styles.cardPressed,
      ]}>
      {unread ? <View style={[styles.accentBar, { backgroundColor: tone.accent }]} /> : null}

      <View style={[styles.iconWrap, { backgroundColor: tone.soft }]}>
        <AppIcon name={tone.icon} size={18} color={tone.accent} />
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.typeChip, { backgroundColor: tone.soft }]}>
            <Text style={[styles.typeText, { color: tone.accent }]}>{tone.label}</Text>
          </View>
          {unread ? (
            <View style={styles.newBadge}>
              <View style={styles.newDot} />
              <Text style={styles.newText}>New</Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.title, unread && styles.titleUnread]} numberOfLines={2}>
          {item.title}
        </Text>

        {item.message ? (
          <Text style={styles.message} numberOfLines={3}>
            {item.message}
          </Text>
        ) : null}

        <Text style={styles.time}>{relativeTime(item.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardUnread: {
    borderColor: '#C7D7FF',
    backgroundColor: '#F7F9FF',
  },
  cardPressed: { opacity: 0.92 },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  body: { flex: 1, minWidth: 0 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  newDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  newText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  titleUnread: { fontWeight: '700' },
  message: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  time: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
});

import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export type AppIconName =
  | 'home'
  | 'clock'
  | 'check-square'
  | 'users'
  | 'user'
  | 'bell'
  | 'plus'
  | 'log-in'
  | 'log-out'
  | 'coffee'
  | 'rotate-ccw'
  | 'chevron-right'
  | 'x'
  | 'edit-2'
  | 'trash-2'
  | 'check'
  | 'calendar'
  | 'briefcase'
  | 'activity'
  | 'map-pin'
  | 'alert-circle';

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

type DrawProps = { size: number; color: string };

function Box({ size, children, style }: { size: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      {children}
    </View>
  );
}

function IconHome({ size, color }: DrawProps) {
  const w = size * 0.72;
  return (
    <Box size={size}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: w * 0.42,
          borderRightWidth: w * 0.42,
          borderBottomWidth: w * 0.34,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          marginBottom: -1,
        }}
      />
      <View
        style={{
          width: w * 0.7,
          height: w * 0.52,
          borderWidth: 2,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
    </Box>
  );
}

function IconClock({ size, color }: DrawProps) {
  const d = size * 0.78;
  return (
    <Box size={size}>
      <View
        style={{
          width: d,
          height: d,
          borderRadius: d / 2,
          borderWidth: 2,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: d * 0.22,
        }}>
        <View style={{ width: 2, height: d * 0.28, backgroundColor: color, borderRadius: 1 }} />
        <View
          style={{
            position: 'absolute',
            top: d * 0.46,
            left: d * 0.46,
            width: d * 0.24,
            height: 2,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      </View>
    </Box>
  );
}

function IconCheckSquare({ size, color }: DrawProps) {
  const s = size * 0.72;
  return (
    <Box size={size}>
      <View
        style={{
          width: s,
          height: s,
          borderRadius: 3,
          borderWidth: 2,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: s * 0.42,
            height: s * 0.22,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            borderColor: color,
            transform: [{ rotate: '-45deg' }],
            marginTop: -2,
          }}
        />
      </View>
    </Box>
  );
}

function IconUser({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: size * 0.17,
          borderWidth: 2,
          borderColor: color,
          marginBottom: 3,
        }}
      />
      <View
        style={{
          width: size * 0.58,
          height: size * 0.3,
          borderTopLeftRadius: size * 0.3,
          borderTopRightRadius: size * 0.3,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: color,
        }}
      />
    </Box>
  );
}

function IconUsers({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: 'absolute',
            left: size * 0.12,
            top: size * 0.12,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: size * 0.14,
            borderWidth: 1.8,
            borderColor: color,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: size * 0.48,
            top: size * 0.12,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: size * 0.14,
            borderWidth: 1.8,
            borderColor: color,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.12,
            left: size * 0.08,
            width: size * 0.36,
            height: size * 0.28,
            borderTopLeftRadius: size * 0.18,
            borderTopRightRadius: size * 0.18,
            borderWidth: 1.8,
            borderBottomWidth: 0,
            borderColor: color,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.12,
            right: size * 0.08,
            width: size * 0.36,
            height: size * 0.28,
            borderTopLeftRadius: size * 0.18,
            borderTopRightRadius: size * 0.18,
            borderWidth: 1.8,
            borderBottomWidth: 0,
            borderColor: color,
          }}
        />
      </View>
    </Box>
  );
}

function IconBell({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.42,
          height: size * 0.38,
          borderTopLeftRadius: size * 0.22,
          borderTopRightRadius: size * 0.22,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: color,
          marginTop: size * 0.08,
        }}
      />
      <View
        style={{
          width: size * 0.55,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.14,
          height: size * 0.1,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          borderWidth: 1.5,
          borderTopWidth: 0,
          borderColor: color,
          marginTop: 1,
        }}
      />
    </Box>
  );
}

function IconPlus({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View style={{ position: 'absolute', width: size * 0.7, height: 2.5, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ position: 'absolute', width: 2.5, height: size * 0.7, backgroundColor: color, borderRadius: 2 }} />
    </Box>
  );
}

function IconCheck({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.48,
          height: size * 0.26,
          borderLeftWidth: 2.5,
          borderBottomWidth: 2.5,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginTop: -size * 0.08,
        }}
      />
    </Box>
  );
}

function IconX({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.7,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.7,
          height: 2.5,
          backgroundColor: color,
          borderRadius: 2,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </Box>
  );
}

function IconChevronRight({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.32,
          height: size * 0.32,
          borderTopWidth: 2.5,
          borderRightWidth: 2.5,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: -size * 0.08,
        }}
      />
    </Box>
  );
}

function IconLogIn({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: size * 0.16,
            borderBottomWidth: size * 0.16,
            borderLeftWidth: size * 0.22,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: color,
          }}
        />
        <View
          style={{
            width: size * 0.38,
            height: size * 0.55,
            borderWidth: 2,
            borderLeftWidth: 0,
            borderColor: color,
            borderTopRightRadius: 3,
            borderBottomRightRadius: 3,
          }}
        />
      </View>
    </Box>
  );
}

function IconLogOut({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <View
          style={{
            width: size * 0.38,
            height: size * 0.55,
            borderWidth: 2,
            borderRightWidth: 0,
            borderColor: color,
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3,
          }}
        />
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: size * 0.16,
            borderBottomWidth: size * 0.16,
            borderLeftWidth: size * 0.22,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: color,
          }}
        />
      </View>
    </Box>
  );
}

function IconCoffee({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: size * 0.48,
            height: size * 0.42,
            borderWidth: 2,
            borderColor: color,
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            marginTop: size * 0.12,
          }}
        />
        <View
          style={{
            width: size * 0.16,
            height: size * 0.22,
            borderWidth: 2,
            borderLeftWidth: 0,
            borderColor: color,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            marginTop: size * 0.18,
          }}
        />
      </View>
    </Box>
  );
}

function IconRotateCcw({ size, color }: DrawProps) {
  const d = size * 0.62;
  return (
    <Box size={size}>
      <View
        style={{
          width: d,
          height: d,
          borderRadius: d / 2,
          borderWidth: 2,
          borderColor: color,
          borderTopColor: 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.12,
          left: size * 0.18,
          width: 0,
          height: 0,
          borderTopWidth: size * 0.12,
          borderBottomWidth: size * 0.12,
          borderRightWidth: size * 0.16,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: color,
        }}
      />
    </Box>
  );
}

function IconCalendar({ size, color }: DrawProps) {
  const s = size * 0.72;
  return (
    <Box size={size}>
      <View style={{ width: s, height: s * 0.85, borderWidth: 2, borderColor: color, borderRadius: 3 }}>
        <View style={{ height: s * 0.22, backgroundColor: color, opacity: 0.25 }} />
        <View style={{ position: 'absolute', top: -3, left: s * 0.18, width: 2, height: 8, backgroundColor: color }} />
        <View style={{ position: 'absolute', top: -3, right: s * 0.18, width: 2, height: 8, backgroundColor: color }} />
      </View>
    </Box>
  );
}

function IconBriefcase({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.28,
          height: size * 0.16,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          marginBottom: -1,
        }}
      />
      <View
        style={{
          width: size * 0.72,
          height: size * 0.48,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </Box>
  );
}

function IconActivity({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: size * 0.6 }}>
        <View style={{ width: 3, height: size * 0.28, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 3, height: size * 0.48, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 3, height: size * 0.36, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 3, height: size * 0.55, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </Box>
  );
}

function IconMapPin({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: size * 0.21,
          borderWidth: 2,
          borderColor: color,
          marginBottom: -size * 0.08,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.18,
          borderRightWidth: size * 0.18,
          borderTopWidth: size * 0.28,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
        }}
      />
    </Box>
  );
}

function IconAlertCircle({ size, color }: DrawProps) {
  const d = size * 0.78;
  return (
    <Box size={size}>
      <View
        style={{
          width: d,
          height: d,
          borderRadius: d / 2,
          borderWidth: 2,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}>
        <View style={{ width: 2.5, height: d * 0.28, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
      </View>
    </Box>
  );
}

function IconEdit2({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 2,
          transform: [{ rotate: '12deg' }],
        }}
      />
    </Box>
  );
}

function IconTrash2({ size, color }: DrawProps) {
  return (
    <Box size={size}>
      <View style={{ width: size * 0.4, height: 2.5, backgroundColor: color, borderRadius: 1, marginBottom: 2 }} />
      <View
        style={{
          width: size * 0.5,
          height: size * 0.48,
          borderWidth: 2,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
    </Box>
  );
}

const ICONS: Record<AppIconName, (p: DrawProps) => React.ReactElement> = {
  home: IconHome,
  clock: IconClock,
  'check-square': IconCheckSquare,
  users: IconUsers,
  user: IconUser,
  bell: IconBell,
  plus: IconPlus,
  'log-in': IconLogIn,
  'log-out': IconLogOut,
  coffee: IconCoffee,
  'rotate-ccw': IconRotateCcw,
  'chevron-right': IconChevronRight,
  x: IconX,
  'edit-2': IconEdit2,
  'trash-2': IconTrash2,
  check: IconCheck,
  calendar: IconCalendar,
  briefcase: IconBriefcase,
  activity: IconActivity,
  'map-pin': IconMapPin,
  'alert-circle': IconAlertCircle,
};

export function AppIcon({ name, size = 22, color = '#0F172A', style }: Props) {
  const Icon = ICONS[name] ?? IconHome;
  return (
    <View style={style} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon size={size} color={color} />
    </View>
  );
}

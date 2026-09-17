import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

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
  | 'chevron-left'
  | 'x'
  | 'edit-2'
  | 'trash-2'
  | 'check'
  | 'calendar'
  | 'briefcase'
  | 'activity'
  | 'map-pin'
  | 'alert-circle'
  | 'filter'
  | 'flag'
  | 'list'
  | 'folder'
  | 'hourglass'
  | 'inbox';

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
};

type DrawProps = { size: number; color: string; strokeWidth: number };

function SvgIcon({
  size,
  color,
  strokeWidth,
  children,
}: DrawProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

const stroke = (color: string, strokeWidth: number) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

function IconHome(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M3 10.5 12 3l9 7.5" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M5 10v10h14V10" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M10 20v-6h4v6" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconClock(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx="12" cy="12" r="9" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M12 7v5l3 2" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconCheckSquare(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Rect x="4" y="4" width="16" height="16" rx="3" {...stroke(p.color, p.strokeWidth)} />
      <Path d="m8 12 2.5 2.5L16 9" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconUsers(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" {...stroke(p.color, p.strokeWidth)} />
      <Circle cx="9.5" cy="8" r="3" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M20 20v-1.2a3 3 0 0 0-2.2-2.9" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M16.5 5.2a3 3 0 0 1 0 5.6" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconUser(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx="12" cy="8" r="3.5" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M5.5 19.5c1.4-3 3.7-4.5 6.5-4.5s5.1 1.5 6.5 4.5" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconBell(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path
        d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.2 1.8H4.8L6 16.5Z"
        {...stroke(p.color, p.strokeWidth)}
      />
      <Path d="M10 19a2 2 0 0 0 4 0" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconPlus(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 5v14M5 12h14" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconLogIn(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M10 17H5V7h5" {...stroke(p.color, p.strokeWidth)} />
      <Polyline points="14,16 18,12 14,8" {...stroke(p.color, p.strokeWidth)} />
      <Line x1="18" y1="12" x2="9" y2="12" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconLogOut(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M14 17h5V7h-5" {...stroke(p.color, p.strokeWidth)} />
      <Polyline points="10,16 6,12 10,8" {...stroke(p.color, p.strokeWidth)} />
      <Line x1="6" y1="12" x2="15" y2="12" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconCoffee(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M16 10h2.5a2.5 2.5 0 0 1 0 5H16" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M7 19h9" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconRotateCcw(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M3 12a9 9 0 1 0 3-6.7" {...stroke(p.color, p.strokeWidth)} />
      <Polyline points="3,4 3,9 8,9" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconChevronRight(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Polyline points="9,6 15,12 9,18" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconChevronLeft(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Polyline points="15,6 9,12 15,18" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconX(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M6 6l12 12M18 6 6 18" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconEdit2(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 20h8" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconTrash2(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4 7h16" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M9 7V5h6v2" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M7 7l1 12h8l1-12" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconCheck(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="m5 12 4.5 4.5L19 7" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconCalendar(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Rect x="4" y="5" width="16" height="15" rx="2" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M4 10h16M8 3v4M16 3v4" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconBriefcase(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Rect x="3" y="8" width="18" height="12" rx="2" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M3 13h18" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconActivity(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Polyline points="3,14 8,14 10.5,6 13.5,18 16,10 21,10" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconMapPin(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" {...stroke(p.color, p.strokeWidth)} />
      <Circle cx="12" cy="11" r="2.2" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconAlertCircle(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Circle cx="12" cy="12" r="9" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M12 8v5" {...stroke(p.color, p.strokeWidth)} />
      <Circle cx="12" cy="16.5" r="0.8" fill={p.color} />
    </SvgIcon>
  );
}

function IconFilter(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconFlag(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M5 21V4" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M5 4h11l-1.5 4L16 12H5" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconList(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M9 7h11M9 12h11M9 17h11" {...stroke(p.color, p.strokeWidth)} />
      <Circle cx="5" cy="7" r="1.2" fill={p.color} />
      <Circle cx="5" cy="12" r="1.2" fill={p.color} />
      <Circle cx="5" cy="17" r="1.2" fill={p.color} />
    </SvgIcon>
  );
}

function IconFolder(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path
        d="M3 8.5A2.5 2.5 0 0 1 5.5 6H9l2 2h7.5A2.5 2.5 0 0 1 21 10.5v7A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9Z"
        {...stroke(p.color, p.strokeWidth)}
      />
    </SvgIcon>
  );
}

function IconHourglass(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M6 3h12M6 21h12" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M7 3c0 4 5 5 5 9s-5 5-5 9" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M17 3c0 4-5 5-5 9s5 5 5 9" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
  );
}

function IconInbox(p: DrawProps) {
  return (
    <SvgIcon {...p}>
      <Path d="M4 13 6.5 5h11L20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" {...stroke(p.color, p.strokeWidth)} />
      <Path d="M4 13h4.5l1.5 2h4l1.5-2H20" {...stroke(p.color, p.strokeWidth)} />
    </SvgIcon>
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
  'chevron-left': IconChevronLeft,
  x: IconX,
  'edit-2': IconEdit2,
  'trash-2': IconTrash2,
  check: IconCheck,
  calendar: IconCalendar,
  briefcase: IconBriefcase,
  activity: IconActivity,
  'map-pin': IconMapPin,
  'alert-circle': IconAlertCircle,
  filter: IconFilter,
  flag: IconFlag,
  list: IconList,
  folder: IconFolder,
  hourglass: IconHourglass,
  inbox: IconInbox,
};

export function AppIcon({
  name,
  size = 22,
  color = '#0F172A',
  style,
  strokeWidth = 1.85,
}: Props) {
  const Icon = ICONS[name] ?? IconHome;
  return (
    <View style={style} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Icon size={size} color={color} strokeWidth={strokeWidth} />
    </View>
  );
}

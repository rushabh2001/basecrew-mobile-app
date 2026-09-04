import React from 'react';
import Feather from 'react-native-vector-icons/Feather';

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
  style?: object;
};

export function AppIcon({ name, size = 22, color = '#0F172A', style }: Props) {
  return <Feather name={name} size={size} color={color} style={style} />;
}

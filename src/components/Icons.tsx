import React from 'react';
import { View } from 'react-native';

type IconProps = {
  color: string;
  size?: number;
  focused?: boolean;
};

function Box({
  size,
  color,
  children,
}: {
  size: number;
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

export function IconClock({ color, size = 24 }: IconProps) {
  const r = size * 0.42;
  return (
    <Box size={size} color={color}>
      <View
        style={{
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          borderWidth: 2,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: size * 0.18,
        }}>
        <View style={{ width: 2, height: size * 0.22, backgroundColor: color, borderRadius: 1 }} />
        <View
          style={{
            position: 'absolute',
            top: size * 0.38,
            left: size * 0.42,
            width: size * 0.22,
            height: 2,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      </View>
    </Box>
  );
}

export function IconHome({ color, size = 24 }: IconProps) {
  return (
    <Box size={size} color={color}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.28,
          borderRightWidth: size * 0.28,
          borderBottomWidth: size * 0.24,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          marginBottom: -2,
        }}
      />
      <View
        style={{
          width: size * 0.48,
          height: size * 0.36,
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

export function IconTasks({ color, size = 24 }: IconProps) {
  const line = (w: number) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 3,
        width: size * 0.7,
      }}>
      <View
        style={{
          width: size * 0.16,
          height: size * 0.16,
          borderRadius: 2,
          borderWidth: 1.5,
          borderColor: color,
        }}
      />
      <View style={{ flex: 1, height: 2, backgroundColor: color, borderRadius: 1, maxWidth: w }} />
    </View>
  );
  return (
    <Box size={size} color={color}>
      {line(size * 0.45)}
      {line(size * 0.35)}
      {line(size * 0.4)}
    </Box>
  );
}

export function IconTeam({ color, size = 24 }: IconProps) {
  const head = (left: number) => (
    <View
      style={{
        position: 'absolute',
        left,
        top: size * 0.12,
        width: size * 0.28,
        height: size * 0.28,
        borderRadius: size * 0.14,
        borderWidth: 1.8,
        borderColor: color,
        backgroundColor: 'transparent',
      }}
    />
  );
  return (
    <Box size={size} color={color}>
      {head(size * 0.12)}
      {head(size * 0.48)}
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
    </Box>
  );
}

export function IconBell({ color, size = 24 }: IconProps) {
  return (
    <Box size={size} color={color}>
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

export function IconProfile({ color, size = 24 }: IconProps) {
  return (
    <Box size={size} color={color}>
      <View
        style={{
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size * 0.16,
          borderWidth: 2,
          borderColor: color,
          marginBottom: 3,
        }}
      />
      <View
        style={{
          width: size * 0.55,
          height: size * 0.28,
          borderTopLeftRadius: size * 0.28,
          borderTopRightRadius: size * 0.28,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: color,
        }}
      />
    </Box>
  );
}

export function IconPlus({ color, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.7, height: 2.5, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ position: 'absolute', width: 2.5, height: size * 0.7, backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

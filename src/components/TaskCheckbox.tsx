import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors } from '../theme';

type Props = {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: number;
};

export function TaskCheckbox({ checked, onToggle, disabled, size = 26 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const fill = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(fill, {
      toValue: checked ? 1 : 0,
      friction: 6,
      tension: 120,
      useNativeDriver: false,
    }).start();
  }, [checked, fill]);

  function handlePress() {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, friction: 5 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
    ]).start();
    onToggle();
  }

  const bg = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.success],
  });
  const border = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderStrong, colors.success],
  });

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Animated.View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bg,
              borderColor: border,
            },
          ]}>
          {checked ? (
            <View style={styles.check}>
              <AppIcon name="check" size={size * 0.55} color="#fff" />
            </View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { alignItems: 'center', justifyContent: 'center' },
});

import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

const logoLight = require('../../assets/basecrew-logo-2x.png');
const logoDark = require('../../assets/basecrew-logo-dark-2x.png');
const iconWhite = require('../../assets/basecrew-icon-white.png');

type Props = {
  variant?: 'light' | 'dark' | 'icon';
  height?: number;
  style?: ViewStyle;
};

export function BrandLogo({ variant = 'light', height = 36, style }: Props) {
  const source = variant === 'dark' ? logoDark : variant === 'icon' ? iconWhite : logoLight;
  const aspect = variant === 'icon' ? 1 : 780.5 / 178;
  const width = height * aspect;

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={source}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel="BaseCrew"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});

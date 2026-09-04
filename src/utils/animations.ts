import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function animateListChange() {
  LayoutAnimation.configureNext({
    duration: 280,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'spring', springDamping: 0.82 },
    delete: { type: 'easeInEaseOut', property: 'opacity' },
  });
}

/** BaseCrew brand palette - aligned with web portal (`src/lib/branding.ts`). */
export const colors = {
  bg: '#FAFBFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#8E95A3',
  border: '#ECEEF2',
  borderStrong: '#D8DCE3',
  navy: '#0B1226',
  navyMid: '#111A4A',
  primary: '#1E63FF',
  primaryDeep: '#0B3BE8',
  primarySoft: '#E8F0FF',
  accent: '#4D8BFF',
  glow: '#9CC3FF',
  success: '#0F766E',
  successSoft: '#E8F8EF',
  danger: '#B91C1C',
  dangerSoft: '#FDEEEC',
  warning: '#B45309',
  warningSoft: '#FEF5E7',
  overlay: 'rgba(11, 18, 38, 0.45)',
};

export const shadows = {
  sm: {
    shadowColor: '#1A1D26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1D26',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  float: {
    shadowColor: '#1E63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const typography = {
  hero: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  section: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500' as const },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const color = {
  background: {
    base: '#173C2F',
    deep: '#123127',
    elevated: '#315B47',
  },
  surface: {
    ivory: '#FBF7EB',
    subtle: '#F3ECDD',
    depth: '#D8CDB4',
    glass: '#29483D',
  },
  text: {
    onDark: '#FBF7EB',
    onDarkSecondary: '#D8CDB4',
    onLight: '#1D332B',
    onLightSecondary: '#5D6F66',
  },
  accent: {
    jade: '#2F765A',
    jadeSoft: '#A7C8B2',
    gold: '#B99A58',
    goldSoft: '#E8DDBD',
    red: '#A44332',
  },
  border: '#D7CCB4',
} as const;

export const primitiveColor = {
  green950: '#123127',
  green900: '#173C2F',
  green700: '#315B47',
  jade600: '#2F765A',
  jade200: '#A7C8B2',
  ivory50: '#FBF7EB',
  ivory100: '#F3ECDD',
  stone300: '#D8CDB4',
  gold500: '#B99A58',
  gold200: '#E8DDBD',
  red600: '#A44332',
  ink900: '#1D332B',
  ink500: '#5D6F66',
  line300: '#D7CCB4',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  display: 40,
  xxxl: 48,
  section: 64,
} as const;

export const radius = {
  compact: 4,
  tile: 7,
  card: 8,
  modal: 12,
  pill: 999,
} as const;

export const motion = {
  instantMs: 0,
  pressMs: 80,
  selectionMs: 170,
  removalMs: 300,
  modalMs: 220,
  screenMs: 360,
} as const;

export type MotionToken = keyof typeof motion;

export function resolveMotionDuration(token: MotionToken, reducedMotion: boolean): number {
  return reducedMotion ? 0 : motion[token];
}

export const fontFamily = {
  display: 'CormorantGaramond_500Medium',
  body: 'Inter_400Regular',
  editorial: 'InriaSerif_400Regular',
  accent: 'IrishGrover_400Regular',
  displayFallback: 'serif',
  bodyFallback: 'sans-serif',
} as const;

export const size = {
  touchMinimumIos: 44,
  touchMinimumAndroid: 48,
  control: 52,
} as const;

export const layout = {
  phoneMinimumWidth: 360,
  phoneReferenceWidth: 390,
  phoneMaximumWidth: 430,
  tabletContentMaximum: 760,
} as const;

export const shadow = {
  tile: { color: '#000000', opacity: 0.16, radius: 8, offsetX: 0, offsetY: 4 },
  selected: { color: '#000000', opacity: 0.25, radius: 16, offsetX: 0, offsetY: 8 },
  card: { color: '#000000', opacity: 0.12, radius: 20, offsetX: 0, offsetY: 8 },
  modal: { color: '#000000', opacity: 0.22, radius: 44, offsetX: 0, offsetY: 18 },
} as const;

export const typography = {
  gameTitle: {
    fontFamily: fontFamily.display,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '500' as const,
  },
  headingLarge: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '500' as const,
  },
  headingMedium: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500' as const,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  control: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '400' as const,
  },
  editorial: {
    fontFamily: fontFamily.editorial,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  accent: {
    fontFamily: fontFamily.accent,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
} as const;

export const Colors = {
  bg: '#0A0E1A',
  card: '#131829',
  cardHover: '#1A2035',
  border: '#1E2642',
  gold: '#D4A843',
  goldLight: '#E8C875',
  goldDim: '#8B7332',
  amber: '#F0A830',
  text: '#E8E8EC',
  textDim: '#8A8FA8',
  textMuted: '#5A5F78',
  navy: '#0D1225',
  navyLight: '#162040',
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  transparent: 'transparent',
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGlow: {
    shadowColor: '#D4A843',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  fab: {
    shadowColor: '#D4A843',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;

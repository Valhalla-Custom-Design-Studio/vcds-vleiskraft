export const Colors = {
  primary: "#7F1D1D",
  primaryLight: "#991B1B",
  secondary: "#DC2626",
  accent: "#FCA5A5",
  background: "#FFF7F7",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  error: "#DC2626",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  white: "#FFFFFF",
  black: "#000000",
};

// --- Platinum Design System Additions -----------------------
export const Shadow = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  }),
  glowRed: { shadowColor: '#FF1744', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 10 },
};

export const PlatinumTokens = {
  glass: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.10)',
  surfaceElevated: 'rgba(255,255,255,0.08)',
  accentGreen: '#22C55E',
  accentRed: '#EF4444',
  accentPurple: '#A855F7',
  accentViolet: '#8B5CF6',
  accentYellow: '#EAB308',
  accentBlue: '#3B82F6',
  accentOrange: '#F97316',
};

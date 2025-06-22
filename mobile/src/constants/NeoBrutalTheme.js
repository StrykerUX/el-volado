// Soft Neo-Brutalism Design System
export const COLORS = {
  // Primary palette - soft pastels with high contrast
  primary: '#FF6B9D',      // Soft pink
  secondary: '#4ECDC4',    // Soft teal
  tertiary: '#FFE66D',     // Soft yellow
  accent: '#A8E6CF',       // Soft mint
  
  // Neutrals
  background: '#F8F3E3',   // Warm cream
  surface: '#FFFFFF',      // Pure white
  dark: '#2C2C54',         // Deep navy
  darkAlt: '#40407A',      // Medium navy
  
  // Functional colors
  success: '#6BCF7F',      // Soft green
  warning: '#FFB74D',      // Soft orange
  error: '#FF8A65',        // Soft red
  info: '#81C784',         // Soft blue-green
  
  // Text colors
  text: '#2C2C54',         // Dark navy for text
  textSecondary: '#6C7B7F', // Muted gray
  textLight: '#FFFFFF',    // White text
  
  // Accessibility colors
  highContrast: '#000000', // Pure black for high contrast
  focus: '#0066CC',        // Focus indicator blue
  disabled: '#CCCCCC',     // Disabled elements
};

export const SHADOWS = {
  // Hard shadows characteristic of brutalism
  brutal: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    // Web compatibility
    boxShadow: '6px 6px 0px #2C2C54',
  },
  brutalSmall: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    // Web compatibility
    boxShadow: '3px 3px 0px #2C2C54',
  },
  brutalLarge: {
    shadowColor: COLORS.dark,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
    // Web compatibility
    boxShadow: '8px 8px 0px #2C2C54',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  round: 999,
};

export const BORDERS = {
  thick: 4,
  thicker: 6,
  thickest: 8,
};

export const TYPOGRAPHY = {
  // Bold, chunky fonts typical of neo-brutalism
  weights: {
    normal: '400',
    medium: '600',
    bold: '800',
    black: '900',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    huge: 48,
  },
};

export const FONTS = {
  normal: 'System',
  medium: 'System',
  bold: 'System',
  black: 'System',
};

// Accessibility helpers
export const ACCESSIBILITY = {
  // Minimum touch target size (44x44 points)
  MIN_TOUCH_SIZE: 44,
  
  // High contrast mode
  getHighContrastColor: (normalColor) => COLORS.highContrast,
  
  // Color contrast ratios (WCAG AA compliant)
  TEXT_CONTRAST_RATIOS: {
    normal: 4.5,
    large: 3.0,
  },
  
  // Screen reader announcements
  ANNOUNCEMENTS: {
    coinFlip: 'Coin flipped',
    achievement: 'Achievement unlocked',
    prestige: 'Prestige completed',
    purchase: 'Item purchased',
  },
};
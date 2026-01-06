/**
 * Belief Changer 타이포그래피 시스템
 *
 * 가독성을 최우선으로 하는 텍스트 스타일
 */

export const typography = {
  // Font Family
  fontFamily: {
    sans: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },

  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Heading Styles
  h1: {
    fontSize: '2rem',      // 32px
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 600,
    lineHeight: 1.33,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.25rem',   // 20px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0',
  },

  // Body Styles
  body: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  bodyLarge: {
    fontSize: '1.125rem',  // 18px
    fontWeight: 400,
    lineHeight: 1.56,
    letterSpacing: '0',
  },
  bodySmall: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: '0',
  },

  // UI Styles
  button: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 600,
    lineHeight: 1.43,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
  },
  caption: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  label: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 500,
    lineHeight: 1.43,
    letterSpacing: '0',
  },
} as const;

export type Typography = typeof typography;

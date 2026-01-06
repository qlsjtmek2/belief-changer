/**
 * Belief Changer 간격 시스템
 *
 * 8pt Grid System 기반
 */

export const spacing = {
  // Base unit: 4px
  '0': '0',
  '1': '0.25rem',   // 4px
  '2': '0.5rem',    // 8px
  '3': '0.75rem',   // 12px
  '4': '1rem',      // 16px
  '5': '1.25rem',   // 20px
  '6': '1.5rem',    // 24px
  '8': '2rem',      // 32px
  '10': '2.5rem',   // 40px
  '12': '3rem',     // 48px
  '16': '4rem',     // 64px
  '20': '5rem',     // 80px
} as const;

// Semantic spacing aliases
export const layout = {
  // 화면 패딩
  screenPadding: spacing['4'],      // 16px

  // 섹션 간격
  sectionGap: spacing['8'],         // 32px

  // 컴포넌트 간격
  componentGap: spacing['4'],       // 16px

  // 아이템 간격 (리스트 등)
  itemGap: spacing['3'],            // 12px

  // 내부 패딩
  cardPadding: spacing['4'],        // 16px
  buttonPadding: `${spacing['2']} ${spacing['4']}`, // 8px 16px
  inputPadding: `${spacing['3']} ${spacing['4']}`,  // 12px 16px
} as const;

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',   // pill
} as const;

// Shadows for dark theme
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

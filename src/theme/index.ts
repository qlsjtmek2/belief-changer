/**
 * Belief Changer 테마 시스템 통합 export
 */

export { colors } from './colors';
export type { Colors } from './colors';

export { typography } from './typography';
export type { Typography } from './typography';

export { spacing, layout, borderRadius, shadows } from './spacing';
export type { Spacing, Layout, BorderRadius, Shadows } from './spacing';

// CSS Custom Properties 생성 유틸리티
export const generateCSSVariables = (): string => {
  return `
    :root {
      /* Primary Colors */
      --color-primary: #6366F1;
      --color-primary-light: #818CF8;
      --color-primary-dark: #4F46E5;

      /* Secondary Colors */
      --color-secondary: #8B5CF6;
      --color-secondary-light: #A78BFA;
      --color-secondary-dark: #7C3AED;

      /* Background Colors */
      --color-bg-default: #0F0F23;
      --color-bg-paper: #1A1A2E;
      --color-bg-elevated: #252542;

      /* Surface Colors */
      --color-surface: #1A1A2E;
      --color-surface-hover: #252542;
      --color-surface-active: #2D2D4A;
      --color-surface-border: #3D3D5C;

      /* Text Colors */
      --color-text-primary: #F8FAFC;
      --color-text-secondary: #94A3B8;
      --color-text-disabled: #64748B;
      --color-text-hint: #475569;

      /* Semantic Colors */
      --color-success: #10B981;
      --color-warning: #F59E0B;
      --color-error: #EF4444;
      --color-info: #3B82F6;

      /* Accent Colors */
      --color-accent-cyan: #06B6D4;
      --color-accent-teal: #14B8A6;
      --color-accent-violet: #8B5CF6;
      --color-accent-pink: #EC4899;

      /* Typography */
      --font-sans: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: "JetBrains Mono", "Fira Code", monospace;

      /* Spacing */
      --spacing-1: 0.25rem;
      --spacing-2: 0.5rem;
      --spacing-3: 0.75rem;
      --spacing-4: 1rem;
      --spacing-6: 1.5rem;
      --spacing-8: 2rem;

      /* Border Radius */
      --radius-sm: 0.25rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;
      --radius-full: 9999px;

      /* Shadows */
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
    }
  `;
};

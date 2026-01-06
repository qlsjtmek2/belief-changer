/**
 * Belief Changer 다크 테마 컬러 시스템
 *
 * 확언(affirmation) 앱에 적합한 차분하고 신뢰감 있는 색상 팔레트
 */

export const colors = {
  // Primary - 주요 액션, CTA 버튼
  primary: {
    main: '#6366F1',      // Indigo - 신뢰, 직관
    light: '#818CF8',
    dark: '#4F46E5',
    contrast: '#FFFFFF',
  },

  // Secondary - 보조 액션
  secondary: {
    main: '#8B5CF6',      // Purple - 창의성, 변화
    light: '#A78BFA',
    dark: '#7C3AED',
    contrast: '#FFFFFF',
  },

  // Background - 다크 테마 배경
  background: {
    default: '#0F0F23',   // 깊은 네이비 블랙
    paper: '#1A1A2E',     // 카드, 컨테이너 배경
    elevated: '#252542',  // 상승된 요소 (모달, 드롭다운)
  },

  // Surface - 표면 색상
  surface: {
    default: '#1A1A2E',
    hover: '#252542',
    active: '#2D2D4A',
    border: '#3D3D5C',
  },

  // Text - 텍스트 색상
  text: {
    primary: '#F8FAFC',   // 주요 텍스트
    secondary: '#94A3B8', // 보조 텍스트
    disabled: '#64748B',  // 비활성화
    hint: '#475569',      // 힌트, 플레이스홀더
  },

  // Semantic - 상태 색상
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },

  // Accent - 강조 색상 (대화 화자 구분 등)
  accent: {
    cyan: '#06B6D4',
    teal: '#14B8A6',
    emerald: '#10B981',
    violet: '#8B5CF6',
    pink: '#EC4899',
  },
} as const;

export type Colors = typeof colors;

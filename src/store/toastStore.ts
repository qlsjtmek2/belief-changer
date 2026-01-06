import { create } from 'zustand';

export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type = 'success', duration = 2500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    // 자동 제거
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// 편의 함수
export const toast = {
  success: (message: string, duration?: number) => {
    useToastStore.getState().addToast(message, 'success', duration);
  },
  error: (message: string, duration?: number) => {
    useToastStore.getState().addToast(message, 'error', duration ?? 4000);
  },
};

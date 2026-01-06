import { useEffect, useState } from 'react';
import { useToastStore, type ToastItem } from '../store';
import './Toast.css';

interface SingleToastProps {
  toast: ToastItem;
  index: number;
  onRemove: (id: string) => void;
}

function SingleToast({ toast, index, onRemove }: SingleToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 등장 애니메이션
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // 퇴장 애니메이션 (duration 150ms 전에 시작)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, toast.duration - 150);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.duration]);

  const toastClasses = [
    'toast',
    isVisible && !isExiting && 'toast--visible',
    isExiting && 'toast--exiting',
    toast.type === 'error' && 'toast--error',
  ].filter(Boolean).join(' ');

  // 스택 위치 계산 (최신이 아래, 이전 것은 위로)
  const stackOffset = index * 38; // 각 토스트 높이 + 간격

  return (
    <div
      className={toastClasses}
      style={{ transform: `translateY(-${stackOffset}px)` }}
      onClick={() => onRemove(toast.id)}
    >
      <div className="toast__icon">
        {toast.type === 'error' ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1C3.7 1 1 3.7 1 7s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 9.5c-.4 0-.75-.35-.75-.75s.35-.75.75-.75.75.35.75.75-.35.75-.75.75zm.75-3c0 .4-.35.75-.75.75s-.75-.35-.75-.75v-3c0-.4.35-.75.75-.75s.75.35.75.75v3z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5.5 9.5L2.5 6.5L1.5 7.5L5.5 11.5L12.5 4.5L11.5 3.5L5.5 9.5Z"
              fill="currentColor"
            />
          </svg>
        )}
      </div>
      <span className="toast__message">{toast.message}</span>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <SingleToast
          key={toast.id}
          toast={toast}
          index={toasts.length - 1 - index} // 최신이 index 0 (맨 아래)
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}

// 하위 호환을 위한 레거시 Toast 컴포넌트 (deprecated)
interface LegacyToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error';
}

export function Toast({ message, isVisible, onClose, duration = 2500, type = 'success' }: LegacyToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!message) return null;

  const toastClasses = [
    'toast',
    'toast--legacy',
    isVisible && 'toast--visible',
    type === 'error' && 'toast--error',
  ].filter(Boolean).join(' ');

  return (
    <div className={toastClasses}>
      <div className="toast__icon">
        {type === 'error' ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1C3.7 1 1 3.7 1 7s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 9.5c-.4 0-.75-.35-.75-.75s.35-.75.75-.75.75.35.75.75-.35.75-.75.75zm.75-3c0 .4-.35.75-.75.75s-.75-.35-.75-.75v-3c0-.4.35-.75.75-.75s.75.35.75.75v3z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5.5 9.5L2.5 6.5L1.5 7.5L5.5 11.5L12.5 4.5L11.5 3.5L5.5 9.5Z"
              fill="currentColor"
            />
          </svg>
        )}
      </div>
      <span className="toast__message">{message}</span>
    </div>
  );
}

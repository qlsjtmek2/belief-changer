import { useEffect, useRef } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 2500 }: ToastProps) {
  const lastMessageRef = useRef(message);

  // 메시지가 있을 때만 업데이트 (사라지는 동안 유지)
  useEffect(() => {
    if (message) {
      lastMessageRef.current = message;
    }
  }, [message]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <div className={`toast ${isVisible ? 'toast--visible' : ''}`}>
      <div className="toast__icon">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5.5 9.5L2.5 6.5L1.5 7.5L5.5 11.5L12.5 4.5L11.5 3.5L5.5 9.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="toast__message">{message || lastMessageRef.current}</span>
    </div>
  );
}

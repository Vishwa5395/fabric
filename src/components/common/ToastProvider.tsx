import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { achievementEngine } from '../../services/achievements';
import { AchievementDef } from '../../data/achievements';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  durationMs?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastItem['type'], durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info', durationMs: number = 3200) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type, durationMs }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, durationMs);
  }, []);

  // Listen for achievement unlocks
  useEffect(() => {
    const unsubscribe = achievementEngine.onUnlock((ach: AchievementDef) => {
      showToast(`🏆 Badge Unlocked: ${ach.name}!`, 'success', 4000);
    });
    return unsubscribe;
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '90vw',
          width: '380px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(toast => {
          let bg = 'var(--color-graphite)';
          let color = '#FFFFFF';
          let border = '2px solid var(--color-lime)';

          if (toast.type === 'success') {
            bg = 'var(--color-lime)';
            color = 'var(--color-graphite)';
            border = '2px solid var(--color-graphite)';
          } else if (toast.type === 'warning' || toast.type === 'error') {
            bg = 'var(--color-coral)';
            color = 'var(--color-graphite)';
            border = '2px solid var(--color-graphite)';
          }

          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: bg,
                color,
                border,
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: 'var(--shadow-retro-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'center',
                animation: 'fadeDown 0.2s ease-out'
              }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}


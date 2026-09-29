import React from 'react';
import { useAppStore } from '../../state/store';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastRegion: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => {
        let Icon = Info;
        let iconColor = 'var(--status-info)';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconColor = 'var(--status-ok)';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'var(--status-warning)';
        } else if (toast.type === 'danger') {
          Icon = AlertCircle;
          iconColor = 'var(--status-danger)';
        }

        return (
          <div key={toast.id} className="toast-item">
            <Icon size={18} color={iconColor} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: 'var(--text-muted)', padding: '2px' }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

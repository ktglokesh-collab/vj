import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Processing simulated optimization...',
  subtext = 'Evaluating constraint boundaries and candidate allocations',
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        gap: '12px',
      }}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{subtext}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

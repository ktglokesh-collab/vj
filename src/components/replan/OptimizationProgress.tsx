import React from 'react';
import { OptimizationState } from '../../domain/types';
import { Loader2, X } from 'lucide-react';

interface OptimizationProgressProps {
  state: OptimizationState;
  phase?: string;
  progressPercent: number;
  onCancel: () => void;
}

export const OptimizationProgress: React.FC<OptimizationProgressProps> = ({
  state,
  phase,
  progressPercent,
  onCancel,
}) => {
  const isSolving = state === 'analyzing' || state === 'modeling' || state === 'optimizing' || state === 'validating';

  if (!isSolving) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-2)',
        border: '1px solid var(--accent-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-glow)',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={20} color="var(--accent-cyan)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            Simulating Local Replan Optimization...
          </span>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
          aria-label="Cancel replan"
        >
          <X size={14} />
          <span>Cancel</span>
        </button>
      </div>

      <div style={{ fontSize: '0.875rem', color: 'var(--accent-cyan)' }}>
        {phase || 'Evaluating multi-resource trade-offs...'}
      </div>

      <div style={{ height: '6px', backgroundColor: 'var(--surface-3)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: 'var(--accent-cyan)',
            transition: 'width 300ms ease-out',
          }}
        />
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

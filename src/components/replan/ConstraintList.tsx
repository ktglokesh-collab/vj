import React from 'react';
import { ConstraintResult } from '../../domain/types';
import { useAppStore } from '../../state/store';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface ConstraintListProps {
  constraints: ConstraintResult[];
  onSelectConstraint?: (constraint: ConstraintResult) => void;
}

export const ConstraintList: React.FC<ConstraintListProps> = ({
  constraints,
  onSelectConstraint,
}) => {
  const { openDrawer } = useAppStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {constraints.map(c => {
        const isPassed = c.passed;
        const isBlocking = c.severity === 'blocking';

        return (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: isPassed
                ? 'var(--surface-1)'
                : isBlocking
                ? 'rgba(248, 113, 113, 0.08)'
                : 'rgba(251, 191, 36, 0.08)',
              border: `1px solid ${
                isPassed
                  ? 'var(--border-subtle)'
                  : isBlocking
                  ? 'rgba(248, 113, 113, 0.35)'
                  : 'rgba(251, 191, 36, 0.3)'
              }`,
              borderRadius: 'var(--radius-md)',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
              <div style={{ flexShrink: 0 }}>
                {isPassed && <CheckCircle2 size={18} color="var(--status-ok)" />}
                {!isPassed && isBlocking && <XCircle size={18} color="var(--status-danger)" />}
                {!isPassed && !isBlocking && <AlertTriangle size={18} color="var(--status-warning)" />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {c.label}
                  </span>
                  <span
                    className={`badge ${isPassed ? 'badge-ok' : isBlocking ? 'badge-danger' : 'badge-warning'}`}
                    style={{ fontSize: '0.6875rem' }}
                  >
                    {isPassed ? 'Passed' : isBlocking ? 'Blocking Breach' : 'Warning'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {c.detail}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Observed / Limit</span>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: isPassed ? 'var(--text-primary)' : 'var(--status-danger)' }}>
                  {c.observed} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {c.threshold}</span>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (onSelectConstraint) onSelectConstraint(c);
                  else openDrawer('constraint', c.id, c);
                }}
                style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                aria-label={`Inspect ${c.label}`}
              >
                <span>Inspect</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

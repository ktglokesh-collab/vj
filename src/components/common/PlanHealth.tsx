import React from 'react';
import type { PlanState } from '../../domain/types';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PlanHealthProps {
  planState: PlanState;
  score?: number;
  scoreLabel?: string;
  violationsCount?: number;
}

export const PlanHealth: React.FC<PlanHealthProps> = ({
  planState,
  score = 100,
  scoreLabel = 'Feasible',
  violationsCount = 0,
}) => {
  const isOk = planState === 'feasible';
  const isWarn = planState === 'at_risk';
  const isDanger = planState === 'infeasible';

  return (
    <div
      className={`plan-health-banner ${planState}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderRadius: 'var(--radius-xl)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Top accent specular light */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: isDanger
            ? 'linear-gradient(90deg, transparent, var(--status-danger), transparent)'
            : isWarn
            ? 'linear-gradient(90deg, transparent, var(--status-warning), transparent)'
            : 'linear-gradient(90deg, transparent, var(--status-ok), transparent)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDanger
              ? 'var(--status-danger-bg)'
              : isWarn
              ? 'var(--status-warning-bg)'
              : 'var(--status-ok-bg)',
            border: `1px solid ${
              isDanger
                ? 'var(--status-danger-border)'
                : isWarn
                ? 'var(--status-warning-border)'
                : 'var(--status-ok-border)'
            }`,
            color: isDanger ? 'var(--status-danger)' : isWarn ? 'var(--status-warning)' : 'var(--status-ok)',
            boxShadow: isDanger
              ? '0 0 16px var(--status-danger-bg)'
              : isOk
              ? '0 0 16px var(--status-ok-bg)'
              : 'none',
          }}
        >
          {isOk && <ShieldCheck size={26} />}
          {isWarn && <AlertTriangle size={26} />}
          {isDanger && <ShieldAlert size={26} />}
        </div>

        <div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
            Operating Plan State & Safety Margin
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', letterSpacing: '-0.02em' }}>
            {isOk ? (
              <span style={{ color: 'var(--status-ok)' }}>Current Plan is FEASIBLE</span>
            ) : isWarn ? (
              <span style={{ color: 'var(--status-warning)' }}>Plan is CONSTRAINED / AT RISK</span>
            ) : (
              <span style={{ color: 'var(--status-danger)' }}>Current Plan is INFEASIBLE</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Safety Index</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isDanger ? 'var(--status-danger)' : isWarn ? 'var(--status-warning)' : 'var(--status-ok)', letterSpacing: '-0.02em' }}>
            {score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Blocking Breaches</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: violationsCount > 0 ? 'var(--status-danger)' : 'var(--text-secondary)', letterSpacing: '-0.02em' }}>
            {violationsCount}
          </div>
        </div>
      </div>
    </div>
  );
};

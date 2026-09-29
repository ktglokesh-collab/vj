import React from 'react';
import { Recommendation } from '../../domain/types';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, ArrowRight, AlertTriangle, Clock } from 'lucide-react';

interface RecommendationDetailProps {
  recommendation: Recommendation;
}

export const RecommendationDetail: React.FC<RecommendationDetailProps> = ({ recommendation }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Action ID: {recommendation.id} · Priority: {recommendation.priority.toUpperCase()}
          </span>
          <StatusBadge
            status={recommendation.status === 'included' ? 'ok' : 'info'}
            label={recommendation.status.toUpperCase()}
          />
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
          {recommendation.title}
        </h3>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <span className="badge badge-scenario">Resource: {recommendation.resourceId.toUpperCase()}</span>
          <span className="badge badge-scenario">Target: {recommendation.targetEntityId}</span>
          <span className="badge badge-sim">Plan Rev {recommendation.planRevision}</span>
        </div>
      </div>

      <div className="panel">
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Clinical / Operational Rationale
        </h4>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {recommendation.rationale}
        </p>
      </div>

      <div className="panel">
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Modeled Impact & Constraint Relief
        </h4>
        <p style={{ fontSize: '0.9375rem', color: 'var(--status-ok)', lineHeight: 1.5 }}>
          {recommendation.modeledImpact}
        </p>
      </div>

      <div className="panel">
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Operational Trade-Off & Risk
        </h4>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {recommendation.tradeOff}
        </p>
      </div>

      {recommendation.sourceLocation && recommendation.targetLocation && (
        <div style={{ background: 'var(--surface-2)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>FROM</span>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{recommendation.sourceLocation}</div>
          </div>
          <ArrowRight size={16} color="var(--accent-cyan)" />
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>TO</span>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{recommendation.targetLocation}</div>
          </div>
        </div>
      )}

      <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <strong>Decision-Support Notice:</strong> Simulated operational recommendation. Acceptance updates local simulation state only and requires explicit clinical administrator authorization.
      </div>
    </div>
  );
};

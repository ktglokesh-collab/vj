import React from 'react';
import { Recommendation, RecommendationStatus } from '../../domain/types';
import { useAppStore } from '../../state/store';
import { BedDouble, Users, Activity, Check, X, ArrowRight, Clock } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onSelect?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onSelect,
}) => {
  const { toggleRecommendationStatus, openDrawer } = useAppStore();

  const getIcon = () => {
    switch (recommendation.resourceId) {
      case 'icu': return <BedDouble size={18} color="var(--accent-cyan)" />;
      case 'staff': return <Users size={18} color="var(--accent-cyan)" />;
      case 'or': return <Activity size={18} color="var(--accent-cyan)" />;
      default: return <Clock size={18} color="var(--accent-cyan)" />;
    }
  };

  const getStatusBadge = (status: RecommendationStatus) => {
    switch (status) {
      case 'proposed': return <span className="badge badge-scenario">Proposed</span>;
      case 'reviewed': return <span className="badge badge-info">Reviewed</span>;
      case 'included': return <span className="badge badge-ok">Included in Plan</span>;
      case 'dismissed': return <span className="badge badge-danger">Dismissed</span>;
    }
  };

  const handleToggleReviewed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = recommendation.status === 'reviewed' ? 'proposed' : 'reviewed';
    toggleRecommendationStatus(recommendation.id, nextStatus);
  };

  const handleToggleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = recommendation.status === 'dismissed' ? 'proposed' : 'dismissed';
    toggleRecommendationStatus(recommendation.id, nextStatus);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        opacity: recommendation.status === 'dismissed' ? 0.5 : 1,
        transition: 'all 160ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
        <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '8px', flexShrink: 0 }}>
          {getIcon()}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              {recommendation.title}
            </span>
            {getStatusBadge(recommendation.status)}
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              (Rev {recommendation.planRevision})
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
            {recommendation.rationale}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span><strong>Modeled Impact:</strong> {recommendation.modeledImpact}</span>
            <span><strong>Trade-off:</strong> {recommendation.tradeOff}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn btn-secondary"
          onClick={handleToggleReviewed}
          style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
          title="Toggle Reviewed Status"
        >
          <Check size={14} />
          <span>{recommendation.status === 'reviewed' ? 'Mark Proposed' : 'Mark Reviewed'}</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleToggleDismiss}
          style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
          title="Dismiss / Restore Recommendation"
        >
          <X size={14} />
          <span>{recommendation.status === 'dismissed' ? 'Restore' : 'Dismiss'}</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            if (onSelect) onSelect();
            else openDrawer('recommendation', recommendation.id, recommendation);
          }}
          style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
          aria-label="View recommendation details"
        >
          <span>Detail</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

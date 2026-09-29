import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { PageHeader } from '../components/common/PageHeader';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { EmptyState } from '../components/common/EmptyState';
import { Lightbulb, Cpu, Filter } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { recommendations, activeScenario, openDrawer } = useAppStore();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const navigate = useNavigate();

  const isStale = recommendations.some(r => r.planRevision !== activeScenario.revision);

  const immediateRecs = recommendations.filter(r => r.priority === 'immediate');
  const nextShiftRecs = recommendations.filter(r => r.priority === 'next_shift');
  const monitorRecs = recommendations.filter(r => r.priority === 'monitor');

  const filteredRecs = recommendations.filter(r => {
    if (filterPriority === 'all') return true;
    return r.priority === filterPriority;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Explainable Recommendations"
        description="Prioritized, clinical decision-support actions generated from constraint optimization and surge modeling."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/replan')}>
              <Cpu size={16} />
              <span>Open Replan Studio</span>
            </button>
          </div>
        }
      />

      {isStale && (
        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.4)', padding: '14px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            ⚠️ <strong>Scenario Changed:</strong> Recommendations below reference prior simulation revisions. Re-run Replan Studio for latest updates.
          </span>
          <button className="btn btn-primary" onClick={() => navigate('/replan')}>
            Re-generate Recommendations
          </button>
        </div>
      )}

      <div className="panel" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Priority:</span>
          {(['all', 'immediate', 'next_shift', 'monitor'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`btn ${filterPriority === p ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            >
              {p === 'all' ? 'All' : p === 'immediate' ? 'Immediate' : p === 'next_shift' ? 'Next Shift' : 'Monitor'}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {filteredRecs.length} Action{filteredRecs.length === 1 ? '' : 's'}
        </span>
      </div>

      {recommendations.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={36} />}
          title="No Active Recommendations"
          description="Operational allocations are currently optimal with no pending constraint violations."
          action={
            <button className="btn btn-secondary" onClick={() => navigate('/scenarios')}>
              Simulate a Scenario
            </button>
          }
        />
      ) : filterPriority !== 'all' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredRecs.map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onSelect={() => openDrawer('recommendation', rec.id, rec)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {immediateRecs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-danger">Immediate Action Required</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Resolve active blocking constraint breaches
                </span>
              </div>
              {immediateRecs.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onSelect={() => openDrawer('recommendation', rec.id, rec)}
                />
              ))}
            </div>
          )}

          {nextShiftRecs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-warning">Next Shift / Schedule Adjustments</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Surgical buffer protection and shift handoffs
                </span>
              </div>
              {nextShiftRecs.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onSelect={() => openDrawer('recommendation', rec.id, rec)}
                />
              ))}
            </div>
          )}

          {monitorRecs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-info">Continuous Operational Monitoring</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Proactive baseline headroom and telemetry alerts
                </span>
              </div>
              {monitorRecs.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onSelect={() => openDrawer('recommendation', rec.id, rec)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

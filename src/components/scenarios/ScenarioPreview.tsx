import React from 'react';
import { ScenarioInput } from '../../domain/types';
import { INITIAL_ALLOCATION, simulateScenario } from '../../domain/scenarioEngine';
import { evaluateConstraints } from '../../domain/constraints';
import { derivePlanState, deriveResourceMetrics } from '../../domain/deriveMetrics';
import { StatusBadge } from '../common/StatusBadge';
import { HeartPulse, BedDouble, Users, Activity, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ScenarioPreviewProps {
  input: ScenarioInput;
  isDraft?: boolean;
}

export const ScenarioPreview: React.FC<ScenarioPreviewProps> = ({ input, isDraft }) => {
  const { allocation, staff } = simulateScenario(INITIAL_ALLOCATION, input);
  const constraints = evaluateConstraints(allocation, input, staff);
  const planState = derivePlanState(constraints);
  const metrics = deriveResourceMetrics(allocation, input, staff);

  const blockingCount = constraints.filter(c => !c.passed && c.severity === 'blocking').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Calculated Outcome Banner */}
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: planState === 'feasible' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.12)',
          border: `1px solid ${planState === 'feasible' ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.4)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {planState === 'feasible' ? (
            <CheckCircle2 size={24} color="var(--status-ok)" />
          ) : (
            <ShieldAlert size={24} color="var(--status-danger)" />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: planState === 'feasible' ? 'var(--status-ok)' : 'var(--status-danger)' }}>
              {isDraft ? 'DRAFT PREVIEW: ' : 'SIMULATED RESULT: '}
              {planState === 'feasible' ? 'FEASIBLE' : `INFEASIBLE (${blockingCount} BLOCKING VIOLATIONS)`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {planState === 'feasible' ? 'All 7 operational rules satisfied.' : 'Immediate operational rebalancing required.'}
            </div>
          </div>
        </div>

        <StatusBadge
          status={planState === 'feasible' ? 'ok' : 'danger'}
          label={planState.toUpperCase()}
        />
      </div>

      {/* Grid of derived resource pressures */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <HeartPulse size={14} color="var(--accent-cyan)" />
            <span>ICU Census</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: metrics.icu.status === 'danger' ? 'var(--status-danger)' : 'var(--text-primary)', marginTop: '4px' }}>
            {metrics.icu.currentValue} / {metrics.icu.capacity}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {metrics.icu.reserveCount} bed reserve open
          </div>
        </div>

        <div className="panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <BedDouble size={14} color="var(--accent-cyan)" />
            <span>General Beds</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: metrics.beds.status === 'danger' ? 'var(--status-danger)' : 'var(--text-primary)', marginTop: '4px' }}>
            {metrics.beds.currentValue} / {metrics.beds.capacity}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {metrics.beds.reserveCount} bed reserve open
          </div>
        </div>

        <div className="panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <Users size={14} color="var(--accent-cyan)" />
            <span>Nurses Deployed</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: metrics.staff.status === 'danger' ? 'var(--status-danger)' : 'var(--text-primary)', marginTop: '4px' }}>
            {metrics.staff.currentValue} / {input.availableNurses}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Active roster count
          </div>
        </div>

        <div className="panel" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <Activity size={14} color="var(--accent-cyan)" />
            <span>OR Theatres</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {metrics.or.currentValue} / {metrics.or.capacity}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Surgical suites active
          </div>
        </div>
      </div>

      {/* List of active constraint breaches if any */}
      {constraints.filter(c => !c.passed).length > 0 && (
        <div className="panel">
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--status-danger)' }}>
            Predicted Constraint Breaches Under This Scenario:
          </div>
          <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {constraints.filter(c => !c.passed).map(c => (
              <li key={c.id}>
                <strong>{c.label}:</strong> {c.detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

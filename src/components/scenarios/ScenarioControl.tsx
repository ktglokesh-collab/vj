import React from 'react';
import { ScenarioInput } from '../../domain/types';

interface ScenarioControlProps {
  draft: ScenarioInput;
  active: ScenarioInput;
  onChange: (updated: ScenarioInput) => void;
}

export const ScenarioControl: React.FC<ScenarioControlProps> = ({
  draft,
  active,
  onChange,
}) => {
  const handleChange = <K extends keyof ScenarioInput>(field: K, value: number) => {
    onChange({
      ...draft,
      [field]: value,
    });
  };

  const isDirty = (field: keyof ScenarioInput) => draft[field] !== active[field];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Emergency Arrivals */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label htmlFor="input-arrivals" style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Acute Emergency Room Inflow
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseline: 0 · Range: 0 to 10 acute arrivals
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDirty('emergencyArrivals') && (
              <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>Draft Modified</span>
            )}
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', minWidth: '32px', textAlign: 'right' }}>
              +{draft.emergencyArrivals}
            </span>
          </div>
        </div>

        <input
          id="input-arrivals"
          type="range"
          min="0"
          max="10"
          step="1"
          value={draft.emergencyArrivals}
          onChange={e => handleChange('emergencyArrivals', parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '12px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>0 (Normal Flow)</span>
          <span>5 (Canonical Emergency)</span>
          <span>10 (Mass Casualty)</span>
        </div>
      </div>

      {/* 2. Available Nurses */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label htmlFor="input-nurses" style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Available Clinical Nursing Roster
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseline: 10 / 12 on duty · Range: 6 to 12 nurses
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDirty('availableNurses') && (
              <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>Draft Modified</span>
            )}
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: draft.availableNurses < 10 ? 'var(--status-danger)' : 'var(--accent-cyan)', minWidth: '32px', textAlign: 'right' }}>
              {draft.availableNurses}
            </span>
          </div>
        </div>

        <input
          id="input-nurses"
          type="range"
          min="6"
          max="12"
          step="1"
          value={draft.availableNurses}
          onChange={e => handleChange('availableNurses', parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '12px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>6 (-4 Sick Call)</span>
          <span>8 (Canonical -2 Deficit)</span>
          <span>10 (Baseline)</span>
          <span>12 (Full Shift)</span>
        </div>
      </div>

      {/* 3. Added ICU Demand */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label htmlFor="input-icu-demand" style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Projected High-Acuity ICU Admissions
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseline: 0 · Range: 0 to 6 admissions
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDirty('addedIcuDemand') && (
              <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>Draft Modified</span>
            )}
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', minWidth: '32px', textAlign: 'right' }}>
              +{draft.addedIcuDemand}
            </span>
          </div>
        </div>

        <input
          id="input-icu-demand"
          type="range"
          min="0"
          max="6"
          step="1"
          value={draft.addedIcuDemand}
          onChange={e => handleChange('addedIcuDemand', parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '12px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>0</span>
          <span>2 (Canonical Surge)</span>
          <span>4</span>
          <span>6 (Severe Saturation)</span>
        </div>
      </div>

      {/* 4. Delayed Discharges */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label htmlFor="input-discharges" style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Delayed Inpatient Floor Discharges
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseline: 0 · Range: 0 to 8 delayed bed turnovers
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDirty('delayedDischarges') && (
              <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>Draft Modified</span>
            )}
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', minWidth: '32px', textAlign: 'right' }}>
              +{draft.delayedDischarges}
            </span>
          </div>
        </div>

        <input
          id="input-discharges"
          type="range"
          min="0"
          max="8"
          step="1"
          value={draft.delayedDischarges}
          onChange={e => handleChange('delayedDischarges', parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '12px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>0</span>
          <span>4 (Step-down bottleneck)</span>
          <span>8 (Full Inpatient Hold)</span>
        </div>
      </div>

      {/* 5. OR Delay Minutes */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label htmlFor="input-or-delay" style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Operating Theatre Schedule Delay
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseline: 0 min · Range: 0 to 240 mins (30m increments)
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDirty('orDelayMinutes') && (
              <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>Draft Modified</span>
            )}
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', minWidth: '40px', textAlign: 'right' }}>
              +{draft.orDelayMinutes}m
            </span>
          </div>
        </div>

        <input
          id="input-or-delay"
          type="range"
          min="0"
          max="240"
          step="30"
          value={draft.orDelayMinutes}
          onChange={e => handleChange('orDelayMinutes', parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '12px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>0m</span>
          <span>60m (1 hr)</span>
          <span>120m (2 hr)</span>
          <span>240m (4 hr)</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScenarioInput } from '../domain/types';
import { useAppStore } from '../state/store';
import { BASELINE_SCENARIO, CANONICAL_EMERGENCY_SCENARIO, IMPOSSIBLE_CUSTOM_SCENARIO } from '../data/scenarios';
import { PageHeader } from '../components/common/PageHeader';
import { ScenarioControl } from '../components/scenarios/ScenarioControl';
import { ScenarioPreview } from '../components/scenarios/ScenarioPreview';
import {
  Play,
  RotateCcw,
  Undo2,
  Cpu,
  Flame,
  ShieldAlert,
} from 'lucide-react';

export const ScenarioLabPage: React.FC = () => {
  const {
    activeScenario,
    draftScenario,
    setDraftScenario,
    revertDraftScenario,
    simulateScenario,
    resetBaseline,
    openConfirmModal,
  } = useAppStore();

  const navigate = useNavigate();

  const currentDraft: ScenarioInput = draftScenario || {
    emergencyArrivals: activeScenario.emergencyArrivals,
    availableNurses: activeScenario.availableNurses,
    addedIcuDemand: activeScenario.addedIcuDemand,
    delayedDischarges: activeScenario.delayedDischarges,
    orDelayMinutes: activeScenario.orDelayMinutes,
  };

  const isDirty = draftScenario !== null;

  const handleDraftChange = (updated: ScenarioInput) => {
    setDraftScenario(updated);
  };

  const handleSimulate = () => {
    simulateScenario();
  };

  const handleRevert = () => {
    revertDraftScenario();
  };

  const handleResetBaseline = () => {
    openConfirmModal({
      title: 'Reset Scenario to Baseline?',
      message: 'This will reset all scenario parameters back to default baseline values (0 arrivals, 10 nurses).',
      confirmLabel: 'Reset Baseline',
      isDanger: true,
      onConfirm: () => resetBaseline(),
    });
  };

  const handleLoadPreset = (preset: ScenarioInput) => {
    setDraftScenario(preset);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Scenario Lab"
        description="Simulate what-if operational disruptions, staffing shocks, and acute arrival surges in an isolated sandbox."
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isDirty && (
              <button className="btn btn-secondary" onClick={handleRevert}>
                <Undo2 size={16} />
                <span>Revert Draft</span>
              </button>
            )}

            <button className="btn btn-secondary" onClick={handleResetBaseline}>
              <RotateCcw size={16} />
              <span>Reset Baseline</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSimulate}
              style={{ backgroundColor: 'var(--accent-primary)', fontWeight: 700 }}
            >
              <Play size={16} />
              <span>Simulate Scenario {isDirty ? '(Commit Draft)' : ''}</span>
            </button>
          </div>
        }
      />

      <div className="panel" style={{ padding: '14px 18px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Quick Scenario Presets:
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleLoadPreset(BASELINE_SCENARIO)}
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
          >
            Baseline (Normal Ops)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleLoadPreset(CANONICAL_EMERGENCY_SCENARIO)}
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
          >
            <Flame size={14} color="var(--status-danger)" />
            <span>Canonical Emergency (+5 Inflow, -2 Staff)</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleLoadPreset(IMPOSSIBLE_CUSTOM_SCENARIO)}
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            title="Tests truthful failure path when constraints cannot be satisfied"
          >
            <ShieldAlert size={14} color="var(--status-warning)" />
            <span>Extreme Stress Test (Impossible Solvability)</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Scenario Assumption Controls
            </h2>
            {isDirty ? (
              <span className="badge badge-warning">Draft Not Yet Simulated</span>
            ) : (
              <span className="badge badge-ok">Active in Simulation (Rev {activeScenario.revision})</span>
            )}
          </div>

          <ScenarioControl
            draft={currentDraft}
            active={activeScenario}
            onChange={handleDraftChange}
          />

          <button
            className="btn btn-primary"
            onClick={handleSimulate}
            style={{ padding: '12px', fontSize: '1rem', fontWeight: 700, marginTop: '8px' }}
          >
            <Play size={18} />
            <span>Simulate & Commit Scenario to Operations</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Predicted Operational Impact
            </h2>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/replan')}
              style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            >
              <Cpu size={14} />
              <span>Go to Replan Studio</span>
            </button>
          </div>

          <ScenarioPreview input={currentDraft} isDraft={isDirty} />
        </div>
      </div>
    </div>
  );
};

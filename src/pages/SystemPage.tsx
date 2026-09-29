import React from 'react';
import type { DemoEvent } from '../domain/types';
import { useAppStore } from '../state/store';
import { PageHeader } from '../components/common/PageHeader';
import {
  RotateCcw,
  Database,
  Copy,
  Terminal,
} from 'lucide-react';

export const SystemPage: React.FC = () => {
  const {
    hospital,
    activeScenario,
    currentAllocation,
    validation,
    events,
    lastUpdatedAt,
    resetBaseline,
    openConfirmModal,
    addToast,
  } = useAppStore();

  const handleResetClick = () => {
    openConfirmModal({
      title: 'Reset Full Simulation to Baseline?',
      message: 'This will reset all allocations, clear event history, and restore canonical operating metrics.',
      confirmLabel: 'Reset Entire Simulation',
      isDanger: true,
      onConfirm: () => resetBaseline(),
    });
  };

  const handleCopyStateSummary = () => {
    const summary = JSON.stringify(
      {
        simulatedHospital: hospital.name,
        simulatedTime: hospital.simulatedTime,
        activeScenario,
        currentAllocation,
        validationVerdict: validation?.isFeasible ? 'FEASIBLE' : 'INFEASIBLE',
        lastUpdated: lastUpdatedAt,
      },
      null,
      2
    );
    navigator.clipboard.writeText(summary);
    addToast({
      title: 'State Copied to Clipboard',
      message: 'Synthetic simulation state JSON copied successfully.',
      type: 'success',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="System Simulation & Event Audit"
        description="Local mock engine diagnostics, deterministic seed configuration, and simulated operations audit log."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleCopyStateSummary}>
              <Copy size={16} />
              <span>Copy Mock State JSON</span>
            </button>
            <button className="btn btn-danger" onClick={handleResetClick}>
              <RotateCcw size={16} />
              <span>Reset Entire Simulation</span>
            </button>
          </div>
        }
      />

      <div
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <Database size={24} color="var(--accent-cyan)" />
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Simulation Environment Notice:</strong> All metrics, time horizons, constraint algorithms, and event feeds are executed locally within the client memory using deterministic typed state. No EHR or production clinical system integration is active.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deterministic Seed</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            SEED_QCARE_2026
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Repeatable test execution</span>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Simulated Clock</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {hospital.simulatedTime}
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{hospital.simulatedDate}</span>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Scenario Revision</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            Revision {activeScenario.revision}
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{activeScenario.label}</span>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last State Recompute</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {lastUpdatedAt}
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Synchronized across pages</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Terminal size={18} color="var(--accent-cyan)" />
            <span>Simulation Event Audit Log ({events.length} Events)</span>
          </div>
          <span className="badge badge-scenario">Real-Time Client Log</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {events.map((evt: DemoEvent) => (
            <div
              key={evt.id}
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span className={`badge ${evt.severity === 'danger' ? 'badge-danger' : evt.severity === 'success' ? 'badge-ok' : 'badge-info'}`} style={{ marginTop: '2px' }}>
                  {evt.relativeTime}
                </span>

                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {evt.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                    {evt.description}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{evt.id} · {evt.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

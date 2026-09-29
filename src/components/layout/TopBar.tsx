import React from 'react';
import { useAppStore } from '../../state/store';
import { evaluateConstraints } from '../../domain/constraints';
import { derivePlanState } from '../../domain/deriveMetrics';
import { Activity, Clock, Command, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Sun, Moon } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    hospital,
    activeScenario,
    currentAllocation,
    staff,
    ui,
    toggleTheme,
    openCommandPalette,
    openConfirmModal,
    resetBaseline,
  } = useAppStore();

  const theme = ui.theme;

  const constraints = evaluateConstraints(currentAllocation, activeScenario, staff);
  const planState = derivePlanState(constraints);

  const handleResetClick = () => {
    openConfirmModal({
      title: 'Reset Simulation to Baseline?',
      message: 'This will revert all scenario modifications, clear pending proposals, and restore canonical baseline metrics.',
      confirmLabel: 'Confirm Reset',
      isDanger: true,
      onConfirm: () => resetBaseline(),
    });
  };

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <div className="brand-mark" aria-label="Q-CARE System">
          <Activity className="brand-logo-icon" />
          <span className="gradient-text">Q-CARE</span>
        </div>

        <div className="hospital-context" title={hospital.campus}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>BVH</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span>Main Hospital</span>
        </div>

        <span className="badge badge-sim" title="This application runs local synthetic simulation data. No real hospital connectivity.">
          <span className="pulse-dot" style={{ backgroundColor: 'var(--accent-cyan)' }} />
          <span>SIMULATION · Synthetic Demo Data</span>
        </span>
      </div>

      <div className="topbar-right">
        {/* Scenario Badge */}
        <span
          className={`badge ${
            activeScenario.kind === 'emergency'
              ? 'badge-danger'
              : activeScenario.kind === 'custom'
              ? 'badge-warning'
              : 'badge-scenario'
          }`}
          title={`Active Scenario Revision ${activeScenario.revision}`}
        >
          {activeScenario.kind === 'emergency' && (
            <span className="pulse-dot" style={{ backgroundColor: 'var(--status-danger)' }} />
          )}
          <span>
            {activeScenario.kind === 'emergency'
              ? '🚨 Canonical Emergency'
              : activeScenario.kind === 'custom'
              ? '⚙️ Custom Scenario'
              : 'Baseline Operations'}{' '}
            (Rev {activeScenario.revision})
          </span>
        </span>

        {/* Simulated Clock */}
        <div
          className="clock"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--text-body)',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-glass)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
          }}
          title="Deterministic Simulated Time"
        >
          <Clock size={15} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{hospital.simulatedTime}</span>
        </div>

        {/* Plan Status Chip */}
        <div
          className={`plan-health-chip ${planState}`}
          title={`Current Plan: ${planState.toUpperCase()}`}
          role="status"
          aria-live="polite"
        >
          {planState === 'feasible' && <CheckCircle2 size={16} color="var(--status-ok)" />}
          {planState === 'at_risk' && <AlertTriangle size={16} color="var(--status-warning)" />}
          {planState === 'infeasible' && <XCircle size={16} color="var(--status-danger)" />}
          <span>{planState === 'feasible' ? 'FEASIBLE' : planState === 'at_risk' ? 'AT RISK' : 'INFEASIBLE'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="btn btn-secondary theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {theme === 'dark' ? (
            <Sun size={15} color="#F59E0B" className="theme-icon sun" />
          ) : (
            <Moon size={15} color="#6366F1" className="theme-icon moon" />
          )}
          <span style={{ fontSize: 'var(--text-metadata)' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Command Palette Button */}
        <button
          className="btn btn-secondary"
          onClick={openCommandPalette}
          title="Open Command Palette (Ctrl+K / ⌘K)"
          aria-label="Open Command Palette"
          style={{ padding: '6px 12px', fontSize: 'var(--text-metadata)' }}
        >
          <Command size={14} color="var(--accent-cyan)" />
          <span>⌘K</span>
        </button>

        {/* Reset Shortcut */}
        <button
          className="btn btn-secondary"
          onClick={handleResetClick}
          title="Reset Simulation to Baseline"
          aria-label="Reset simulation to baseline"
          style={{ padding: '6px 12px', fontSize: 'var(--text-metadata)' }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};

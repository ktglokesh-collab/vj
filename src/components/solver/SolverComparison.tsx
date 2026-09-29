import React, { useState } from 'react';
import { Objective } from '../../domain/types';
import { SOLVER_COMPARISON_DATA } from '../../data/solver';
import { Boxes, Zap, Cpu, AlertCircle } from 'lucide-react';

export const SolverComparison: React.FC = () => {
  const [objective, setObjective] = useState<Objective>('feasibility_first');
  const data = SOLVER_COMPARISON_DATA[objective];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Prominent Disclosure Banner */}
      <div
        style={{
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <AlertCircle size={24} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Illustrative Simulation Disclosure:</strong> All metrics, runtimes, energy units, and benchmarks displayed below represent deterministic mock architectural fixtures for conceptual comparison. No real quantum hardware or production solver execution is claimed.
        </div>
      </div>

      {/* Objective Selector Bar */}
      <div className="panel" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Mathematical Objective</span>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>{data.headline}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{data.summary}</div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${objective === 'feasibility_first' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setObjective('feasibility_first')}
          >
            Feasibility-First
          </button>
          <button
            className={`btn ${objective === 'change_minimizing' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setObjective('change_minimizing')}
          >
            Change-Minimizing
          </button>
        </div>
      </div>

      {/* Side-by-side comparison cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Classical Formulation Concept */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <Cpu size={20} color="var(--text-secondary)" />
              <span>Classical Baseline (MILP / OR-Tools Concept)</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Mixed-Integer Linear Programming baseline with branch-and-cut linear relaxation heuristics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {data.metrics.map((m, idx) => (
              <div key={idx} style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{m.metric}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.classical}</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {m.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hybrid / QUBO Formulation Concept */}
        <div className="panel" style={{ borderColor: 'rgba(34, 211, 238, 0.3)' }}>
          <div className="panel-header">
            <div className="panel-title">
              <Zap size={20} color="var(--accent-cyan)" />
              <span>Hybrid / QUBO Optimization Concept</span>
            </div>
            <span className="badge badge-sim">Simulated Concept</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Quadratic Unconstrained Binary Optimization mapping with simulated quantum-inspired penalty energy landscapes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {data.metrics.map((m, idx) => (
              <div key={idx} style={{ background: 'rgba(34, 211, 238, 0.05)', border: '1px solid rgba(34, 211, 238, 0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{m.metric}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{m.hybridQubo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{m.note}</span>
                  {m.improvement && (
                    <span className="badge badge-ok" style={{ fontSize: '0.6875rem' }}>{m.improvement}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assumptions & Notes */}
      <div className="panel">
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Modeling Assumptions & Conceptual Framework
        </h4>
        <ul style={{ paddingLeft: '20px', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '8px' }}>
          {data.assumptions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

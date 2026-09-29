import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Objective } from '../domain/types';
import { useAppStore } from '../state/store';
import { evaluateConstraints } from '../domain/constraints';
import { derivePlanHealthScore, derivePlanState } from '../domain/deriveMetrics';
import { PageHeader } from '../components/common/PageHeader';
import { PlanHealth } from '../components/common/PlanHealth';
import { ConstraintList } from '../components/replan/ConstraintList';
import { OptimizationProgress } from '../components/replan/OptimizationProgress';
import { BeforeAfter } from '../components/replan/BeforeAfter';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import {
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export const ReplanStudioPage: React.FC = () => {
  const {
    currentAllocation,
    activeScenario,
    staff,
    proposal,
    optimization,
    validation,
    startReplan,
    cancelReplan,
    acceptProposal,
    openConfirmModal,
  } = useAppStore();

  const [objective, setObjective] = useState<Objective>(optimization.objective || 'feasibility_first');
  const navigate = useNavigate();

  const constraints = evaluateConstraints(currentAllocation, activeScenario, staff);
  const planState = derivePlanState(constraints);
  const planHealth = derivePlanHealthScore(constraints);
  const blockingViolations = constraints.filter(c => !c.passed && c.severity === 'blocking');

  const isSolving =
    optimization.state === 'analyzing' ||
    optimization.state === 'modeling' ||
    optimization.state === 'optimizing' ||
    optimization.state === 'validating';

  const isFailed = optimization.state === 'failed';

  const handleStartSolve = () => {
    startReplan(objective);
  };

  const handleAcceptClick = () => {
    openConfirmModal({
      title: 'Accept & Commit Rebalanced Plan?',
      message: 'This will update the active local simulation allocation with the validated candidate actions. No real-world changes are executed.',
      confirmLabel: 'Accept Proposed Plan',
      isDanger: false,
      onConfirm: () => acceptProposal(),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Replan Studio"
        description="Autonomous multi-resource constraint rebalancing and optimal candidate proposal generation."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            {proposal && validation?.isFeasible && (
              <button
                className="btn btn-primary"
                onClick={handleAcceptClick}
                style={{ backgroundColor: 'var(--status-ok)', color: '#000', fontWeight: 700 }}
              >
                <CheckCircle2 size={16} />
                <span>Accept Plan (Rev {proposal.baseRevision})</span>
              </button>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => navigate('/replan/validation')}
            >
              <ShieldCheck size={16} />
              <span>Full Validation Checklist</span>
            </button>
          </div>
        }
      />

      <PlanHealth
        planState={planState}
        score={planHealth.score}
        scoreLabel={planHealth.label}
        violationsCount={constraints.filter(c => !c.passed).length}
      />

      {isSolving && (
        <OptimizationProgress
          state={optimization.state}
          phase={optimization.phase}
          progressPercent={optimization.progressPercent}
          onCancel={cancelReplan}
        />
      )}

      {!isSolving && !proposal && (
        <div className="panel" style={{ borderColor: blockingViolations.length > 0 ? 'rgba(248, 113, 113, 0.4)' : 'var(--border-subtle)' }}>
          <div className="panel-header">
            <div className="panel-title">
              <Cpu size={20} color="var(--accent-cyan)" />
              <span>Optimizer Formulation & Objective</span>
            </div>
            <span className="badge badge-scenario">Engine Ready</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {blockingViolations.length > 0
              ? `The engine has detected ${blockingViolations.length} blocking constraint violation(s) in the current plan. Select an optimization objective and execute candidate search.`
              : 'Current operating allocations satisfy all modeled constraints. You may still generate an alternative rebalancing candidate.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: 'var(--surface-2)', padding: '14px 16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className={`btn ${objective === 'feasibility_first' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setObjective('feasibility_first')}
              >
                Feasibility-First (Max Reserve Margins)
              </button>
              <button
                className={`btn ${objective === 'change_minimizing' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setObjective('change_minimizing')}
              >
                Change-Minimizing (Least Disruption)
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleStartSolve}
              style={{ padding: '10px 20px', fontSize: '0.9375rem', fontWeight: 700 }}
            >
              <Sparkles size={16} />
              <span>Generate Feasible Plan</span>
            </button>
          </div>
        </div>
      )}

      {isFailed && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <XCircle size={24} color="var(--status-danger)" />
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--status-danger)' }}>
              No Feasible Candidate Found
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Under the current extreme scenario parameters, no combination of permitted patient transfers, nurse cross-reassignments, and procedure deferrals can satisfy all hard safety constraints.
          </p>
          <div style={{ background: 'var(--surface-1)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
            <strong>Residual Blocking Violations:</strong>
            <div style={{ color: 'var(--status-danger)', marginTop: '4px' }}>
              {optimization.error}
            </div>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={() => navigate('/scenarios')}>
              <span>Adjust Scenario Parameters in Scenario Lab</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {proposal && (
        <div
          className="panel"
          style={{
            borderColor: 'rgba(52, 211, 153, 0.4)',
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, var(--surface-1) 100%)',
          }}
        >
          <div className="panel-header">
            <div className="panel-title">
              <Sparkles size={20} color="var(--status-ok)" />
              <span>Proposed Feasible Candidate: {proposal.id}</span>
            </div>
            <span className="badge badge-ok">All 7 Rules Verified</span>
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {proposal.summary}
          </p>

          <BeforeAfter
            currentAllocation={currentAllocation}
            proposal={proposal}
          />

          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Candidate Operational Actions ({proposal.actions.length})
            </h4>
            {proposal.actions.map(action => (
              <RecommendationCard
                key={action.id}
                recommendation={{ ...action, planRevision: proposal.baseRevision }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-2)', borderRadius: '8px', marginTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Validation checks evaluated for Revision {proposal.baseRevision}. Acceptance updates local state.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/replan/validation')}
              >
                <span>Inspect Validation Proof</span>
                <ArrowRight size={14} />
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAcceptClick}
                style={{ backgroundColor: 'var(--status-ok)', color: '#000', fontWeight: 700 }}
              >
                <CheckCircle2 size={16} />
                <span>Accept Proposed Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>Evaluated Operational Constraints ({constraints.length} Rules)</span>
          </div>
          <span className="badge badge-scenario">
            {constraints.filter(c => c.passed).length}/{constraints.length} Satisfied
          </span>
        </div>

        <ConstraintList constraints={constraints} />
      </div>
    </div>
  );
};

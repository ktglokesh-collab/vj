import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { PageHeader } from '../components/common/PageHeader';
import { ValidationChecklist } from '../components/replan/ValidationChecklist';
import { CheckCircle2, ChevronLeft } from 'lucide-react';

export const ValidationPage: React.FC = () => {
  const {
    validation,
    proposal,
    activeScenario,
    acceptProposal,
    openConfirmModal,
  } = useAppStore();

  const navigate = useNavigate();

  if (!validation) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PageHeader
          title="Plan Validation Checklist"
          description="Verification of regulatory, clinical safety, and physical capacity constraints."
        />
        <div className="panel" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No validation data currently active.</p>
          <button className="btn btn-primary" onClick={() => navigate('/replan')} style={{ marginTop: '12px' }}>
            <span>Open Replan Studio</span>
          </button>
        </div>
      </div>
    );
  }

  const isStale = proposal && proposal.baseRevision !== activeScenario.revision;

  const handleAcceptClick = () => {
    openConfirmModal({
      title: 'Accept & Commit Validated Plan?',
      message: 'This will update the active local simulation allocation with the verified candidate actions.',
      confirmLabel: 'Accept Plan',
      isDanger: false,
      onConfirm: () => {
        acceptProposal();
        navigate('/replan');
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Plan Validation Checklist"
        description="Deterministic verification of all 7 clinical staffing mandates, bed capacities, shift boundaries, and surgical buffers."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/replan')}>
              <ChevronLeft size={16} />
              <span>Back to Replan Studio</span>
            </button>

            {proposal && validation.isFeasible && !isStale && (
              <button
                className="btn btn-primary"
                onClick={handleAcceptClick}
                style={{ backgroundColor: 'var(--status-ok)', color: '#000', fontWeight: 700 }}
              >
                <CheckCircle2 size={16} />
                <span>Accept Validated Plan</span>
              </button>
            )}
          </div>
        }
      />

      {isStale && (
        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.4)', padding: '14px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            ⚠️ <strong>Stale Proposal:</strong> The current candidate was evaluated for an earlier scenario revision. Please regenerate in Replan Studio.
          </span>
          <button className="btn btn-primary" onClick={() => navigate('/replan')}>
            Re-run Replan Studio
          </button>
        </div>
      )}

      <div className="panel">
        <ValidationChecklist validation={validation} isProposalContext={Boolean(proposal)} />
      </div>

      <div style={{ padding: '14px', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <strong>Governance Disclosure:</strong> Q-CARE decision-support simulation does not execute autonomous operational transfers or alter patient care records. All recommendations require operational administrator review.
      </div>
    </div>
  );
};

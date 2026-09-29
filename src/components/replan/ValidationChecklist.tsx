import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ValidationResult } from '../../domain/types';
import { useAppStore } from '../../state/store';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, ArrowRight, ShieldCheck } from 'lucide-react';

interface ValidationChecklistProps {
  validation: ValidationResult;
  isProposalContext?: boolean;
}

export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  validation,
  isProposalContext,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { selectResource } = useAppStore();
  const navigate = useNavigate();

  const handleInspectResource = (resId: string) => {
    selectResource(resId as any);
    navigate(`/resources/${resId}`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Summary Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: validation.isFeasible ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.12)',
          border: `1px solid ${validation.isFeasible ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.4)'}`,
          borderRadius: 'var(--radius-lg)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {validation.isFeasible ? (
            <ShieldCheck size={28} color="var(--status-ok)" />
          ) : (
            <XCircle size={28} color="var(--status-danger)" />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: validation.isFeasible ? 'var(--status-ok)' : 'var(--status-danger)' }}>
              {validation.isFeasible ? 'VALIDATION VERDICT: FEASIBLE' : 'VALIDATION VERDICT: PLAN REJECTED'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {validation.passedChecks} of {validation.totalChecks} constraints passed · Evaluated at {validation.evaluatedAt}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${validation.isFeasible ? 'badge-ok' : 'badge-danger'}`}>
            Revision {validation.revision} Validated
          </span>
        </div>
      </div>

      {/* Checklist items in fixed order */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {validation.checks.map(check => {
          const isExpanded = expandedId === check.id;
          const isPass = check.passed;
          const isBlocking = check.severity === 'blocking';

          return (
            <div
              key={check.id}
              style={{
                backgroundColor: 'var(--surface-1)',
                border: `1px solid ${
                  isPass
                    ? 'var(--border-subtle)'
                    : isBlocking
                    ? 'rgba(248, 113, 113, 0.35)'
                    : 'rgba(251, 191, 36, 0.3)'
                }`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => toggleExpand(check.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? 'var(--surface-2)' : 'transparent',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
                  {isPass ? (
                    <CheckCircle2 size={18} color="var(--status-ok)" />
                  ) : isBlocking ? (
                    <XCircle size={18} color="var(--status-danger)" />
                  ) : (
                    <AlertTriangle size={18} color="var(--status-warning)" />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      Rule {check.ruleNumber}: {check.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Observed: {check.observedValue} | Required Threshold: {check.thresholdValue}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${isPass ? 'badge-ok' : isBlocking ? 'badge-danger' : 'badge-warning'}`}>
                    {isPass ? 'PASS' : isBlocking ? 'BLOCKING FAIL' : 'WARN'}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {check.details}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Context description: {check.description}
                  </p>
                  <div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleInspectResource(check.resourceId)}
                      style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
                    >
                      <span>Inspect {check.resourceId.toUpperCase()} Resource</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

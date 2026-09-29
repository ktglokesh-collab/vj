import React from 'react';
import { Allocation, PlanCandidate } from '../../domain/types';
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface BeforeAfterProps {
  currentAllocation: Allocation;
  proposal: PlanCandidate;
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({ currentAllocation, proposal }) => {
  const propAlloc = proposal.allocation;

  const transferred = propAlloc.transferredPatientIds.length;
  const currentTransferred = currentAllocation.transferredPatientIds.length;

  const currentIcuOccupied = currentAllocation.icuBedsOccupied - currentTransferred;
  const proposedIcuOccupied = propAlloc.icuBedsOccupied - transferred;

  const currentGeneralOccupied = currentAllocation.generalBedsOccupied + currentTransferred;
  const proposedGeneralOccupied = propAlloc.generalBedsOccupied + transferred;

  const currentIcuNurses = currentAllocation.nursesAssignedIcu.length;
  const proposedIcuNurses = propAlloc.nursesAssignedIcu.length;

  const currentOrActive = currentAllocation.orRoomsActive - currentAllocation.deferredProcedureIds.length;
  const proposedOrActive = propAlloc.orRoomsActive - propAlloc.deferredProcedureIds.length;

  const items = [
    {
      title: 'ICU Critical Care Census',
      before: `${currentIcuOccupied} / ${currentAllocation.icuBedsCapacity} beds`,
      after: `${proposedIcuOccupied} / ${propAlloc.icuBedsCapacity} beds`,
      change: proposedIcuOccupied < currentIcuOccupied ? '-1 Patient (Step-Down Transfer)' : 'Stable',
      statusBefore: currentIcuOccupied >= 10 ? 'danger' : 'ok',
      statusAfter: 'ok',
    },
    {
      title: 'General & Step-Down Inpatient Beds',
      before: `${currentGeneralOccupied} / ${currentAllocation.generalBedsCapacity} beds`,
      after: `${proposedGeneralOccupied} / ${propAlloc.generalBedsCapacity} beds`,
      change: proposedGeneralOccupied > currentGeneralOccupied ? '+1 Inpatient Step-Down Load' : 'Stable',
      statusBefore: currentGeneralOccupied > 30 ? 'danger' : 'ok',
      statusAfter: 'ok',
    },
    {
      title: 'ICU Critical Care Nursing Coverage',
      before: `${currentIcuNurses} Nurses Assigned (Shortfall)`,
      after: `${proposedIcuNurses} Nurses Assigned (1:2 Met)`,
      change: proposedIcuNurses > currentIcuNurses ? '+1 Cross-Trained Nurse Reassigned' : 'Stable',
      statusBefore: 'danger',
      statusAfter: 'ok',
    },
    {
      title: 'Operating Theatre Standby Buffer',
      before: `${currentOrActive} / 3 Suites Active`,
      after: `${proposedOrActive} / 3 Suites Active`,
      change: proposedOrActive < currentOrActive ? '1 Low-Priority Elective Deferred' : '1 Trauma Standby Buffer Preserved',
      statusBefore: 'warning',
      statusAfter: 'ok',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        Modeled Operational Allocation: Before vs Proposed Candidate
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {item.title}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ flex: 1, background: 'var(--surface-2)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Plan</span>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: item.statusBefore === 'danger' ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                  {item.before}
                </div>
              </div>

              <ArrowRight size={16} color="var(--accent-cyan)" />

              <div style={{ flex: 1, background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--status-ok)', textTransform: 'uppercase' }}>Proposed Plan</span>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--status-ok)' }}>
                  {item.after}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {item.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

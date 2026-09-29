import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResourceId } from '../../domain/types';
import { useAppStore } from '../../state/store';
import { deriveResourceMetrics } from '../../domain/deriveMetrics';
import { INITIAL_PATIENTS } from '../../data/patients';
import { INITIAL_PROCEDURES } from '../../data/procedures';
import { StatusBadge } from '../common/StatusBadge';
import { BedDouble, HeartPulse, Users, Activity, Flame, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ResourceDetailProps {
  resourceId: ResourceId;
  isDrawer?: boolean;
}

export const ResourceDetail: React.FC<ResourceDetailProps> = ({ resourceId, isDrawer }) => {
  const { currentAllocation, activeScenario, staff, setMetric } = useAppStore();
  const navigate = useNavigate();

  const metrics = deriveResourceMetrics(currentAllocation, activeScenario, staff);
  const metric = metrics[resourceId];

  const handleOpenForecast = () => {
    setMetric(resourceId);
    navigate('/forecast');
  };

  const handleOpenReplan = () => {
    navigate('/replan');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top summary card */}
      <div style={{ backgroundColor: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {resourceId === 'emergency' && <Flame color="var(--accent-cyan)" size={20} />}
            {resourceId === 'beds' && <BedDouble color="var(--accent-cyan)" size={20} />}
            {resourceId === 'icu' && <HeartPulse color="var(--accent-cyan)" size={20} />}
            {resourceId === 'staff' && <Users color="var(--accent-cyan)" size={20} />}
            {resourceId === 'or' && <Activity color="var(--accent-cyan)" size={20} />}
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metric.name}</span>
          </div>
          <StatusBadge status={metric.status} label={metric.status.toUpperCase()} />
        </div>

        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
          {metric.currentValue} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {metric.capacity} {metric.unit}</span>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {metric.headline}
        </div>
      </div>

      {/* Resource-specific detailed breakdowns */}
      {resourceId === 'icu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ICU High-Acuity Patient Census
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {INITIAL_PATIENTS.filter(p => p.unit === 'ICU').map(patient => {
                const isTransferred = currentAllocation.transferredPatientIds.includes(patient.id);
                return (
                  <div
                    key={patient.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: isTransferred ? '1px solid var(--status-ok)' : '1px solid var(--border-subtle)',
                      opacity: isTransferred ? 0.6 : 1,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {patient.id} {isTransferred && '(Transferred to Step-Down)'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Acuity Level {patient.acuity} · Admitted {patient.admitTime}
                      </div>
                    </div>
                    {patient.transferEligibleStepdown && !isTransferred && (
                      <span className="badge badge-ok" style={{ fontSize: '0.6875rem' }}>
                        Step-Down Eligible
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Critical Care Nursing Coverage (Mandated 1:2 Ratio)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              ICU requires nurses with `ICU_CERTIFIED` or `CROSS_TRAINED_ICU` credentials.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {currentAllocation.nursesAssignedIcu.map(nurseId => {
                const nurse = staff.find(s => s.id === nurseId);
                return (
                  <div key={nurseId} style={{ background: 'var(--surface-2)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nurse?.name || nurseId}</span>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--accent-cyan)' }}>
                      {nurse?.skills.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {resourceId === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Clinical Workforce Roster & Skill Map
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {staff.map(nurse => (
                <div
                  key={nurse.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--surface-2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    opacity: nurse.isAvailable ? 1 : 0.45,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {nurse.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {nurse.skills.join(' · ')} · {nurse.hoursWorked}h on shift
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${nurse.isAvailable ? 'badge-ok' : 'badge-danger'}`}>
                      {nurse.isAvailable ? nurse.assignedUnit : 'OFF DUTY'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {resourceId === 'beds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              General Floor & Step-Down Allocation
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MED-SURG OCCUPIED</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentAllocation.generalBedsOccupied - currentAllocation.stepDownOccupied} / 26
                </div>
              </div>
              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STEP-DOWN UNIT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {currentAllocation.stepDownOccupied + currentAllocation.transferredPatientIds.length} / 4
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {resourceId === 'or' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Surgical Suite Schedule & Priority Governance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {INITIAL_PROCEDURES.map(proc => {
                const isDeferred = currentAllocation.deferredProcedureIds.includes(proc.id);
                return (
                  <div
                    key={proc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'var(--surface-2)',
                      borderRadius: 'var(--radius-md)',
                      border: isDeferred ? '1px solid var(--status-warning)' : '1px solid var(--border-subtle)',
                      opacity: isDeferred ? 0.6 : 1,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {proc.id} ({proc.orRoom}) {isDeferred && '— RESCHEDULED / DEFERRED'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Start {proc.scheduledStart} · {proc.scheduledDurationMinutes} mins · {proc.priority}
                      </div>
                    </div>
                    <span className={`badge ${proc.deferrable ? 'badge-scenario' : 'badge-danger'}`}>
                      {proc.deferrable ? 'Deferrable' : 'Fixed Case'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {resourceId === 'emergency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="panel">
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Acute Emergency Intake & Downstream Pressure
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Emergency arrivals directly drive immediate bed demand: 60% general inpatient beds and 40% high-acuity ICU beds.
            </p>
            <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT HOLDING BUFFER</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentAllocation.emergencyReserveBeds} / 6 holding slots open
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action links */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button className="btn btn-secondary" onClick={handleOpenForecast} style={{ flex: 1 }}>
          <span>View {metric.name} Forecast</span>
          <ArrowRight size={15} />
        </button>
        <button className="btn btn-primary" onClick={handleOpenReplan} style={{ flex: 1 }}>
          <span>Open Replan Studio</span>
        </button>
      </div>
    </div>
  );
};

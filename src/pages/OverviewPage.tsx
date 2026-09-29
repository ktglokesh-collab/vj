import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';
import { evaluateConstraints } from '../domain/constraints';
import { deriveNextRisk, derivePlanHealthScore, derivePlanState, deriveResourceMetrics } from '../domain/deriveMetrics';
import { generateForecastData } from '../data/forecasts';
import { PageHeader } from '../components/common/PageHeader';
import { PlanHealth } from '../components/common/PlanHealth';
import { MetricGroup } from '../components/common/MetricGroup';
import { ForecastChart } from '../components/charts/ForecastChart';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import {
  AlertTriangle,
  TrendingUp,
  Cpu,
  Flame,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const {
    currentAllocation,
    activeScenario,
    staff,
    proposal,
    recommendations,
    events,
    injectEmergency,
    selectResource,
    setMetric,
    openDrawer,
    openConfirmModal,
  } = useAppStore();

  const navigate = useNavigate();

  const constraints = evaluateConstraints(currentAllocation, activeScenario, staff);
  const planState = derivePlanState(constraints);
  const planHealth = derivePlanHealthScore(constraints);
  const nextRisk = deriveNextRisk(constraints, activeScenario);
  const metrics = deriveResourceMetrics(currentAllocation, activeScenario, staff);

  const forecastData = generateForecastData(nextRisk.resourceId, 12, activeScenario);

  const handleInjectEmergencyClick = () => {
    openConfirmModal({
      title: 'Inject Canonical Emergency Inflow?',
      message: 'This will simulate +5 acute emergency arrivals, +2 projected ICU admissions, and 2 nurse shift absences in the synthetic environment.',
      confirmLabel: 'Inject Emergency',
      isDanger: true,
      onConfirm: () => injectEmergency(),
    });
  };

  const prioritizedRecs = recommendations.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header with State-Dependent CTAs */}
      <PageHeader
        title="Command Center Overview"
        description="Real-time operations decision-support and multi-resource capacity picture."
        actions={
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {planState === 'feasible' && !proposal && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setMetric('icu');
                    navigate('/forecast');
                  }}
                >
                  <TrendingUp size={16} />
                  <span>View ICU Forecast</span>
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleInjectEmergencyClick}
                  title="Simulate canonical emergency surge"
                >
                  <Flame size={16} />
                  <span>Inject Emergency (+5 Inflow)</span>
                </button>
              </>
            )}

            {planState === 'infeasible' && !proposal && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/replan')}
                style={{ backgroundColor: 'var(--status-danger)' }}
              >
                <Cpu size={16} />
                <span>Open Replan Studio (Resolve Violations)</span>
              </button>
            )}

            {proposal && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/replan')}
              >
                <Sparkles size={16} />
                <span>Review Generated Plan Candidate</span>
              </button>
            )}
          </div>
        }
      />

      {/* 1. Plan Health Banner */}
      <PlanHealth
        planState={planState}
        score={planHealth.score}
        scoreLabel={planHealth.label}
        violationsCount={constraints.filter(c => !c.passed).length}
      />

      {/* 2. Next Risk Panel & Primary Forecast Chart Hero Composition */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div
          className="panel"
          style={{
            borderColor: nextRisk.hasRisk ? 'rgba(248, 113, 113, 0.4)' : 'rgba(99, 102, 241, 0.3)',
            backgroundColor: nextRisk.hasRisk ? 'rgba(248, 113, 113, 0.05)' : 'var(--surface-1)',
          }}
        >
          <div className="panel-header">
            <div className="panel-title" style={{ color: nextRisk.hasRisk ? 'var(--status-danger)' : 'var(--text-primary)' }}>
              {nextRisk.hasRisk ? <ShieldAlert size={20} /> : <AlertTriangle size={20} color="var(--accent-cyan)" />}
              <span>Next Operational Risk Window</span>
            </div>
            <span className={`badge ${nextRisk.hasRisk ? 'badge-danger' : 'badge-info'}`}>
              {nextRisk.horizon}
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {nextRisk.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
              {nextRisk.detail}
            </p>
          </div>

          <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600 }}>Causal Bottleneck</span>
            <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontWeight: 500 }}>
              {nextRisk.breachReason}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button
              className="btn btn-secondary"
              onClick={() => openDrawer('risk', nextRisk.resourceId, nextRisk)}
              style={{ flex: 1 }}
            >
              <span>Why this risk?</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                selectResource(nextRisk.resourceId);
              }}
              style={{ flex: 1 }}
            >
              <span>Inspect {nextRisk.resourceId.toUpperCase()}</span>
            </button>
          </div>
        </div>

        <div className="panel" style={{ gridColumn: 'span 2' }}>
          <div className="panel-header">
            <div className="panel-title">
              <TrendingUp size={20} color="var(--accent-cyan)" />
              <span>Projected Demand & Capacity Trajectory (12-Hour Horizon)</span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setMetric(nextRisk.resourceId);
                navigate('/forecast');
              }}
              style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            >
              <span>Full Forecast Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <ForecastChart
            data={forecastData}
            resourceId={nextRisk.resourceId}
            height={240}
          />
        </div>
      </div>

      {/* 3. Five Compact Resource Metrics Strip */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Resource Operational Status
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click any resource to inspect drill-down drawer
          </span>
        </div>
        <MetricGroup
          metrics={metrics}
          onSelectMetric={(id) => selectResource(id)}
        />
      </div>

      {/* 4. Prioritized Recommendations */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>Prioritized Operational Action Recommendations</span>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/recommendations')}
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
          >
            <span>View All ({recommendations.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {prioritizedRecs.map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onSelect={() => openDrawer('recommendation', rec.id, rec)}
            />
          ))}
        </div>
      </div>

      {/* 5. Recent Event Timeline */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <Clock size={18} color="var(--text-secondary)" />
            <span>Recent Operational Simulation Events</span>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/system')}
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
          >
            <span>Full System Event Log</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {events.slice(0, 4).map(evt => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge ${evt.severity === 'danger' ? 'badge-danger' : evt.severity === 'success' ? 'badge-ok' : 'badge-info'}`}>
                  {evt.relativeTime}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {evt.title}
                </span>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {evt.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResourceId } from '../domain/types';
import { useAppStore } from '../state/store';
import { generateForecastData } from '../data/forecasts';
import { PageHeader } from '../components/common/PageHeader';
import { ForecastChart } from '../components/charts/ForecastChart';
import { ChartDataTable } from '../components/charts/ChartDataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  TrendingUp,
  Table as TableIcon,
  LineChart,
  Cpu,
  ArrowRight,
  AlertCircle,
  BedDouble,
  HeartPulse,
  Users,
  Activity,
  Flame,
} from 'lucide-react';

export const ForecastPage: React.FC = () => {
  const { ui, activeScenario, setMetric, setRangeHours, selectResource } = useAppStore();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const navigate = useNavigate();

  const selectedMetric = ui.selectedMetric;
  const rangeHours = ui.rangeHours;

  const data = generateForecastData(selectedMetric, rangeHours, activeScenario);
  const breaches = data.filter(d => !d.isHistorical && d.breach);

  const tabs: { id: ResourceId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'beds', label: 'General Beds', icon: BedDouble },
    { id: 'icu', label: 'ICU Critical Care', icon: HeartPulse },
    { id: 'staff', label: 'Clinical Staff', icon: Users },
    { id: 'or', label: 'Operating Theatres', icon: Activity },
    { id: 'emergency', label: 'Emergency Intake', icon: Flame },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Capacity & Demand Forecast"
        description="Deterministic time-series demand projections with modeled uncertainty and breach windows."
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ background: 'var(--surface-2)', padding: '4px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '4px' }}>
              <button
                className={`btn ${viewMode === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('chart')}
                style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
                aria-label="Chart View"
              >
                <LineChart size={15} />
                <span>Visual Chart</span>
              </button>
              <button
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('table')}
                style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
                aria-label="Table View"
              >
                <TableIcon size={15} />
                <span>Data Table</span>
              </button>
            </div>

            {breaches.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/replan')}
                style={{ backgroundColor: 'var(--status-danger)' }}
              >
                <Cpu size={16} />
                <span>Replan {selectedMetric.toUpperCase()} Breach</span>
              </button>
            )}
          </div>
        }
      />

      {/* Control Bar: Resource Tabs + Horizon Selectors */}
      <div
        className="panel"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} role="tablist" aria-label="Resource tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedMetric === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setMetric(tab.id)}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.875rem' }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Horizon:</span>
          {([6, 12, 24] as const).map(h => (
            <button
              key={h}
              onClick={() => setRangeHours(h)}
              className={`btn ${rangeHours === h ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            >
              {h} Hours
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Chart Panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <TrendingUp size={20} color="var(--accent-cyan)" />
            <span>{tabs.find(t => t.id === selectedMetric)?.label} — {rangeHours}h Forward Projection</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-sim">Deterministic Model</span>
            <button
              className="btn btn-secondary"
              onClick={() => selectResource(selectedMetric)}
              style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
            >
              <span>Inspect {selectedMetric.toUpperCase()} Topology</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {viewMode === 'chart' ? (
          <ForecastChart
            data={data}
            resourceId={selectedMetric}
            height={340}
          />
        ) : (
          <ChartDataTable data={data} />
        )}
      </div>

      {/* Breach Summary & Factor Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <AlertCircle size={18} color={breaches.length > 0 ? 'var(--status-danger)' : 'var(--status-ok)'} />
              <span>Breach & Risk Analysis</span>
            </div>
            <StatusBadge
              status={breaches.length > 0 ? 'danger' : 'ok'}
              label={breaches.length > 0 ? `${breaches.length} Breach Points` : 'Safe Operating Margin'}
            />
          </div>

          {breaches.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Projected demand exceeds modeled safe operating thresholds starting at <strong>{breaches[0]?.timestamp}</strong> ({breaches[0]?.timeOffsetHours >= 0 ? `+${breaches[0]?.timeOffsetHours}h` : ''}).
              </p>
              <div style={{ background: 'rgba(248, 113, 113, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(248, 113, 113, 0.3)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                Peak projected demand is <strong>{Math.max(...breaches.map(b => b.demand))}</strong> against safe capacity of <strong>{data[0]?.capacity}</strong>.
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Demand remains within safe operating bounds over the selected {rangeHours}-hour horizon under the active scenario.
            </p>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <span>Projection Assumptions</span>
            </div>
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <li>Emergency arrival shock weighting: +{activeScenario.emergencyArrivals} arrivals.</li>
            <li>Available clinical nursing staff: {activeScenario.availableNurses} nurses on shift.</li>
            <li>Confidence ribbon displays 95% modeled uncertainty interval based on admission variance.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

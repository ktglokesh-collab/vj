import React from 'react';
import { ResourceMetricSummary } from '../../domain/types';
import { StatusBadge } from './StatusBadge';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricProps {
  metric: ResourceMetricSummary;
  onClick?: () => void;
  isSelected?: boolean;
}

export const Metric: React.FC<MetricProps> = ({ metric, onClick, isSelected }) => {
  const isDanger = metric.status === 'danger';
  const isWarn = metric.status === 'warning';

  return (
    <div
      className="metric-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        borderColor: isSelected
          ? 'var(--accent-primary)'
          : isDanger
          ? 'rgba(248, 113, 113, 0.4)'
          : isWarn
          ? 'rgba(251, 191, 36, 0.3)'
          : 'var(--border-subtle)',
      }}
    >
      <div className="metric-card-header">
        <span>{metric.name}</span>
        <StatusBadge
          status={metric.status}
          label={metric.status === 'ok' ? 'Nominal' : metric.status === 'warning' ? 'Constrained' : 'Breached'}
        />
      </div>

      <div className="metric-main-value">
        <span>{metric.currentValue}</span>
        <span className="metric-capacity-sub">/ {metric.capacity} {metric.unit}</span>
      </div>

      <div className="metric-progress-bar">
        <div
          className="metric-progress-fill"
          style={{
            width: `${Math.min(100, metric.utilizationPercent)}%`,
            backgroundColor: isDanger
              ? 'var(--status-danger)'
              : isWarn
              ? 'var(--status-warning)'
              : 'var(--accent-primary)',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-metadata)', marginTop: '4px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          {metric.reserveCount} reserve available
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            color: metric.deltaFromBaseline > 0 ? 'var(--status-warning)' : 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {metric.deltaFromBaseline > 0 && <ArrowUpRight size={13} />}
          {metric.deltaFromBaseline < 0 && <ArrowDownRight size={13} />}
          {metric.deltaFromBaseline === 0 && <Minus size={13} />}
          {metric.deltaFromBaseline > 0 ? `+${metric.deltaFromBaseline}` : metric.deltaFromBaseline}
        </span>
      </div>
    </div>
  );
};

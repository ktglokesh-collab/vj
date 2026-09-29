import React from 'react';
import type { ResourceId, ResourceMetricSummary } from '../../domain/types';
import { StatusBadge } from '../common/StatusBadge';
import { BedDouble, HeartPulse, Users, Activity, Flame } from 'lucide-react';

interface ResourceNodeProps {
  id: ResourceId;
  label: string;
  metric: ResourceMetricSummary;
  x: number;
  y: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ResourceNode: React.FC<ResourceNodeProps> = ({
  id,
  label,
  metric,
  x,
  y,
  isSelected,
  onClick,
}) => {
  const getIcon = () => {
    switch (id) {
      case 'emergency': return <Flame size={17} color="var(--accent-rose)" />;
      case 'beds': return <BedDouble size={17} color="var(--accent-cyan)" />;
      case 'icu': return <HeartPulse size={17} color="var(--accent-secondary)" />;
      case 'staff': return <Users size={17} color="var(--accent-amber)" />;
      case 'or': return <Activity size={17} color="var(--accent-emerald)" />;
    }
  };

  const isDanger = metric.status === 'danger';
  const isWarn = metric.status === 'warning';

  return (
    <div
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
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: '185px',
        backgroundColor: 'var(--surface-1)',
        border: `1px solid ${
          isSelected
            ? 'var(--accent-primary)'
            : isDanger
            ? 'var(--status-danger-border)'
            : isWarn
            ? 'var(--status-warning-border)'
            : 'var(--border-subtle)'
        }`,
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        boxShadow: isSelected
          ? '0 0 0 2px var(--accent-primary), var(--shadow-md)'
          : 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all 140ms ease',
        zIndex: isSelected ? 25 : 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {getIcon()}
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {label}
          </span>
        </div>
        <StatusBadge
          status={metric.status}
          label={metric.status === 'ok' ? 'OK' : metric.status === 'warning' ? 'WARN' : 'ALERT'}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {metric.currentValue}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {metric.capacity}</span>
        </div>

        {metric.deltaFromBaseline !== 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: metric.deltaFromBaseline > 0 ? 'var(--status-warning)' : 'var(--status-ok)',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-glass)',
            }}
          >
            {metric.deltaFromBaseline > 0 ? `+${metric.deltaFromBaseline}` : metric.deltaFromBaseline}
          </span>
        )}
      </div>

      <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
        {metric.reserveCount} reserve · {metric.utilizationPercent}% load
      </div>
    </div>
  );
};

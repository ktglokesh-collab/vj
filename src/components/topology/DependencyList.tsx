import React from 'react';
import { ResourceId, ResourceMetricSummary } from '../../domain/types';
import { TOPOLOGY_EDGES, TOPOLOGY_NODES } from '../../data/resources';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowRight } from 'lucide-react';

interface DependencyListProps {
  metrics: Record<ResourceId, ResourceMetricSummary>;
  onSelectResource: (id: ResourceId) => void;
}

export const DependencyList: React.FC<DependencyListProps> = ({ metrics, onSelectResource }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        Resource Dependencies & Causal Propagation
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {TOPOLOGY_EDGES.map(edge => {
          const srcMetric = metrics[edge.source];
          const tgtMetric = metrics[edge.target];
          const srcNode = TOPOLOGY_NODES.find(n => n.id === edge.source);
          const tgtNode = TOPOLOGY_NODES.find(n => n.id === edge.target);

          return (
            <div
              key={edge.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => onSelectResource(edge.source)}
                  style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
                >
                  {srcNode?.label}
                </button>
                <ArrowRight size={14} color="var(--accent-cyan)" />
                <button
                  className="btn btn-secondary"
                  onClick={() => onSelectResource(edge.target)}
                  style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
                >
                  {tgtNode?.label}
                </button>
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {edge.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {edge.description}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <StatusBadge status={srcMetric.status} label={srcMetric.status.toUpperCase()} />
                <StatusBadge status={tgtMetric.status} label={tgtMetric.status.toUpperCase()} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

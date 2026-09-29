import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResourceId } from '../domain/types';
import { useAppStore } from '../state/store';
import { deriveResourceMetrics } from '../domain/deriveMetrics';
import { PageHeader } from '../components/common/PageHeader';
import { ResourceGraph } from '../components/topology/ResourceGraph';
import { DependencyList } from '../components/topology/DependencyList';
import { MetricGroup } from '../components/common/MetricGroup';
import { Network, ArrowRight } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { currentAllocation, activeScenario, staff, ui, selectResource } = useAppStore();
  const navigate = useNavigate();

  const metrics = deriveResourceMetrics(currentAllocation, activeScenario, staff);
  const selectedResource = ui.selectedResource;

  const handleSelectResource = (id: ResourceId) => {
    selectResource(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Resource Topology & Propagation"
        description="Interactive graph representing causal dependencies, capacity pressure, and critical care ratios across hospital departments."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedResource && (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/resources/${selectedResource}`)}
              >
                <span>Full Page {selectedResource.toUpperCase()} Detail</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        }
      />

      <MetricGroup
        metrics={metrics}
        selectedMetric={selectedResource}
        onSelectMetric={handleSelectResource}
      />

      <div className="panel" style={{ padding: '20px' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Network size={20} color="var(--accent-cyan)" />
            <span>Interactive Operational Dependency Topology</span>
          </div>
          <span className="badge badge-scenario">
            Revision {activeScenario.revision} Topology
          </span>
        </div>

        <ResourceGraph
          metrics={metrics}
          selectedResource={selectedResource}
          onSelectResource={handleSelectResource}
        />
      </div>

      <div className="panel">
        <DependencyList
          metrics={metrics}
          onSelectResource={handleSelectResource}
        />
      </div>
    </div>
  );
};

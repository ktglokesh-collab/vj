import React from 'react';
import { ResourceId, ResourceMetricSummary } from '../../domain/types';
import { Metric } from './Metric';

interface MetricGroupProps {
  metrics: Record<ResourceId, ResourceMetricSummary>;
  selectedMetric?: ResourceId;
  onSelectMetric?: (id: ResourceId) => void;
}

export const MetricGroup: React.FC<MetricGroupProps> = ({
  metrics,
  selectedMetric,
  onSelectMetric,
}) => {
  const orderedKeys: ResourceId[] = ['beds', 'icu', 'staff', 'or', 'emergency'];

  return (
    <div className="metric-grid" role="region" aria-label="Hospital Resource Metric Strip">
      {orderedKeys.map(key => {
        const item = metrics[key];
        if (!item) return null;
        return (
          <Metric
            key={key}
            metric={item}
            isSelected={selectedMetric === key}
            onClick={() => onSelectMetric?.(key)}
          />
        );
      })}
    </div>
  );
};

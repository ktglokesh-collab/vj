import React from 'react';
import { ForecastPoint } from '../../domain/types';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';

interface ChartDataTableProps {
  data: ForecastPoint[];
}

export const ChartDataTable: React.FC<ChartDataTableProps> = ({ data }) => {
  const columns: ColumnDef<ForecastPoint>[] = [
    {
      key: 'timestamp',
      header: 'Simulated Time',
      render: item => (
        <span style={{ fontWeight: item.timeOffsetHours === 0 ? 700 : 400, color: item.timeOffsetHours === 0 ? 'var(--accent-cyan)' : 'inherit' }}>
          {item.timestamp} {item.timeOffsetHours === 0 && '(Now)'}
        </span>
      ),
    },
    {
      key: 'isHistorical',
      header: 'Type',
      render: item => (
        <span style={{ fontSize: '0.75rem', color: item.isHistorical ? 'var(--text-muted)' : 'var(--accent-cyan)' }}>
          {item.isHistorical ? 'Historical' : 'Forecast'}
        </span>
      ),
    },
    {
      key: 'demand',
      header: 'Projected Demand',
      render: item => (
        <span style={{ fontWeight: 600, color: item.breach ? 'var(--status-danger)' : 'inherit' }}>
          {item.demand}
        </span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity Limit',
      render: item => <span style={{ color: 'var(--text-muted)' }}>{item.capacity}</span>,
    },
    {
      key: 'uncertainty',
      header: 'Confidence Band (95%)',
      render: item => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {item.lowerConfidence} – {item.upperConfidence}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Modeled Status',
      render: item => (
        <StatusBadge
          status={item.breach ? 'danger' : item.demand >= item.threshold ? 'warning' : 'ok'}
          label={item.breach ? 'Breach' : item.demand >= item.threshold ? 'Constrained' : 'Nominal'}
        />
      ),
    },
  ];

  return (
    <div style={{ marginTop: '16px' }}>
      <DataTable
        data={data}
        columns={columns}
        keyExtractor={item => `row-${item.timeOffsetHours}`}
      />
    </div>
  );
};

import React from 'react';

export interface StatusBadgeProps {
  status: 'ok' | 'warning' | 'danger' | 'info' | 'critical';
  label: string;
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, icon }) => {
  const badgeClass =
    status === 'ok'
      ? 'badge-ok'
      : status === 'warning'
      ? 'badge-warning'
      : status === 'danger' || status === 'critical'
      ? 'badge-danger'
      : 'badge-info';

  return (
    <span className={`badge ${badgeClass}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};

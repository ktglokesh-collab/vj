import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SolverComparison } from '../components/solver/SolverComparison';

export const SolverLabPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Solver Lab Comparison"
        description="Illustrative architectural comparison between Classical MILP branch-and-cut and Hybrid QUBO formulations."
      />

      <SolverComparison />
    </div>
  );
};

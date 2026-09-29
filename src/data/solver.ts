import { Objective, SolverMetricComparison } from '../domain/types';

export const SOLVER_COMPARISON_DATA: Record<Objective, {
  headline: string;
  summary: string;
  metrics: SolverMetricComparison[];
  assumptions: string[];
}> = {
  feasibility_first: {
    headline: 'Feasibility-First Multi-Resource Resolution',
    summary: 'Focuses on rapidly restoring hard constraint bounds and safety margins across high-acuity departments (ICU, Emergency Reserve, Skill Coverage) with secondary emphasis on schedule displacement.',
    metrics: [
      {
        metric: 'Solution Search Convergence',
        classical: '840 ms',
        hybridQubo: '195 ms',
        improvement: '4.3x faster',
        note: 'Illustrative search time for 120 binary decision variables and 48 mixed constraints.',
      },
      {
        metric: 'Hard Constraint Violations',
        classical: '0 residual',
        hybridQubo: '0 residual',
        improvement: 'Feasible (100%)',
        note: 'Both formulation concepts successfully satisfy all 7 operational rules.',
      },
      {
        metric: 'ICU Buffer Preservation Margin',
        classical: '1.0 bed (10%)',
        hybridQubo: '1.2 beds (12% equiv)',
        improvement: '+20% safety margin',
        note: 'Modeled reserve headspace post-action execution under projected arrival volatility.',
      },
      {
        metric: 'Staff Shift Disruption Cost',
        classical: '2 reassignments',
        hybridQubo: '1 reassignment',
        improvement: '-50% staff churn',
        note: 'Total cross-unit nurse movements required to satisfy critical care skill ratios.',
      },
      {
        metric: 'Elective OR Case Preservation',
        classical: '1 case deferred',
        hybridQubo: '0 cases deferred (rescheduled)',
        improvement: 'Zero cancellation',
        note: 'Downstream surgical pipeline throughput preservation.',
      },
      {
        metric: 'Constraint Penalty Energy (H_cost)',
        classical: '0.042 a.u.',
        hybridQubo: '0.018 a.u.',
        improvement: '57% lower penalty',
        note: 'Quadratic penalty landscape objective minimum in normalized energy units.',
      },
    ],
    assumptions: [
      'Values represent illustrative simulation fixtures for architectural comparison, not real hardware benchmarks.',
      'Classical formulation models a mixed-integer linear program (MILP) solved with branch-and-cut heuristics.',
      'Hybrid formulation maps resource constraints into Quadratic Unconstrained Binary Optimization (QUBO) with simulated annealing / quantum-inspired penalty functions.',
      'No live hospital production solver execution or quantum hardware connection is implied.',
    ],
  },
  change_minimizing: {
    headline: 'Change-Minimizing Operational Stability',
    summary: 'Prioritizes minimizing staff cross-transfers, patient unit relocations, and scheduled elective surgical disruptions while strictly meeting legal safety constraints.',
    metrics: [
      {
        metric: 'Solution Search Convergence',
        classical: '920 ms',
        hybridQubo: '210 ms',
        improvement: '4.4x faster',
        note: 'Weighted perturbation penalty objective function optimization.',
      },
      {
        metric: 'Total Patient Movements',
        classical: '1 transfer',
        hybridQubo: '1 transfer',
        improvement: 'Minimal (1 unit)',
        note: 'Restricted strictly to verified step-down transfer-eligible patient P-108.',
      },
      {
        metric: 'Nurse Skill Reassignment Count',
        classical: '1 cross-trained move',
        hybridQubo: '1 cross-trained move',
        improvement: 'Optimally isolated',
        note: 'Assigns N04 without altering general floor baseline coverage thresholds.',
      },
      {
        metric: 'OR Elective Schedule Impact',
        classical: '1 procedure deferred',
        hybridQubo: '1 procedure shifted 30 min',
        improvement: 'Deferred -> Delayed',
        note: 'Maintains OR suite surgical throughput without outright cancellation.',
      },
      {
        metric: 'Hard Constraint Satisfaction',
        classical: '7/7 Rules Passed',
        hybridQubo: '7/7 Rules Passed',
        improvement: '100% Validated',
        note: 'Validation engine confirms strict regulatory and clinical safety compliance.',
      },
      {
        metric: 'Operational Friction Score',
        classical: '34 / 100',
        hybridQubo: '18 / 100',
        improvement: '47% lower friction',
        note: 'Composite administrative friction index computed from shift and unit disruption weights.',
      },
    ],
    assumptions: [
      'Values represent illustrative simulation fixtures for architectural comparison, not real hardware benchmarks.',
      'Change weights penalize patient transfers at 3.0x, nurse cross-unit shifts at 2.0x, and elective deferrals at 4.0x.',
      'Hybrid formulation utilizes soft-constraint quadratic penalties to avoid combinatorial explosion in dense penalty spaces.',
      'No live hospital production solver execution or quantum hardware connection is implied.',
    ],
  },
};

import { Allocation, ConstraintResult, PlanState, ResourceId, ResourceMetricSummary, ScenarioInput, StaffMember } from './types';
import { evaluateConstraints } from './constraints';

export function deriveResourceMetrics(
  allocation: Allocation,
  scenarioInput: ScenarioInput,
  staff: StaffMember[]
): Record<ResourceId, ResourceMetricSummary> {
  const transferred = allocation.transferredPatientIds.length;
  const deferred = allocation.deferredProcedureIds.length;

  // 1. Beds
  const generalOccupied = allocation.generalBedsOccupied + transferred;
  const generalCapacity = allocation.generalBedsCapacity;
  const generalReserve = generalCapacity - generalOccupied;
  const generalDelta = generalOccupied - 24;

  // 2. ICU
  const icuOccupied = allocation.icuBedsOccupied - transferred;
  const icuCapacity = allocation.icuBedsCapacity;
  const icuReserve = icuCapacity - icuOccupied;
  const icuDelta = icuOccupied - 8;

  // 3. Staff
  const assignedTotal = allocation.nursesAssignedIcu.length + allocation.nursesAssignedGeneral.length + allocation.nursesAssignedOr.length;
  const availableNurses = scenarioInput.availableNurses;
  const staffDelta = assignedTotal - availableNurses;

  // 4. OR
  const activeOr = allocation.orRoomsActive - deferred;
  const orCapacity = allocation.orRoomsCapacity;
  const orDelta = activeOr - 2;

  // 5. Emergency
  const emHolding = allocation.emergencyReserveBeds;
  const emCapacity = 6;
  const emDelta = scenarioInput.emergencyArrivals;

  const metrics: Record<ResourceId, ResourceMetricSummary> = {
    beds: {
      id: 'beds',
      name: 'General & Step-Down',
      currentValue: generalOccupied,
      capacity: generalCapacity,
      unit: 'beds',
      utilizationPercent: Math.round((generalOccupied / generalCapacity) * 100),
      reserveCount: generalReserve,
      status: generalOccupied > generalCapacity ? 'danger' : generalReserve < 2 ? 'warning' : 'ok',
      deltaFromBaseline: generalDelta,
      trend: generalDelta > 0 ? 'up' : generalDelta < 0 ? 'down' : 'stable',
      headline: `${generalOccupied}/${generalCapacity} beds occupied (${generalReserve} reserve)`,
    },
    icu: {
      id: 'icu',
      name: 'Intensive Care Unit (ICU)',
      currentValue: icuOccupied,
      capacity: icuCapacity,
      unit: 'beds',
      utilizationPercent: Math.round((icuOccupied / icuCapacity) * 100),
      reserveCount: icuReserve,
      status: icuOccupied >= icuCapacity ? 'danger' : icuReserve <= 1 ? 'warning' : 'ok',
      deltaFromBaseline: icuDelta,
      trend: icuDelta > 0 ? 'up' : icuDelta < 0 ? 'down' : 'stable',
      headline: `${icuOccupied}/${icuCapacity} beds occupied (${icuReserve} reserve)`,
    },
    staff: {
      id: 'staff',
      name: 'Clinical Nursing Staff',
      currentValue: assignedTotal,
      capacity: availableNurses,
      unit: 'nurses',
      utilizationPercent: Math.round((assignedTotal / Math.max(1, availableNurses)) * 100),
      reserveCount: Math.max(0, availableNurses - assignedTotal),
      status: assignedTotal > availableNurses ? 'danger' : assignedTotal === availableNurses ? 'warning' : 'ok',
      deltaFromBaseline: staffDelta,
      trend: staffDelta > 0 ? 'up' : staffDelta < 0 ? 'down' : 'stable',
      headline: `${assignedTotal}/${availableNurses} nurses deployed`,
    },
    or: {
      id: 'or',
      name: 'Operating Theatres',
      currentValue: activeOr,
      capacity: orCapacity,
      unit: 'theatres',
      utilizationPercent: Math.round((activeOr / orCapacity) * 100),
      reserveCount: orCapacity - activeOr,
      status: activeOr === orCapacity ? 'warning' : 'ok',
      deltaFromBaseline: orDelta,
      trend: orDelta > 0 ? 'up' : orDelta < 0 ? 'down' : 'stable',
      headline: `${activeOr}/${orCapacity} suites in operation`,
    },
    emergency: {
      id: 'emergency',
      name: 'Emergency Surge Holding',
      currentValue: emHolding,
      capacity: emCapacity,
      unit: 'beds',
      utilizationPercent: Math.round((emHolding / emCapacity) * 100),
      reserveCount: emCapacity - emHolding,
      status: emHolding <= 1 ? 'danger' : emHolding <= 2 ? 'warning' : 'ok',
      deltaFromBaseline: emDelta,
      trend: emDelta > 0 ? 'up' : emDelta < 0 ? 'down' : 'stable',
      headline: `${emHolding} triage holding slots available`,
    },
  };

  return metrics;
}

export function derivePlanState(constraints: ConstraintResult[]): PlanState {
  const blockingViolations = constraints.filter(c => !c.passed && c.severity === 'blocking');
  const warningViolations = constraints.filter(c => !c.passed && c.severity === 'warning');

  if (blockingViolations.length > 0) {
    return 'infeasible';
  }
  if (warningViolations.length > 0) {
    return 'at_risk';
  }
  return 'feasible';
}

export function deriveNextRisk(constraints: ConstraintResult[], scenario: ScenarioInput) {
  const failed = constraints.filter(c => !c.passed);
  if (failed.length > 0) {
    const primary = failed[0];
    return {
      hasRisk: true,
      severity: primary.severity,
      title: primary.label,
      resourceId: primary.resourceId,
      detail: primary.detail,
      horizon: 'T+02:00 to T+04:00',
      breachReason: `Modeled constraint breach: observed ${primary.observed} vs limit ${primary.threshold}`,
    };
  }

  // If all pass, show subtle baseline projection risk
  return {
    hasRisk: false,
    severity: 'info' as const,
    title: 'ICU Capacity Compression (Horizon T+06h)',
    resourceId: 'icu' as ResourceId,
    detail: 'Baseline operations stable. Projected normal admission trajectory reaches 90% threshold in 6 hours.',
    horizon: 'T+06:00',
    breachReason: 'Normal evening surgical transfer and telemetry step-up volume.',
  };
}

export function derivePlanHealthScore(constraints: ConstraintResult[]): { score: number; label: string; status: 'ok' | 'warning' | 'danger' } {
  const total = constraints.length;
  if (total === 0) return { score: 100, label: 'Optimal', status: 'ok' };

  let score = 100;
  for (const c of constraints) {
    if (!c.passed) {
      if (c.severity === 'blocking') {
        score -= 25;
      } else {
        score -= 10;
      }
    }
  }

  score = Math.max(0, score);
  if (score >= 90) return { score, label: 'Feasible · High Confidence', status: 'ok' };
  if (score >= 70) return { score, label: 'At Risk · Action Recommended', status: 'warning' };
  return { score, label: 'Infeasible · Violations Detected', status: 'danger' };
}

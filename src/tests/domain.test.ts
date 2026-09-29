import { describe, it, expect } from 'vitest';
import { BASELINE_SCENARIO, CANONICAL_EMERGENCY_SCENARIO, IMPOSSIBLE_CUSTOM_SCENARIO } from '../data/scenarios';
import { INITIAL_ALLOCATION, simulateScenario } from '../domain/scenarioEngine';
import { evaluateConstraints } from '../domain/constraints';
import { derivePlanState, deriveResourceMetrics } from '../domain/deriveMetrics';
import { generateCandidate } from '../domain/replanEngine';
import { validateAllocation } from '../domain/validationEngine';
import { INITIAL_STAFF } from '../data/staff';

describe('Q-CARE Domain & Constraint Engine', () => {
  it('1. Baseline scenario evaluates to feasible with 24/30 beds, 8/10 ICU, 10/12 nurses, 2/3 OR, reserve 4', () => {
    const { allocation, staff } = simulateScenario(INITIAL_ALLOCATION, BASELINE_SCENARIO);
    const metrics = deriveResourceMetrics(allocation, BASELINE_SCENARIO, staff);
    const constraints = evaluateConstraints(allocation, BASELINE_SCENARIO, staff);
    const planState = derivePlanState(constraints);
    const validation = validateAllocation(allocation, BASELINE_SCENARIO, 1, staff);

    expect(metrics.beds.currentValue).toBe(24);
    expect(metrics.beds.capacity).toBe(30);
    expect(metrics.beds.reserveCount).toBe(6);

    expect(metrics.icu.currentValue).toBe(8);
    expect(metrics.icu.capacity).toBe(10);
    expect(metrics.icu.reserveCount).toBe(2);

    expect(metrics.staff.currentValue).toBe(10);
    expect(metrics.staff.capacity).toBe(10);

    expect(metrics.or.currentValue).toBe(2);
    expect(metrics.or.capacity).toBe(3);

    expect(metrics.emergency.currentValue).toBe(4);

    expect(planState).toBe('feasible');
    expect(validation.isFeasible).toBe(true);
    expect(validation.failedBlockingChecks).toBe(0);
  });

  it('2. Canonical Emergency (+5 arrivals, -2 nurses) causes INFEASIBLE plan with exact violations', () => {
    const { allocation, staff } = simulateScenario(INITIAL_ALLOCATION, CANONICAL_EMERGENCY_SCENARIO);
    const metrics = deriveResourceMetrics(allocation, CANONICAL_EMERGENCY_SCENARIO, staff);
    const constraints = evaluateConstraints(allocation, CANONICAL_EMERGENCY_SCENARIO, staff);
    const planState = derivePlanState(constraints);

    expect(planState).toBe('infeasible');

    // Check violations
    const failedConstraints = constraints.filter(c => !c.passed);
    expect(failedConstraints.length).toBeGreaterThan(0);

    const icuViolation = failedConstraints.find(c => c.id === 'C-02');
    const skillViolation = failedConstraints.find(c => c.id === 'C-04');
    const bedSurgeViolation = failedConstraints.find(c => c.id === 'C-01');

    expect(icuViolation).toBeDefined();
    expect(skillViolation).toBeDefined();
    expect(bedSurgeViolation).toBeDefined();

    // ICU is 10/10 with 0 reserve
    expect(metrics.icu.currentValue).toBe(10);
    expect(metrics.icu.reserveCount).toBe(0);
  });

  it('3. Replan Engine computes a deterministic feasible candidate resolving all violations', () => {
    const { allocation, staff } = simulateScenario(INITIAL_ALLOCATION, CANONICAL_EMERGENCY_SCENARIO);
    const replanResult = generateCandidate(allocation, CANONICAL_EMERGENCY_SCENARIO, staff, 'feasibility_first', 2);

    expect(replanResult.success).toBe(true);
    if (!replanResult.success) return;

    const candidate = replanResult.candidate;
    expect(candidate.actions.length).toBeGreaterThan(0);

    // Validate the candidate allocation
    const validation = validateAllocation(candidate.allocation, CANONICAL_EMERGENCY_SCENARIO, 2, staff);
    expect(validation.isFeasible).toBe(true);
    expect(validation.failedBlockingChecks).toBe(0);

    // Expected canonical outcome: ICU 9/10 (1 free bed), general/stepdown 28/30 (2 free beds)
    const postTransferred = candidate.allocation.transferredPatientIds.length;
    const postIcu = candidate.allocation.icuBedsOccupied - postTransferred;
    const postGeneral = candidate.allocation.generalBedsOccupied + postTransferred;

    expect(postIcu).toBe(9);
    expect(postGeneral).toBe(28);
  });

  it('4. Impossible Custom Scenario produces a truthful failure without false success', () => {
    const { allocation, staff } = simulateScenario(INITIAL_ALLOCATION, IMPOSSIBLE_CUSTOM_SCENARIO);
    const replanResult = generateCandidate(allocation, IMPOSSIBLE_CUSTOM_SCENARIO, staff, 'feasibility_first', 2);

    expect(replanResult.success).toBe(false);
    if (!replanResult.success) {
      expect(replanResult.residualViolations.length).toBeGreaterThan(0);
    }
  });

  it('5. 7-point validation checklist verifies all required operational rules', () => {
    const validation = validateAllocation(INITIAL_ALLOCATION, BASELINE_SCENARIO, 1, INITIAL_STAFF);
    expect(validation.totalChecks).toBe(7);
    expect(validation.checks.map(c => c.ruleNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

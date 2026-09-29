import { Allocation, ScenarioInput, StaffMember, ValidationCheck, ValidationResult } from './types';
import { evaluateConstraints } from './constraints';
import { INITIAL_STAFF } from '../data/staff';

export function validateAllocation(
  allocation: Allocation,
  scenarioInput: ScenarioInput,
  revision: number,
  staff: StaffMember[] = INITIAL_STAFF
): ValidationResult {
  const constraints = evaluateConstraints(allocation, scenarioInput, staff);

  const checks: ValidationCheck[] = constraints.map((c, index) => ({
    id: `VAL-${index + 1}`,
    ruleNumber: index + 1,
    name: c.label,
    description: c.detail,
    passed: c.passed,
    observedValue: c.observed,
    thresholdValue: c.threshold,
    severity: c.severity,
    resourceId: c.resourceId,
    details: c.passed
      ? `Check satisfied: observed value ${c.observed} complies with required threshold ${c.threshold}.`
      : `Check failed: observed value ${c.observed} violates ${c.severity} threshold ${c.threshold}.`,
  }));

  const failedBlocking = checks.filter(c => !c.passed && c.severity === 'blocking').length;
  const isFeasible = failedBlocking === 0;

  return {
    revision,
    isFeasible,
    totalChecks: checks.length,
    passedChecks: checks.filter(c => c.passed).length,
    failedBlockingChecks: failedBlocking,
    checks,
    evaluatedAt: new Date().toLocaleTimeString(),
  };
}

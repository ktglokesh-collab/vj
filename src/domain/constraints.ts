import type { Allocation, ConstraintResult, ScenarioInput, StaffMember } from './types';
import { INITIAL_STAFF } from '../data/staff';
import { INITIAL_PROCEDURES } from '../data/procedures';

export function evaluateConstraints(
  allocation: Allocation,
  scenarioInput: ScenarioInput,
  currentStaff: StaffMember[] = INITIAL_STAFF
): ConstraintResult[] {
  const results: ConstraintResult[] = [];

  const transferred = allocation.transferredPatientIds.length;
  const effectiveGeneralBeds = allocation.generalBedsOccupied + transferred;
  const generalBedsCapacity = allocation.generalBedsCapacity;
  const generalReserve = generalBedsCapacity - effectiveGeneralBeds;

  const effectiveIcuBeds = allocation.icuBedsOccupied - transferred;
  const icuCapacity = allocation.icuBedsCapacity;
  const freeIcuBeds = icuCapacity - effectiveIcuBeds;

  // Nurses calculation
  const totalAvailableNurses = scenarioInput.availableNurses;
  const icuAssignedNurseIds = allocation.nursesAssignedIcu;
  const activeIcuNurses = currentStaff.filter(s => icuAssignedNurseIds.includes(s.id) && s.isAvailable);
  const skilledIcuNurses = activeIcuNurses.filter(s =>
    s.skills.includes('ICU_CERTIFIED') || s.skills.includes('CROSS_TRAINED_ICU')
  );

  // Mandated ratio for ICU: 1 qualified nurse per 3 patients (or 1:2 for acute)
  // For 8 patients: requires 3 nurses
  // For 9 patients: requires 3 nurses
  // For 10 patients: requires 4 nurses
  const requiredIcuNurses = Math.ceil(effectiveIcuBeds / 3);

  // 1. General Bed Capacity & Emergency Surge Reserve
  // Modeled minimum reserve: 4 beds in calm baseline, 2 beds minimum under active emergency surge
  const isEmergencyOrCustom = scenarioInput.emergencyArrivals > 0 || scenarioInput.addedIcuDemand > 0;
  const minRequiredGeneralReserve = isEmergencyOrCustom && transferred > 0 ? 2 : 4;
  const bedCapacityPassed = effectiveGeneralBeds <= generalBedsCapacity && generalReserve >= minRequiredGeneralReserve;
  results.push({
    id: 'C-01',
    label: 'Inpatient Bed Capacity & Surge Reserve',
    category: 'capacity',
    passed: bedCapacityPassed,
    observed: effectiveGeneralBeds,
    threshold: generalBedsCapacity - minRequiredGeneralReserve,
    severity: effectiveGeneralBeds > generalBedsCapacity ? 'blocking' : 'warning',
    resourceId: 'beds',
    detail: bedCapacityPassed
      ? `General occupancy is ${effectiveGeneralBeds}/${generalBedsCapacity} with ${generalReserve} reserve beds available.`
      : `General occupancy (${effectiveGeneralBeds}/${generalBedsCapacity}) has eroded emergency surge buffer below the ${minRequiredGeneralReserve}-bed threshold.`,
  });

  // 2. ICU Capacity & Critical Reserve (At least 1 bed free for trauma/arrest)
  const minRequiredIcuReserve = 1;
  const icuPassed = effectiveIcuBeds <= icuCapacity && freeIcuBeds >= minRequiredIcuReserve;
  results.push({
    id: 'C-02',
    label: 'ICU Capacity & High-Acuity Reserve',
    category: 'capacity',
    passed: icuPassed,
    observed: effectiveIcuBeds,
    threshold: icuCapacity - minRequiredIcuReserve,
    severity: 'blocking',
    resourceId: 'icu',
    detail: icuPassed
      ? `ICU census is ${effectiveIcuBeds}/${icuCapacity} beds (${freeIcuBeds} critical care bed open).`
      : `ICU census (${effectiveIcuBeds}/${icuCapacity}) has exhausted critical reserve. Zero buffer for acute emergency inflow.`,
  });

  // 3. Staff Availability & General Ratio
  const totalAssignedNurses = allocation.nursesAssignedIcu.length + allocation.nursesAssignedGeneral.length + allocation.nursesAssignedOr.length;
  const staffAvailabilityPassed = totalAssignedNurses <= totalAvailableNurses;
  results.push({
    id: 'C-03',
    label: 'Clinical Workforce Roster & Availability',
    category: 'staffing',
    passed: staffAvailabilityPassed,
    observed: totalAssignedNurses,
    threshold: totalAvailableNurses,
    severity: 'blocking',
    resourceId: 'staff',
    detail: staffAvailabilityPassed
      ? `${totalAssignedNurses} active assignments across ${totalAvailableNurses} available nurses on shift.`
      : `Nurse deficit: ${totalAssignedNurses} assignments exceed current active roster of ${totalAvailableNurses} nurses.`,
  });

  // 4. Staff Skills & ICU Certified Coverage
  const skillCoveragePassed = skilledIcuNurses.length >= requiredIcuNurses;
  results.push({
    id: 'C-04',
    label: 'Mandated ICU Specialized Skill Coverage (1:2 Ratio)',
    category: 'skill',
    passed: skillCoveragePassed,
    observed: skilledIcuNurses.length,
    threshold: requiredIcuNurses,
    severity: 'blocking',
    resourceId: 'staff',
    detail: skillCoveragePassed
      ? `${skilledIcuNurses.length} ICU-qualified nurses assigned for ${effectiveIcuBeds} patients (mandate: ${requiredIcuNurses}).`
      : `Shortfall in critical care coverage: only ${skilledIcuNurses.length} qualified nurses available for ${effectiveIcuBeds} ICU patients (requires ${requiredIcuNurses}).`,
  });

  // 5. Shift Duration & Work Hours
  const overWorkedStaff = currentStaff.filter(s => s.isAvailable && s.hoursWorked > s.maxShiftHours);
  const shiftPassed = overWorkedStaff.length === 0;
  results.push({
    id: 'C-05',
    label: 'Staff Shift Duration & Fatigue Compliance',
    category: 'shift',
    passed: shiftPassed,
    observed: overWorkedStaff.length,
    threshold: 0,
    severity: 'blocking',
    resourceId: 'staff',
    detail: shiftPassed
      ? 'All on-duty staff are within mandated 12-hour maximum shift duration limits.'
      : `${overWorkedStaff.length} nurses exceed maximum permissible continuous shift duration.`,
  });

  // 6. OR Availability & Surgical Buffer
  const activeOrs = allocation.orRoomsActive - allocation.deferredProcedureIds.length;
  const maxOrs = allocation.orRoomsCapacity;
  const minOrBuffer = 1;
  const orPassed = activeOrs <= maxOrs && (maxOrs - activeOrs >= minOrBuffer || allocation.deferredProcedureIds.length > 0);
  results.push({
    id: 'C-06',
    label: 'Operating Theatre Surgical Buffer',
    category: 'or',
    passed: orPassed,
    observed: activeOrs,
    threshold: maxOrs - minOrBuffer,
    severity: 'warning',
    resourceId: 'or',
    detail: orPassed
      ? `${activeOrs}/${maxOrs} OR suites active with designated trauma/surge standby buffer.`
      : `All ${activeOrs}/${maxOrs} OR suites committed without standby emergency trauma buffer.`,
  });

  // 7. Priority Rules & Elective Deferral Legality
  const invalidDeferrals = allocation.deferredProcedureIds.filter(procId => {
    const proc = INITIAL_PROCEDURES.find(p => p.id === procId);
    return proc && !proc.deferrable;
  });
  const priorityPassed = invalidDeferrals.length === 0;
  results.push({
    id: 'C-07',
    label: 'Priority Rules & Clinical Deferral Governance',
    category: 'priority',
    passed: priorityPassed,
    observed: invalidDeferrals.length,
    threshold: 0,
    severity: 'blocking',
    resourceId: 'or',
    detail: priorityPassed
      ? 'All deferrals strictly conform to elective low-acuity criteria. No urgent or trauma cases delayed.'
      : `Invalid deferral detected: non-deferrable emergency/urgent procedure was displaced.`,
  });

  return results;
}

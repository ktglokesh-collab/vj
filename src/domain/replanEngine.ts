import { Allocation, Objective, PlanAction, PlanCandidate, ScenarioInput, StaffMember } from './types';
import { evaluateConstraints } from './constraints';
import { INITIAL_PATIENTS } from '../data/patients';
import { INITIAL_PROCEDURES } from '../data/procedures';

export type ReplanResult =
  | { success: true; candidate: PlanCandidate }
  | { success: false; residualViolations: string[]; details: string };

interface ActionBundle {
  title: string;
  actions: PlanAction[];
  allocation: Allocation;
  staff: StaffMember[];
  changeCost: number;
}

export function generateCandidate(
  currentAllocation: Allocation,
  scenarioInput: ScenarioInput,
  currentStaff: StaffMember[],
  objective: Objective,
  revision: number
): ReplanResult {
  // Enumerate legal potential actions:
  // 1. ICU to Step-Down Transfer of eligible patient (e.g. P-108)
  // 2. Reassignment of available cross-trained nurse (e.g. N04 who has CROSS_TRAINED_ICU skill)
  // 3. Deferral of elective low-priority OR case (PROC-202)

  const eligiblePatients = INITIAL_PATIENTS.filter(p => p.unit === 'ICU' && p.transferEligibleStepdown);
  const crossTrainedNurses = currentStaff.filter(
    s => s.isAvailable && s.skills.includes('CROSS_TRAINED_ICU') && !currentAllocation.nursesAssignedIcu.includes(s.id)
  );
  const deferrableProcedures = INITIAL_PROCEDURES.filter(
    p => p.deferrable && p.priority === 'ELECTIVE_LOW' && !currentAllocation.deferredProcedureIds.includes(p.id)
  );

  // Generate candidate bundles to test:
  const candidateBundles: ActionBundle[] = [];

  // Bundle 0: No changes (test if current is already feasible)
  candidateBundles.push({
    title: 'Baseline In-Place Maintenance',
    actions: [],
    allocation: { ...currentAllocation },
    staff: [...currentStaff],
    changeCost: 0,
  });

  // Bundle 1: Step-Down Transfer only
  if (eligiblePatients.length > 0) {
    const targetPatient = eligiblePatients[0];
    const newAlloc: Allocation = {
      ...currentAllocation,
      transferredPatientIds: [targetPatient.id],
      stepDownOccupied: currentAllocation.stepDownOccupied + 1,
    };
    const action: PlanAction = {
      id: 'ACT-01',
      title: `Transfer ${targetPatient.id} from ICU to Step-Down Unit`,
      type: 'TRANSFER_PATIENT',
      resourceId: 'icu',
      targetEntityId: targetPatient.id,
      sourceLocation: 'ICU-Bed-08',
      targetLocation: 'StepDown-Ward-3B',
      rationale: 'Patient meets clinical step-down stability criteria. Decompresses critical ICU bed for acute emergency intake.',
      modeledImpact: '+1 available ICU bed; preserves high-acuity emergency buffer.',
      tradeOff: 'Increases general step-down nursing load by 1 patient.',
      status: 'proposed',
      priority: 'immediate',
    };
    candidateBundles.push({
      title: 'ICU Patient Transfer Only',
      actions: [action],
      allocation: newAlloc,
      staff: [...currentStaff],
      changeCost: 10,
    });
  }

  // Bundle 2: Step-Down Transfer + Cross-Trained Nurse Reassignment
  if (eligiblePatients.length > 0 && crossTrainedNurses.length > 0) {
    const targetPatient = eligiblePatients[0];
    const targetNurse = crossTrainedNurses[0];

    const newStaff = currentStaff.map(s => (s.id === targetNurse.id ? { ...s, assignedUnit: 'ICU' as const } : s));
    const newAlloc: Allocation = {
      ...currentAllocation,
      transferredPatientIds: [targetPatient.id],
      stepDownOccupied: currentAllocation.stepDownOccupied + 1,
      nursesAssignedIcu: [...currentAllocation.nursesAssignedIcu, targetNurse.id],
      nursesAssignedGeneral: currentAllocation.nursesAssignedGeneral.filter(id => id !== targetNurse.id),
      reassignedStaffIds: [{ staffId: targetNurse.id, from: 'BEDS', to: 'ICU' }],
    };

    const action1: PlanAction = {
      id: 'ACT-01',
      title: `Transfer ${targetPatient.id} from ICU to Step-Down Unit`,
      type: 'TRANSFER_PATIENT',
      resourceId: 'icu',
      targetEntityId: targetPatient.id,
      sourceLocation: 'ICU-Bed-08',
      targetLocation: 'StepDown-Ward-3B',
      rationale: 'Patient meets clinical step-down stability criteria. Decompresses critical ICU bed for acute emergency intake.',
      modeledImpact: '+1 available ICU bed; preserves high-acuity emergency buffer.',
      tradeOff: 'Increases step-down bed census from 4 to 5 patients.',
      status: 'proposed',
      priority: 'immediate',
    };

    const action2: PlanAction = {
      id: 'ACT-02',
      title: `Reassign ${targetNurse.name} from Med-Surg to ICU (Coverage Ratio)`,
      type: 'REASSIGN_STAFF',
      resourceId: 'staff',
      targetEntityId: targetNurse.id,
      sourceLocation: 'Med-Surg Floor 4',
      targetLocation: 'ICU Pod Alpha',
      rationale: 'Nurse N04 holds active critical care cross-training certification. Restores mandated 1:2 ICU staffing ratio.',
      modeledImpact: 'Satisfies mandated ICU skilled coverage without requiring external emergency call-in.',
      tradeOff: 'Med-surg floor staffing ratio tightens slightly from 1:4.8 to 1:5.0.',
      status: 'proposed',
      priority: 'immediate',
    };

    candidateBundles.push({
      title: 'Coordinated Transfer & ICU Skill Reassignment',
      actions: [action1, action2],
      allocation: newAlloc,
      staff: newStaff,
      changeCost: 25,
    });
  }

  // Bundle 3: Step-Down Transfer + Cross-Trained Nurse Reassignment + Elective OR Deferral
  if (eligiblePatients.length > 0 && crossTrainedNurses.length > 0 && deferrableProcedures.length > 0) {
    const targetPatient = eligiblePatients[0];
    const targetNurse = crossTrainedNurses[0];
    const targetProc = deferrableProcedures[0];

    const newStaff = currentStaff.map(s => (s.id === targetNurse.id ? { ...s, assignedUnit: 'ICU' as const } : s));
    const newAlloc: Allocation = {
      ...currentAllocation,
      transferredPatientIds: [targetPatient.id],
      stepDownOccupied: currentAllocation.stepDownOccupied + 1,
      nursesAssignedIcu: [...currentAllocation.nursesAssignedIcu, targetNurse.id],
      nursesAssignedGeneral: currentAllocation.nursesAssignedGeneral.filter(id => id !== targetNurse.id),
      reassignedStaffIds: [{ staffId: targetNurse.id, from: 'BEDS', to: 'ICU' }],
      deferredProcedureIds: [targetProc.id],
    };

    const action1: PlanAction = {
      id: 'ACT-01',
      title: `Transfer ${targetPatient.id} from ICU to Step-Down Unit`,
      type: 'TRANSFER_PATIENT',
      resourceId: 'icu',
      targetEntityId: targetPatient.id,
      sourceLocation: 'ICU-Bed-08',
      targetLocation: 'StepDown-Ward-3B',
      rationale: 'Patient meets clinical step-down stability criteria. Decompresses critical ICU bed for acute emergency intake.',
      modeledImpact: '+1 available ICU bed; preserves high-acuity emergency buffer.',
      tradeOff: 'Increases step-down bed census from 4 to 5 patients.',
      status: 'proposed',
      priority: 'immediate',
    };

    const action2: PlanAction = {
      id: 'ACT-02',
      title: `Reassign ${targetNurse.name} from Med-Surg to ICU (Coverage Ratio)`,
      type: 'REASSIGN_STAFF',
      resourceId: 'staff',
      targetEntityId: targetNurse.id,
      sourceLocation: 'Med-Surg Floor 4',
      targetLocation: 'ICU Pod Alpha',
      rationale: 'Nurse N04 holds active critical care cross-training certification. Restores mandated 1:2 ICU staffing ratio.',
      modeledImpact: 'Satisfies mandated ICU skilled coverage without requiring external emergency call-in.',
      tradeOff: 'Med-surg floor staffing ratio tightens slightly from 1:4.8 to 1:5.0.',
      status: 'proposed',
      priority: 'immediate',
    };

    const action3: PlanAction = {
      id: 'ACT-03',
      title: `Reschedule Elective Procedure ${targetProc.id} (${targetProc.orRoom})`,
      type: 'DEFER_PROCEDURE',
      resourceId: 'or',
      targetEntityId: targetProc.id,
      sourceLocation: targetProc.orRoom,
      targetLocation: 'Next Day Morning Shift',
      rationale: 'Procedure is non-urgent elective arthroscopy. Deferral preserves critical surgical suite standby for trauma.',
      modeledImpact: 'Frees 1 OR suite and recovery buffer for emergency surgical admissions.',
      tradeOff: 'Patient procedure delayed by 18 hours; patient and surgeon notified.',
      status: 'proposed',
      priority: 'next_shift',
    };

    candidateBundles.push({
      title: 'Full Multi-Resource Surge Stabilization Plan',
      actions: [action1, action2, action3],
      allocation: newAlloc,
      staff: newStaff,
      changeCost: 40,
    });
  }

  // Evaluate each candidate bundle against actual constraints
  const feasibleBundles: { bundle: ActionBundle; score: number; violationsCount: number }[] = [];
  let worstResidualViolations: string[] = [];

  for (const bundle of candidateBundles) {
    const constraintResults = evaluateConstraints(bundle.allocation, scenarioInput, bundle.staff);
    const blockingViolations = constraintResults.filter(c => !c.passed && c.severity === 'blocking');

    if (blockingViolations.length === 0) {
      // Valid feasible candidate!
      let score = 100;
      if (objective === 'feasibility_first') {
        // Feasibility first awards safety buffer margin
        const icuFree = bundle.allocation.icuBedsCapacity - (bundle.allocation.icuBedsOccupied - bundle.allocation.transferredPatientIds.length);
        const generalFree = bundle.allocation.generalBedsCapacity - (bundle.allocation.generalBedsOccupied + bundle.allocation.transferredPatientIds.length);
        score += (icuFree * 10) + (generalFree * 2) - (bundle.actions.length * 2);
      } else {
        // Change minimizing penalizes action cost
        score -= bundle.changeCost;
      }

      feasibleBundles.push({
        bundle,
        score,
        violationsCount: 0,
      });
    } else {
      worstResidualViolations = blockingViolations.map(v => `${v.label}: observed ${v.observed} vs threshold ${v.threshold}`);
    }
  }

  if (feasibleBundles.length > 0) {
    // Sort by score descending
    feasibleBundles.sort((a, b) => b.score - a.score);
    const best = feasibleBundles[0];

    const candidate: PlanCandidate = {
      id: `PLAN-PROP-REV${revision}-${Date.now().toString().slice(-4)}`,
      baseRevision: revision,
      title: best.bundle.title,
      actions: best.bundle.actions,
      allocation: best.bundle.allocation,
      objective,
      score: best.score,
      summary: `Computed feasible plan with ${best.bundle.actions.length} coordinated actions. Resolves all blocking constraints.`,
      violationsCount: 0,
    };

    return {
      success: true,
      candidate,
    };
  }

  // Truthful failure path
  return {
    success: false,
    residualViolations: worstResidualViolations,
    details: 'Unable to find a feasible allocation bundle within permitted operational bounds and safety limits for this scenario.',
  };
}

import { PlanCandidate, Recommendation } from './types';

export function buildRecommendations(candidate: PlanCandidate | null, revision: number): Recommendation[] {
  if (!candidate || candidate.actions.length === 0) {
    // Return baseline proactive monitor recommendations
    return [
      {
        id: 'REC-BASE-01',
        title: 'Monitor ICU Admission Trajectory',
        type: 'TRANSFER_PATIENT',
        resourceId: 'icu',
        targetEntityId: 'ICU-Floor',
        rationale: 'Baseline ICU census is at 80% (8/10 beds). Monitor telemetry step-ups during afternoon shift.',
        modeledImpact: 'Preserves 2 critical care reserve beds for unforeseen emergency arrivals.',
        tradeOff: 'Routine telemetry monitoring required.',
        status: 'reviewed',
        priority: 'monitor',
        planRevision: revision,
      },
      {
        id: 'REC-BASE-02',
        title: 'Maintain Standby Cross-Trained Nurse Coverage',
        type: 'REASSIGN_STAFF',
        resourceId: 'staff',
        targetEntityId: 'N04',
        rationale: 'Nurse N04 on Med-Surg is cross-certified for critical care. Keep available for rapid ICU surge reinforcement.',
        modeledImpact: 'Ensures 1:2 critical care coverage can be activated within 15 minutes.',
        tradeOff: 'No floor disruption unless surge event triggers.',
        status: 'reviewed',
        priority: 'monitor',
        planRevision: revision,
      },
      {
        id: 'REC-BASE-03',
        title: 'Verify OR-3 Emergency Trauma Buffer',
        type: 'DEFER_PROCEDURE',
        resourceId: 'or',
        targetEntityId: 'OR-3',
        rationale: 'Surgical Suite OR-3 is designated standby for emergency trauma and urgent unscheduled cases.',
        modeledImpact: 'Guarantees immediate surgical readiness without bumping elective cases.',
        tradeOff: 'OR suite remains unbooked during prime operating hours.',
        status: 'reviewed',
        priority: 'monitor',
        planRevision: revision,
      },
    ];
  }

  // Convert candidate actions to recommendations
  return candidate.actions.map(action => ({
    ...action,
    planRevision: candidate.baseRevision,
  }));
}

export type ResourceId = 'beds' | 'icu' | 'staff' | 'or' | 'emergency';
export type ScenarioKind = 'baseline' | 'emergency' | 'custom';
export type PlanState = 'feasible' | 'at_risk' | 'infeasible' | 'replanning' | 'validating';
export type OptimizationState = 'idle' | 'analyzing' | 'modeling' | 'optimizing' | 'validating' | 'complete' | 'failed';
export type Objective = 'feasibility_first' | 'change_minimizing';
export type RecommendationStatus = 'proposed' | 'reviewed' | 'included' | 'dismissed';
export type PriorityLevel = 'immediate' | 'next_shift' | 'monitor';

export interface ScenarioInput {
  emergencyArrivals: number;   // 0 - 10 (baseline: 0, emergency: 5)
  availableNurses: number;     // 6 - 12 (baseline: 10, total roster: 12)
  addedIcuDemand: number;      // 0 - 6 (baseline: 0, emergency: 2)
  delayedDischarges: number;   // 0 - 8 (baseline: 0)
  orDelayMinutes: number;      // 0 - 240 in 30min steps (baseline: 0)
}

export interface ConstraintResult {
  id: string;
  label: string;
  category: 'capacity' | 'staffing' | 'skill' | 'shift' | 'or' | 'reserve' | 'priority';
  passed: boolean;
  observed: number;
  threshold: number;
  severity: 'warning' | 'blocking';
  resourceId: ResourceId;
  detail: string;
}

export interface StaffMember {
  id: string;
  name: string; // Synthetic ID e.g. "Nurse N01"
  skills: ('ICU_CERTIFIED' | 'GENERAL_MED' | 'OR_SURGICAL' | 'CROSS_TRAINED_ICU')[];
  shift: 'DAY' | 'NIGHT';
  hoursWorked: number;
  maxShiftHours: number;
  assignedUnit: 'ICU' | 'BEDS' | 'OR' | 'UNASSIGNED' | 'OFF_DUTY';
  isAvailable: boolean;
}

export interface Patient {
  id: string; // synthetic e.g. "P-101"
  unit: 'ICU' | 'BEDS' | 'STEP_DOWN' | 'EMERGENCY_HOLD';
  acuity: 1 | 2 | 3 | 4 | 5; // 1 = highest, 5 = lowest
  admitTime: string;
  transferEligibleStepdown: boolean;
  assignedNurseId?: string;
}

export interface Procedure {
  id: string; // e.g. "PROC-201"
  orRoom: 'OR-1' | 'OR-2' | 'OR-3';
  scheduledStart: string;
  scheduledDurationMinutes: number;
  priority: 'EMERGENCY' | 'URGENT' | 'ELECTIVE_LOW';
  deferrable: boolean;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'DEFERRED' | 'COMPLETED';
}

export interface Allocation {
  generalBedsOccupied: number;
  generalBedsCapacity: number;
  icuBedsOccupied: number;
  icuBedsCapacity: number;
  emergencyReserveBeds: number;
  nursesAssignedIcu: string[];
  nursesAssignedGeneral: string[];
  nursesAssignedOr: string[];
  orRoomsActive: number;
  orRoomsCapacity: number;
  stepDownOccupied: number;
  transferredPatientIds: string[];
  reassignedStaffIds: { staffId: string; from: string; to: string }[];
  deferredProcedureIds: string[];
}

export interface PlanAction {
  id: string;
  title: string;
  type: 'TRANSFER_PATIENT' | 'REASSIGN_STAFF' | 'DEFER_PROCEDURE' | 'EXPAND_RESERVE';
  resourceId: ResourceId;
  targetEntityId: string; // e.g. "P-108", "N04", "PROC-203"
  sourceLocation?: string;
  targetLocation?: string;
  rationale: string;
  modeledImpact: string;
  tradeOff: string;
  status: RecommendationStatus;
  priority: PriorityLevel;
}

export interface PlanCandidate {
  id: string;
  baseRevision: number;
  title: string;
  actions: PlanAction[];
  allocation: Allocation;
  objective: Objective;
  score: number;
  summary: string;
  violationsCount: number;
}

export interface ValidationCheck {
  id: string;
  ruleNumber: number;
  name: string;
  description: string;
  passed: boolean;
  observedValue: string | number;
  thresholdValue: string | number;
  severity: 'blocking' | 'warning';
  resourceId: ResourceId;
  details: string;
}

export interface ValidationResult {
  revision: number;
  isFeasible: boolean;
  totalChecks: number;
  passedChecks: number;
  failedBlockingChecks: number;
  checks: ValidationCheck[];
  evaluatedAt: string;
}

export interface Recommendation extends PlanAction {
  planRevision: number;
}

export interface DemoEvent {
  id: string;
  timestamp: string; // Simulated ISO / time string
  relativeTime: string; // e.g. "T+00:15", "Now"
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  resourceId?: ResourceId;
  category: 'SCENARIO' | 'OPTIMIZER' | 'CLINICAL_OPS' | 'ALLOCATION';
}

export interface ForecastPoint {
  timeOffsetHours: number; // -4 to +24
  timestamp: string;       // e.g. "14:00"
  demand: number;
  capacity: number;
  threshold: number;
  lowerConfidence: number;
  upperConfidence: number;
  isHistorical: boolean;
  hasEvent?: boolean;
  eventLabel?: string;
  breach?: boolean;
}

export interface ResourceMetricSummary {
  id: ResourceId;
  name: string;
  currentValue: number;
  capacity: number;
  unit: string;
  utilizationPercent: number;
  reserveCount: number;
  status: 'ok' | 'warning' | 'danger';
  deltaFromBaseline: number;
  trend: 'up' | 'down' | 'stable';
  headline: string;
}

export interface HospitalMock {
  name: string;
  campus: string;
  simulatedTime: string;
  simulatedDate: string;
  status: 'NORMAL' | 'ELEVATED_SURGE' | 'CRITICAL_SURGE';
}

export interface SolverMetricComparison {
  metric: string;
  classical: string | number;
  hybridQubo: string | number;
  unit?: string;
  improvement?: string;
  note: string;
}

export interface AppState {
  hospital: HospitalMock;
  activeScenario: ScenarioInput & { kind: ScenarioKind; revision: number; label: string };
  draftScenario: ScenarioInput | null;
  currentAllocation: Allocation;
  proposal: PlanCandidate | null;
  optimization: {
    state: OptimizationState;
    runId: string;
    phase?: string;
    progressPercent: number;
    error?: string;
    objective: Objective;
  };
  validation: ValidationResult | null;
  recommendations: Recommendation[];
  ui: {
    selectedMetric: ResourceId;
    rangeHours: 6 | 12 | 24;
    selectedResource?: ResourceId;
    activeDrawer?: {
      type: 'resource' | 'risk' | 'recommendation' | 'constraint';
      id?: string;
      data?: any;
    } | null;
    isSidebarCollapsed: boolean;
    isCommandPaletteOpen: boolean;
    theme: 'dark' | 'light';
    activeConfirmModal?: {
      title: string;
      message: string;
      confirmLabel: string;
      isDanger?: boolean;
      onConfirm: () => void;
    } | null;
  };
  toasts: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
    timestamp: number;
  }>;
  events: DemoEvent[];
  lastUpdatedAt: string;
}

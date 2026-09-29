import { create } from 'zustand';
import type {
  Allocation,
  AppState,
  DemoEvent,
  Objective,
  PlanCandidate,
  Recommendation,
  RecommendationStatus,
  ResourceId,
  ScenarioInput,
  StaffMember,
} from '../domain/types';
import { INITIAL_HOSPITAL } from '../data/hospital';
import { INITIAL_STAFF } from '../data/staff';
import { BASELINE_SCENARIO, CANONICAL_EMERGENCY_SCENARIO } from '../data/scenarios';
import { INITIAL_ALLOCATION, simulateScenario } from '../domain/scenarioEngine';
import { generateCandidate } from '../domain/replanEngine';
import { validateAllocation } from '../domain/validationEngine';
import { buildRecommendations } from '../domain/buildRecommendations';

interface StoreState extends AppState {
  staff: StaffMember[];
  activeRunTimerId?: ReturnType<typeof setTimeout>;

  // Actions
  injectEmergency: () => void;
  setDraftScenario: (draft: ScenarioInput) => void;
  revertDraftScenario: () => void;
  simulateScenario: (overrideInput?: ScenarioInput) => void;
  startReplan: (objective?: Objective) => void;
  cancelReplan: () => void;
  acceptProposal: () => void;
  resetBaseline: () => void;
  toggleRecommendationStatus: (id: string, status: RecommendationStatus) => void;
  
  // UI Actions
  setMetric: (metric: ResourceId) => void;
  setRangeHours: (range: 6 | 12 | 24) => void;
  selectResource: (resourceId?: ResourceId) => void;
  openDrawer: (type: 'resource' | 'risk' | 'recommendation' | 'constraint', id?: string, data?: unknown) => void;
  closeDrawer: () => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openConfirmModal: (modal: {
    title: string;
    message: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }) => void;
  closeConfirmModal: () => void;
  addToast: (toast: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'danger' }) => void;
  removeToast: (id: string) => void;
}

const INITIAL_EVENT: DemoEvent = {
  id: 'EV-001',
  timestamp: '14:00',
  relativeTime: 'Now',
  title: 'Simulation Initialized at Baseline',
  description: 'Operating baseline loaded. All 7 clinical and capacity constraints satisfied.',
  severity: 'info',
  category: 'SCENARIO',
};

export const useAppStore = create<StoreState>((set, get) => ({
  hospital: INITIAL_HOSPITAL,
  activeScenario: {
    ...BASELINE_SCENARIO,
    kind: 'baseline',
    revision: 1,
    label: 'Baseline Operational State',
  },
  draftScenario: null,
  currentAllocation: INITIAL_ALLOCATION,
  proposal: null,
  optimization: {
    state: 'idle',
    runId: 'RUN-INIT',
    progressPercent: 0,
    objective: 'feasibility_first',
  },
  validation: validateAllocation(INITIAL_ALLOCATION, BASELINE_SCENARIO, 1, INITIAL_STAFF),
  recommendations: buildRecommendations(null, 1),
  staff: INITIAL_STAFF,
  events: [INITIAL_EVENT],
  lastUpdatedAt: new Date().toLocaleTimeString(),
  ui: {
    selectedMetric: 'icu',
    rangeHours: 12,
    selectedResource: undefined,
    activeDrawer: null,
    isSidebarCollapsed: false,
    isCommandPaletteOpen: false,
    theme: (typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? (localStorage.getItem('qcare_theme') as 'dark' | 'light') : null) || 'dark',
    activeConfirmModal: null,
  },
  toasts: [],

  injectEmergency: () => {
    const state = get();
    if (state.activeRunTimerId) {
      clearTimeout(state.activeRunTimerId);
    }

    const newRevision = state.activeScenario.revision + 1;
    const { allocation, staff } = simulateScenario(INITIAL_ALLOCATION, CANONICAL_EMERGENCY_SCENARIO);
    const validation = validateAllocation(allocation, CANONICAL_EMERGENCY_SCENARIO, newRevision, staff);

    const event: DemoEvent = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      timestamp: '14:05',
      relativeTime: 'T+00:05',
      title: 'Canonical Emergency Inflow Injected',
      description: 'Mass-casualty triage alert: +5 acute emergency arrivals, +2 ICU demand, 2 nursing staff absences.',
      severity: 'danger',
      resourceId: 'emergency',
      category: 'SCENARIO',
    };

    set({
      activeScenario: {
        ...CANONICAL_EMERGENCY_SCENARIO,
        kind: 'emergency',
        revision: newRevision,
        label: 'Canonical Emergency Surge (+5 Inflow, -2 Staff)',
      },
      draftScenario: null,
      currentAllocation: allocation,
      staff,
      proposal: null,
      validation,
      recommendations: buildRecommendations(null, newRevision),
      optimization: {
        state: 'idle',
        runId: `RUN-${newRevision}`,
        progressPercent: 0,
        objective: 'feasibility_first',
      },
      events: [event, ...state.events],
      lastUpdatedAt: new Date().toLocaleTimeString(),
    });

    get().addToast({
      title: 'Emergency Scenario Injected',
      message: '+5 arrivals & -2 nurses committed. Current plan is now INFEASIBLE.',
      type: 'danger',
    });
  },

  setDraftScenario: (draft) => {
    set({ draftScenario: draft });
  },

  revertDraftScenario: () => {
    set({ draftScenario: null });
  },

  simulateScenario: (overrideInput) => {
    const state = get();
    const input = overrideInput || state.draftScenario || state.activeScenario;
    if (state.activeRunTimerId) {
      clearTimeout(state.activeRunTimerId);
    }

    const newRevision = state.activeScenario.revision + 1;
    const { allocation, staff } = simulateScenario(INITIAL_ALLOCATION, input);
    const validation = validateAllocation(allocation, input, newRevision, staff);

    const isCustom = input.emergencyArrivals !== 0 || input.availableNurses !== 10 || input.addedIcuDemand !== 0 || input.delayedDischarges !== 0 || input.orDelayMinutes !== 0;

    const event: DemoEvent = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      timestamp: '14:10',
      relativeTime: 'T+00:10',
      title: `Scenario Simulation Executed (Rev ${newRevision})`,
      description: `Committed parameters: Arrivals=${input.emergencyArrivals}, Nurses=${input.availableNurses}, Added ICU=${input.addedIcuDemand}, Delays=${input.delayedDischarges}, OR=${input.orDelayMinutes}m.`,
      severity: validation.isFeasible ? 'info' : 'warning',
      category: 'SCENARIO',
    };

    set({
      activeScenario: {
        ...input,
        kind: isCustom ? 'custom' : 'baseline',
        revision: newRevision,
        label: isCustom ? `Custom Scenario (Rev ${newRevision})` : 'Baseline Operational State',
      },
      draftScenario: null,
      currentAllocation: allocation,
      staff,
      proposal: null,
      validation,
      recommendations: buildRecommendations(null, newRevision),
      optimization: {
        state: 'idle',
        runId: `RUN-${newRevision}`,
        progressPercent: 0,
        objective: state.optimization.objective,
      },
      events: [event, ...state.events],
      lastUpdatedAt: new Date().toLocaleTimeString(),
    });

    get().addToast({
      title: 'Scenario Committed',
      message: `Revision ${newRevision} calculated: Plan is ${validation.isFeasible ? 'FEASIBLE' : 'INFEASIBLE'}.`,
      type: validation.isFeasible ? 'success' : 'warning',
    });
  },

  startReplan: (chosenObjective) => {
    const state = get();
    if (state.optimization.state !== 'idle' && state.optimization.state !== 'complete' && state.optimization.state !== 'failed') {
      return;
    }

    const objective = chosenObjective || state.optimization.objective;
    const runId = `RUN-${Date.now().toString().slice(-4)}`;
    const revision = state.activeScenario.revision;

    set({
      optimization: {
        state: 'analyzing',
        runId,
        phase: 'Step 1/4: Analyzing 7 hard operational constraints and resource bottleneck propagation...',
        progressPercent: 25,
        objective,
      },
    });

    const timer1 = setTimeout(() => {
      if (get().optimization.runId !== runId) return;

      set({
        optimization: {
          state: 'modeling',
          runId,
          phase: 'Step 2/4: Formulating mixed-integer decision variables and capacity bounding landscape...',
          progressPercent: 50,
          objective,
        },
      });

      const timer2 = setTimeout(() => {
        if (get().optimization.runId !== runId) return;

        set({
          optimization: {
            state: 'optimizing',
            runId,
            phase: 'Step 3/4: Evaluating candidate action bundles against multi-objective function...',
            progressPercent: 75,
            objective,
          },
        });

        const timer3 = setTimeout(() => {
          if (get().optimization.runId !== runId) return;

          set({
            optimization: {
              state: 'validating',
              runId,
              phase: 'Step 4/4: Executing strict 7-point validation checklist on optimal candidate...',
              progressPercent: 90,
              objective,
            },
          });

          const timer4 = setTimeout(() => {
            if (get().optimization.runId !== runId) return;

            const currentState = get();
            const replanResult = generateCandidate(
              currentState.currentAllocation,
              currentState.activeScenario,
              currentState.staff,
              objective,
              revision
            );

            if (replanResult.success) {
              const candidate = replanResult.candidate;
              const valResult = validateAllocation(candidate.allocation, currentState.activeScenario, revision, currentState.staff);
              const recs = buildRecommendations(candidate, revision);

              const event: DemoEvent = {
                id: `EV-${Date.now().toString().slice(-4)}`,
                timestamp: '14:15',
                relativeTime: 'T+00:15',
                title: 'Feasible Plan Candidate Generated',
                description: `Candidate ${candidate.id} computed with ${candidate.actions.length} actions. All 7 validation rules verified.`,
                severity: 'success',
                category: 'OPTIMIZER',
              };

              set({
                proposal: candidate,
                validation: valResult,
                recommendations: recs,
                optimization: {
                  state: 'complete',
                  runId,
                  phase: 'Plan generated and validated against current scenario revision.',
                  progressPercent: 100,
                  objective,
                },
                events: [event, ...currentState.events],
                lastUpdatedAt: new Date().toLocaleTimeString(),
              });

              get().addToast({
                title: 'Feasible Proposal Ready',
                message: `${candidate.actions.length} actions ready for review. Validation passed.`,
                type: 'success',
              });
            } else {
              const event: DemoEvent = {
                id: `EV-${Date.now().toString().slice(-4)}`,
                timestamp: '14:15',
                relativeTime: 'T+00:15',
                title: 'Optimization Search Exhausted (No Feasible Solution)',
                description: `No legal candidate satisfies all hard constraints under current scenario parameters. ${replanResult.residualViolations.length} residual blockers remain.`,
                severity: 'danger',
                category: 'OPTIMIZER',
              };

              set({
                proposal: null,
                optimization: {
                  state: 'failed',
                  runId,
                  phase: 'No feasible candidate found within permitted operational bounds.',
                  progressPercent: 100,
                  error: replanResult.residualViolations.join(' | '),
                  objective,
                },
                events: [event, ...currentState.events],
                lastUpdatedAt: new Date().toLocaleTimeString(),
              });

              get().addToast({
                title: 'Optimization Search Complete',
                message: 'No feasible plan exists for this extreme scenario. Residual violations listed.',
                type: 'danger',
              });
            }
          }, 450);
          set({ activeRunTimerId: timer4 });
        }, 450);
        set({ activeRunTimerId: timer3 });
      }, 450);
      set({ activeRunTimerId: timer2 });
    }, 450);

    set({ activeRunTimerId: timer1 });
  },

  cancelReplan: () => {
    const state = get();
    if (state.activeRunTimerId) {
      clearTimeout(state.activeRunTimerId);
    }
    set({
      activeRunTimerId: undefined,
      optimization: {
        state: 'idle',
        runId: 'RUN-CANCELLED',
        progressPercent: 0,
        objective: state.optimization.objective,
      },
    });
    get().addToast({
      title: 'Replanning Cancelled',
      message: 'Optimization cancelled. Current allocation retained.',
      type: 'info',
    });
  },

  acceptProposal: () => {
    const state = get();
    if (!state.proposal) return;

    if (state.proposal.baseRevision !== state.activeScenario.revision) {
      get().addToast({
        title: 'Cannot Accept Stale Proposal',
        message: 'The proposal was calculated for an older scenario revision. Please re-run replan.',
        type: 'danger',
      });
      return;
    }

    const newRevision = state.activeScenario.revision + 1;
    const newAllocation = state.proposal.allocation;
    const newStaff = state.staff.map(s => {
      const reassigned = newAllocation.reassignedStaffIds.find(r => r.staffId === s.id);
      if (reassigned) {
        return { ...s, assignedUnit: reassigned.to as any };
      }
      return s;
    });

    const validation = validateAllocation(newAllocation, state.activeScenario, newRevision, newStaff);

    const event: DemoEvent = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      timestamp: '14:20',
      relativeTime: 'T+00:20',
      title: 'Candidate Plan Accepted by Operator',
      description: `Plan ${state.proposal.id} accepted locally. Transferred ${newAllocation.transferredPatientIds.length} patient(s), reassigned ${newAllocation.reassignedStaffIds.length} nurse(s).`,
      severity: 'success',
      category: 'ALLOCATION',
    };

    set({
      currentAllocation: newAllocation,
      staff: newStaff,
      proposal: null,
      validation,
      activeScenario: {
        ...state.activeScenario,
        revision: newRevision,
      },
      recommendations: state.recommendations.map(r => ({ ...r, status: 'included' as RecommendationStatus })),
      events: [event, ...state.events],
      lastUpdatedAt: new Date().toLocaleTimeString(),
    });

    get().addToast({
      title: 'Plan Accepted Locally',
      message: 'New allocations are now active in simulation. All constraints verified feasible.',
      type: 'success',
    });
  },

  resetBaseline: () => {
    const state = get();
    if (state.activeRunTimerId) {
      clearTimeout(state.activeRunTimerId);
    }

    const validation = validateAllocation(INITIAL_ALLOCATION, BASELINE_SCENARIO, 1, INITIAL_STAFF);

    const event: DemoEvent = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      timestamp: '14:00',
      relativeTime: 'Now',
      title: 'Simulation Reset to Baseline',
      description: 'Canonical baseline restored. All draft inputs, proposals, and pending timers cleared.',
      severity: 'info',
      category: 'SCENARIO',
    };

    set({
      hospital: INITIAL_HOSPITAL,
      activeScenario: {
        ...BASELINE_SCENARIO,
        kind: 'baseline',
        revision: 1,
        label: 'Baseline Operational State',
      },
      draftScenario: null,
      currentAllocation: INITIAL_ALLOCATION,
      staff: INITIAL_STAFF,
      proposal: null,
      optimization: {
        state: 'idle',
        runId: 'RUN-RESET',
        progressPercent: 0,
        objective: 'feasibility_first',
      },
      validation,
      recommendations: buildRecommendations(null, 1),
      events: [event],
      ui: {
        ...state.ui,
        activeDrawer: null,
        activeConfirmModal: null,
      },
      lastUpdatedAt: new Date().toLocaleTimeString(),
    });

    get().addToast({
      title: 'Reset to Baseline',
      message: 'Canonical operating values restored.',
      type: 'info',
    });
  },

  toggleRecommendationStatus: (id, status) => {
    set(state => ({
      recommendations: state.recommendations.map(r => (r.id === id ? { ...r, status } : r)),
    }));
  },

  setMetric: (metric) => {
    set(state => ({ ui: { ...state.ui, selectedMetric: metric } }));
  },

  setRangeHours: (range) => {
    set(state => ({ ui: { ...state.ui, rangeHours: range } }));
  },

  selectResource: (resourceId) => {
    set(state => ({
      ui: {
        ...state.ui,
        selectedResource: resourceId,
        activeDrawer: resourceId ? { type: 'resource', id: resourceId } : null,
      },
    }));
  },

  openDrawer: (type, id, data) => {
    set(state => ({
      ui: {
        ...state.ui,
        activeDrawer: { type, id, data },
      },
    }));
  },

  closeDrawer: () => {
    set(state => ({
      ui: {
        ...state.ui,
        activeDrawer: null,
      },
    }));
  },

  toggleSidebar: () => {
    set(state => ({
      ui: {
        ...state.ui,
        isSidebarCollapsed: !state.ui.isSidebarCollapsed,
      },
    }));
  },

  toggleTheme: () => {
    const nextTheme = get().ui.theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('qcare_theme', theme);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    set(state => ({
      ui: {
        ...state.ui,
        theme,
      },
    }));
  },

  openCommandPalette: () => {
    set(state => ({
      ui: {
        ...state.ui,
        isCommandPaletteOpen: true,
      },
    }));
  },

  closeCommandPalette: () => {
    set(state => ({
      ui: {
        ...state.ui,
        isCommandPaletteOpen: false,
      },
    }));
  },

  openConfirmModal: (modal) => {
    set(state => ({
      ui: {
        ...state.ui,
        activeConfirmModal: modal,
      },
    }));
  },

  closeConfirmModal: () => {
    set(state => ({
      ui: {
        ...state.ui,
        activeConfirmModal: null,
      },
    }));
  },

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString().slice(2, 6)}`;
    set(state => ({
      toasts: [...state.toasts, { ...toast, id, timestamp: Date.now() }],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },
}));

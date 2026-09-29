import { describe, it, expect } from 'vitest';
import { useAppStore } from '../state/store';
import { evaluateConstraints } from '../domain/constraints';
import { derivePlanState, deriveResourceMetrics } from '../domain/deriveMetrics';
import { generateForecastData } from '../data/forecasts';
import { IMPOSSIBLE_CUSTOM_SCENARIO } from '../data/scenarios';

describe('Q-CARE End-to-End Demo Flow Acceptance Tests', () => {
  it('Step 1: Baseline state validation', () => {
    useAppStore.getState().resetBaseline();
    const state = useAppStore.getState();

    const metrics = deriveResourceMetrics(state.currentAllocation, state.activeScenario, state.staff);
    const constraints = evaluateConstraints(state.currentAllocation, state.activeScenario, state.staff);
    const planState = derivePlanState(constraints);

    expect(metrics.beds.currentValue).toBe(24);
    expect(metrics.beds.capacity).toBe(30);
    expect(metrics.icu.currentValue).toBe(8);
    expect(metrics.icu.capacity).toBe(10);
    expect(metrics.staff.currentValue).toBe(10);
    expect(metrics.or.currentValue).toBe(2);
    expect(metrics.emergency.currentValue).toBe(4);
    expect(planState).toBe('feasible');
    expect(state.validation?.isFeasible).toBe(true);
  });

  it('Step 2: Forecast generation and breach inspection', () => {
    const state = useAppStore.getState();
    const forecast6h = generateForecastData('icu', 6, state.activeScenario);
    const forecast12h = generateForecastData('icu', 12, state.activeScenario);
    const forecast24h = generateForecastData('icu', 24, state.activeScenario);

    expect(forecast6h.length).toBeGreaterThan(0);
    expect(forecast12h.length).toBeGreaterThan(forecast6h.length);
    expect(forecast24h.length).toBeGreaterThan(0);

    // Verify historical and forecast points exist
    const histPoints = forecast12h.filter(p => p.isHistorical);
    const futurePoints = forecast12h.filter(p => !p.isHistorical);
    expect(histPoints.length).toBeGreaterThan(0);
    expect(futurePoints.length).toBeGreaterThan(0);
  });

  it('Step 3 & 4: Inject Canonical Emergency -> Infeasible with named violations', () => {
    useAppStore.getState().injectEmergency();
    const state = useAppStore.getState();

    expect(state.activeScenario.kind).toBe('emergency');
    expect(state.activeScenario.emergencyArrivals).toBe(5);
    expect(state.activeScenario.availableNurses).toBe(8);

    const constraints = evaluateConstraints(state.currentAllocation, state.activeScenario, state.staff);
    const planState = derivePlanState(constraints);
    expect(planState).toBe('infeasible');

    const blockers = constraints.filter(c => !c.passed && c.severity === 'blocking');
    expect(blockers.length).toBeGreaterThanOrEqual(2);

    // Event audit record
    const emergencyEvent = state.events.find(e => e.category === 'SCENARIO' && e.severity === 'danger');
    expect(emergencyEvent).toBeDefined();
  });

  it('Step 5 & 6: Replan Studio and validation', async () => {
    const initialAllocation = { ...useAppStore.getState().currentAllocation };

    // Start replan
    useAppStore.getState().startReplan('feasibility_first');
    expect(useAppStore.getState().optimization.state).toBe('analyzing');

    // Allocation remains unchanged during solve
    expect(useAppStore.getState().currentAllocation).toEqual(initialAllocation);

    // Wait for the finite async stages to complete
    await new Promise(resolve => setTimeout(resolve, 2200));

    const state = useAppStore.getState();
    expect(state.optimization.state).toBe('complete');
    expect(state.proposal).not.toBeNull();
    expect(state.validation?.isFeasible).toBe(true);
    expect(state.proposal?.actions.length).toBeGreaterThan(0);
  });

  it('Step 7: Accept proposal commits locally without external side-effects', () => {
    useAppStore.getState().acceptProposal();
    const state = useAppStore.getState();

    expect(state.proposal).toBeNull();
    const metrics = deriveResourceMetrics(state.currentAllocation, state.activeScenario, state.staff);
    const constraints = evaluateConstraints(state.currentAllocation, state.activeScenario, state.staff);
    const planState = derivePlanState(constraints);

    expect(planState).toBe('feasible');
    expect(metrics.icu.currentValue).toBe(9);
    expect(metrics.beds.currentValue).toBe(28);

    const acceptEvent = state.events.find(e => e.category === 'ALLOCATION');
    expect(acceptEvent).toBeDefined();
  });

  it('Step 8: Reset baseline restores canonical values', () => {
    useAppStore.getState().resetBaseline();
    const state = useAppStore.getState();

    const metrics = deriveResourceMetrics(state.currentAllocation, state.activeScenario, state.staff);
    expect(metrics.beds.currentValue).toBe(24);
    expect(metrics.icu.currentValue).toBe(8);
    expect(metrics.staff.currentValue).toBe(10);
    expect(metrics.or.currentValue).toBe(2);
    expect(metrics.emergency.currentValue).toBe(4);
    expect(state.activeScenario.revision).toBe(1);
    expect(state.proposal).toBeNull();
  });

  it('Step 9: Impossible scenario truthfully fails', async () => {
    useAppStore.getState().simulateScenario(IMPOSSIBLE_CUSTOM_SCENARIO);
    useAppStore.getState().startReplan('feasibility_first');

    await new Promise(resolve => setTimeout(resolve, 2200));

    const state = useAppStore.getState();
    expect(state.optimization.state).toBe('failed');
    expect(state.proposal).toBeNull();
    expect(state.optimization.error).toBeDefined();
  });
});

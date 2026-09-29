import { ScenarioInput } from '../domain/types';

export const BASELINE_SCENARIO: ScenarioInput = {
  emergencyArrivals: 0,
  availableNurses: 10,
  addedIcuDemand: 0,
  delayedDischarges: 0,
  orDelayMinutes: 0,
};

export const CANONICAL_EMERGENCY_SCENARIO: ScenarioInput = {
  emergencyArrivals: 5,     // +5 emergency arrivals (modeled as +3 general bed demand, +2 projected ICU demand)
  availableNurses: 8,       // -2 available nurses (10 down to 8)
  addedIcuDemand: 2,        // +2 projected ICU admissions
  delayedDischarges: 0,
  orDelayMinutes: 0,
};

export const IMPOSSIBLE_CUSTOM_SCENARIO: ScenarioInput = {
  emergencyArrivals: 10,
  availableNurses: 6,
  addedIcuDemand: 6,
  delayedDischarges: 8,
  orDelayMinutes: 240,
};

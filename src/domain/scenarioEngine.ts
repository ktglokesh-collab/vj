import { Allocation, DemoEvent, ScenarioInput, StaffMember } from './types';
import { INITIAL_STAFF } from '../data/staff';

export interface DerivedHospitalState {
  allocation: Allocation;
  staff: StaffMember[];
  event?: DemoEvent;
}

export const INITIAL_ALLOCATION: Allocation = {
  generalBedsOccupied: 24,
  generalBedsCapacity: 30,
  icuBedsOccupied: 8,
  icuBedsCapacity: 10,
  emergencyReserveBeds: 4,
  nursesAssignedIcu: ['N01', 'N02', 'N03'],
  nursesAssignedGeneral: ['N04', 'N05', 'N06', 'N07', 'N08'],
  nursesAssignedOr: ['N09', 'N10'],
  orRoomsActive: 2,
  orRoomsCapacity: 3,
  stepDownOccupied: 4,
  transferredPatientIds: [],
  reassignedStaffIds: [],
  deferredProcedureIds: [],
};

export function simulateScenario(
  baseAllocation: Allocation,
  input: ScenarioInput
): DerivedHospitalState {
  // Compute modeled bed and ICU demand
  // Each emergency arrival distributes: ~60% general bed surge, ~40% ICU demand when high
  const generalSurge = Math.floor(input.emergencyArrivals * 0.6) + input.delayedDischarges;
  const icuSurge = input.addedIcuDemand + Math.floor(input.emergencyArrivals * 0.4);

  const newGeneralOccupied = Math.min(30, 24 + generalSurge);
  const newIcuOccupied = Math.min(10, 8 + icuSurge);

  // Reserve drops when emergency holding fills
  const newEmergencyReserve = Math.max(0, 4 - Math.floor(input.emergencyArrivals * 0.6));

  // Staff availability adjustment
  // If availableNurses < 10, disable nurses starting from off duty / med-surg / ICU according to scenario
  const staff: StaffMember[] = INITIAL_STAFF.map(nurse => {
    // In canonical emergency (-2 nurses: available = 8), N02 (Senior ICU) and N08 (Med-Surg) are unavailable (e.g. sick call/quarantine)
    if (input.availableNurses === 8 && (nurse.id === 'N02' || nurse.id === 'N08')) {
      return { ...nurse, isAvailable: false, assignedUnit: 'OFF_DUTY' };
    }
    if (input.availableNurses === 6 && (nurse.id === 'N02' || nurse.id === 'N03' || nurse.id === 'N07' || nurse.id === 'N08')) {
      return { ...nurse, isAvailable: false, assignedUnit: 'OFF_DUTY' };
    }
    if (input.availableNurses === 7 && (nurse.id === 'N02' || nurse.id === 'N07' || nurse.id === 'N08')) {
      return { ...nurse, isAvailable: false, assignedUnit: 'OFF_DUTY' };
    }
    return { ...nurse };
  });

  // Allocation adjusts assigned nurse lists based on availability
  const activeStaffIds = staff.filter(s => s.isAvailable).map(s => s.id);
  const newIcuNurses = baseAllocation.nursesAssignedIcu.filter(id => activeStaffIds.includes(id));
  const newGeneralNurses = baseAllocation.nursesAssignedGeneral.filter(id => activeStaffIds.includes(id));
  const newOrNurses = baseAllocation.nursesAssignedOr.filter(id => activeStaffIds.includes(id));

  const allocation: Allocation = {
    ...baseAllocation,
    generalBedsOccupied: newGeneralOccupied,
    icuBedsOccupied: newIcuOccupied,
    emergencyReserveBeds: newEmergencyReserve,
    nursesAssignedIcu: newIcuNurses,
    nursesAssignedGeneral: newGeneralNurses,
    nursesAssignedOr: newOrNurses,
    transferredPatientIds: [],
    reassignedStaffIds: [],
    deferredProcedureIds: [],
  };

  return {
    allocation,
    staff,
  };
}

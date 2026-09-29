import { Patient } from '../domain/types';

export const INITIAL_PATIENTS: Patient[] = [
  // ICU Patients (8 baseline)
  { id: 'P-101', unit: 'ICU', acuity: 1, admitTime: 'T-18h', transferEligibleStepdown: false, assignedNurseId: 'N01' },
  { id: 'P-102', unit: 'ICU', acuity: 1, admitTime: 'T-14h', transferEligibleStepdown: false, assignedNurseId: 'N01' },
  { id: 'P-103', unit: 'ICU', acuity: 2, admitTime: 'T-12h', transferEligibleStepdown: false, assignedNurseId: 'N02' },
  { id: 'P-104', unit: 'ICU', acuity: 2, admitTime: 'T-10h', transferEligibleStepdown: false, assignedNurseId: 'N02' },
  { id: 'P-105', unit: 'ICU', acuity: 2, admitTime: 'T-08h', transferEligibleStepdown: false, assignedNurseId: 'N03' },
  { id: 'P-106', unit: 'ICU', acuity: 2, admitTime: 'T-06h', transferEligibleStepdown: false, assignedNurseId: 'N03' },
  { id: 'P-107', unit: 'ICU', acuity: 3, admitTime: 'T-05h', transferEligibleStepdown: false, assignedNurseId: 'N01' },
  { id: 'P-108', unit: 'ICU', acuity: 4, admitTime: 'T-24h', transferEligibleStepdown: true, assignedNurseId: 'N02' }, // Eligible for step-down transfer

  // General Beds Patients (24 baseline)
  { id: 'P-109', unit: 'BEDS', acuity: 3, admitTime: 'T-30h', transferEligibleStepdown: false, assignedNurseId: 'N04' },
  { id: 'P-110', unit: 'BEDS', acuity: 4, admitTime: 'T-28h', transferEligibleStepdown: false, assignedNurseId: 'N04' },
  { id: 'P-111', unit: 'BEDS', acuity: 4, admitTime: 'T-26h', transferEligibleStepdown: false, assignedNurseId: 'N04' },
  { id: 'P-112', unit: 'BEDS', acuity: 5, admitTime: 'T-24h', transferEligibleStepdown: false, assignedNurseId: 'N04' },
  { id: 'P-113', unit: 'BEDS', acuity: 3, admitTime: 'T-22h', transferEligibleStepdown: false, assignedNurseId: 'N05' },
  { id: 'P-114', unit: 'BEDS', acuity: 4, admitTime: 'T-20h', transferEligibleStepdown: false, assignedNurseId: 'N05' },
  { id: 'P-115', unit: 'BEDS', acuity: 4, admitTime: 'T-18h', transferEligibleStepdown: false, assignedNurseId: 'N05' },
  { id: 'P-116', unit: 'BEDS', acuity: 5, admitTime: 'T-16h', transferEligibleStepdown: false, assignedNurseId: 'N05' },
  { id: 'P-117', unit: 'BEDS', acuity: 3, admitTime: 'T-15h', transferEligibleStepdown: false, assignedNurseId: 'N06' },
  { id: 'P-118', unit: 'BEDS', acuity: 4, admitTime: 'T-14h', transferEligibleStepdown: false, assignedNurseId: 'N06' },
  { id: 'P-119', unit: 'BEDS', acuity: 4, admitTime: 'T-12h', transferEligibleStepdown: false, assignedNurseId: 'N06' },
  { id: 'P-120', unit: 'BEDS', acuity: 5, admitTime: 'T-10h', transferEligibleStepdown: false, assignedNurseId: 'N06' },
  { id: 'P-121', unit: 'BEDS', acuity: 3, admitTime: 'T-09h', transferEligibleStepdown: false, assignedNurseId: 'N07' },
  { id: 'P-122', unit: 'BEDS', acuity: 4, admitTime: 'T-08h', transferEligibleStepdown: false, assignedNurseId: 'N07' },
  { id: 'P-123', unit: 'BEDS', acuity: 4, admitTime: 'T-07h', transferEligibleStepdown: false, assignedNurseId: 'N07' },
  { id: 'P-124', unit: 'BEDS', acuity: 5, admitTime: 'T-06h', transferEligibleStepdown: false, assignedNurseId: 'N07' },
  { id: 'P-125', unit: 'BEDS', acuity: 3, admitTime: 'T-05h', transferEligibleStepdown: false, assignedNurseId: 'N08' },
  { id: 'P-126', unit: 'BEDS', acuity: 4, admitTime: 'T-04h', transferEligibleStepdown: false, assignedNurseId: 'N08' },
  { id: 'P-127', unit: 'BEDS', acuity: 4, admitTime: 'T-03h', transferEligibleStepdown: false, assignedNurseId: 'N08' },
  { id: 'P-128', unit: 'BEDS', acuity: 5, admitTime: 'T-02h', transferEligibleStepdown: false, assignedNurseId: 'N08' },
  { id: 'P-129', unit: 'BEDS', acuity: 3, admitTime: 'T-02h', transferEligibleStepdown: false, assignedNurseId: 'N05' },
  { id: 'P-130', unit: 'BEDS', acuity: 4, admitTime: 'T-01h', transferEligibleStepdown: false, assignedNurseId: 'N06' },
  { id: 'P-131', unit: 'BEDS', acuity: 4, admitTime: 'T-01h', transferEligibleStepdown: false, assignedNurseId: 'N07' },
  { id: 'P-132', unit: 'BEDS', acuity: 5, admitTime: 'T-00h', transferEligibleStepdown: false, assignedNurseId: 'N08' },
];

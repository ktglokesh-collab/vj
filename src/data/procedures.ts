import { Procedure } from '../domain/types';

export const INITIAL_PROCEDURES: Procedure[] = [
  {
    id: 'PROC-201',
    orRoom: 'OR-1',
    scheduledStart: '14:30',
    scheduledDurationMinutes: 120,
    priority: 'URGENT',
    deferrable: false,
    status: 'IN_PROGRESS',
  },
  {
    id: 'PROC-202',
    orRoom: 'OR-2',
    scheduledStart: '15:15',
    scheduledDurationMinutes: 90,
    priority: 'ELECTIVE_LOW',
    deferrable: true,
    status: 'SCHEDULED',
  },
  {
    id: 'PROC-203',
    orRoom: 'OR-3',
    scheduledStart: '16:00',
    scheduledDurationMinutes: 60,
    priority: 'EMERGENCY',
    deferrable: false,
    status: 'SCHEDULED',
  },
];

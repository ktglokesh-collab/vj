import { ResourceId } from '../domain/types';

export interface TopologyNodeDef {
  id: ResourceId;
  label: string;
  category: 'inflow' | 'critical_care' | 'inpatient' | 'workforce' | 'surgical';
  icon: string;
  x: number; // percentage or SVG coordinate for responsive positioning
  y: number;
  description: string;
  baselineValue: number;
  capacity: number;
  unit: string;
}

export interface DependencyEdgeDef {
  id: string;
  source: ResourceId;
  target: ResourceId;
  label: string;
  direction: 'unidirectional' | 'bidirectional';
  description: string;
}

export const TOPOLOGY_NODES: TopologyNodeDef[] = [
  {
    id: 'emergency',
    label: 'Emergency Intake',
    category: 'inflow',
    icon: 'Flame',
    x: 12,
    y: 48,
    description: 'Acute emergency room arrivals, triage holding, and emergency bed surge buffer.',
    baselineValue: 4, // Reserve buffer
    capacity: 6,
    unit: 'holding beds',
  },
  {
    id: 'beds',
    label: 'General & Step-Down',
    category: 'inpatient',
    icon: 'BedDouble',
    x: 48,
    y: 22,
    description: 'General inpatient wards, telemetry, and step-down intermediate care units.',
    baselineValue: 24,
    capacity: 30,
    unit: 'beds occupied',
  },
  {
    id: 'icu',
    label: 'Intensive Care Unit',
    category: 'critical_care',
    icon: 'HeartPulse',
    x: 52,
    y: 72,
    description: 'High-acuity 1:1 and 1:2 monitored intensive care beds with specialized life support.',
    baselineValue: 8,
    capacity: 10,
    unit: 'beds occupied',
  },
  {
    id: 'staff',
    label: 'Clinical Workforce',
    category: 'workforce',
    icon: 'Users',
    x: 84,
    y: 35,
    description: 'Active nursing roster with critical care certifications, cross-training, and shift limits.',
    baselineValue: 10,
    capacity: 12,
    unit: 'nurses on shift',
  },
  {
    id: 'or',
    label: 'Operating Theatres',
    category: 'surgical',
    icon: 'Activity',
    x: 82,
    y: 80,
    description: 'Surgical suites for scheduled elective cases and emergency trauma availability.',
    baselineValue: 2,
    capacity: 3,
    unit: 'theatres active',
  },
];

export const TOPOLOGY_EDGES: DependencyEdgeDef[] = [
  {
    id: 'edge-em-icu',
    source: 'emergency',
    target: 'icu',
    label: 'Direct ICU Inflow',
    direction: 'unidirectional',
    description: 'High-acuity emergency arrivals drive immediate ICU bed and critical nurse demand.',
  },
  {
    id: 'edge-em-beds',
    source: 'emergency',
    target: 'beds',
    label: 'Acute Inpatient Inflow',
    direction: 'unidirectional',
    description: 'Emergency admissions consume general med-surg beds and floor capacity.',
  },
  {
    id: 'edge-icu-beds',
    source: 'icu',
    target: 'beds',
    label: 'Step-Down Decompression',
    direction: 'bidirectional',
    description: 'Stabilized ICU patients can transfer to step-down beds to free critical ICU capacity.',
  },
  {
    id: 'edge-icu-staff',
    source: 'icu',
    target: 'staff',
    label: 'Specialized 1:2 Ratio',
    direction: 'bidirectional',
    description: 'ICU beds require certified or cross-trained critical care nurses under mandated ratios.',
  },
  {
    id: 'edge-or-staff',
    source: 'or',
    target: 'staff',
    label: 'Surgical Staff Support',
    direction: 'bidirectional',
    description: 'Active OR procedures draw surgical nurse allocations and downstream recovery staff.',
  },
  {
    id: 'edge-or-icu',
    source: 'or',
    target: 'icu',
    label: 'Post-Op Critical Care',
    direction: 'unidirectional',
    description: 'Complex surgical recoveries require scheduled or emergent ICU transfer slots.',
  },
];

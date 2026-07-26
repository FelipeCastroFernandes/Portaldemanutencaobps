/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EquipmentType = 'escadas' | 'elevadores';

export type ProfileLevel = 'Gestor' | 'Planejador' | 'visualizar';

export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'done';
export type TaskImpact = 'low' | 'medium' | 'critical';
export type TaskUrgency = 'strategic' | 'planned' | 'immediate';

export interface Task {
  id: string;
  title: string;
  hours: number;
  impact: TaskImpact;
  urgency: TaskUrgency;
  responsible: string;
  notes: string;
  status: TaskStatus;
  collaborator?: string;
  score: number;
  createdAt: string;
  archivedAt?: string;
}




export interface StopCause {
  id: string;
  type: EquipmentType;
  name: string;
  createdAt?: string;
}

export interface OccurrenceStatusPeriod {
  status: string;
  start: string;
  end?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  photo?: string;
  team: string;
  role: string;
  profile: ProfileLevel;
  createdAt: string;
}

export interface Occurrence {
  id: string;
  type: EquipmentType;
  equip: string;
  callNumber: string;
  attendant: string;
  createdBy: string; // The user who opened the call
  start: string; // ISO string
  end?: string; // ISO string
  technician?: string; // Technician who performed the service
  reason?: string; // Reason for the stop
  causa_parada?: string;
  is_equipment_stopped?: boolean;
  statusHistory?: OccurrenceStatusPeriod[];
  extraScopeApprovalMs?: number;
  extraScopeStart?: string; // ISO string - when the extra scope pause started
  extraScopeEnd?: string; // ISO string - when the extra scope pause ended
  closedBy?: string; // User who registered the closure
}

export interface MaintenanceRecord {
  equip: string;
  mes: string;
  chamados: number;
  disp: number;
  mtbf: string; // "HH:MM:SS"
  mttr: string; // "HH:MM:SS"
  baseHours?: number;
}

export interface DashboardData {
  escadas: MaintenanceRecord[];
  elevadores: MaintenanceRecord[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

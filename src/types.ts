/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EquipmentType = 'escadas' | 'elevadores';

export type ProfileLevel = 'gestao' | 'visualizacao';

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
  closedBy?: string; // User who registered the closure
}

export interface MaintenanceRecord {
  equip: string;
  mes: string;
  chamados: number;
  disp: number;
  mtbf: string; // "HH:MM:SS"
  mttr: string; // "HH:MM:SS"
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

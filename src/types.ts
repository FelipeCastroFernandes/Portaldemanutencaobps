/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EquipmentType = 'escadas' | 'elevadores';

export type ProfileLevel = 'Gestor' | 'Planejador' | 'Solicitante';

export const CAUSAS_PARADA_BY_TYPE: Record<EquipmentType, string[]> = {
  elevadores: [
    'CORREDIÇAS',
    'OPERADORES DE PORTA',
    'PORTA DE PAVIMENTO',
    'DRIVE / DRIVE QUEIMADO',
    'OSCILAÇÃO DE ENERGIA',
    'INTERMITÊNCIA DE QUADRO DE COMANDO',
    'SENSORES',
    'CABO DE MANOBRA',
    'DANOS POR TERCEIROS',
    'PORTA DE CABINA',
    'ROLETE DE PORTA',
    'ENCODER',
    'POLIA TENSORA',
    'GUIAS E CORREDIÇAS',
    'OUTROS',
    '(OUTROS) RESET',
  ],
  escadas: [
    'DEGRAUS',
    'CORREMAO',
    'CORRENTE DE DEGRAUS',
    'SENSORES DE SEGURANÇA',
    'PLACA DE PENTES',
    'DRIVER / CONJUNTO MOTOR REDUTOR',
    'INVERSOR DE FREQUÊNCIA / QUADRO DE COMANDO',
    'SISTEMA DE FREIOS',
    'ACIONAMENTO DE EMERGÊNCIA (BOTÃO)',
    'OSCILAÇÃO DE ENERGIA',
    'SISTEMA DE LUBRIFICAÇÃO',
    'DANOS POR TERCEIROS / VANDALISMO',
    'OUTROS',
    '(OUTROS) RESET',
  ],
};

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

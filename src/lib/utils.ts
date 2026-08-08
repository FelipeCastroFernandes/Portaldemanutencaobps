/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MaintenanceRecord, EquipmentType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTime(timeStr: string): number {
  if (!timeStr || timeStr === "-") return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const seconds = parts.length === 3 ? (parseInt(parts[2]) || 0) : 0;
  
  return parseFloat((hours + minutes / 60 + seconds / 3600).toFixed(2));
}

export function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.round(((hours - h) * 60 - m) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getLocalTimezoneOffset(): string {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Retorna a disponibilidade (%) de um MaintenanceRecord.
 *
 * O valor de `record.disp` já está corretamente calculado na base certa:
 * - Dados iniciais: representam a disponibilidade real observada
 * - Dados de ocorrências (com baseHours): calculados no App.tsx
 *   usando HORAS_ESCADA_MES para escadas (12h/dia) ou
 *   HORAS_MES para elevadores (24h/dia)
 */
export function calcDisp(
  record: MaintenanceRecord,
  _equipType: EquipmentType
): number {
  return record.disp;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MaintenanceRecord, EquipmentType } from '../types';
import { HORAS_MES, HORAS_ESCADA_MES } from '../data/initialData';

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

/**
 * Recalcula a disponibilidade (%) de um MaintenanceRecord aplicando o regime
 * comercial correto de acordo com o tipo de equipamento:
 *
 * - ELEVADORES  → teto de 24h/dia (usa HORAS_MES — comportamento original)
 * - ESCADAS     → teto de 12h/dia (usa HORAS_ESCADA_MES — novo regime)
 *
 * O downtime efetivo é extraído do `disp` armazenado (que foi calculado em
 * base 24h) e então re-aplicado sobre o teto correto:
 *
 *   downtime = (1 - disp_original / 100) × HORAS_MES[mes]
 *   disp_corrigida = ((teto_mes - downtime) / teto_mes) × 100
 *
 * Para elevadores a função é identidade (retorna `record.disp` inalterado).
 */
export function calcDisp(
  record: MaintenanceRecord,
  equipType: EquipmentType
): number {
  if (record.baseHours) {
    return record.disp;
  }

  if (equipType === 'elevadores') {
    // Elevadores mantêm o regime original de 24h/dia
    return record.disp;
  }

  // Escadas Rolantes: regime de 12h/dia
  const horasMes24h: number = HORAS_MES[record.mes] ?? 720;
  const horasMes12h: number = HORAS_ESCADA_MES[record.mes] ?? 360;

  // Downtime efetivo em horas (derivado do disp original em base 24h)
  const downtimeHoras: number = ((100 - record.disp) / 100) * horasMes24h;

  // Disponibilidade recalculada sobre o novo teto de 12h/dia
  const dispCorrigida: number =
    ((horasMes12h - downtimeHoras) / horasMes12h) * 100;

  // Clamp entre 0 e 100 (downtime nunca deve exceder o teto comercial)
  return parseFloat(Math.max(0, Math.min(100, dispCorrigida)).toFixed(1));
}

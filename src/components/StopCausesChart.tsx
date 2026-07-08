/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Occurrence, EquipmentType } from '../types';

interface StopCausesChartProps {
  occurrences: Occurrence[];
  equipmentType: EquipmentType;
}

interface CauseData {
  causa: string;
  count: number;
  percentage: number;
}

export default function StopCausesChart({ occurrences, equipmentType }: StopCausesChartProps) {
  // Memoized computation of the top 5 stop causes
  const topCauses = useMemo(() => {
    // Step 1: Filter out closed occurrences and those without causa_parada
    const filteredByStatus = occurrences.filter(occ => occ.end && occ.causa_parada);

    // Step 2: Filter to keep only occurrences matching the equipmentType
    const filteredByType = filteredByStatus.filter(occ => occ.type === equipmentType);

    // Step 3: Group by causa_parada and count frequency
    const causeCounts: Record<string, number> = {};
    filteredByType.forEach(occ => {
      const causa = occ.causa_parada!;
      causeCounts[causa] = (causeCounts[causa] || 0) + 1;
    });

    // Step 4: Convert to array, sort descending, and limit to top 5
    const causesArray = Object.entries(causeCounts)
      .map(([causa, count]) => ({ causa, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Step 5: Calculate percentages based on max count
    const maxCount = causesArray.length > 0 ? causesArray[0].count : 1;
    return causesArray.map(item => ({
      ...item,
      percentage: (item.count / maxCount) * 100
    }));
  }, [occurrences, equipmentType]);

  // Dynamic title based on equipmentType
  const chartTitle = `Principais Causas de Parada`;

  return (
    <div className="h-full flex flex-col min-h-[300px] bg-white p-6 rounded-[24px] shadow-xl border border-brand-dark-red/5">
      {/* Header */}
      <h2 className="text-center font-bold text-brand-dark-red uppercase text-sm tracking-widest mb-6">
        {chartTitle}
      </h2>

      {/* Chart Container - Increased height for more space */}
      <div className="flex-1 flex flex-col justify-start gap-3">
        {topCauses.length > 0 ? (
          topCauses.map((cause, index) => (
            <div key={`${cause.causa}-${index}`} className="flex items-center gap-3 flex-1">
              {/* Cause Label - Larger width */}
              <div className="w-40 flex-shrink-0">
                <p className="text-xs font-bold text-brand-dark-red uppercase truncate tracking-tight">
                  {cause.causa}
                </p>
              </div>

              {/* Bar Container */}
              <div className="flex-1 flex items-center gap-2">
                {/* Horizontal Bar */}
                <div className="flex-1 h-10 bg-gray-100 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-[#7A1919] rounded transition-all duration-500 ease-out flex items-center justify-end pr-3"
                    style={{ width: `${cause.percentage}%`, minWidth: '2px' }}
                  >
                    {cause.percentage > 20 && (
                      <span className="text-[10px] font-bold text-white truncate">
                        {cause.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Sem dados disponíveis
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Nenhuma ocorrência fechada com causa de parada registrada
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {topCauses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic text-center">
            Top 5 causas mais frequentes • Total de {topCauses.reduce((sum, c) => sum + c.count, 0)} ocorrências
          </p>
        </div>
      )}
    </div>
  );
}

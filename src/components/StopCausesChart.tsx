/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
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

  const [isExpanded, setIsExpanded] = useState(false);
  
  // Dynamic title based on equipmentType
  const chartTitle = `Principais Causas de Parada`;

  const ChartContent = ({ expanded = false }: { expanded?: boolean }) => (
    <>
      {/* Header */}
      <div className="relative mb-6">
        {!expanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 rounded-lg transition-all"
            title="Expandir gráfico"
          >
            <Maximize2 className="w-4 h-4" /> 
          </button>
        )}
        <h2 className={`text-center font-bold text-brand-dark-red uppercase tracking-widest ${expanded ? 'text-xl' : 'text-sm'}`}>
          {chartTitle}
        </h2>
      </div>

      {/* Chart Container */}
      <div className={`flex-1 flex flex-col justify-start ${expanded ? 'gap-6' : 'gap-3'}`}>
        {topCauses.length > 0 ? (
          topCauses.map((cause, index) => (
            <div key={`${cause.causa}-${index}`} className="flex items-center gap-3 flex-1">
              {/* Cause Label */}
              <div className={`${expanded ? 'w-64' : 'w-40'} flex-shrink-0`}>
                <p className={`${expanded ? 'text-base' : 'text-xs'} font-bold text-brand-dark-red uppercase truncate tracking-tight`}>
                  {cause.causa}
                </p>
              </div>

              {/* Bar Container */}
              <div className="flex-1 flex items-center gap-2">
                <div className={`flex-1 ${expanded ? 'h-16' : 'h-10'} bg-gray-100 rounded overflow-hidden relative`}>
                  <div
                    className="h-full bg-[#7A1919] rounded transition-all duration-500 ease-out flex items-center justify-end pr-3"
                    style={{ width: `${cause.percentage}%`, minWidth: '2px' }}
                  >
                    {cause.percentage > 20 && (
                      <span className={`${expanded ? 'text-sm' : 'text-[10px]'} font-bold text-white truncate`}>
                        {cause.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
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
        <div className={`mt-6 pt-4 border-t border-gray-100 ${expanded ? 'pb-4' : ''}`}>
          <p className={`${expanded ? 'text-sm' : 'text-xs'} text-gray-500 italic text-center`}>
            Top 5 causas mais frequentes • Total de {topCauses.reduce((sum, c) => sum + c.count, 0)} ocorrências
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="h-full flex flex-col min-h-[300px] bg-white p-6 rounded-[24px] shadow-xl border border-brand-dark-red/5 relative">
        <ChartContent />
      </div>

      {/* Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 lg:p-12">
          <div className="bg-white rounded-[24px] w-full h-full max-h-[800px] max-w-5xl relative flex flex-col p-8 lg:p-12 shadow-2xl">
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <ChartContent expanded={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart 
} from 'recharts';
import { Maximize2, X } from 'lucide-react';
import { MaintenanceRecord, EquipmentType, Occurrence } from '../types';
import { MESES_ORDEM, ESCADAS_LIST, ELEVADORES_LIST } from '../data/initialData';
import { parseTime, calcDisp } from '../lib/utils';
import StopCausesChart from './StopCausesChart';

interface StatsChartsProps {
  type: EquipmentType;
  data: MaintenanceRecord[];
  allData: MaintenanceRecord[];
  selectedEquips: string[];
  selectedMonths: string[];
  occurrences: Occurrence[];
}

const COLORS = ['#79030f', '#ab0303', '#b76058', '#d4c2ae', '#4a0209', '#e8877e', '#2b2b2b', '#942b2b'];

export default function StatsCharts({ type, data, allData, selectedEquips, selectedMonths, occurrences }: StatsChartsProps) {
  const [hoveredTitle, setHoveredTitle] = useState<'mtbf' | 'mttr' | null>(null);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const equipList = type === 'escadas' ? ESCADAS_LIST : ELEVADORES_LIST;
  const commercialMonthHours = type === 'elevadores' ? 720 : 360;

  // 1. Chart Data: Disponibilidade por Equipamento ou Meses
  interface CausaChartData {
  name: string;
  quantidade: number;
}

  const barData = useMemo(() => {
    const isMultiEquip = selectedEquips.length !== 1;
    const labels = isMultiEquip ? equipList : MESES_ORDEM.filter(m => data.some(d => d.mes === m));
    
    return labels.map(label => {
      const matched = data.filter(d => (isMultiEquip ? d.equip : d.mes) === label);
      // No calls = 100% Availability
      const avgDisp = matched.length > 0 
        ? matched.reduce((acc, curr) => acc + calcDisp(curr, type), 0) / matched.length
        : 100;
      
      return {
        name: label,
        disp: parseFloat(avgDisp.toFixed(1)),
        meta: 85
      };
    }).filter(d => {
      if (isMultiEquip) {
        return selectedEquips.length === 0 || selectedEquips.includes(d.name);
      }
      return true;
    });
  }, [data, selectedEquips, equipList, type]);

  // 2. Chart Data: Trend Mensal
  const trendData = useMemo(() => {
    const trendBase = selectedEquips.length > 0 ? allData.filter(d => selectedEquips.includes(d.equip)) : allData;
    const meses = MESES_ORDEM.filter(m => {
      const hasData = allData.some(d => d.mes === m);
      const isSelected = selectedMonths.length === 0 || selectedMonths.includes(m);
      return hasData && isSelected;
    });

    return meses.map(m => {
      const mData = trendBase.filter(d => d.mes === m);
      const avg = mData.length > 0 ? mData.reduce((a, c) => a + calcDisp(c, type), 0) / mData.length : 100;
      return {
        name: m,
        disp: parseFloat(avg.toFixed(1)),
        meta: 97
      };
    }).filter(d => d.disp > 0);
  }, [allData, selectedEquips, selectedMonths, type]);

  // 3. Chart Data: Pie Chamados
  const pieData = useMemo(() => {
    const isMultiEquip = selectedEquips.length !== 1;
    const counts: Record<string, number> = {};
    data.forEach(d => {
      if (d.chamados > 0) {
        const key = isMultiEquip ? d.equip : d.mes;
        counts[key] = (counts[key] || 0) + d.chamados;
      }
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data, selectedEquips]);

  // 4. Chart Data: MTBF & MTTR
  const maintenanceData = useMemo(() => {
    const isMultiEquip = selectedEquips.length !== 1;
    const labels = isMultiEquip ? equipList : MESES_ORDEM.filter(m => data.some(d => d.mes === m));
    
    const monthsInScope = selectedMonths.length > 0 
      ? selectedMonths 
      : Array.from(new Set(allData.map(d => d.mes)));
    
    const totalHoursInScope = monthsInScope.length * commercialMonthHours;
    
    return labels.map(label => {
      const matched = data.filter(d => (isMultiEquip ? d.equip : d.mes) === label);
      
      let avgMtbf: number;
      let avgMttr: number;

      if (matched.length > 0) {
        avgMtbf = matched.reduce((acc, curr) => acc + parseTime(curr.mtbf), 0) / matched.length;
        avgMttr = matched.reduce((acc, curr) => acc + parseTime(curr.mttr), 0) / matched.length;
      } else {
        // Default values for items with no failures
        avgMtbf = isMultiEquip ? totalHoursInScope : commercialMonthHours;
        avgMttr = 0;
      }
      
      return {
        name: label,
        mtbf: parseFloat(avgMtbf.toFixed(2)),
        mttr: parseFloat(avgMttr.toFixed(2))
      };
    }).filter(d => {
      if (isMultiEquip) {
        return selectedEquips.length === 0 || selectedEquips.includes(d.name);
      }
      return true;
    });
  }, [data, allData, selectedEquips, selectedMonths, equipList, commercialMonthHours]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Bar Chart Disp */}
        <div className="chart-container lg:col-span-2 relative">
          <button
            onClick={() => setExpandedChart('disp')}
            className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 rounded-lg transition-all"
            title="Expandir gráfico"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <h2 className="text-center font-bold text-brand-dark-red uppercase text-sm tracking-widest mb-6">
            Disponibilidade por {selectedEquips.length === 1 ? 'Período' : 'Equipamento'} (%)
          </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" fontSize={10} tick={{ fill: '#555' }} />
              <YAxis domain={[40, 105]} fontSize={10} tick={{ fill: '#555' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                formatter={(v: number) => [`${v}%`, 'Disponibilidade']}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="disp" name="Disponibilidade (%)" fill="#79030f" radius={[4, 4, 0, 0]} barSize={40} />
              <Line dataKey="meta" name="Meta Individual (85%)" stroke="#2b2b2b" strokeDasharray="5 5" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Line Chart Trend */}
      <div className="chart-container relative">
        <button
          onClick={() => setExpandedChart('trend')}
          className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 rounded-lg transition-all"
          title="Expandir gráfico"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <h2 className="text-center font-bold text-brand-dark-red uppercase text-sm tracking-widest mb-6">
          Disponibilidade Média Mensal (%)
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis domain={[60, 105]} fontSize={10} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Média']} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="disp" name="Média Mensal (%)" stroke="#ab0303" strokeWidth={3} dot={{ r: 5, fill: '#ab0303' }} label={(props: any) => (
                <text x={props.x} y={props.y - 10} fill="#ab0303" fontSize={10} fontWeight="bold" textAnchor="middle">{props.value}%</text>
              )} />
              <Line dataKey="meta" name="Meta Mensal (97%)" stroke="#2b2b2b" strokeDasharray="5 5" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Pie Chart Chamados */}
      <div className="chart-container text-center relative">
        <button
          onClick={() => setExpandedChart('pie')}
          className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 rounded-lg transition-all"
          title="Expandir gráfico"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <h2 className="text-center font-bold text-brand-dark-red uppercase text-sm tracking-widest mb-6">
          Proporção de Chamados
        </h2>
        <div className="h-[300px]">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted italic opacity-50">
              Sem chamados no período
            </div>
          )}
        </div>
      </div>

{/* 4. MTBF Bar */}
      <div className="chart-container relative">
        <button
          onClick={() => setExpandedChart('mtbf')}
          className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 rounded-lg transition-all"
          title="Expandir gráfico"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <h2
          className="text-center font-bold text-brand-dark-red uppercase text-sm tracking-widest mb-6 cursor-help relative"
          onMouseEnter={() => setHoveredTitle('mtbf')}
          onMouseLeave={() => setHoveredTitle(null)}
        >
          MTBF - Tempo Médio Entre Falhas (Horas)
          {hoveredTitle === 'mtbf' && (
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 px-4 py-3 bg-stone-900 text-white text-[10px] leading-relaxed font-medium rounded-xl shadow-2xl z-50 text-center">
              Mede o tempo que um equipamento funciona sem quebrar. Quanto maior for, melhor.
            </span>
          )}
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip formatter={(v: number) => {
                const days = (v / 24).toFixed(1);
                return [`${v}h (${days} dias)`, 'MTBF'];
              }} />
              <Bar dataKey="mtbf" name="MTBF (Horas)" fill="#b76058" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

{/* 5. MTTR Bar */}
      <div className="chart-container relative">
        <button
          onClick={() => setExpandedChart('mttr')}
          className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-brand-red bg-gray-50 hover:bg-red-50 rounded-lg transition-all"
          title="Expandir gráfico"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <h2
          className="text-center font-bold text-brand-dark-red uppercase text-sm tracking-widest mb-6 cursor-help relative"
          onMouseEnter={() => setHoveredTitle('mttr')}
          onMouseLeave={() => setHoveredTitle(null)}
        >
          MTTR - Tempo Médio para Reparo (Horas)
          {hoveredTitle === 'mttr' && (
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 px-4 py-3 bg-stone-900 text-white text-[10px] leading-relaxed font-medium rounded-xl shadow-2xl z-50 text-center">
              Mede o tempo que a máquina fica parada até ser consertada. Quanto menor for, melhor.
            </span>
          )}
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip formatter={(v: number) => {
                const days = (v / 24).toFixed(2);
                return [`${v}h (${days} dias)`, 'MTTR'];
               }} />
               <Bar dataKey="mttr" name="MTTR (Horas)" fill="#2b2b2b" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
         </div>
       </div>

       {/* 6. Stop Causes Chart - Full width like Availability chart */}
       <div className="lg:col-span-2">
         <StopCausesChart 
           occurrences={occurrences}
           equipmentType={type}
         />
       </div>
     </div>

      {expandedChart && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 lg:p-12">
          <div className="bg-white rounded-[24px] w-full h-full max-h-[800px] max-w-6xl relative flex flex-col p-8 lg:p-12 shadow-2xl">
            <button 
              onClick={() => setExpandedChart(null)}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 w-full h-full">
              {expandedChart === 'disp' && (
                <>
                  <h2 className="text-center font-bold text-brand-dark-red uppercase text-xl tracking-widest mb-8">
                    Disponibilidade por {selectedEquips.length === 1 ? 'Período' : 'Equipamento'} (%)
                  </h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <ComposedChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" fontSize={12} tick={{ fill: '#555' }} />
                      <YAxis domain={[40, 105]} fontSize={12} tick={{ fill: '#555' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(v: number) => [`${v}%`, 'Disponibilidade']}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="disp" name="Disponibilidade (%)" fill="#79030f" radius={[4, 4, 0, 0]} barSize={60} />
                      <Line dataKey="meta" name="Meta Individual (85%)" stroke="#2b2b2b" strokeDasharray="5 5" dot={false} strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              )}

              {expandedChart === 'trend' && (
                <>
                  <h2 className="text-center font-bold text-brand-dark-red uppercase text-xl tracking-widest mb-8">
                    Disponibilidade Média Mensal (%)
                  </h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={[60, 105]} fontSize={12} />
                      <Tooltip formatter={(v: number) => [`${v}%`, 'Média']} />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="disp" name="Média Mensal (%)" stroke="#ab0303" strokeWidth={4} dot={{ r: 6, fill: '#ab0303' }} label={(props: any) => (
                        <text x={props.x} y={props.y - 15} fill="#ab0303" fontSize={12} fontWeight="bold" textAnchor="middle">{props.value}%</text>
                      )} />
                      <Line dataKey="meta" name="Meta Mensal (97%)" stroke="#2b2b2b" strokeDasharray="5 5" dot={false} strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              )}

              {expandedChart === 'pie' && (
                <>
                  <h2 className="text-center font-bold text-brand-dark-red uppercase text-xl tracking-widest mb-8">
                    Proporção de Chamados
                  </h2>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={120}
                          outerRadius={200}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-muted italic opacity-50 text-xl">
                      Sem chamados no período
                    </div>
                  )}
                </>
              )}

              {expandedChart === 'mtbf' && (
                <>
                  <h2 className="text-center font-bold text-brand-dark-red uppercase text-xl tracking-widest mb-8">
                    MTBF - Tempo Médio Entre Falhas (Horas)
                  </h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={maintenanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(v: number) => {
                        const days = (v / 24).toFixed(1);
                        return [`${v}h (${days} dias)`, 'MTBF'];
                      }} />
                      <Bar dataKey="mtbf" name="MTBF (Horas)" fill="#b76058" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}

              {expandedChart === 'mttr' && (
                <>
                  <h2 className="text-center font-bold text-brand-dark-red uppercase text-xl tracking-widest mb-8">
                    MTTR - Tempo Médio para Reparo (Horas)
                  </h2>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={maintenanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(v: number) => {
                        const days = (v / 24).toFixed(2);
                        return [`${v}h (${days} dias)`, 'MTTR'];
                      }} />
                      <Bar dataKey="mttr" name="MTTR (Horas)" fill="#2b2b2b" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>
        </div>
      )}
   </>
  );
}

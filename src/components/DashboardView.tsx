/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Filter, AlertTriangle, TrendingUp, Hash, Clock, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaintenanceRecord, EquipmentType, Occurrence } from '../types';
import { MESES_ORDEM, ESCADAS_LIST, ELEVADORES_LIST } from '../data/initialData';
import { calcDisp } from '../lib/utils';
import StatsCharts from './StatsCharts';
import PageHeader from './PageHeader';

interface DashboardViewProps {
  type: EquipmentType;
  data: MaintenanceRecord[];
  onBack: () => void;
  onOpenOccurrence: () => void;
  occurrences: Occurrence[];
}

export default function DashboardView({ type, data, onBack, onOpenOccurrence, occurrences }: DashboardViewProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedEquips, setSelectedEquips] = useState<string[]>([]);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isEquipDropdownOpen, setIsEquipDropdownOpen] = useState(false);

  const equipList = type === 'escadas' ? ESCADAS_LIST : ELEVADORES_LIST;
  const mesesDisponiveis = useMemo(() => {
    const meses = Array.from(new Set(data.map(d => d.mes)));
    return MESES_ORDEM.filter(m => meses.includes(m));
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (selectedMonths.length > 0) result = result.filter(d => selectedMonths.includes(d.mes));
    if (selectedEquips.length > 0) result = result.filter(d => selectedEquips.includes(d.equip));
    return result;
  }, [data, selectedMonths, selectedEquips]);

  const filteredOccurrences = useMemo(() => {
    let result = [...occurrences];
    if (selectedMonths.length > 0) {
      result = result.filter(o => selectedMonths.includes(MESES_ORDEM[new Date(o.start).getMonth()]));
    }
    if (selectedEquips.length > 0) {
      result = result.filter(o => selectedEquips.includes(o.equip));
    }
    return result;
  }, [occurrences, selectedMonths, selectedEquips]);

  const kpis = useMemo(() => {
    const totalChamados = filteredData.reduce((acc, curr) => acc + curr.chamados, 0);
    const mediaDisp = filteredData.length > 0 
      ? (filteredData.reduce((acc, curr) => acc + calcDisp(curr, type), 0) / filteredData.length).toFixed(1)
      : '0';
    
    let criticalEq = '-';
    let lowestDisp = 100;
    
    filteredData.forEach(d => {
      const disp = calcDisp(d, type);
      if (disp < lowestDisp) {
        lowestDisp = disp;
        criticalEq = d.equip;
      }
    });

    return { totalChamados, mediaDisp, criticalEq, lowestDisp };
  }, [filteredData, type]);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader
        title={`Dashboard ${type === 'escadas' ? 'Escadas Rolantes' : 'Elevadores'}`}
        onBack={onBack}
        actions={
          <>
            <div className="relative">
              <button 
                onClick={() => setIsEquipDropdownOpen(!isEquipDropdownOpen)}
                className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                <Filter size={16} className="text-brand-beige" />
                <span className="max-w-[120px] truncate">
                  {selectedEquips.length === 0 ? 'Todos os Equipamentos' : 
                   selectedEquips.length === 1 ? selectedEquips[0] : 
                   `${selectedEquips.length} Equips`}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isEquipDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isEquipDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsEquipDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-20 py-2 border border-brand-beige/30 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setSelectedEquips([]);
                          setIsEquipDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-brand-bg/50 transition-colors flex items-center justify-between text-black font-medium"
                      >
                        Todos os Equipamentos
                        {selectedEquips.length === 0 && <Check size={14} className="text-brand-red" />}
                      </button>
                      <div className="h-px bg-brand-beige/30 my-1" />
                      <div className="max-h-64 overflow-y-auto">
                        {equipList.map(eq => (
                          <button
                            key={eq}
                            onClick={() => {
                              const newEquips = selectedEquips.includes(eq)
                                ? selectedEquips.filter(e => e !== eq)
                                : [...selectedEquips, eq];
                              setSelectedEquips(newEquips);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-brand-bg/50 transition-colors flex items-center justify-between text-black"
                          >
                            {eq}
                            {selectedEquips.includes(eq) && <Check size={14} className="text-brand-red" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                <Clock size={16} className="text-brand-beige" />
                <span>
                  {selectedMonths.length === 0 ? 'Todos os Meses' : 
                   selectedMonths.length === 1 ? selectedMonths[0] : 
                   `${selectedMonths.length} Meses`}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMonthDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsMonthDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl z-20 py-2 border border-brand-beige/30 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setSelectedMonths([]);
                          setIsMonthDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-brand-bg/50 transition-colors flex items-center justify-between text-black font-medium"
                      >
                        Todos os Meses
                        {selectedMonths.length === 0 && <Check size={14} className="text-brand-red" />}
                      </button>
                      <div className="h-px bg-brand-beige/30 my-1" />
                      {mesesDisponiveis.map(m => (
                        <button
                          key={m}
                          onClick={() => {
                            const newMonths = selectedMonths.includes(m)
                              ? selectedMonths.filter(sm => sm !== m)
                              : [...selectedMonths, m];
                            setSelectedMonths(newMonths);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-brand-bg/50 transition-colors flex items-center justify-between text-black"
                        >
                          {m}
                          {selectedMonths.includes(m) && <Check size={14} className="text-brand-red" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="kpi-card group hover:translate-y-[-2px] transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total de Chamados</p>
              <h3 className="text-3xl font-black text-brand-red">{kpis.totalChamados}</h3>
            </div>
            <div className="p-2 bg-brand-red/10 rounded-lg text-brand-red">
              <Hash size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-text-muted italic opacity-75">
            Acumulado do período selecionado
          </div>
        </div>

        <div className="kpi-card group hover:translate-y-[-2px] transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Disponibilidade Média</p>
              <h3 className="text-3xl font-black text-brand-red">{kpis.mediaDisp}%</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-red rounded-full" 
                style={{ width: `${kpis.mediaDisp}%` }}
              />
            </div>
          </div>
        </div>

        <div className="kpi-card border-l-black group hover:translate-y-[-2px] transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Equipamento Crítico</p>
              <h3 className="text-xl font-black text-black break-words mt-1">
                {kpis.criticalEq !== '-' ? `${kpis.criticalEq} (${kpis.lowestDisp}%)` : '-'}
              </h3>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-text-muted italic opacity-75">
            Menor disponibilidade registrada
          </div>
        </div>
      </div>

      {/* Charts Section */}
        <StatsCharts 
          type={type}
          data={filteredData}
          allData={data}
          selectedEquips={selectedEquips}
          selectedMonths={selectedMonths}
          occurrences={filteredOccurrences}
        />
    </div>
  );
}

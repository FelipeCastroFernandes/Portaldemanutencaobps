/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Power, BarChart3, Settings, PlusCircle, ArrowLeft, ClipboardList, ArrowUpToLine, ArrowUpRight } from 'lucide-react';
import { Occurrence } from '../types';
import { ELEVADORES_LIST, ESCADAS_LIST } from '../data/initialData';

interface DashboardCoverProps {
  onNavigate: (page: 'escadas' | 'elevadores') => void;
  onViewOrders: () => void;
  onOpenOccurrence: () => void;
  onBack: () => void;
  occurrences: Occurrence[];
}

export default function DashboardCover({ onNavigate, onViewOrders, onOpenOccurrence, onBack, occurrences }: DashboardCoverProps) {
  const getAvailability = (type: 'escadas' | 'elevadores') => {
    const list = type === 'escadas' ? ESCADAS_LIST : ELEVADORES_LIST;
    const totalEquips = list.length;
    if (totalEquips === 0) return 100;

    // Periodo de referência: Últimos 30 dias (em minutos)
    const thirtyDaysInMinutes = 30 * 24 * 60;
    const totalPotentialMinutes = thirtyDaysInMinutes * totalEquips;

    // Calcular tempo parado total apenas de chamados FECHADOS
    const totalDowntimeMinutes = occurrences
      .filter(occ => occ.type === type && occ.end)
      .reduce((acc, occ) => {
        const start = new Date(occ.start).getTime();
        const end = new Date(occ.end!).getTime();
        const diffMinutes = (end - start) / (1000 * 60);
        return acc + diffMinutes;
      }, 0);

    const availability = ((totalPotentialMinutes - totalDowntimeMinutes) / totalPotentialMinutes) * 100;
    
    // Garantir que não seja negativo e arredondar
    return Math.max(0, Math.min(100, Math.round(availability * 10) / 10));
  };

  const escadasAvailability = getAvailability('escadas');
  const elevadoresAvailability = getAvailability('elevadores');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark-red p-6 text-center relative overflow-hidden pt-24 sm:pt-6">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar with Back and Logout buttons */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex justify-between items-center z-10">
        <button 
          onClick={onBack}
          className="text-white bg-white/10 hover:bg-white/20 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all px-5 py-2.5 rounded-full border border-white/5 shadow-lg backdrop-blur-sm"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        
        <button 
          onClick={() => {
            sessionStorage.removeItem('bps_auth');
            window.location.reload();
          }}
          className="text-white bg-white/10 hover:bg-white/20 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all px-5 py-2.5 rounded-full border border-white/5 shadow-lg backdrop-blur-sm"
        >
          <Power size={14} />
          Sair
        </button>
      </div>

      <motion.img 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        src="https://www.botafogopraiashopping.com.br/sites/botafogo-praia/files/styles/logo_header/public/shopping-media/Cabe%C3%A7alho%20e%20Rodap%C3%A9/bps_logo_header.png?itok=d7aZA7B_" 
        alt="Logo Botafogo Praia Shopping" 
        className="h-24 md:h-32 mb-12 z-10"
      />
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white text-3xl md:text-5xl font-extrabold tracking-widest mb-12 drop-shadow-md z-10 max-w-4xl leading-tight"
      >
        DASHBOARD DE TRANSPORTE VERTICAL
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 z-10 w-full max-w-6xl">
        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('elevadores')}
          className="bg-brand-bg text-brand-dark-red p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 transition-all border-b-4 border-brand-red group"
        >
          <div className="bg-brand-dark-red/5 p-4 rounded-xl group-hover:bg-brand-red group-hover:text-white transition-colors relative">
            <ArrowUpToLine size={32} />
            <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-black border ${
              elevadoresAvailability === 100 
                ? 'bg-emerald-500 border-emerald-600 text-white' 
                : 'bg-brand-red border-brand-dark-red text-white'
            }`}>
              {elevadoresAvailability}%
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-xl tracking-tight uppercase">ELEVADORES</span>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
              elevadoresAvailability === 100 ? 'text-emerald-600' : 'text-brand-red'
            }`}>
              Disponibilidade
            </span>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('escadas')}
          className="bg-brand-bg text-brand-dark-red p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 transition-all border-b-4 border-brand-red group"
        >
          <div className="bg-brand-dark-red/5 p-4 rounded-xl group-hover:bg-brand-red group-hover:text-white transition-colors relative">
            <ArrowUpRight size={32} />
            <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-black border ${
              escadasAvailability === 100 
                ? 'bg-emerald-500 border-emerald-600 text-white' 
                : 'bg-brand-red border-brand-dark-red text-white'
            }`}>
              {escadasAvailability}%
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black text-xl tracking-tight uppercase">ESCADAS ROLANTES</span>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
              escadasAvailability === 100 ? 'text-emerald-600' : 'text-brand-red'
            }`}>
              Disponibilidade
            </span>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewOrders}
          className="bg-brand-bg text-brand-dark-red p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 transition-all border-b-4 border-brand-red group"
        >
          <div className="bg-brand-dark-red/5 p-4 rounded-xl group-hover:bg-brand-red group-hover:text-white transition-colors">
            <ClipboardList size={32} />
          </div>
          <span className="font-black text-xl tracking-tight uppercase">ORDENS DE SERVIÇO</span>
        </motion.button>
      </div>

      <div className="flex flex-col items-center gap-6 z-10">
        <button 
          onClick={onOpenOccurrence}
          className="bg-white hover:bg-brand-beige text-brand-dark-red flex items-center gap-3 px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
        >
          <PlusCircle size={20} />
          ABRIR NOVA OCORRÊNCIA
        </button>

        <div className="text-brand-beige/30 text-[10px] font-mono uppercase tracking-[0.4em] mt-8">
          BPS MAINTENANCE PORTAL • 2026
        </div>
      </div>
    </div>
  );
}

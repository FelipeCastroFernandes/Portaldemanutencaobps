/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ArrowUpDown, Power, ClipboardList, UserPlus } from 'lucide-react';
import { User } from '../types';

interface MainPortalProps {
  onEscadas: () => void;
  onElevadores: () => void;
  onOrders: () => void;
  onTasks: () => void;
  onManageUsers: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

export default function MainPortal({ onEscadas, onElevadores, onOrders, onTasks, onManageUsers, onLogout, currentUser }: MainPortalProps) {
  console.log('[MainPortal] currentUser:', currentUser?.email, 'profile:', currentUser?.profile, '| len:', currentUser?.profile?.length);
  console.log('[MainPortal] check Gestor:', currentUser?.profile === 'Gestor');
  console.log('[MainPortal] check Planejador:', currentUser?.profile === 'Planejador');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark-red p-6 text-center relative overflow-hidden pt-24 sm:pt-6">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-red opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-red opacity-50" />
      
      {/* Logout button */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50">
        <button 
          onClick={onLogout}
          className="text-white bg-white/10 hover:bg-white/20 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all px-5 py-2.5 rounded-full border border-white/5 shadow-lg backdrop-blur-sm cursor-pointer"
        >
          <Power size={14} />
          Sair do Portal
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center z-10 w-full max-w-4xl"
      >
        <motion.img 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src="https://www.botafogopraiashopping.com.br/sites/botafogo-praia/files/styles/logo_header/public/shopping-media/Cabe%C3%A7alho%20e%20Rodap%C3%A9/bps_logo_header.png?itok=d7aZA7B_" 
          alt="Logo BPS" 
          className="h-20 md:h-24 mb-6"
        />

        {currentUser && (
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase text-brand-beige/60 tracking-[0.3em] mb-1">Bem-vindo(a) ao Portal</p>
            <p className="text-white text-lg font-black uppercase tracking-tight">{currentUser.fullName}</p>
          </div>
        )}

        <div className="space-y-2 mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter"
          >
            Portal de Manutenção
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1.5 w-32 bg-brand-red mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onEscadas}
            className="group flex flex-col items-center justify-center bg-brand-bg text-brand-dark-red p-8 rounded-3xl shadow-2xl transition-all border-b-8 border-brand-red"
          >
            <div className="bg-brand-dark-red/10 p-5 rounded-2xl group-hover:bg-brand-dark-red transition-colors mb-6">
              <ArrowUpDown size={32} className="group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <span className="block text-lg font-black uppercase tracking-tighter leading-none mb-2">Transporte Vertical</span>
              <span className="text-[9px] font-bold text-brand-dark-red/50 uppercase tracking-[0.2em] block">Escadas e Elevadores</span>
            </div>
          </motion.button>

          {(currentUser?.profile === 'Gestor' || currentUser?.profile === 'Planejador') && (
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onTasks}
              className="group flex flex-col items-center justify-center bg-brand-bg text-brand-dark-red p-8 rounded-3xl shadow-2xl transition-all border-b-8 border-brand-red"
            >
              <div className="bg-brand-dark-red/10 p-5 rounded-2xl group-hover:bg-brand-dark-red transition-colors mb-6">
                <ClipboardList size={32} className="group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <span className="block text-lg font-black uppercase tracking-tighter leading-none mb-2">Gestão de Tarefas</span>
                <span className="text-[9px] font-bold text-brand-dark-red/50 uppercase tracking-[0.2em] block">Painel de Capacidade</span>
              </div>
            </motion.button>
          )}

          {currentUser?.profile === 'Gestor' && (
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onManageUsers}
              className="group flex flex-col items-center justify-center bg-brand-bg text-brand-dark-red p-8 rounded-3xl shadow-2xl transition-all border-b-8 border-brand-red"
            >
              <div className="bg-brand-dark-red/10 p-5 rounded-2xl group-hover:bg-brand-dark-red transition-colors mb-6">
                <UserPlus size={32} className="group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <span className="block text-lg font-black uppercase tracking-tighter leading-none mb-2">Gestão de Usuários</span>
                <span className="text-[9px] font-bold text-brand-dark-red/50 uppercase tracking-[0.2em] block">Controle de Acessos</span>
              </div>
            </motion.button>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-20 text-[10px] font-black text-brand-beige uppercase tracking-[0.4em]"
        >
          Intranet BPS • 2026
        </motion.div>
      </motion.div>
      
      {/* Decorative large text in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="text-[20vw] font-black text-white/[0.02] uppercase tracking-tighter whitespace-nowrap">
          MAINTENANCE
        </span>
      </div>
    </div>
  );
}

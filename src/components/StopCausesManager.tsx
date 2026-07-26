/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Tag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from './PageHeader';
import { StopCause, EquipmentType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface StopCausesManagerProps {
  stopCauses: StopCause[];
  onBack: () => void;
  onReload: () => void;
}

export default function StopCausesManager({ stopCauses, onBack, onReload }: StopCausesManagerProps) {
  const [filterType, setFilterType] = useState<'all' | EquipmentType>('all');
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<EquipmentType>('escadas');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    return stopCauses.filter(c => {
      const matchType = filterType === 'all' || c.type === filterType;
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [stopCauses, filterType, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed) return;
    if (stopCauses.some(c => c.name.toUpperCase() === trimmed && c.type === newType)) {
      setError('Já existe uma causa com esse nome para esse tipo de equipamento.');
      return;
    }
    setIsAdding(true);
    setError('');
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: sbError } = await supabase
          .from('stop_causes')
          .insert({ type: newType, name: trimmed });
        if (sbError) throw sbError;
        setNewName('');
        onReload();
      } else {
        setError('Supabase não configurado.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar causa.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta causa de parada?')) return;
    setDeletingId(id);
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('stop_causes').delete().eq('id', id);
        onReload();
      }
    } catch (err: any) {
      alert('Erro ao remover: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const escadasCount = stopCauses.filter(c => c.type === 'escadas').length;
  const elevadoresCount = stopCauses.filter(c => c.type === 'elevadores').length;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12 pt-6">
      <PageHeader title="Causas de Parada" onBack={onBack} />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: stopCauses.length, color: 'text-brand-dark-red', bg: 'bg-white' },
            { label: 'Escadas', value: escadasCount, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Elevadores', value: elevadoresCount, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`${stat.bg} p-6 rounded-2xl border-2 border-brand-dark-red/5`}
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{String(stat.value).padStart(2, '0')}</p>
            </motion.div>
          ))}
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-dark-red/5 shadow-sm">
          <h2 className="text-xs font-black text-brand-dark-red uppercase tracking-widest mb-4 flex items-center gap-2">
            <Plus size={14} /> Nova Causa de Parada
          </h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nome da causa (ex: SENSOR DE PORTA)"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(''); }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-dark-red placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red/30 uppercase"
              />
            </div>
            <div className="relative">
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as EquipmentType)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-8 text-sm font-black text-brand-dark-red focus:outline-none focus:ring-2 focus:ring-brand-red/30 cursor-pointer"
              >
                <option value="escadas">Escadas</option>
                <option value="elevadores">Elevadores</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={isAdding || !newName.trim()}
              className="flex items-center gap-2 bg-brand-dark-red text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus size={14} />
              {isAdding ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
          {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
        </div>

        {/* Filter & Search */}
        <div className="bg-white p-2 rounded-2xl border-2 border-brand-dark-red/5 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
          <div className="relative flex-1 w-full pl-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark-red/30" size={18} />
            <input
              type="text"
              placeholder="Buscar causa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm font-bold text-brand-dark-red placeholder:text-brand-dark-red/30 outline-none"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-brand-dark-red/5 rounded-xl">
            {(['all', 'escadas', 'elevadores'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterType === t
                    ? 'bg-brand-dark-red text-white shadow-lg'
                    : 'text-brand-dark-red/40 hover:text-brand-dark-red hover:bg-white'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'escadas' ? 'Escadas' : 'Elevadores'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? filtered.map((cause, idx) => (
              <motion.div
                key={cause.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl px-6 py-4 border-2 border-brand-dark-red/5 hover:border-brand-red/20 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${cause.type === 'escadas' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Tag size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-brand-dark-red uppercase tracking-tight">{cause.name}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${cause.type === 'escadas' ? 'text-orange-400' : 'text-blue-400'}`}>
                      {cause.type === 'escadas' ? 'Escada' : 'Elevador'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cause.id)}
                  disabled={deletingId === cause.id}
                  className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Remover causa"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            )) : (
              <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                <div className="p-8 bg-brand-dark-red/5 rounded-full text-brand-dark-red/20">
                  <Tag size={48} />
                </div>
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Nenhuma causa encontrada</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

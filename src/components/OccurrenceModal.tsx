import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Calendar, Clock, User, Hash, CheckCircle2, History, AlertCircle, Trash2, PlusCircle, ClipboardList, PauseCircle, Play } from 'lucide-react';
import { CAUSAS_PARADA_BY_TYPE, EquipmentType, Occurrence, User as UserType } from '../types';
import { ESCADAS_LIST, ELEVADORES_LIST } from '../data/initialData';
import { getLocalTimezoneOffset } from '../lib/utils';

interface OccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  occurrences: Occurrence[];
  users: UserType[];
  currentUser: UserType | null;
  onAdd: (occ: Occurrence) => void;
  onUpdate: (occ: Occurrence) => void;
  onDelete: (id: string) => void;
}

interface FormDataState {
  is_equipment_stopped: boolean;
  type: EquipmentType;
  equip: string;
  callNumber: string;
  attendant: string;
  createdBy: string;
  startDate: string;
  startTime: string;
}

interface ReturnFormDataState {
  technician: string;
  reason: string;
  causa_parada: string;
  closedBy: string;
  endDate: string;
  endTime: string;
}

const getInitialTime = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const getInitialFormData = (currentUser: UserType | null): FormDataState => ({
  is_equipment_stopped: false,
  type: 'escadas' as EquipmentType,
  equip: ESCADAS_LIST[0],
  callNumber: '',
  attendant: '',
  createdBy: currentUser?.fullName || '',
  startDate: new Date().toISOString().split('T')[0],
  startTime: getInitialTime(),
});

const getInitialReturnFormData = (): ReturnFormDataState => ({
  technician: '',
  reason: '',
  causa_parada: '',
  closedBy: '',
  endDate: new Date().toISOString().split('T')[0],
  endTime: getInitialTime(),
});

export default function OccurrenceModal({ 
  isOpen, 
  onClose, 
  occurrences, 
  users, 
  currentUser, 
  onAdd, 
  onUpdate, 
  onDelete 
}: OccurrenceModalProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [closingOccId, setClosingOccId] = useState<string | null>(null);
  const [deletingOccId, setDeletingOccId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormDataState>(getInitialFormData(currentUser));
  const [returnFormData, setReturnFormData] = useState<ReturnFormDataState>(getInitialReturnFormData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOcc: Occurrence = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      type: formData.type,
      equip: formData.equip,
      callNumber: formData.callNumber,
      attendant: formData.attendant,
      createdBy: formData.createdBy,
      start: `${formData.startDate}T${formData.startTime}:00${getLocalTimezoneOffset()}`,
      is_equipment_stopped: formData.is_equipment_stopped,
    };
    
    onAdd(newOcc);
    
    // Reset form to initial state
    setFormData(getInitialFormData(currentUser));
    setActiveTab('history');
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingOccId) return;
    
    const occ = occurrences.find(o => o.id === closingOccId);
    if (!occ) return;

    const endIso = `${returnFormData.endDate}T${returnFormData.endTime}:00${getLocalTimezoneOffset()}`;

    onUpdate({
      ...occ,
      end: endIso,
      technician: returnFormData.technician,
      reason: returnFormData.reason,
      causa_parada: returnFormData.causa_parada,
      closedBy: returnFormData.closedBy,
      extraScopeEnd: occ.extraScopeStart && !occ.extraScopeEnd ? endIso : occ.extraScopeEnd,
    });

    setClosingOccId(null);
    setReturnFormData(getInitialReturnFormData());
  };

   const handleOpenReturnForm = (id: string) => {
     setClosingOccId(id);
     setReturnFormData({
       technician: '',
       reason: '',
       causa_parada: '',
       closedBy: currentUser?.fullName || '',
       endDate: new Date().toISOString().split('T')[0],
       endTime: getInitialTime(),
     });
   };

   const handlePauseExtraScope = (occ: Occurrence) => {
     const now = new Date();
     const isoLocal = `${now.toISOString().split('T')[0]}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00${getLocalTimezoneOffset()}`;
     
     onUpdate({
       ...occ,
       extraScopeStart: isoLocal,
       extraScopeEnd: undefined,
     });
   };

   const handleResumeExtraScope = (occ: Occurrence) => {
     const now = new Date();
     const isoLocal = `${now.toISOString().split('T')[0]}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00${getLocalTimezoneOffset()}`;
     
     onUpdate({
       ...occ,
       extraScopeEnd: isoLocal,
     });
   };

   const canManage = currentUser?.profile === 'Gestor' || currentUser?.profile === 'Planejador';

   const isPaused = (occ: Occurrence) => !!occ.extraScopeStart && !occ.extraScopeEnd;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-dark-red/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="bg-brand-dark-red p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Plus size={24} />
              {closingOccId ? 'Registrar Retorno' : 'Registro de Ocorrências'}
            </h2>
            <p className="text-white/70 text-xs mt-1 uppercase tracking-widest font-bold">Gestão de Chamados em Tempo Real</p>
          </div>
          <button 
            onClick={() => {
              if (closingOccId) setClosingOccId(null);
              else onClose();
            }} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {!closingOccId && (
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'new' ? 'bg-white border-b-2 border-brand-red text-brand-red' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Plus size={16} /> Nova Ocorrência
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-white border-b-2 border-brand-red text-brand-red' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <History size={16} /> Histórico {occurrences.length > 0 && <span className="bg-brand-red text-white px-2 py-0.5 rounded-full text-[10px]">{occurrences.length}</span>}
            </button>
          </div>
        )}

        <div className="p-6 flex-1 overflow-y-auto bg-brand-bg/30">
          {closingOccId ? (
            (() => {
              const occToClose = occurrences.find(o => o.id === closingOccId);
              if (!occToClose) {
                return (
                  <div className="text-center py-12">
                    <p className="text-sm text-text-muted font-medium">Chamado não encontrado.</p>
                  </div>
                );
              }
              return (
                <form onSubmit={handleReturnSubmit} className="space-y-4">
                  <div className="bg-brand-red/5 p-4 rounded-xl border border-brand-red/10 mb-6">
                    <h4 className="text-xs font-black text-brand-dark-red uppercase tracking-widest mb-1">Finalizando Chamado:</h4>
                    <p className="text-sm font-bold text-brand-red">#{occToClose.callNumber} - {occToClose.equip}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                        <User size={10} /> Técnico Responsável
                      </label>
                      <input 
                        required
                        type="text"
                        value={returnFormData.technician}
                        onChange={(e) => setReturnFormData({ ...returnFormData, technician: e.target.value })}
                        placeholder="Nome do técnico"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                        <User size={10} /> Quem está fechando?
                      </label>
                      <select 
                        required
                        value={returnFormData.closedBy}
                        onChange={(e) => setReturnFormData({ ...returnFormData, closedBy: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow appearance-none"
                      >
                        <option value="" disabled>Selecionar usuário...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.fullName}>{u.fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                      <ClipboardList size={10} /> Causa de Parada
                    </label>
                    <select
                      required
                      value={returnFormData.causa_parada}
                      onChange={(e) => setReturnFormData({ ...returnFormData, causa_parada: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow appearance-none"
                    >
                      <option value="" disabled>Selecionar causa...</option>
                      {(CAUSAS_PARADA_BY_TYPE[occToClose.type] || []).map(causa => (
                        <option key={causa} value={causa}>{causa}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                      <ClipboardList size={10} /> Motivo da Parada
                    </label>
                    <textarea 
                      required
                      value={returnFormData.reason}
                      onChange={(e) => setReturnFormData({ ...returnFormData, reason: e.target.value })}
                      placeholder="Descreva o motivo da parada e o serviço realizado..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> Data do Retorno
                      </label>
                      <input 
                        required
                        type="date"
                        value={returnFormData.endDate}
                        onChange={(e) => setReturnFormData({ ...returnFormData, endDate: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                        <Clock size={10} /> Horário do Retorno
                      </label>
                      <input 
                        required
                        type="time"
                        value={returnFormData.endTime}
                        onChange={(e) => setReturnFormData({ ...returnFormData, endTime: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button 
                      type="button"
                      onClick={() => setClosingOccId(null)}
                      className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] bg-green-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-lg hover:shadow-green-600/20 flex items-center justify-center gap-2 group"
                    >
                      Finalizar Chamado e Registrar Retorno <CheckCircle2 size={18} />
                    </button>
                  </div>
                </form>
              );
            })()
          ) : activeTab === 'new' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Tipo de Equipamento</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => {
                      const type = e.target.value as EquipmentType;
                      setFormData({ ...formData, type, equip: type === 'escadas' ? ESCADAS_LIST[0] : ELEVADORES_LIST[0] });
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow appearance-none"
                  >
                    <option value="escadas">Escadas Rolantes</option>
                    <option value="elevadores">Elevadores</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">ID do Equipamento</label>
                  <select 
                    value={formData.equip}
                    onChange={(e) => setFormData({ ...formData, equip: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow appearance-none"
                  >
                    {(formData.type === 'escadas' ? ESCADAS_LIST : ELEVADORES_LIST).map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-widest">Equipamento Parado?</label>
                <select 
                  required
                  value={formData.is_equipment_stopped ? 'sim' : 'nao'}
                  onChange={(e) => setFormData({ ...formData, is_equipment_stopped: e.target.value === 'sim' })}
                  className="w-full bg-white border border-brand-red/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow appearance-none cursor-pointer"
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                    <Hash size={10} /> Número do Chamado
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.callNumber}
                    onChange={(e) => setFormData({ ...formData, callNumber: e.target.value })}
                    placeholder="Ex: CH-2024-001"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                    <User size={10} /> Quem está abrindo?
                  </label>
                  {currentUser?.profile === 'Gestor' ? (
                    // Gestor pode selecionar outro usuário
                    <select 
                      required
                      value={formData.createdBy}
                      onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow appearance-none"
                    >
                      <option value="" disabled>Selecionar usuário...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.fullName}>{u.fullName}</option>
                      ))}
                    </select>
                  ) : (
                    // Visualização vê apenas seu nome (desabilitado)
                    <input
                      type="text"
                      disabled
                      value={currentUser?.fullName || 'Não identificado'}
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none text-gray-600 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                    <User size={10} /> Nome do Atendente (Empresa)
                  </label>
                  <input 
                    required
                    type="text"
                    value={formData.attendant}
                    onChange={(e) => setFormData({ ...formData, attendant: e.target.value })}
                    placeholder="Nome do técnico da empresa de manutenção"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Data da Parada
                  </label>
                  <input 
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                    <Clock size={10} /> Horário da Parada
                  </label>
                  <input 
                    required
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/50 transition-shadow"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-dark-red text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-red transition-all shadow-lg hover:shadow-brand-red/20 flex items-center justify-center gap-2 mt-6 group"
              >
                Abrir Chamado <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {occurrences.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <History size={32} />
                  </div>
                  <p className="text-sm text-text-muted font-medium">Nenhum chamado registrado até o momento.</p>
                </div>
              ) : (
                occurrences.map((occ) => {
                  const isClosed = !!occ.end;
                  const start = new Date(occ.start);
                  const end = occ.end ? new Date(occ.end) : null;
                  
                  return (
                    <div key={occ.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative group overflow-hidden">
                      {!isClosed && <div className="absolute top-0 left-0 w-1 h-full bg-brand-red animate-pulse" />}
                      
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
<span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isClosed ? 'bg-green-100 text-green-700' : isPaused(occ) ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-brand-red/10 text-brand-red animate-pulse'}`}>
  {isClosed ? 'Concluído' : isPaused(occ) ? 'Aguardando Aprovação' : 'Em Aberto'}
</span>
                            <span className="text-[10px] font-black uppercase text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                              {occ.equip}
                            </span>
                          </div>
                          <h4 className="font-black text-sm text-brand-dark-red">#{occ.callNumber}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentUser?.profile === 'Gestor' && (
                            <button 
                              onClick={() => setDeletingOccId(occ.id)}
                              className="p-2 text-gray-400 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <p className="text-[10px] text-text-muted flex items-center gap-1.5">
                            <PlusCircle size={10} className="text-brand-red" /> Abertura: <span className="font-bold text-brand-dark-red">{occ.createdBy}</span>
                          </p>
                          <p className="text-text-muted flex items-center gap-1.5">
                            <User size={12} className="text-brand-red" /> Atendente: {occ.attendant}
                          </p>
                          <p className="text-text-muted flex items-center gap-1.5">
                            <Calendar size={12} className="text-brand-red" /> {start.toLocaleDateString('pt-BR')} {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex flex-col justify-end items-end">
                          {isClosed ? (
                            <div className="text-right space-y-1">
                              <p className="text-[9px] text-text-muted flex items-center gap-1.5 justify-end uppercase font-black tracking-widest">
                                <CheckCircle2 size={10} className="text-green-600" /> Fechado por: <span className="text-brand-dark-red">{occ.closedBy}</span>
                              </p>
                              <p className="text-[10px] text-text-muted font-bold">
                                Técnico: <span className="text-gray-700">{occ.technician}</span>
                              </p>
                              <p className="text-[10px] text-text-muted italic">
                                {occ.causa_parada ? `${occ.causa_parada} - ` : ''}
                                {occ.reason}
                              </p>
                              <p className="text-[10px] text-text-muted flex items-center gap-1.5 justify-end font-bold">
                                <Calendar size={10} className="text-green-600" /> {end?.toLocaleDateString('pt-BR')} {end?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {canManage && (
                                <>
                                  {isPaused(occ) ? (
                                    <button
                                      onClick={() => handleResumeExtraScope(occ)}
                                      className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-200 transition-colors flex items-center gap-1.5"
                                    >
                                      <Play size={12} /> Retomar Atendimento
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handlePauseExtraScope(occ)}
                                      className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-colors flex items-center gap-1.5"
                                    >
                                      <PauseCircle size={12} /> Pausar: Escopo Extra
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleOpenReturnForm(occ.id)}
                                    className="bg-brand-red text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark-red transition-colors flex items-center gap-1.5"
                                  >
                                    Registrar Retorno <CheckCircle2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }).sort((a, b) => {
                  const dateA = a.end ? new Date(a.end).getTime() : new Date(a.start).getTime();
                  const dateB = b.end ? new Date(b.end).getTime() : new Date(b.start).getTime();
                  return dateB - dateA;
                })
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 text-[10px] text-text-muted font-bold text-center border-t border-gray-200">
          SISTEMA DE GESTÃO DE MANUTENÇÃO BOTAFOGO PRAIA SHOPPING
        </div>
      </motion.div>

      {deletingOccId && (
        <div className="fixed inset-0 bg-brand-dark-red/90 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border-4 border-white/20 p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-red-50 text-brand-red rounded-full flex items-center justify-center mb-5 animate-pulse">
              <AlertCircle size={32} />
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-2">Atenção! Ação Irreversível</span>
            <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight mb-2">Excluir Chamado</h3>
            
            {(() => {
              const occToDel = occurrences.find(o => o.id === deletingOccId);
              return occToDel ? (
                <div className="bg-brand-red/5 p-4 rounded-2xl border border-brand-red/10 mb-6 w-full">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Chamado selecionado:</p>
                  <p className="text-sm font-black text-brand-dark-red">#{occToDel.callNumber} - {occToDel.equip}</p>
                </div>
              ) : null;
            })()}
            
            <p className="text-stone-500 text-xs font-medium mb-6 leading-relaxed">
              Deseja realmente excluir este chamado permanentemente do sistema? Esta ação também removerá o registro correspondente no banco de dados.
            </p>

            <div className="flex gap-3 w-full">
              <button 
                type="button"
                onClick={() => setDeletingOccId(null)}
                className="flex-1 py-4 bg-brand-dark-red/5 text-brand-dark-red rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-brand-dark-red/10 transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    await onDelete(deletingOccId);
                  } catch (err) {
                    console.error("Delete failed:", err);
                  } finally {
                    setDeletingOccId(null);
                  }
                }}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={12} />
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
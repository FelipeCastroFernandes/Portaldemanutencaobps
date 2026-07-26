/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  FileSpreadsheet,
  AlertCircle,
  Eye,
  X,
  FileText,
  Pencil,
  Play,
  PauseCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from './PageHeader';
import { CAUSAS_PARADA_BY_TYPE, Occurrence, User as UserType } from '../types';
import { MESES_ORDEM } from '../data/initialData';
import { getLocalTimezoneOffset } from '../lib/utils';

interface ServiceOrdersViewProps {
  occurrences: Occurrence[];
  users: UserType[];
  currentUser: UserType | null;
  onBack: () => void;
  onUpdate: (occ: Occurrence) => void;
  onDelete: (id: string) => void;
  onAdd?: (occ: Occurrence) => Promise<void> | void;
  stopCauses?: {id: string; type: string; name: string}[];
}

export default function ServiceOrdersView({ occurrences, users, currentUser, onBack, onUpdate, onDelete, onAdd, stopCauses = [] }: ServiceOrdersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'paused'>('all');
  const [filterType, setFilterType] = useState<'all' | 'escadas' | 'elevadores'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [sortPriority, setSortPriority] = useState<'start' | 'openFirst' | 'closedFirst'>('openFirst');
  const [closingOccId, setClosingOccId] = useState<string | null>(null);
  const [deletingOccId, setDeletingOccId] = useState<string | null>(null);
  const [editingOccId, setEditingOccId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Occurrence | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getInitialReturnFormData = () => ({
    technician: '',
    reason: '',
    causa_parada: '',
    closedBy: currentUser?.fullName || '',
    endDate: new Date().toISOString().split('T')[0],
    endTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  });

  const [returnFormData, setReturnFormData] = useState(getInitialReturnFormData());

  const getInitialEditFormData = (occ: Occurrence) => ({
    type: occ.type || 'escadas',
    equip: occ.equip || '',
    callNumber: occ.callNumber || '',
    attendant: occ.attendant || '',
    createdBy: occ.createdBy || '',
    startDate: occ.start ? new Date(occ.start).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: occ.start ? new Date(occ.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    technician: occ.technician || '',
    reason: occ.reason || '',
    causa_parada: occ.causa_parada || '',
    closedBy: occ.closedBy || '',
    endDate: occ.end ? new Date(occ.end).toISOString().split('T')[0] : '',
    endTime: occ.end ? new Date(occ.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
  });

  const [editFormData, setEditFormData] = useState(getInitialEditFormData({} as Occurrence));

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOccId) return;

    const occ = occurrences.find(o => o.id === editingOccId);
    if (!occ) return;

    onUpdate({
      ...occ,
      type: editFormData.type,
      equip: editFormData.equip,
      callNumber: editFormData.callNumber,
      attendant: editFormData.attendant,
      createdBy: editFormData.createdBy,
      start: `${editFormData.startDate}T${editFormData.startTime}:00${getLocalTimezoneOffset()}`,
      end: editFormData.endDate ? `${editFormData.endDate}T${editFormData.endTime}:00${getLocalTimezoneOffset()}` : undefined,
      technician: editFormData.technician || undefined,
      reason: editFormData.reason || undefined,
      causa_parada: editFormData.causa_parada || undefined,
      closedBy: editFormData.closedBy || undefined,
    });

    setEditingOccId(null);
  };

  const handleOpenEditForm = (order: Occurrence) => {
    setEditFormData(getInitialEditFormData(order));
    setEditingOccId(order.id);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingOccId) return;
    
    const occ = occurrences.find(o => o.id === closingOccId);
    if (!occ) return;

    onUpdate({
      ...occ,
      end: `${returnFormData.endDate}T${returnFormData.endTime}:00${getLocalTimezoneOffset()}`,
      technician: returnFormData.technician,
      reason: returnFormData.reason,
      causa_parada: returnFormData.causa_parada,
      closedBy: returnFormData.closedBy,
    });

    setClosingOccId(null);
    setReturnFormData(getInitialReturnFormData());
  };

  const handleOpenReturnForm = (orderId: string) => {
    setClosingOccId(orderId);
    setReturnFormData(getInitialReturnFormData());
  };

  const handlePauseExtraScope = (occ: Occurrence) => {
    onUpdate({
      ...occ,
      extraScopeStart: new Date().toISOString(),
    });
  };

  const handleResumeExtraScope = (occ: Occurrence) => {
    onUpdate({
      ...occ,
      extraScopeEnd: new Date().toISOString(),
    });
    alert('O tempo de parada do equipamento voltou a ser contabilizado a partir de agora.');
  };

  const isPaused = (o: Occurrence) => !!o.extraScopeStart && !o.extraScopeEnd;

  const getNetDowntimeMs = (occ: Occurrence): number => {
    if (!occ.end) return 0;
    const grossMs = Math.max(0, new Date(occ.end).getTime() - new Date(occ.start).getTime());
    let extraMs = 0;
    if (occ.extraScopeStart) {
      const pauseStart = new Date(occ.extraScopeStart).getTime();
      const pauseEnd = occ.extraScopeEnd
        ? new Date(occ.extraScopeEnd).getTime()
        : Date.now();
      extraMs = Math.max(0, pauseEnd - pauseStart);
    }
    if (occ.extraScopeApprovalMs) {
      extraMs = Math.max(extraMs, occ.extraScopeApprovalMs);
    }
    return Math.max(0, grossMs - extraMs);
  };

  const formatDowntime = (ms: number): string => {
    const totalHours = Math.floor(ms / (1000 * 60 * 60));
    const totalMinutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const totalSeconds = Math.floor((ms % (1000 * 60)) / 1000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(totalMinutes).padStart(2, '0')}m`;
  };

  const filteredOrders = useMemo(() => {
    return occurrences
      .filter(order => {
        const matchesSearch = 
          order.equip.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.callNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.attendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.createdBy && order.createdBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.reason && order.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.causa_parada && order.causa_parada.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const isClosed = !!order.end;
        const paused = isPaused(order);
        const matchesStatus = 
          filterStatus === 'all' || 
          (filterStatus === 'open' && !isClosed && !paused) || 
          (filterStatus === 'closed' && isClosed) ||
          (filterStatus === 'paused' && paused);
        
        const matchesType = 
          filterType === 'all' || 
          order.type === filterType;

        const orderMonth = MESES_ORDEM[new Date(order.start).getMonth()];
        const matchesMonth = filterMonth === 'all' || orderMonth === filterMonth;
        
        return matchesSearch && matchesStatus && matchesType && matchesMonth;
      })
      .sort((a, b) => {
        if (sortPriority === 'openFirst') {
          const isAOpen = !a.end;
          const isBOpen = !b.end;
          if (isAOpen && !isBOpen) return -1;
          if (!isAOpen && isBOpen) return 1;
        } else if (sortPriority === 'closedFirst') {
          const isAClosed = !!a.end;
          const isBClosed = !!b.end;
          if (isAClosed && !isBClosed) return -1;
          if (!isAClosed && isBClosed) return 1;
        }
        return new Date(b.start).getTime() - new Date(a.start).getTime();
      });
  }, [occurrences, searchTerm, filterStatus, filterType, filterMonth, sortPriority]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const open = filteredOrders.filter(o => !o.end).length;
    const concluded = filteredOrders.filter(o => !!o.end).length;

    return { total, waiting: open, inExecution: open, concludedToday: concluded };
  }, [filteredOrders]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      
      const data = filteredOrders.map(o => ({
        'ID': o.id,
        'Tipo': o.type === 'escadas' ? 'Escada' : 'Elevador',
        'Equipamento': o.equip,
        'Nº Chamado': o.callNumber,
        'Solicitante (Acesso)': o.createdBy || '-',
        'Atendente (Empresa)': o.attendant,
        'Técnico Responsável': o.technician || '-',
        'Causa de Parada': o.causa_parada || '-',
        'Motivo da Parada': o.reason || '-',
        'Fechado Por (Acesso)': o.closedBy || '-',
        'Início': new Date(o.start).toLocaleString(),
        'Fim': o.end ? new Date(o.end).toLocaleString() : '-',
        'Status': o.end ? 'Concluído' : 'Aberto'
      }));

      const ws = XLSX.utils.json_to_sheet(data);

      ws['!cols'] = [
        { wch: 15 }, // ID
        { wch: 10 }, // Tipo
        { wch: 15 }, // Equipamento
        { wch: 15 }, // Nº Chamado
        { wch: 20 }, // Solicitante
        { wch: 20 }, // Atendente
        { wch: 20 }, // Técnico
        { wch: 25 }, // Causa
        { wch: 40 }, // Motivo
        { wch: 20 }, // Fechado Por
        { wch: 20 }, // Início
        { wch: 20 }, // Fim
        { wch: 12 }  // Status
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatório");
      
      const fileName = `relatorio_bps_manutencao_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const parseDate = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
      let isoDateStr = '';
      if (parts.length === 3) {
        if (parts[0].length <= 2) {
           isoDateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else {
           isoDateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      } else {
         return '';
      }
      
      const time = timeStr ? timeStr.split(':').slice(0, 2).join(':') : '00:00';
      return `${isoDateStr}T${time}:00`;
    } catch (e) {
      return '';
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAdd) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith(';ID;EQUIPAMENTO') && !line.startsWith('ID;EQUIPAMENTO'));
        
        let addedCount = 0;
        for (const line of lines) {
          const cols = line.split(';');
          if (cols.length < 5) continue; 
          
          const equip = cols[1];
          const chamadoStr = cols[2];
          const paradaDate = cols[3];
          const paradaTime = cols[4];
          const retornoDate = cols[5];
          const retornoTime = cols[6];
          const osEngeman = cols[7];
          const causa = cols[8];
          const desc = cols[9];

          if (!equip || equip.trim() === '') continue;

          const type: 'escadas' | 'elevadores' = equip.toLowerCase().includes('elevador') || equip.toLowerCase().includes('ae') ? 'elevadores' : 'escadas';

          const startStr = parseDate(paradaDate?.trim(), paradaTime?.trim());
          const endStr = retornoDate?.trim() ? parseDate(retornoDate?.trim(), retornoTime?.trim()) : undefined;
          
          if (!startStr) continue;

          await onAdd({
            id: Math.random().toString(36).substring(2, 15),
            type,
            equip: equip.trim(),
            callNumber: osEngeman?.trim() || Math.floor(Math.random() * 10000).toString(),
            attendant: chamadoStr?.trim() || 'Sistema',
            createdBy: currentUser?.fullName || 'Importação',
            start: startStr,
            end: endStr || undefined,
            causa_parada: causa?.trim() || undefined,
            reason: (causa + " " + (desc || '')).trim() || undefined,
            technician: retornoDate?.trim() ? 'Técnico Importado' : undefined,
            closedBy: retornoDate?.trim() ? (currentUser?.fullName || 'Importação') : undefined,
          });
          addedCount++;
        }
        alert(`Importação concluída. ${addedCount} ordens de serviço adicionadas.`);
      } catch (err) {
        console.error(err);
        alert('Erro ao importar arquivo CSV.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file, 'ISO-8859-1'); // Useful for files matching typical Brazilian windows-1252 CSV
    e.target.value = '';
  };

  const getRecentActivities = useMemo(() => {
    return [...occurrences]
      .sort((a, b) => {
        const dateA = a.end ? new Date(a.end).getTime() : new Date(a.start).getTime();
        const dateB = b.end ? new Date(b.end).getTime() : new Date(b.start).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [occurrences]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 pb-12 pt-6">
      <PageHeader
        title="Gestão de Ordens de Serviço"
        onBack={onBack}
        actions={
          <>
            {onAdd && (
              <label className="flex items-center gap-2 bg-brand-red px-4 py-2 rounded-lg border border-brand-red text-xs font-black uppercase tracking-widest hover:bg-brand-red/90 transition-all group cursor-pointer relative overflow-hidden">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImportCSV} 
                  disabled={isImporting}
                />
                <FileSpreadsheet size={16} className={`group-hover:-translate-y-0.5 transition-transform ${isImporting ? 'animate-bounce' : ''}`} />
                <span>{isImporting ? 'Importando...' : 'Importar CSV'}</span>
              </label>
            )}
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10"
            >
              <Download size={16} className={`transition-transform ${isExporting ? 'animate-bounce' : 'group-hover:-translate-y-0.5'}`} />
              <span>{isExporting ? 'Gerando...' : 'Exportar Excel'}</span>
            </button>
          </>
        }
      />

      <div className="space-y-8">
        {/* Main Content Pane */}
        <div className="space-y-8">
          {/* Stats Cards - Simplified style based on mockup */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { 
                label: 'Total', 
                value: stats.total, 
                color: 'text-brand-dark-red', 
                bg: 'bg-white',
                pct: 100,
                sortAction: 'start' as const
              },
              { 
                label: 'Em Andamento', 
                value: stats.waiting, 
                color: 'text-amber-600', 
                bg: 'bg-amber-50',
                pct: stats.total > 0 ? Math.round((stats.waiting / stats.total) * 100) : 0,
                sortAction: 'openFirst' as const
              },
              { 
                label: 'Concluídas', 
                value: stats.concludedToday, 
                color: 'text-emerald-600', 
                bg: 'bg-emerald-50',
                pct: stats.total > 0 ? Math.round((stats.concludedToday / stats.total) * 100) : 0,
                sortAction: 'closedFirst' as const
              }
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label}
                onClick={() => setSortPriority(stat.sortAction)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${stat.bg} p-6 rounded-2xl border-2 ${sortPriority === stat.sortAction ? 'border-brand-dark-red/30 shadow-md' : 'border-brand-dark-red/5 hover:border-brand-dark-red/10'} transition-all group relative overflow-hidden cursor-pointer`}
              >
                <div className="flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-dark-red transition-colors">{stat.label}</span>
                    <span className={`text-[10px] font-black ${stat.color} bg-white/50 px-2 py-0.5 rounded-full`}>{stat.pct}%</span>
                  </div>
                  <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{String(stat.value).padStart(2, '0')}</p>
                </div>
                {/* Visual progress indicator at the bottom of the card */}
                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-10 transition-all duration-1000" style={{ width: `${stat.pct}%`, color: 'inherit' }} />
              </motion.div>
            ))}
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-2 rounded-2xl border-2 border-brand-dark-red/5 flex flex-col md:flex-row gap-4 items-center shadow-lg shadow-brand-dark-red/5">
            <div className="relative flex-1 w-full pl-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark-red/30" size={20} />
              <input 
                type="text"
                placeholder="Buscar por ID, Equipamento ou Técnico..."
                className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-bold text-brand-dark-red placeholder:text-brand-dark-red/30 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-brand-dark-red/5 rounded-xl w-full md:w-auto overflow-x-auto">
              {(['all', 'open', 'paused', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filterStatus === status 
                      ? 'bg-brand-dark-red text-white shadow-xl' 
                      : 'text-brand-dark-red/40 hover:text-brand-dark-red hover:bg-white'
                  }`}
                >
                  {status === 'all' ? 'Todos Status' : status === 'open' ? 'Em andamento' : status === 'paused' ? 'Escopo Extra' : 'Concluído'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pr-2">
              <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-brand-dark-red/5 text-brand-dark-red text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-brand-dark-red h-[40px] cursor-pointer"
              >
                <option value="all">Mês: Todos</option>
                {MESES_ORDEM.map(mes => (
                  <option key={mes} value={mes}>{mes}</option>
                ))}
              </select>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-brand-dark-red/5 text-brand-dark-red text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-brand-dark-red h-[40px] cursor-pointer"
              >
                <option value="all">Tipo: Todos</option>
                <option value="escadas">Escadas</option>
                <option value="elevadores">Elevadores</option>
              </select>
            </div>
          </div>

          {/* Service Orders List */}
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-12 px-8 text-[10px] font-black text-brand-dark-red uppercase tracking-[0.2em]">
              <div className="col-span-1">Chamado</div>
              <div className="col-span-1">Tipo</div>
              <div className="col-span-2">Ativo</div>
              <div className="col-span-2">Aberto por</div>
              <div className="col-span-2">Motivo</div>
              <div className="col-span-2">Tempo Parado</div>
              <div className="col-span-2">Status</div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    key={order.id}
                    onDoubleClick={() => setSelectedOrderDetails(order)}
                    className="bg-white rounded-3xl p-6 md:p-8 border-2 border-brand-dark-red/5 hover:border-brand-red/30 transition-all group hover:shadow-2xl hover:shadow-brand-red/10 cursor-pointer"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                      {/* ID/Chamado */}
                      <div className="md:col-span-1 border-brand-dark-red/10">
                        <span className="text-xl md:text-2xl font-black text-brand-dark-red">#{order.callNumber}</span>
                      </div>

                      {/* Tipo */}
                      <div className="md:col-span-1 flex flex-col gap-1 border-l-0 md:border-l-2 border-brand-dark-red/5 md:pl-6">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest inline-block w-fit ${order.type === 'escadas' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                          {order.type === 'escadas' ? 'Escada' : 'Elevador'}
                        </span>
                      </div>

                      {/* Ativo */}
                      <div className="md:col-span-2 flex flex-col gap-1 border-l-0 md:border-l-2 border-brand-dark-red/5 md:pl-6">
                        <span className="text-sm font-black text-brand-dark-red uppercase tracking-tight">{order.equip}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ativo</span>
                      </div>

                      {/* Aberto por */}
                      <div className="md:col-span-2 flex flex-col gap-2 border-l-0 md:border-l-2 border-brand-dark-red/5 md:pl-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-dark-red/10 flex items-center justify-center text-[10px] font-black text-brand-dark-red">
                            {order.createdBy?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-brand-dark-red uppercase tracking-tight block leading-none">{order.createdBy || 'Sistema'}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Solicitante</span>
                          </div>
                        </div>
                      </div>

                      {/* Motivo */}
                      <div className="md:col-span-2 flex flex-col gap-1 border-l-0 md:border-l-2 border-brand-dark-red/5 md:pl-6 min-w-0">
                        <span className="text-[11px] font-black text-gray-800 truncate" title={order.reason || '-'}>
                          {order.causa_parada || '-'}
                        </span>
                        {order.reason && <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Causa</span>}
                      </div>

                      {/* Tempo Parado */}
                      <div className="md:col-span-2 flex flex-col gap-1 border-l-0 md:border-l-2 border-brand-dark-red/5 md:pl-6">
                        {order.end ? (
                          <>
                            <span className="text-[11px] font-black text-brand-dark-red">{formatDowntime(getNetDowntimeMs(order))}</span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Indisponibilidade</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-black text-gray-300">-</span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Indisponibilidade</span>
                          </>
                        )}
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2 flex items-center justify-between gap-6 border-l-0 md:border-l-2 border-brand-dark-red/5 md:pl-6">
                        <div className="w-full flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${order.end ? 'text-emerald-600' : isPaused(order) ? 'text-amber-600' : 'text-amber-600'}`}>
                              {order.end ? 'Concluída' : isPaused(order) ? 'Pausado' : 'Em andamento'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: order.end ? '100%' : isPaused(order) ? '60%' : '20%' }}
                              className={`h-full rounded-full ${order.end ? 'bg-emerald-500' : isPaused(order) ? 'bg-amber-500' : 'bg-amber-500'}`}
                            />
                          </div>
                        </div>

<div className="flex items-center gap-2" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-gray-100 flex flex-col items-center gap-6">
                  <div className="p-10 bg-brand-dark-red/5 rounded-full text-brand-dark-red/20">
                    <AlertCircle size={80} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-brand-dark-red uppercase tracking-tight mb-2">Sem Resultados</h3>
                    <p className="text-gray-400 font-medium text-sm">Não encontramos nenhuma ordem de serviço com esses filtros.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Activities Pane - More discrete as requested */}
          <div className="bg-brand-beige/20 rounded-[40px] p-8 md:p-12 border border-brand-dark-red/10 overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-brand-dark-red/5 rounded-2xl text-brand-dark-red">
                  <Clock size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-dark-red/40 block mb-1">Linha do Tempo</span>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-brand-dark-red">Atividade Recente</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                {getRecentActivities.map((act, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={act.id} 
                    className="flex gap-6 group bg-white p-6 rounded-3xl border border-brand-dark-red/5 hover:border-brand-red/20 transition-all shadow-sm hover:shadow-xl"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12 ${act.end ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-red/10 text-brand-red'}`}>
                      {act.end ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-brand-dark-red/40 block leading-none mb-2 tracking-tighter">
                        {act.end ? new Date(act.end).toLocaleTimeString('pt-BR') : new Date(act.start).toLocaleTimeString('pt-BR')} • {new Date(act.end ? act.end : act.start).toLocaleDateString('pt-BR')}
                      </span>
                      <p className="text-sm font-bold leading-relaxed mb-2 text-brand-dark-red">
                        <span className="text-brand-red">#{act.callNumber}</span> {act.end ? 'finalizada por' : 'iniciada por'} <span className="font-black underline decoration-brand-red/20">{act.end ? act.technician : (act.createdBy || act.attendant)}</span>
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-dark-red/5 rounded-lg border border-brand-dark-red/5">
                        <span className="text-[10px] font-black text-brand-dark-red/40 uppercase tracking-widest">{act.equip}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal Overlay */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute inset-0 bg-brand-dark-red/90 backdrop-blur-md pointer-events-auto"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-brand-dark-red p-5 md:p-6 text-white relative shrink-0">
                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="absolute top-5 right-5 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight uppercase">Detalhes da OS</h2>
                    <div className="flex gap-1.5 mt-0.5 items-center">
                      <span className="px-2 py-0.5 bg-white/15 rounded-full text-[9px] font-black tracking-widest overflow-hidden whitespace-nowrap">
                        Chamado #{selectedOrderDetails.callNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] font-medium tracking-widest text-white/50">
                        ID: {selectedOrderDetails.id?.substring(0, 8).toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black tracking-widest uppercase">
                        {selectedOrderDetails.equip}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1 text-stone-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Status Atual</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedOrderDetails.end ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {selectedOrderDetails.end ? 'Concluída' : 'Em andamento'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Equipamento / Ativo</span>
                    <p className="text-xs font-black text-brand-dark-red uppercase tracking-tight">
                      {selectedOrderDetails.equip} - {selectedOrderDetails.type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Solicitante (Abertura)</span>
                    <span className="text-xs font-bold text-stone-700">{selectedOrderDetails.createdBy || 'Sistema'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Atendente (Registro)</span>
                    <span className="text-xs font-bold text-stone-700">{selectedOrderDetails.attendant || '-'}</span>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Data e Hora de Abertura</span>
                    <span className="text-xs font-bold text-stone-700">
                      {new Date(selectedOrderDetails.start).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-brand-beige/10 rounded-2xl border border-brand-dark-red/5 space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Descrição do Problema</span>
                    <p className="text-xs font-medium text-stone-600 leading-relaxed italic">
                      "Chamado #{selectedOrderDetails.callNumber}"
                    </p>
                  </div>
                </div>

                {selectedOrderDetails.end && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest block">Técnico</span>
                        <span className="text-xs font-black text-emerald-990">{selectedOrderDetails.technician}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest block">Concluído Por</span>
                        <span className="text-xs font-black text-emerald-990">{selectedOrderDetails.closedBy}</span>
                      </div>
                      <div className="space-y-0.5 col-span-2 border-t border-emerald-100/30 pt-1.5">
                        <span className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest block">Data e Hora de Conclusão</span>
                        <span className="text-xs font-bold text-emerald-900">
                          {new Date(selectedOrderDetails.end).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="space-y-0.5 col-span-2 border-t border-emerald-100/30 pt-1.5">
                        <span className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest block">Causa de Parada</span>
                        <span className="text-xs font-black text-emerald-900 uppercase">
                          {selectedOrderDetails.causa_parada || '-'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-0.5 border-t border-emerald-100/50 pt-2">
                      <span className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest block">Motivo da Parada / Diagnóstico</span>
                      <p className="text-xs font-medium text-emerald-800 leading-relaxed bg-white/80 p-3 rounded-xl whitespace-pre-wrap">
                        {selectedOrderDetails.reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {!selectedOrderDetails.end && (currentUser?.profile === 'Gestor' || currentUser?.profile === 'Planejador') && (
                    isPaused(selectedOrderDetails) ? (
                      <button
                        onClick={() => {
                          const occ = selectedOrderDetails;
                          setSelectedOrderDetails(null);
                          handleResumeExtraScope(occ);
                        }}
                        className="px-5 py-2 bg-green-100 text-green-700 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-200 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Play size={14} /> Retomar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const occ = selectedOrderDetails;
                          setSelectedOrderDetails(null);
                          handlePauseExtraScope(occ);
                        }}
                        className="px-5 py-2 bg-amber-100 text-amber-700 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-200 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <PauseCircle size={14} /> Pausar
                      </button>
                    )
                  )}
                  {!selectedOrderDetails.end && (currentUser?.profile === 'Gestor' || currentUser?.profile === 'Planejador') && (
                    <button
                      onClick={() => {
                        const id = selectedOrderDetails.id;
                        setSelectedOrderDetails(null);
                        handleOpenReturnForm(id);
                      }}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Registrar Retorno
                    </button>
                  )}
                  {currentUser?.profile === 'Gestor' && (
                    <button
                      onClick={() => {
                        const id = selectedOrderDetails.id;
                        setSelectedOrderDetails(null);
                        handleOpenEditForm(selectedOrderDetails);
                      }}
                      className="px-5 py-2 bg-amber-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all active:scale-95 shadow-lg flex items-center gap-1.5"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                  )}
                  {currentUser?.profile === 'Gestor' && (
                    <button
                      onClick={() => {
                        const id = selectedOrderDetails.id;
                        setSelectedOrderDetails(null);
                        setDeletingOccId(id);
                      }}
                      className="px-5 py-2 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-lg flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-6 py-2 bg-brand-dark-red text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-dark-red/90 transition-all active:scale-95 shadow-lg"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Closure Modal Overlay */}
      {closingOccId && occurrences.find(o => o.id === closingOccId) && (() => {
        const occToClose = occurrences.find(o => o.id === closingOccId)!;
        return (
          <div className="fixed inset-0 bg-brand-dark-red/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border-4 border-white/20 flex flex-col max-h-[90vh] my-auto"
            >
              <div className="p-8 md:p-10 bg-brand-dark-red text-white flex justify-between items-start shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2 block">Intervenção Técnica</span>
                  <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                    Registrar Retorno
                  </h2>
                  <div className="flex gap-2 mt-4">
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">#{occToClose.callNumber}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{occToClose.equip}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setClosingOccId(null)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <Trash2 size={24} className="text-white/30 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleReturnSubmit} className="p-8 md:p-10 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Técnico Responsável</label>
                    <input 
                      required
                      type="text"
                      value={returnFormData.technician}
                      onChange={(e) => setReturnFormData({ ...returnFormData, technician: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                      placeholder="Nome do técnico"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Usuário de Fechamento</label>
                    <select 
                      required
                      value={returnFormData.closedBy}
                      onChange={(e) => setReturnFormData({ ...returnFormData, closedBy: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all cursor-pointer"
                    >
                      <option value="" disabled>Selecionar...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.fullName}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Causa de Parada</label>
                  <select
                    required
                    value={returnFormData.causa_parada}
                    onChange={(e) => setReturnFormData({ ...returnFormData, causa_parada: e.target.value })}
                    className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all cursor-pointer"
                  >
                    <option value="" disabled>Selecionar causa...</option>
                    {(CAUSAS_PARADA_BY_TYPE[occToClose.type] || []).map(causa => (
                      <option key={causa} value={causa}>{causa}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Motivo da Parada / Diagnóstico</label>
                  <textarea 
                    required
                    value={returnFormData.reason}
                    onChange={(e) => setReturnFormData({ ...returnFormData, reason: e.target.value })}
                    className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all min-h-[120px] resize-none"
                    placeholder="Descreva detalhadamente o motivo da parada ou intervenção..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Data de Conclusão</label>
                    <input 
                      required
                      type="date"
                      value={returnFormData.endDate}
                      onChange={(e) => setReturnFormData({ ...returnFormData, endDate: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Hora de Conclusão</label>
                    <input 
                      required
                      type="time"
                      value={returnFormData.endTime}
                      onChange={(e) => setReturnFormData({ ...returnFormData, endTime: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setClosingOccId(null)}
                    className="flex-1 py-5 bg-brand-dark-red/5 text-brand-dark-red rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-dark-red/10 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all hover:-translate-y-1 active:scale-95"
                  >
                    Finalizar Ordem de Serviço
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        );
      })()}

      {/* Edit Modal Overlay */}
      {editingOccId && occurrences.find(o => o.id === editingOccId) && (() => {
        const occToEdit = occurrences.find(o => o.id === editingOccId)!;
        return (
          <div className="fixed inset-0 bg-brand-dark-red/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border-4 border-white/20 flex flex-col max-h-[90vh] my-auto"
            >
              <div className="p-8 md:p-10 bg-brand-dark-red text-white flex justify-between items-start shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2 block">Gestão de Chamados</span>
                  <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Pencil size={32} className="text-amber-400" />
                    Editar Chamado
                  </h2>
                  <div className="flex gap-2 mt-4">
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">#{occToEdit.callNumber}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{occToEdit.equip}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingOccId(null)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <X size={24} className="text-white/30 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-8 md:p-10 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Tipo</label>
                    <select
                      required
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as 'escadas' | 'elevadores' })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all cursor-pointer"
                    >
                      <option value="escadas">Escadas</option>
                      <option value="elevadores">Elevadores</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Equipamento</label>
                    <input 
                      required
                      type="text"
                      value={editFormData.equip}
                      onChange={(e) => setEditFormData({ ...editFormData, equip: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                      placeholder="Nome do ativo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Nº Chamado</label>
                    <input 
                      required
                      type="text"
                      value={editFormData.callNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, callNumber: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                      placeholder="Número do chamado"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Atendente</label>
                    <input 
                      required
                      type="text"
                      value={editFormData.attendant}
                      onChange={(e) => setEditFormData({ ...editFormData, attendant: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                      placeholder="Nome do atendente"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Solicitante</label>
                    <select
                      required
                      value={editFormData.createdBy}
                      onChange={(e) => setEditFormData({ ...editFormData, createdBy: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all cursor-pointer"
                    >
                      <option value="" disabled>Selecionar...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.fullName}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Técnico</label>
                    <input 
                      type="text"
                      value={editFormData.technician}
                      onChange={(e) => setEditFormData({ ...editFormData, technician: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                      placeholder="Nome do técnico"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Data de Abertura</label>
                    <input 
                      required
                      type="date"
                      value={editFormData.startDate}
                      onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Hora de Abertura</label>
                    <input 
                      required
                      type="time"
                      value={editFormData.startTime}
                      onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                      className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Causa de Parada</label>
                  <select
                    value={editFormData.causa_parada}
                    onChange={(e) => setEditFormData({ ...editFormData, causa_parada: e.target.value })}
                    className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all cursor-pointer"
                  >
                    <option value="">Selecionar causa...</option>
                    {(CAUSAS_PARADA_BY_TYPE[editFormData.type] || []).map(causa => (
                      <option key={causa} value={causa}>{causa}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-brand-dark-red/40 tracking-widest pl-1">Motivo da Parada / Diagnóstico</label>
                  <textarea 
                    value={editFormData.reason}
                    onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                    className="w-full bg-brand-dark-red/5 border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all min-h-[100px] resize-none"
                    placeholder="Descreva o motivo da parada..."
                  />
                </div>

                <div className="space-y-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <span className="text-[10px] font-black uppercase text-amber-700/40 tracking-widest block">Dados de Conclusão</span>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-amber-700/40 tracking-widest pl-1">Data de Conclusão</label>
                      <input 
                        type="date"
                        value={editFormData.endDate}
                        onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                        className="w-full bg-white border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-amber-700/40 tracking-widest pl-1">Hora de Conclusão</label>
                      <input 
                        type="time"
                        value={editFormData.endTime}
                        onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                        className="w-full bg-white border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-amber-700/40 tracking-widest pl-1">Fechado Por</label>
                    <select
                      value={editFormData.closedBy}
                      onChange={(e) => setEditFormData({ ...editFormData, closedBy: e.target.value })}
                      className="w-full bg-white border-2 border-transparent focus:border-brand-dark-red focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-brand-dark-red transition-all cursor-pointer"
                    >
                      <option value="">Selecionar...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.fullName}>{u.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setEditingOccId(null)}
                    className="flex-1 py-5 bg-brand-dark-red/5 text-brand-dark-red rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-dark-red/10 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-5 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-amber-600/30 hover:bg-amber-700 transition-all hover:-translate-y-1 active:scale-95"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        );
      })()}

      {/* Deletion Confirmation Modal Overlay */}
      {deletingOccId && (
        <div className="fixed inset-0 bg-brand-dark-red/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border-4 border-white/20 p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200"
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

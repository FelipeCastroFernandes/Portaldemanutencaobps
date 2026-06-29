import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, X, Clock, User, ChevronDown, Save, Plus, Search, AlertTriangle, Award, Calendar, CheckCircle, ClipboardList, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { getTasks, saveTask, updateTask, archiveDoneTasks } from '../lib/api';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  initials: string;
}

const COLLABORATORS: Collaborator[] = [
  { id: 'felipe', name: 'Felipe', color: 'bg-brand-dark-red', initials: 'F' },
  { id: 'joao', name: 'João', color: 'bg-brand-red', initials: 'J' },
  { id: 'fabricio', name: 'Fabrício', color: 'bg-amber-700', initials: 'F' },
];

const MAX_HOURS = 40;

function calculateScore(impact: string, urgency: string): number {
  const impactMap: Record<string, number> = { low: 1, medium: 3, critical: 5 };
  const urgencyMap: Record<string, number> = { strategic: 1, planned: 3, immediate: 5 };
  return (impactMap[impact] || 1) + (urgencyMap[urgency] || 1);
}

function getImpactColor(impact: string): string {
  switch (impact) {
    case 'critical': return 'bg-red-600 text-white';
    case 'medium': return 'bg-orange-500 text-white';
    case 'low': return 'bg-green-700 text-white';
    default: return 'bg-gray-400 text-white';
  }
}

function getImpactLabel(impact: string): string {
  switch (impact) {
    case 'critical': return 'CRÍTICO';
    case 'medium': return 'MÉDIO';
    case 'low': return 'BAIXO';
    default: return '-';
  }
}

interface TaskManagementViewProps {
  onBack: () => void;
}

export default function TaskManagementView({ onBack }: TaskManagementViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    hours: '',
    impact: 'medium' as 'low' | 'medium' | 'critical',
    urgency: 'planned' as 'strategic' | 'planned' | 'immediate',
    responsible: '',
    notes: '',
  });

  const activeTasks = tasks.filter(t => !t.archivedAt);
  const modalRef = useRef<HTMLDivElement>(null);
  const backlogTasks = activeTasks.filter(t => t.status === 'backlog');
  const filteredBacklog = backlogTasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.score - a.score);

  const getCollaboratorTasks = (collabId: string, status: Task['status']) =>
    activeTasks.filter(t => t.collaborator === collabId && t.status === status);

  const getCapacityHours = (collabId: string) => {
    return activeTasks
      .filter(t => t.collaborator === collabId && (t.status === 'todo' || t.status === 'doing'))
      .reduce((acc, t) => acc + t.hours, 0);
  };

  const getCapacityPercent = (collabId: string) => {
    return Math.min((getCapacityHours(collabId) / MAX_HOURS) * 100, 100);
  };

  const getCapacityColor = (percent: number) => {
    if (percent >= 80) return 'bg-red-600';
    if (percent > 70) return 'bg-orange-500';
    return 'bg-green-700';
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(zoneId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Task['status'], collaboratorId?: string) => {
    e.preventDefault();
    setDragOverId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated: Task = {
      ...task,
      status: targetStatus,
      collaborator: targetStatus === 'backlog' ? undefined : (collaboratorId || task.collaborator),
    };
    const saved = await updateTask(updated);
    setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewTask({ title: '', hours: '', impact: 'medium', urgency: 'planned', responsible: '', notes: '' });
  };

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return;
    const hoursNum = parseFloat(newTask.hours) || 0;
    const score = calculateScore(newTask.impact, newTask.urgency);
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      hours: hoursNum,
      impact: newTask.impact,
      urgency: newTask.urgency,
      responsible: newTask.responsible,
      notes: newTask.notes,
      status: newTask.responsible === 'backlog' || !newTask.responsible ? 'backlog' : 'todo',
      collaborator: newTask.responsible === 'backlog' || !newTask.responsible ? undefined : newTask.responsible,
      score,
      createdAt: new Date().toISOString(),
    };
    const saved = await saveTask(task);
    setTasks(prev => [...prev, saved]);
    closeModal();
  };

  const toggleExpand = (collabId: string) => {
    setExpandedCol(expandedCol === collabId ? null : collabId);
  };

  const handleClearDone = async () => {
    const doneCount = activeTasks.filter(t => t.status === 'done').length;
    if (doneCount === 0) return;
    if (!confirm(`Arquivar ${doneCount} tarefa(s) concluída(s)?`)) return;
    await archiveDoneTasks();
    setTasks(prev => prev.map(t => t.status === 'done' && !t.archivedAt ? { ...t, archivedAt: new Date().toISOString() } : t));
  };

  useEffect(() => {
    getTasks().then(data => {
      if (data.length > 0) {
        setTasks(data);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans selection:bg-brand-red/20">
      {/* Header */}
      <header className="bg-brand-dark-red text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <Zap size={22} className="text-amber-400" />
              <h1 className="font-black text-lg uppercase tracking-tighter">Painel de Tarefas</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <Search size={14} className="text-white/60" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/40 w-28"
              />
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-brand-red hover:bg-red-800 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg border border-white/20 active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              Nova Tarefa
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-64px)]">
        {/* Backlog Column */}
        <aside className="md:col-span-1 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-brand-dark-red">
            <h2 className="font-black text-white uppercase tracking-tight text-lg">Backlog</h2>
            <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Ordenado por impacto</span>
          </div>
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            onDragOver={e => handleDragOver(e, 'backlog-drop')}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, 'backlog')}
          >
            {filteredBacklog.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8 font-medium">Nenhuma tarefa no backlog</p>
            )}
            {filteredBacklog.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                draggable
                onDragStart={e => handleDragStart(e, task.id)}
                className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing"
              >
                <div className="flex justify-between items-center mb-2 gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getImpactColor(task.impact)}`}>
                    {getImpactLabel(task.impact)}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">Score: {task.score}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-2 leading-tight line-clamp-2">{task.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>{task.hours}h estimadas</span>
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Production Line */}
        <section className="md:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-brand-dark-red flex items-center justify-between">
            <h2 className="font-black text-white uppercase tracking-tight text-lg">Linha de Produção</h2>
            <button
              onClick={handleClearDone}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border border-white/10 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={12} />
              Limpar Concluídas
            </button>
          </div>
          <div className="flex-1 overflow-x-auto p-4">
            <div className={`flex gap-4 h-full transition-all ${expandedCol ? 'min-w-0' : 'min-w-[700px]'}`}>
              {COLLABORATORS.map(collab => {
                const percent = getCapacityPercent(collab.id);
                const hours = getCapacityHours(collab.id);
                const isOverload = percent >= 80;
                const isExpanded = expandedCol === collab.id;

                return (
                  <div
                    key={collab.id}
                    className={`bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col overflow-hidden transition-all ${
                      isExpanded ? 'w-full min-w-0' : 'flex-1 min-w-0'
                    } ${!expandedCol || isExpanded ? '' : 'hidden'}`}
                  >
                    {/* Collaborator Header */}
                    <div className="p-3 bg-gray-50 border-b border-stone-200">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          {isExpanded && (
                            <button
                              onClick={() => toggleExpand(collab.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer mr-1"
                              title="Voltar"
                            >
                              <Minimize2 size={14} />
                            </button>
                          )}
                          <div className={`w-8 h-8 rounded-full ${collab.color} text-white flex items-center justify-center font-black text-sm`}>
                            {collab.initials}
                          </div>
                          <span className="font-bold text-sm text-gray-800">{collab.name}</span>
                          {isOverload && (
                            <div className="flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-black uppercase ml-1">
                              <AlertTriangle size={10} />
                              <span className="hidden lg:inline">Sobrecarga</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-amber-50 text-amber-800 px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-black">
                            <Award size={12} className="text-amber-600" />
                            <span>{Math.round(100 - percent)} pts</span>
                          </div>
                          <button
                            onClick={() => toggleExpand(collab.id)}
                            className={`text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer ${isExpanded ? 'hidden' : ''}`}
                            title="Expandir"
                          >
                            <Maximize2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Capacidade: {hours}h / {MAX_HOURS}h</span>
                          <span className="font-bold">{Math.round(percent)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all duration-300 ${getCapacityColor(percent)}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Kanban Columns */}
                    <div className={`flex-1 p-2 bg-gray-50/50 overflow-y-auto ${isExpanded ? 'grid grid-cols-3 gap-4 p-4' : 'grid grid-cols-3 gap-2'}`}>
                      {(['todo', 'doing', 'done'] as const).map(zone => {
                        const zoneTasks = getCollaboratorTasks(collab.id, zone);
                        const zoneLabels: Record<string, string> = { todo: 'A Fazer', doing: 'Em Exec.', done: 'Concluído' };

                        return (
                          <div
                            key={zone}
                            className={`flex flex-col gap-2 rounded-lg transition-colors ${
                              dragOverId === `${collab.id}-${zone}` ? 'bg-stone-200' : ''
                            } ${isExpanded ? 'p-3 min-h-[100px]' : 'p-2 min-h-[60px]'}`}
                            onDragOver={e => handleDragOver(e, `${collab.id}-${zone}`)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, zone, collab.id)}
                          >
                            <div className="text-[10px] font-black text-gray-500 text-center uppercase pointer-events-none tracking-wider">
                              {zoneLabels[zone]}
                            </div>
                            {zoneTasks.map(task => (
                              <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                draggable
                                onDragStart={e => handleDragStart(e, task.id)}
                                className={`rounded-lg border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing ${
                                  zone === 'done'
                                    ? 'bg-gray-100 border-stone-200 opacity-70'
                                    : task.impact === 'critical'
                                    ? 'bg-white border-l-4 border-l-red-500 border-t-4 border-t-red-500 border-r border-b border-stone-200'
                                    : 'bg-white border-l-2 border-l-brand-dark-red border border-stone-200'
                                } ${isExpanded ? 'p-3' : 'p-2'}`}
                              >
                                {zone !== 'done' && task.impact !== 'critical' && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${getImpactColor(task.impact)}`}>
                                    {getImpactLabel(task.impact)}
                                  </span>
                                )}
                                <div className={`font-bold text-gray-800 truncate ${zone === 'done' ? 'line-through' : ''} ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="text-gray-400 flex items-center gap-1">
                                    <Clock size={10} />
                                    <span className="text-xs">{task.hours}h</span>
                                  </div>
                                  {isExpanded && task.responsible && (
                                    <div className="text-gray-400 flex items-center gap-1 text-xs">
                                      <User size={10} />
                                      <span className="capitalize">{task.responsible}</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-brand-dark-red bg-brand-dark-red">
              <div className="flex items-center gap-2">
                <Zap size={24} className="text-amber-400" />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Registrar Nova Atividade</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Título da Iniciativa</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Auditoria de SLA - Contrato de VT"
                  className="w-full bg-gray-50 border border-stone-200 focus:border-brand-dark-red focus:ring-1 focus:ring-brand-dark-red rounded-lg px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tempo Estimado (Horas)</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={newTask.hours}
                      onChange={e => setNewTask(prev => ({ ...prev, hours: e.target.value }))}
                      placeholder="0.0"
                      className="w-full bg-gray-50 border border-stone-200 focus:border-brand-dark-red focus:ring-1 focus:ring-brand-dark-red rounded-lg pl-10 pr-4 py-3 text-sm text-gray-800 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Prazo de Vencimento</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      className="w-full bg-gray-50 border border-stone-200 focus:border-brand-dark-red focus:ring-1 focus:ring-brand-dark-red rounded-lg pl-10 pr-4 py-3 text-sm text-gray-800 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Impact & Urgency Matrix */}
              <div className="bg-gray-50/80 p-4 rounded-xl border border-stone-200 space-y-3">
                <h3 className="text-[10px] font-black text-brand-dark-red border-b border-stone-200 pb-2 uppercase tracking-widest">
                  Matriz de Impacto & Urgência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Impacto</label>
                    <div className="flex p-1 bg-white rounded-lg border border-stone-200">
                      {(['low', 'medium', 'critical'] as const).map(impact => (
                        <label key={impact} className="flex-1 cursor-pointer group relative">
                          <input
                            type="radio"
                            name="impact"
                            value={impact}
                            checked={newTask.impact === impact}
                            onChange={e => setNewTask(prev => ({ ...prev, impact: e.target.value as any }))}
                            className="peer sr-only"
                          />
                          <div className={`py-1.5 text-center rounded-md text-[10px] font-bold uppercase transition-all ${
                            newTask.impact === impact
                              ? impact === 'critical' ? 'bg-red-100 text-red-700'
                                : impact === 'medium' ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-700'
                              : 'text-gray-400'
                          }`}>
                            {impact === 'critical' ? 'Crítico' : impact === 'medium' ? 'Médio' : 'Baixo'}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Urgência</label>
                    <div className="flex p-1 bg-white rounded-lg border border-stone-200">
                      {(['strategic', 'planned', 'immediate'] as const).map(urgency => (
                        <label key={urgency} className="flex-1 cursor-pointer group relative">
                          <input
                            type="radio"
                            name="urgency"
                            value={urgency}
                            checked={newTask.urgency === urgency}
                            onChange={e => setNewTask(prev => ({ ...prev, urgency: e.target.value as any }))}
                            className="peer sr-only"
                          />
                          <div className={`py-1.5 text-center rounded-md text-[10px] font-bold uppercase transition-all ${
                            newTask.urgency === urgency
                              ? urgency === 'immediate' ? 'bg-red-100 text-red-700'
                                : urgency === 'planned' ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-700'
                              : 'text-gray-400'
                          }`}>
                            {urgency === 'immediate' ? 'Imediato' : urgency === 'planned' ? 'Planejado' : 'Estratégico'}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic">Score calculado automaticamente: {calculateScore(newTask.impact, newTask.urgency)}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Responsável</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={newTask.responsible}
                    onChange={e => setNewTask(prev => ({ ...prev, responsible: e.target.value }))}
                    className="w-full bg-gray-50 border border-stone-200 focus:border-brand-dark-red focus:ring-1 focus:ring-brand-dark-red rounded-lg pl-10 pr-4 py-3 text-sm text-gray-800 appearance-none outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Selecione um responsável...</option>
                    {COLLABORATORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="backlog">Manter no Backlog</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Notas e Detalhes da Execução</label>
                <textarea
                  rows={3}
                  value={newTask.notes}
                  onChange={e => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Descreva os requisitos técnicos, premissas e resultados esperados..."
                  className="w-full bg-gray-50 border border-stone-200 focus:border-brand-dark-red focus:ring-1 focus:ring-brand-dark-red rounded-lg px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-gray-50 flex justify-end items-center gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-xs font-black uppercase text-gray-500 border border-stone-200 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTask}
                disabled={!newTask.title.trim()}
                className="px-6 py-2 text-xs font-black uppercase text-white bg-brand-dark-red rounded-lg shadow-lg shadow-brand-dark-red/30 hover:bg-brand-red transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save size={14} />
                Salvar no Backlog
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

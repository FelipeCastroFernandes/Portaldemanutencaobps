/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, HelpCircle, Phone, Clock, Power, Eye, CalendarDays } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  const [activeTab, setActiveTab] = useState<'visualizar' | 'planejador'>('visualizar');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-brand-bg w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-brand-red">
        {/* Header do Modal */}
        <div className="bg-brand-dark-red p-5 flex justify-between items-center text-white border-b-4 border-brand-red">
          <div className="flex items-center gap-3">
            <HelpCircle size={24} className="text-brand-beige" />
            <h2 className="text-xl font-black uppercase tracking-widest">Guia Operacional Integrado</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 text-brand-dark-red bg-[#FDFBF7]">
          
          {/* Seção 1: Contatos */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-brand-red/10">
            <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4 border-b border-brand-red/10 pb-2">
              <Phone size={20} className="text-brand-red" />
              Contatos de Escalonamento
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between font-bold text-sm">
              <div className="flex flex-col items-center p-3 bg-brand-bg rounded-lg w-full text-center shadow-sm">
                <span className="text-xs text-brand-dark-red/60 uppercase tracking-wider mb-1">Nível 1</span>
                <span>Técnico Residente</span>
              </div>
              <div className="hidden md:block text-brand-red/40">➔</div>
              <div className="flex flex-col items-center p-3 bg-brand-bg rounded-lg w-full text-center shadow-sm">
                <span className="text-xs text-brand-dark-red/60 uppercase tracking-wider mb-1">Nível 2</span>
                <span>Supervisor</span>
              </div>
              <div className="hidden md:block text-brand-red/40">➔</div>
              <div className="flex flex-col items-center p-3 bg-brand-red text-white rounded-lg w-full text-center shadow-md">
                <span className="text-xs text-white/70 uppercase tracking-wider mb-1">Nível 3</span>
                <span>Gestão BPS</span>
              </div>
            </div>
          </section>

          {/* Seção 2: Cobertura Horária */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-brand-red/10">
            <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4 border-b border-brand-red/10 pb-2">
              <Clock size={20} className="text-brand-red" />
              Cobertura Horária
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-brand-bg rounded-lg border-l-4 border-emerald-500 shadow-sm">
                <h4 className="font-bold text-sm uppercase mb-2">Dias Úteis</h4>
                <p className="text-sm opacity-80">Equipe completa para atendimento preventivo e corretivo. Operação padrão do shopping.</p>
              </div>
              <div className="p-4 bg-brand-bg rounded-lg border-l-4 border-brand-red shadow-sm">
                <h4 className="font-bold text-sm uppercase mb-2">Plantão</h4>
                <p className="text-sm opacity-80">Fins de semana, feriados e horários estendidos. Acionamento prioritário para emergências.</p>
              </div>
            </div>
          </section>

          {/* Seção 3: Tabela de Horários */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-brand-red/10">
            <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4 border-b border-brand-red/10 pb-2">
              <Power size={20} className="text-brand-red" />
              Acionamento das Escadas Rolantes
            </h3>
            <div className="overflow-x-auto rounded-lg border border-brand-red/10">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-dark-red text-white">
                  <tr>
                    <th className="p-3 font-bold uppercase tracking-wider">Procedimento</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Horário Padrão</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-brand-red/5 hover:bg-brand-bg transition-colors">
                    <td className="p-3 font-bold">Ligar Equipamentos</td>
                    <td className="p-3">09:30 - 10:00 <span className="text-xs opacity-70 ml-1">(Antes da abertura)</span></td>
                  </tr>
                  <tr className="bg-brand-bg/30 hover:bg-brand-bg transition-colors">
                    <td className="p-3 font-bold">Desligar Equipamentos</td>
                    <td className="p-3">22:00 - 22:30 <span className="text-xs opacity-70 ml-1">(Após fechamento)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Seção 4: Instrucional em Abas */}
          <section className="bg-white rounded-xl shadow-sm border border-brand-red/10 overflow-hidden">
            <div className="flex border-b border-brand-red/10">
              <button 
                onClick={() => setActiveTab('visualizar')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 font-black uppercase tracking-widest transition-colors cursor-pointer ${
                  activeTab === 'visualizar' 
                    ? 'bg-brand-red text-white' 
                    : 'text-brand-dark-red hover:bg-brand-bg/80'
                }`}
              >
                <Eye size={18} />
                Visualizar
              </button>
              <button 
                onClick={() => setActiveTab('planejador')}
                className={`flex-1 flex items-center justify-center gap-2 p-4 font-black uppercase tracking-widest transition-colors cursor-pointer ${
                  activeTab === 'planejador' 
                    ? 'bg-brand-red text-white' 
                    : 'text-brand-dark-red hover:bg-brand-bg/80'
                }`}
              >
                <CalendarDays size={18} />
                Planejador
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'visualizar' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h4 className="font-bold text-lg uppercase text-brand-red flex items-center gap-2">
                    <Eye size={20} />
                    Fluxo: Perfil Visualizar
                  </h4>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Como usuário de visualização, você tem acesso aos dashboards de disponibilidade, estatísticas gerais e acompanhamento de chamados.
                  </p>
                  
                  {/* Placeholder de Imagem */}
                  <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-gray-50">
                    [ Placeholder: Print da tela de Visualização ]
                  </div>
                  
                  <div className="bg-brand-bg p-4 rounded-lg mt-4 border border-brand-red/10">
                    <h5 className="font-bold text-xs uppercase text-brand-dark-red mb-2 tracking-wider">Principais Funcionalidades</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-90">
                      <li>Consulte a disponibilidade em tempo real dos equipamentos.</li>
                      <li>Acesse gráficos de paradas e indicadores como MTTR/MTBF.</li>
                      <li>Visualize ordens de serviço e seus status atuais detalhados.</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'planejador' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h4 className="font-bold text-lg uppercase text-brand-red flex items-center gap-2">
                    <CalendarDays size={20} />
                    Fluxo: Perfil Planejador
                  </h4>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Como planejador, além da visualização, você pode gerenciar ordens de serviço, apontar horas, alterar status das ocorrências e muito mais.
                  </p>
                  
                  {/* Placeholder de Imagem */}
                  <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-gray-50">
                    [ Placeholder: Print da tela do Planejador ]
                  </div>
                  
                  <div className="bg-brand-bg p-4 rounded-lg mt-4 border border-brand-red/10">
                    <h5 className="font-bold text-xs uppercase text-brand-dark-red mb-2 tracking-wider">Ações Exclusivas</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 opacity-90">
                      <li>Abra novas ocorrências detalhando a causa raiz da parada.</li>
                      <li>Atualize o andamento, altere o status e registre horas trabalhadas.</li>
                      <li>Acesse o painel completo de Gestão de Tarefas (Painel de Capacidade).</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

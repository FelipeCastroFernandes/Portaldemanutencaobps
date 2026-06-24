/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  Edit2,
  Camera, 
  ShieldCheck, 
  Users, 
  Mail, 
  Briefcase, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ProfileLevel } from '../types';
import PageHeader from './PageHeader';
import { useAuth } from '../hooks/useAuth';

interface UserRegistrationViewProps {
  onBack: () => void;
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (user: User) => void;
  users: User[];
  onDeleteUser: (id: string) => void;
}

export default function UserRegistrationView({ onBack, onAddUser, onUpdateUser, users, onDeleteUser }: UserRegistrationViewProps) {
  const { user: authUser } = useAuth();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    team: '',
    role: '',
    profile: 'Solicitante' as ProfileLevel,
    photo: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: user.password || '',
      team: user.team || '',
      role: user.role || '',
      profile: user.profile || 'Solicitante',
      photo: user.photo || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      team: '',
      role: '',
      profile: 'Solicitante',
      photo: ''
    });
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const openDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        team: formData.team,
        role: formData.role,
        profile: formData.profile,
        photo: formData.photo || undefined
      });
    } else {
      onAddUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        team: formData.team,
        role: formData.role,
        profile: formData.profile,
        photo: formData.photo || undefined
      });
    }

    cancelEdit();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (authUser?.profile !== 'Gestor') {
    return (
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <PageHeader
          title="Cadastro de Usuários"
          subtitle="Controle de Acessos e Perfis"
          onBack={onBack}
        />

        <div className="bg-brand-beige/20 border border-brand-dark-red/10 rounded-3xl p-10 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-dark-red/10 text-brand-dark-red flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <p className="text-brand-dark-red font-black uppercase tracking-tight">
            Acesso Negado. Esta tela é exclusiva para o Gestor do sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      <PageHeader 
        title="Cadastro de Usuários" 
        subtitle="Controle de Acessos e Perfis"
        onBack={onBack} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-brand-dark-red/5 p-8 relative overflow-hidden">
            <h2 className="text-lg font-black text-brand-dark-red uppercase tracking-tight mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingUser ? <Edit2 size={20} /> : <UserPlus size={20} />}
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </div>
              {editingUser && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="text-[9px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  CANCELAR
                </button>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Photo Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-brand-beige/20 border-2 border-brand-dark-red/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-red">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-brand-dark-red/20" size={32} />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-brand-red text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 text-center">Foto (Opcional)</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-brand-dark-red uppercase tracking-[0.2em] mb-2">Nome Completo</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark-red/30" size={16} />
                  <input 
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-brand-beige/10 border border-brand-dark-red/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold"
                    placeholder="Ex: João Silva"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-brand-dark-red uppercase tracking-[0.2em] mb-2">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark-red/30" size={16} />
                  <input 
                    required
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-brand-beige/10 border border-brand-dark-red/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold"
                    placeholder="usuario@botafogopraia.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-brand-dark-red uppercase tracking-[0.2em] mb-2">Senha Inicial</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark-red/30" size={16} />
                  <input 
                    required
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-brand-beige/10 border border-brand-dark-red/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-brand-dark-red uppercase tracking-[0.2em] mb-2">Equipe</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-brand-beige/10 border border-brand-dark-red/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                    value={formData.team}
                    onChange={(e) => setFormData({...formData, team: e.target.value})}
                  >
                    <option value="" disabled>Selecionar...</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Conservação">Conservação</option>
                    <option value="Atendimento">Atendimento</option>
                    <option value="Marketing">Marketing</option>
                    <option value="TI">TI</option>
                    <option value="Administrativo">Administrativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-dark-red uppercase tracking-[0.2em] mb-2">Cargo</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-brand-beige/10 border border-brand-dark-red/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold"
                    placeholder="Ex: Supervisor"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-brand-dark-red uppercase tracking-[0.2em] mb-2">Nível de Perfil</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-brand-beige/10 border border-brand-dark-red/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                  value={formData.profile}
                  onChange={(e) => setFormData({...formData, profile: e.target.value as ProfileLevel})}
                >
                  <option value="Gestor">Gestor</option>
                  <option value="Planejador">Planejador</option>
                  <option value="Solicitante">Solicitante</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-red hover:bg-brand-dark-red text-white p-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-brand-red/20 mt-4 active:scale-95"
              >
                {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </button>
            </form>

            <AnimatePresence>
                  {showSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-4 left-8 right-8 bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <CheckCircle2 size={16} />
                      {editingUser ? 'Usuário Atualizado!' : 'Usuário Cadastrado!'}
                    </motion.div>
                  )}
            </AnimatePresence>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-brand-dark-red/5 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-brand-dark-red uppercase tracking-tight flex items-center gap-2">
                <Users size={20} />
                Usuários Ativos
              </h2>
              <span className="bg-brand-dark-red text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {users.length} Registrados
              </span>
            </div>

            <div className="p-6 overflow-y-auto max-h-[600px] flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={user.id}
                        className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-red/10 group-hover:bg-brand-red transition-colors" />
                        
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-beige/20 border border-brand-dark-red/10 flex items-center justify-center overflow-hidden shrink-0">
                            {user.photo ? (
                              <img src={user.photo} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-brand-dark-red font-black text-lg">{(user.fullName || 'U')[0]}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-brand-dark-red uppercase truncate leading-tight mb-1">{user.fullName || 'Usuário'}</h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold mb-3">
                              <Mail size={10} className="text-brand-red/50" />
                              <span className="truncate">{user.email || 'Email não informado'}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Equipe</span>
                                <span className="text-[10px] font-bold text-brand-dark-red truncate">{user.team || '-'}</span>
                              </div>
                              <div className="flex flex-col bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Nível</span>
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${user.profile === 'Gestor' ? 'text-amber-600' : user.profile === 'Planejador' ? 'text-brand-red' : 'text-blue-600'}`}>
                                  {user.profile || 'Solicitante'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                          <span className="text-[9px] font-bold text-gray-400">Desde {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(user)}
                              className="p-2 text-gray-300 hover:text-brand-dark-red hover:bg-brand-beige/20 rounded-lg transition-all"
                              title="Editar Usuário"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(user)}
                              className="p-2 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all"
                              title="Excluir Usuário"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 opacity-20">
                      <Users size={64} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhum usuário cadastrado</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark-red/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-b-4 border-brand-red"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle size={32} className="text-brand-red" />
                </div>
              </div>

              <h2 className="text-xl font-black text-brand-dark-red uppercase tracking-tight text-center mb-2">
                Excluir Usuário?
              </h2>
              
              <p className="text-sm text-gray-600 text-center mb-6">
                Você está prestes a excluir permanentemente o usuário:
              </p>

              <div className="bg-brand-beige/20 border border-brand-dark-red/10 rounded-xl p-4 mb-6">
                <p className="text-sm font-bold text-brand-dark-red mb-1">
                  {userToDelete.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {userToDelete.email}
                </p>
              </div>

              <p className="text-xs text-brand-red font-bold uppercase tracking-widest mb-6 text-center">
                Esta ação é irreversível e o usuário será removido do banco de dados.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-brand-red hover:bg-brand-dark-red text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

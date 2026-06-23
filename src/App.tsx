"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ArrowLeft, ChevronRight, BarChart3, Settings, PlusCircle } from 'lucide-react';
import { INITIAL_ESCADA_DATA, INITIAL_ELEVADOR_DATA, HORAS_MES, MESES_ORDEM } from './data/initialData';
import { MaintenanceRecord, EquipmentType, Occurrence, User } from './types';
import DashboardView from './components/DashboardView';
import DashboardCover from './components/DashboardCover';
import MainPortal from './components/MainPortal';
import ServiceOrdersView from './components/ServiceOrdersView';
import UserRegistrationView from './components/UserRegistrationView';
import Login from './components/Login';
import OccurrenceModal from './components/OccurrenceModal';
import { formatTime } from './lib/utils';

import { getUsers, saveUser, updateUser as updateApiUser, deleteUser as deleteApiUser, getOccurrences, saveOccurrence as apiSaveOccurrence, updateOccurrence as apiUpdateOccurrence, deleteOccurrence as apiDeleteOccurrence, getEquipmentData } from './lib/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<'portal' | 'cover' | 'escadas' | 'elevadores' | 'orders' | 'registration'>('portal');
  const [escadaData, setEscadaData] = useState<MaintenanceRecord[]>(INITIAL_ESCADA_DATA);
  const [elevadorData, setElevadorData] = useState<MaintenanceRecord[]>(INITIAL_ELEVADOR_DATA);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);

  // Load from Supabase/localStorage if exists
  useEffect(() => {
    async function loadData() {
      try {
        const dbEscadas = await getEquipmentData('escadas').catch(() => []);
        const dbElevadores = await getEquipmentData('elevadores').catch(() => []);
        const dbOccurrences = await getOccurrences().catch(() => []);
        const dbUsers = await getUsers().catch(() => []);

        if (dbEscadas.length > 0) setEscadaData(dbEscadas);
        if (dbElevadores.length > 0) setElevadorData(dbElevadores);
        if (dbOccurrences.length > 0) setOccurrences(dbOccurrences);

        let loadedUsers = [...dbUsers];

        const hasAdmin = loadedUsers.some(u => u.email?.toLowerCase() === 'admin@botafogopraia.com.br');
        const hasTeste = loadedUsers.some(u => u.email?.toLowerCase() === 'teste@botafogopraia.com.br');

        const defaultAdmin: User = { 
          id: 'admin',
          fullName: 'Administrador',
          email: 'admin@botafogopraia.com.br', 
          password: 'bps',
          team: 'TI',
          role: 'Administrador',
          profile: 'gestao',
          createdAt: new Date().toISOString()
        };

        const defaultTeste: User = { 
          id: 'teste',
          fullName: 'Usuário de Teste',
          email: 'teste@botafogopraia.com.br', 
          password: '123',
          team: 'Manutenção',
          role: 'Técnico',
          profile: 'visualizacao',
          createdAt: new Date().toISOString()
        };

        if (!hasAdmin) {
          loadedUsers.push(defaultAdmin);
          saveUser(defaultAdmin).catch(console.error);
        }
        if (!hasTeste) {
          loadedUsers.push(defaultTeste);
          saveUser(defaultTeste).catch(console.error);
        }

        setUsers(loadedUsers);
      } catch (e) {
        console.error("Failed to load initial data:", e);
        // Set default users anyway so they can login locally
        const defaultAdmin: User = { 
          id: 'admin',
          fullName: 'Administrador',
          email: 'admin@botafogopraia.com.br', 
          password: 'bps',
          team: 'TI',
          role: 'Administrador',
          profile: 'gestao',
          createdAt: new Date().toISOString()
        };
        const defaultTeste: User = { 
          id: 'teste',
          fullName: 'Usuário de Teste',
          email: 'teste@botafogopraia.com.br', 
          password: '123',
          team: 'Manutenção',
          role: 'Técnico',
          profile: 'visualizacao',
          createdAt: new Date().toISOString()
        };
        setUsers([defaultAdmin, defaultTeste]);
      }
    }
    
    loadData();

    const auth = sessionStorage.getItem('bps_auth');
    const authUser = sessionStorage.getItem('bps_auth_user');
    if (auth === 'true' && authUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(authUser));
    }
  }, []);

  const handleLogin = (loginData: { email?: string; username?: string; password?: string }) => {
    const user = users.find(u => {
      const inputStr = (loginData.email || loginData.username || '').toLowerCase().trim();
      const userEmail = (u.email || '').toLowerCase();
      const userUsername = ((u as any).username || '').toLowerCase();
      
      const matchEmail = userEmail === inputStr;
      const matchUsername = userEmail.split('@')[0] === inputStr;
      const legacyUsernameMatch = userUsername === inputStr;
      
      return (matchEmail || matchUsername || legacyUsernameMatch) && u.password === loginData.password;
    });
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      sessionStorage.setItem('bps_auth', 'true');
      sessionStorage.setItem('bps_auth_user', JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  };

  const handleAddUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const savedUser = await saveUser(userData as User);
      setUsers([...users, savedUser]);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar usuário. Verifique a conexão com o Supabase.');
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const savedUser = await updateApiUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? savedUser : u));
    } catch(e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('bps_auth');
    sessionStorage.removeItem('bps_auth_user');
    setActivePage('portal');
  };

  const handleDeleteUser = async (id: string) => {
    if (users.length <= 1) {
      alert('Não é possível excluir o único usuário.');
      return;
    }
    try {
      await deleteApiUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch(e) {
      console.error(e);
    }
  };

  // Recalculate indicators based on occurrences
  const processedData = useMemo(() => {
    const calculateForType = (type: EquipmentType, baseData: MaintenanceRecord[]) => {
      const typeOccurrences = occurrences.filter(o => o.type === type);
      if (typeOccurrences.length === 0) return baseData;

      const groupedOcc = typeOccurrences.reduce((acc, occ) => {
        const date = new Date(occ.start);
        const mes = MESES_ORDEM[date.getMonth()];
        const key = `${occ.equip}-${mes}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(occ);
        return acc;
      }, {} as Record<string, Occurrence[]>);

      const updatedData = [...baseData];

      Object.entries(groupedOcc).forEach(([key, value]) => {
        const occs = value as Occurrence[];
        const [equip, mes] = key.split('-');
        const totalHours = HORAS_MES[mes as keyof typeof HORAS_MES] || 744;
        
        let downtimeMs = 0;
        occs.forEach(occ => {
          if (occ.end) {
            downtimeMs += new Date(occ.end).getTime() - new Date(occ.start).getTime();
          }
        });

        const downtimeHours = downtimeMs / (1000 * 60 * 60);
        const chamados = occs.length;
        const disp = ((totalHours - downtimeHours) / totalHours) * 100;
        const mtbfHours = chamados > 0 ? (totalHours - downtimeHours) / chamados : totalHours;
        const mttrHours = chamados > 0 ? downtimeHours / chamados : 0;

        const index = updatedData.findIndex(d => d.equip === equip && d.mes === mes);
        const newRecord: MaintenanceRecord = {
          equip,
          mes,
          chamados,
          disp: parseFloat(disp.toFixed(1)),
          mtbf: formatTime(mtbfHours),
          mttr: formatTime(mttrHours)
        };

        if (index > -1) {
          updatedData[index] = newRecord;
        } else {
          updatedData.push(newRecord);
        }
      });

      return updatedData;
    };

    return {
      escadas: calculateForType('escadas', escadaData),
      elevadores: calculateForType('elevadores', elevadorData)
    };
  }, [escadaData, elevadorData, occurrences]);

  const handleAddOccurrence = async (occ: Occurrence) => {
    try {
      const savedOcc = await apiSaveOccurrence(occ);
      setOccurrences(prev => [...prev, savedOcc]);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleUpdateOccurrence = async (updatedOcc: Occurrence) => {
    try {
      const savedOcc = await apiUpdateOccurrence(updatedOcc);
      setOccurrences(prev => prev.map(o => o.id === updatedOcc.id ? savedOcc : o));
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDeleteOccurrence = async (id: string) => {
    try {
      await apiDeleteOccurrence(id);
      const updated = occurrences.filter(o => o.id !== id);
      setOccurrences(updated);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg font-sans selection:bg-brand-red/20">
      <AnimatePresence mode="wait">
        {activePage === 'portal' ? (
          <MainPortal 
            onEscadas={() => setActivePage('cover')}
            onElevadores={() => setActivePage('elevadores')}
            onOrders={() => setActivePage('orders')}
            onManageUsers={() => setActivePage('registration')}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        ) : activePage === 'orders' ? (
          <ServiceOrdersView 
            occurrences={occurrences} 
            users={users}
            currentUser={currentUser}
            onBack={() => setActivePage('cover')}
            onUpdate={handleUpdateOccurrence}
            onDelete={handleDeleteOccurrence}
            onAdd={handleAddOccurrence}
          />
        ) : activePage === 'registration' ? (
          <UserRegistrationView 
            users={users}
            onBack={() => setActivePage('portal')}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        ) : activePage === 'cover' ? (
          <DashboardCover 
            onNavigate={setActivePage} 
            onViewOrders={() => setActivePage('orders')}
            occurrences={occurrences}
            onOpenOccurrence={() => setIsOccurrenceModalOpen(true)}
            onBack={() => setActivePage('portal')}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 md:p-6"
          >
            <DashboardView 
              type={activePage} 
              data={activePage === 'escadas' ? processedData.escadas : processedData.elevadores}
              onBack={() => setActivePage('cover')}
              onOpenOccurrence={() => setIsOccurrenceModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <OccurrenceModal
        isOpen={isOccurrenceModalOpen}
        onClose={() => setIsOccurrenceModalOpen(false)}
        occurrences={occurrences}
        users={users}
        currentUser={currentUser}
        onAdd={handleAddOccurrence}
        onUpdate={handleUpdateOccurrence}
        onDelete={handleDeleteOccurrence}
      />
      
      {/* Floating Action Button for Occurrence when not in login/portal/orders/registration */}
      {activePage !== 'portal' && activePage !== 'cover' && activePage !== 'orders' && activePage !== 'registration' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
           <button
            onClick={() => setIsOccurrenceModalOpen(true)}
            className="p-4 bg-brand-red text-white rounded-full shadow-lg hover:bg-brand-dark-red transition-all group relative"
            title="Incluir Ocorrência"
          >
            <PlusCircle size={24} />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-brand-red px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest text-[10px]">
              Incluir Ocorrência
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

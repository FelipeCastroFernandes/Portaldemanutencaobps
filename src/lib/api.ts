import { User, Occurrence, MaintenanceRecord, EquipmentType, ProfileLevel, Task } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

let _mockUsers: User[] = [];
let _mockOccurrences: Occurrence[] = [];
let _mockTasks: Task[] = [];

if (typeof window !== 'undefined') {
  try {
    const storedUsers = localStorage.getItem('bps_users');
    if (storedUsers) _mockUsers = JSON.parse(storedUsers);
    
    const storedOccurrences = localStorage.getItem('bps_occurrences');
    if (storedOccurrences) _mockOccurrences = JSON.parse(storedOccurrences);

    const storedTasks = localStorage.getItem('bps_tasks');
    if (storedTasks) _mockTasks = JSON.parse(storedTasks);
  } catch (e) {}
}

const saveLocal = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bps_users', JSON.stringify(_mockUsers));
    localStorage.setItem('bps_occurrences', JSON.stringify(_mockOccurrences));
    localStorage.setItem('bps_tasks', JSON.stringify(_mockTasks));
  }
};

// --- Users ---
export async function getUsers(): Promise<User[]> {
  try {
    if (isSupabaseConfigured() && supabase) {
      console.log('[getUsers] Fetching from Supabase...');
      const { data, error } = await supabase.from('users').select('*');
      
      if (error) {
        console.error('[getUsers] Supabase error:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        console.warn("Supabase query users error, using local fallback:", error);
      } else if (data) {
        console.log('[getUsers] Successfully fetched', data.length, 'users from Supabase');
        return data.map(dbUserToLocalMap);
      }
    } else {
      console.log('[getUsers] Supabase not configured');
    }
  } catch (e) {
    console.error('[getUsers] Exception caught:', e);
    console.warn("Failed fetching users from Supabase, using local fallback:", e);
  }
  
  console.log('[getUsers] Using localStorage fallback with', _mockUsers.length, 'users');
  return _mockUsers.map(normalizeUserProfile);
}

export async function saveUser(user: User): Promise<User> {
  const isConfigured = isSupabaseConfigured();
  console.log('[saveUser] Starting save. Supabase configured:', isConfigured);
  
  try {
    if (isConfigured && supabase) {
      console.log('[saveUser] Attempting Supabase insert with:', {
        full_name: user.fullName,
        email: user.email,
        team: user.team,
        profile: user.profile,
      });
      
      const { data, error } = await supabase.from('users').insert({
        full_name: user.fullName,
        email: user.email,
        password: user.password,
        photo: user.photo,
        team: user.team,
        role: user.role,
        profile: profileToDb(user.profile),
      }).select().single();
      
      if (error) {
        console.error('[saveUser] Supabase error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        console.warn("Supabase saveUser error, using local fallback:", error);
      } else if (data) {
        console.log('[saveUser] Successfully saved to Supabase:', data);
        const localUser = dbUserToLocalMap(data);
        _mockUsers.push(localUser);
        saveLocal();
        return localUser;
      }
    } else {
      console.log('[saveUser] Supabase not configured or not available');
    }
  } catch (e) {
    console.error('[saveUser] Exception caught:', e);
    console.warn("Failed saving user to Supabase, using local fallback:", e);
  }

  console.log('[saveUser] Falling back to localStorage');
  const newUser = { ...user, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
  _mockUsers.push(newUser);
  saveLocal();
  return newUser;
}

export async function updateUser(user: User): Promise<User> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').update({
        full_name: user.fullName,
        email: user.email,
        password: user.password,
        photo: user.photo,
        team: user.team,
        role: user.role,
        profile: profileToDb(user.profile),
      }).eq('id', user.id).select().single();
      
      if (!error && data) {
        const localUser = dbUserToLocalMap(data);
        _mockUsers = _mockUsers.map(u => u.id === localUser.id ? localUser : u);
        saveLocal();
        return localUser;
      }
      console.warn("Supabase updateUser error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed updating user on Supabase, using local fallback:", e);
  }

  _mockUsers = _mockUsers.map(u => u.id === user.id ? user : u);
  saveLocal();
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        console.warn("Supabase deleteUser error:", error);
      }
    }
  } catch (e) {
    console.warn("Failed deleting user on Supabase:", e);
  }

  _mockUsers = _mockUsers.filter(u => u.id !== id);
  saveLocal();
}

// --- Occurrences ---
export async function getOccurrences(): Promise<Occurrence[]> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('occurrences').select('*').order('start_time', { ascending: false });
      if (!error && data) {
        return data.map(dbOccurrenceToLocalMap);
      }
      console.warn("Supabase query occurrences error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed fetching occurrences from Supabase, using local fallback:", e);
  }
  return [..._mockOccurrences].sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
}

export async function saveOccurrence(occurrence: Occurrence): Promise<Occurrence> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('occurrences').insert({
        type: occurrence.type,
        equip: occurrence.equip,
        call_number: occurrence.callNumber,
        attendant: occurrence.attendant,
        created_by: occurrence.createdBy,
        start_time: occurrence.start,
        end_time: occurrence.end || null,
        technician: occurrence.technician || null,
        reason: occurrence.reason || null,
        causa_parada: occurrence.causa_parada || null,
        is_equipment_stopped: occurrence.is_equipment_stopped ?? null,
        status_history: occurrence.statusHistory || null,
        extra_scope_approval_ms: occurrence.extraScopeApprovalMs || null,
        closed_by: occurrence.closedBy || null,
      }).select().single();
      
      if (!error && data) {
        const localOcc = dbOccurrenceToLocalMap(data);
        _mockOccurrences.push(localOcc);
        saveLocal();
        return localOcc;
      }
      console.warn("Supabase saveOccurrence error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed saving occurrence to Supabase, using local fallback:", e);
  }

  const newOcc = { ...occurrence, id: Math.random().toString(36).substr(2, 9) };
  _mockOccurrences.push(newOcc);
  saveLocal();
  return newOcc;
}

export async function updateOccurrence(occurrence: Occurrence): Promise<Occurrence> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('occurrences').update({
        type: occurrence.type,
        equip: occurrence.equip,
        call_number: occurrence.callNumber,
        attendant: occurrence.attendant,
        created_by: occurrence.createdBy,
        start_time: occurrence.start,
        end_time: occurrence.end || null,
        technician: occurrence.technician || null,
        reason: occurrence.reason || null,
        causa_parada: occurrence.causa_parada || null,
        is_equipment_stopped: occurrence.is_equipment_stopped ?? null,
        status_history: occurrence.statusHistory || null,
        extra_scope_approval_ms: occurrence.extraScopeApprovalMs || null,
        closed_by: occurrence.closedBy || null,
      }).eq('id', occurrence.id).select().single();
      
      if (!error && data) {
        const localOcc = dbOccurrenceToLocalMap(data);
        _mockOccurrences = _mockOccurrences.map(o => o.id === localOcc.id ? localOcc : o);
        saveLocal();
        return localOcc;
      }
      console.warn("Supabase updateOccurrence error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed updating occurrence on Supabase, using local fallback:", e);
  }

  _mockOccurrences = _mockOccurrences.map(o => o.id === occurrence.id ? occurrence : o);
  saveLocal();
  return occurrence;
}

export async function deleteOccurrence(id: string): Promise<void> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('occurrences').delete().eq('id', id);
      if (error) {
        console.warn("Supabase deleteOccurrence error:", error);
      }
    }
  } catch (e) {
    console.warn("Failed deleting occurrence from Supabase:", e);
  }

  _mockOccurrences = _mockOccurrences.filter(o => o.id !== id);
  saveLocal();
}

// --- Tasks ---
export async function getTasks(): Promise<Task[]> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('tasks').select('*').order('score', { ascending: false });
      if (!error && data) {
        return data.map(dbTaskToLocalMap);
      }
      console.warn("Supabase query tasks error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed fetching tasks from Supabase, using local fallback:", e);
  }
  return [..._mockTasks].sort((a, b) => b.score - a.score);
}

export async function saveTask(task: Task): Promise<Task> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('tasks').insert({
        title: task.title,
        hours: task.hours,
        impact: task.impact,
        urgency: task.urgency,
        responsible: task.responsible,
        notes: task.notes,
        status: task.status,
        collaborator: task.collaborator || null,
        score: task.score,
        archived_at: task.archivedAt || null,
      }).select().single();

      if (!error && data) {
        const localTask = dbTaskToLocalMap(data);
        _mockTasks.push(localTask);
        saveLocal();
        return localTask;
      }
      console.warn("Supabase saveTask error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed saving task to Supabase, using local fallback:", e);
  }

  const newTask = { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
  _mockTasks.push(newTask);
  saveLocal();
  return newTask;
}

export async function updateTask(task: Task): Promise<Task> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('tasks').update({
        title: task.title,
        hours: task.hours,
        impact: task.impact,
        urgency: task.urgency,
        responsible: task.responsible,
        notes: task.notes,
        status: task.status,
        collaborator: task.collaborator || null,
        score: task.score,
        archived_at: task.archivedAt || null,
      }).eq('id', task.id).select().single();

      if (!error && data) {
        const localTask = dbTaskToLocalMap(data);
        _mockTasks = _mockTasks.map(t => t.id === localTask.id ? localTask : t);
        saveLocal();
        return localTask;
      }
      console.warn("Supabase updateTask error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed updating task on Supabase, using local fallback:", e);
  }

  _mockTasks = _mockTasks.map(t => t.id === task.id ? task : t);
  saveLocal();
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        console.warn("Supabase deleteTask error:", error);
      }
    }
  } catch (e) {
    console.warn("Failed deleting task from Supabase:", e);
  }

  _mockTasks = _mockTasks.filter(t => t.id !== id);
  saveLocal();
}

export async function archiveDoneTasks(): Promise<void> {
  const doneTasks = _mockTasks.filter(t => t.status === 'done' && !t.archivedAt);
  for (const task of doneTasks) {
    const archived: Task = { ...task, archivedAt: new Date().toISOString() };
    await updateTask(archived);
  }
}

// --- Equipment data ---
export async function getEquipmentData(type: EquipmentType): Promise<MaintenanceRecord[]> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('maintenance_records').select('*').eq('type', type);
      if (!error && data) {
        return data.map(dbEquipmentToLocalMap);
      }
      console.warn("Supabase query maintenance records error:", error);
    }
  } catch (e) {
    console.warn("Failed fetching equipment data from Supabase:", e);
  }
  return [];
}

// --- Mappers ---
// Convert app profile values to Supabase enum
function profileToDb(profile: string | undefined): string {
  if (!profile) return 'visualizacao';
  // Map app profiles to database enum value
  // Currently the database only has 'visualizacao' enum value
  return 'visualizacao';
}

// Convert Supabase profile values to app format
function profileFromDb(dbProfile: string | undefined): string {
  if (!dbProfile || dbProfile === 'visualizacao') return 'Solicitante';
  return dbProfile;
}

function dbUserToLocalMap(dbRow: any): User {
  return normalizeUserProfile({
    id: dbRow.id,
    fullName: dbRow.full_name || '',
    email: dbRow.email || '',
    password: dbRow.password,
    photo: dbRow.photo,
    team: dbRow.team || '',
    role: dbRow.role || '',
    profile: profileFromDb(dbRow.profile) || 'Solicitante',
    createdAt: dbRow.created_at || dbRow.createdAt || new Date().toISOString(),
  });
}

function normalizeProfile(profile: string | undefined): ProfileLevel {
  if (profile === 'Gestor' || profile === 'Planejador' || profile === 'Solicitante') return profile;
  if (profile === 'gestao') return 'Gestor';
  return 'Solicitante';
}

function normalizeUserProfile(user: User): User {
  return {
    ...user,
    profile: normalizeProfile(user.profile),
  };
}

function dbOccurrenceToLocalMap(dbRow: any): Occurrence {
  return {
    id: dbRow.id,
    type: dbRow.type,
    equip: dbRow.equip,
    callNumber: dbRow.call_number || dbRow.callNumber,
    attendant: dbRow.attendant,
    createdBy: dbRow.created_by || dbRow.createdBy,
    start: dbRow.start_time || dbRow.start,
    end: dbRow.end_time || dbRow.end,
    technician: dbRow.technician,
    reason: dbRow.reason,
    causa_parada: dbRow.causa_parada || dbRow.causaParada,
    is_equipment_stopped: dbRow.is_equipment_stopped ?? dbRow.isEquipmentStopped,
    statusHistory: dbRow.status_history || dbRow.statusHistory,
    extraScopeApprovalMs: Number(dbRow.extra_scope_approval_ms || dbRow.extraScopeApprovalMs || 0) || undefined,
    closedBy: dbRow.closed_by || dbRow.closedBy,
  };
}

function dbTaskToLocalMap(dbRow: any): Task {
  return {
    id: dbRow.id,
    title: dbRow.title,
    hours: Number(dbRow.hours || 0),
    impact: dbRow.impact || 'medium',
    urgency: dbRow.urgency || 'planned',
    responsible: dbRow.responsible || '',
    notes: dbRow.notes || '',
    status: dbRow.status || 'backlog',
    collaborator: dbRow.collaborator || undefined,
    score: Number(dbRow.score || 0),
    createdAt: dbRow.created_at || dbRow.createdAt || new Date().toISOString(),
    archivedAt: dbRow.archived_at || dbRow.archivedAt || undefined,
  };
}

function dbEquipmentToLocalMap(dbRow: any): MaintenanceRecord {
  return {
    equip: dbRow.equip,
    mes: dbRow.mes,
    chamados: Number(dbRow.chamados || 0),
    disp: Number(dbRow.disp || 0),
    mtbf: dbRow.mtbf || "00:00:00",
    mttr: dbRow.mttr || "00:00:00",
  };
}

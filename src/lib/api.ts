import { User, Occurrence, MaintenanceRecord, EquipmentType } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

let _mockUsers: User[] = [];
let _mockOccurrences: Occurrence[] = [];

if (typeof window !== 'undefined') {
  try {
    const storedUsers = localStorage.getItem('bps_users');
    if (storedUsers) _mockUsers = JSON.parse(storedUsers);
    
    const storedOccurrences = localStorage.getItem('bps_occurrences');
    if (storedOccurrences) _mockOccurrences = JSON.parse(storedOccurrences);
  } catch (e) {}
}

const saveLocal = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bps_users', JSON.stringify(_mockUsers));
    localStorage.setItem('bps_occurrences', JSON.stringify(_mockOccurrences));
  }
};

// --- Users ---
export async function getUsers(): Promise<User[]> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        return data.map(dbUserToLocalMap);
      }
      console.warn("Supabase query users error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed fetching users from Supabase, using local fallback:", e);
  }
  return [..._mockUsers];
}

export async function saveUser(user: User): Promise<User> {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').insert({
        full_name: user.fullName,
        email: user.email,
        password: user.password,
        photo: user.photo,
        team: user.team,
        role: user.role,
        profile: user.profile,
      }).select().single();
      
      if (!error && data) {
        const localUser = dbUserToLocalMap(data);
        _mockUsers.push(localUser);
        saveLocal();
        return localUser;
      }
      console.warn("Supabase saveUser error, using local fallback:", error);
    }
  } catch (e) {
    console.warn("Failed saving user to Supabase, using local fallback:", e);
  }

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
        profile: user.profile,
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
function dbUserToLocalMap(dbRow: any): User {
  return {
    id: dbRow.id,
    fullName: dbRow.full_name || '',
    email: dbRow.email || '',
    password: dbRow.password,
    photo: dbRow.photo,
    team: dbRow.team || '',
    role: dbRow.role || '',
    profile: dbRow.profile || 'visualizacao',
    createdAt: dbRow.created_at || dbRow.createdAt || new Date().toISOString(),
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
    closedBy: dbRow.closed_by || dbRow.closedBy,
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

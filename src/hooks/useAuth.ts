import { ProfileLevel, User } from '../types';

function normalizeProfile(profile: string | undefined): ProfileLevel {
  if (!profile) return 'visualizar';
  const p = profile.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (p === 'gestor' || p === 'gestao') return 'Gestor';
  if (p === 'planejador') return 'Planejador';
  return 'visualizar';
}

export function useAuth() {
  if (typeof window === 'undefined') {
    return { user: null as User | null };
  }

  const storedUser = sessionStorage.getItem('bps_auth_user');

  try {
    const user = storedUser ? JSON.parse(storedUser) as User : null;
    return { user: user ? { ...user, profile: normalizeProfile(user.profile) } : null };
  } catch {
    return { user: null as User | null };
  }
}

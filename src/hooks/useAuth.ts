import { ProfileLevel, User } from '../types';

function normalizeProfile(profile: string | undefined): ProfileLevel {
  if (profile === 'Gestor' || profile === 'Planejador' || profile === 'Solicitante') return profile;
  if (profile === 'gestao') return 'Gestor';
  return 'Solicitante';
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

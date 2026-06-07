// features/auth/hooks/useAuth.ts
import { useState } from 'react';

import type { AuthState } from '../types/auth.types';
import { authService } from '../services/auth.services';

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const storedUserType = localStorage.getItem('userType');
    let userType: 'ETABLISSEMENT' | 'ETUDIANT' | null = null;
    if (storedUserType === 'ETABLISSEMENT' || storedUserType === 'ETUDIANT') {
      userType = storedUserType;
    }
    return {
      isAuthenticated: !!localStorage.getItem('token'),
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role'),
      userType: userType,
      etablissementId: localStorage.getItem('etablissementId'),
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, role, userType, etablissementId } = await authService.login({ email, password });
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userType', userType);
      if (etablissementId) localStorage.setItem('etablissementId', etablissementId);
      setAuth({ isAuthenticated: true, token, role, userType, etablissementId });
      return true;
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userType');
    localStorage.removeItem('etablissementId');
    setAuth({ isAuthenticated: false, token: null, role: null, userType: null, etablissementId: null });
  };

  return { auth, login, logout, loading, error };
};
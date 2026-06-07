// features/auth/services/auth.services.ts
import { api } from '@/lib/api';
import type { LoginCredentials, RegisterEtablissementData, RegisterEtudiantData } from '../types/auth.types';

export const authService = {
  login: async (creds: LoginCredentials) => {
    const res = await api.login(creds.email, creds.password);
    const { token, role, userType, etablissementId } = res.data;
    return { 
      token, 
      role, 
      userType: userType as 'ETABLISSEMENT' | 'ETUDIANT', 
      etablissementId 
    };
  },
  registerEtablissement: async (data: RegisterEtablissementData) => {
    return api.registerEtablissement(data);
  },
  registerEtudiant: async (data: RegisterEtudiantData) => {
    return api.registerEtudiant(data);
  },
};
// features/dossier/services/dossier.service.ts
import { api } from '@/lib/api';
import type { CreationDossierRequest } from '../types/dossier.types';

export const dossierService = {
  creer: (data: CreationDossierRequest) => api.creerDossier(data),
  validerSource: (id: string, commentaire: string) => api.validerParSource(id, commentaire),
  consentement: (id: string) => api.consentementEtudiant(id),
  repondre: (id: string, accepte: boolean, commentaire: string) =>
    api.repondreTransfert(id, accepte, commentaire),
  rechercher: (email: string) => api.rechercherParEmail(email),
  getParcours: (id: string) => api.getParcours(id),
  getDossiers: () => api.getDossiersSource(),
  getDossierById: (id: string) => api.getDossierById(id),
  getHistorique: (id: string) => api.getHistorique(id),
  getStatistiques: () => api.getStatistiques(),
  getMesDossiers: () => api.getMesDossiers(),
};
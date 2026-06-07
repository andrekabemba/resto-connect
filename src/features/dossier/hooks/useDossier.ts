// features/dossier/hooks/useDossier.ts
import { useState } from 'react';
import type { CreationDossierRequest } from '../types/dossier.types';
import { dossierService } from '../services/dossier.services';

export const useDossier = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const creerDossier = (data: CreationDossierRequest) =>
    handleRequest(() => dossierService.creer(data).then(res => res.data));
  const validerSource = (id: string, commentaire: string) =>
    handleRequest(() => dossierService.validerSource(id, commentaire).then(res => res.data));
  const consentement = (id: string) =>
    handleRequest(() => dossierService.consentement(id));
  const repondre = (id: string, accepte: boolean, commentaire: string) =>
    handleRequest(() => dossierService.repondre(id, accepte, commentaire).then(res => res.data));
  const rechercher = (email: string) =>
    handleRequest(() => dossierService.rechercher(email).then(res => res.data));
  const getParcours = (id: string) =>
    handleRequest(() => dossierService.getParcours(id).then(res => res.data));
  const getDossiers = () =>
    handleRequest(() => dossierService.getDossiers().then(res => res.data));
  const getDossier = (id: string) =>
    handleRequest(() => dossierService.getDossierById(id).then(res => res.data));
  const getHistorique = (id: string) =>
    handleRequest(() => dossierService.getHistorique(id).then(res => res.data));
  const getStatistiques = () =>
    handleRequest(() => dossierService.getStatistiques().then(res => res.data));
  const getMesDossiers = () =>
    handleRequest(() => dossierService.getMesDossiers().then(res => res.data));

  return {
    loading,
    error,
    creerDossier,
    validerSource,
    consentement,
    repondre,
    rechercher,
    getParcours,
    getDossiers,
    getDossier,
    getHistorique,
    getStatistiques,
    getMesDossiers,
  };
};
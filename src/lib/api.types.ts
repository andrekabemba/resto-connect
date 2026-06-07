// api.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface Etablissement {
  id: string;
  nom: string;
  adresse?: string;
  emailContact: string;
  actif: boolean;
}

export interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: string;
  identifiantNational?: string;
}

export interface UniteEnseignement {
  code: string;
  nom: string;
  credits: number;
  note?: number;
}

export interface ParcoursAcademique {
  intituleDiplome: string;
  creditsObtenus: number;
  unites: UniteEnseignement[];
}

export interface DossierTransfert {
  id: string;
  etablissementSourceNom: string;
  etablissementSourceId: string; // Ajout nécessaire
  etudiantNom: string;
  etudiantPrenom: string;
  etudiantEmail: string;
  statut: 'BROUILLON' | 'EN_ATTENTE_VALIDATION_SOURCE' | 'EN_ATTENTE_CONSENTEMENT_ETUDIANT' | 'EN_COURS_CIBLE' | 'ACCEPTE' | 'REFUSE' | 'ANNULE';
  dateCreation: string;
  dateValidationSource?: string;
  dateAcceptationCible?: string;
  commentaireSource?: string;
  commentaireCible?: string;
}

export interface StatistiquesDTO {
  totalDossiers: number;
  dossiersAcceptes: number;
  dossiersRefuses: number;
  dossiersEnCours: number;
  dossiersParMois: number;
}

export interface HistoriqueAction {
  id: string;
  action: string;
  description: string;
  utilisateurId: string;
  utilisateurType: string;
  dossierId: string;
  dateAction: string;
}
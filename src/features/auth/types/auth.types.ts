export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  userType: 'ETABLISSEMENT' | 'ETUDIANT' | null;
  etablissementId: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterEtablissementData {
  nom: string;
  adresse?: string;
  emailContact: string;
  password: string;
}

export interface RegisterEtudiantData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  dateNaissance: string;
  identifiantNational?: string;
}
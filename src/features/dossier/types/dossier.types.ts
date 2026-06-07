export interface CreationDossierRequest {
  emailEtudiant: string;
  nomEtudiant?: string;
  prenomEtudiant?: string;
  dateNaissance?: string;
  identifiantNational?: string;
  intituleDiplome?: string;
  creditsObtenus?: number;
  unites?: Array<{
    code: string;
    nom: string;
    credits: number;
    note?: number;
  }>;
  commentaireSource?: string;
}
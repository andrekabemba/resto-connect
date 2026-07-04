import { create } from 'zustand';

export type TableStatus = 'LIBRE' | 'COMMANDE' | 'SERVI' | 'EN_ATTENTE_ENCAISSEMENT';

// Structure de l'entité Table du diagramme de classe
export interface Table {
  numero: number;
  capacite: number;
  statut: TableStatus;
  commandeActiveId: string | null;
}

export interface OrderLine {
  id: string;
  product: {
    id: string;
    nom: string;
    prixVente: number;
    disponible: boolean;
    imageUrl?: string;
  };
  quantite: number;
}

export interface SalleCommande {
  id: string;
  tableNumero: number;
  lignes: OrderLine[];
  serveurId: string;
  statut: 'EN_COURS' | 'PAYEE';
}

// Structure rigoureuse de l'entité Reservation du diagramme de classe
export interface Reservation {
  id: number;          // id: int
  dateHeure: string;   // dateHeure: datetime
  nbPersonnes: number; // nbPersonnes: int
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'CLIENT_ARRIVE'; // statut: string
  tableNumero?: number; // Relation "occupe" vers la Table
}

interface PosState {
  tables: Table[];
  commandesSalle: SalleCommande[];
  selectedTableNumero: number | null;
  panier: OrderLine[];
  reservations: Reservation[]; // État global stockant les réservations
  
  selectTable: (numero: number | null) => void;
  changeTableStatus: (numero: number, newStatus: TableStatus) => void;
  clearTable: (tableNumero: number) => void;
  addToCart: (item: { id: string; nom: string; prix: number; imageUrl?: string }) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  
  // Méthodes requises pour la gestion des réservations
  ajouterReservation: (nouvelle: Omit<Reservation, 'id' | 'statut'>) => void;
  annulerReservation: (id: number) => void; // Méthode annuler() du diagramme
}

export const usePosStore = create<PosState>((set) => ({
  tables: [
    { numero: 1, capacite: 2, statut: 'LIBRE', commandeActiveId: null },
    { numero: 2, capacite: 4, statut: 'COMMANDE', commandeActiveId: 'CMD-101' },
    { numero: 3, capacite: 2, statut: 'SERVI', commandeActiveId: 'CMD-102' },
    { numero: 4, capacite: 6, statut: 'EN_ATTENTE_ENCAISSEMENT', commandeActiveId: 'CMD-103' },
    { numero: 5, capacite: 4, statut: 'LIBRE', commandeActiveId: null },
    { numero: 6, capacite: 8, statut: 'LIBRE', commandeActiveId: null },
  ],
  commandesSalle: [],
  selectedTableNumero: null,
  panier: [],
  reservations: [], // Initialisation du tableau vide des réservations

  selectTable: (numero) => set({ selectedTableNumero: numero }),

  changeTableStatus: (numero, newStatus) => set((state) => ({
    tables: state.tables.map((table) =>
      table.numero === numero ? { ...table, statut: newStatus } : table
    ),
  })),

  clearTable: (tableNumero) => set((state) => ({
    tables: state.tables.map((table) =>
      table.numero === tableNumero ? { ...table, statut: 'LIBRE', commandeActiveId: null } : table
    )
  })),

  addToCart: (item) => set((state) => {
    const ligneExistante = state.panier.find((l) => l.product.id === item.id);
    if (ligneExistante) {
      return {
        panier: state.panier.map((l) =>
          l.product.id === item.id ? { ...l, quantite: l.quantite + 1 } : l
        ),
      };
    }
    const nouvelleLigne: OrderLine = {
      id: Math.random().toString(36).substring(2, 9),
      product: {
        id: item.id,
        nom: item.nom,
        prixVente: item.prix,
        disponible: true,
        imageUrl: item.imageUrl
      },
      quantite: 1,
    };
    return { panier: [...state.panier, nouvelleLigne] };
  }),

  updateQuantity: (id, delta) => set((state) => ({
    panier: state.panier.map((l) => {
      if (l.id === id) {
        const nouvelleQuantite = l.quantite + delta;
        return nouvelleQuantite > 0 ? { ...l, quantite: nouvelleQuantite } : l;
      }
      return l;
    })
  })),

  removeItem: (id) => set((state) => ({
    panier: state.panier.filter((l) => l.id !== id)
  })),

  // Logique d'ajout d'une réservation (génère un ID de type integer)
  ajouterReservation: (nouvelle) => set((state) => {
    const nouvelleReservation: Reservation = {
      id: Math.floor(100000 + Math.random() * 900000), // Génère un ID numérique unique (int)
      dateHeure: nouvelle.dateHeure,
      nbPersonnes: nouvelle.nbPersonnes,
      statut: 'EN_ATTENTE',
      tableNumero: nouvelle.tableNumero
    };
    return { reservations: [...state.reservations, nouvelleReservation] };
  }),

  // Logique de modification de statut pour l'annulation (méthode annuler du diagramme)
  annulerReservation: (id) => set((state) => ({
    reservations: state.reservations.map((res) =>
      res.id === id ? { ...res, statut: 'ANNULEE' } : res
    )
  }))
}));
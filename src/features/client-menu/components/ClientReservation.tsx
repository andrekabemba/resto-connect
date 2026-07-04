import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../post-salle/posSlice';
import { PageTransition } from '../../../components/PageTransition';
import { apiService } from '../../../services/apiService';
import { Calendar, Users, MapPin, CheckCircle, X, Clock } from 'lucide-react';

// 1. On définit proprement la structure locale d'un plat sélectionné pour la réservation
interface PlatSelectionne {
  id: number;
  nom: string;
  prix: number;
  quantite: number;
}

export const ClientReservation: React.FC = () => {
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState<number | 'auto'>('auto');
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const fetchTables = async () => {
    const res = await apiService.get('/tables');
    setDbTables(res.data.tables || []);
  };

  const fetchReservations = async () => {
    const res = await apiService.get('/reservations');
    setDbReservations(res.data.reservations || []);
  };

  // 2. Gestion de la sélection des plats au sein du composant (indépendant du panier POS)
  const [platsChoisis, setPlatsChoisis] = useState<PlatSelectionne[]>([]);

  // Liste des plats disponibles à la réservation (déclarée ici pour éviter les erreurs de store)
  const cataloguePlats = [
    { id: 1, nom: "Filet Mignon aux Épices", prix: 24.50 },
    { id: 2, nom: "Poulet à la Moambe", prix: 19.00 },
    { id: 3, nom: "Capitaine Grillé aux Bananes Plantains", prix: 22.00 },
    { id: 4, nom: "Salade Fraîcheur Maison", prix: 14.50 }
  ];

  // Filtrer uniquement les tables libres
  const tablesLibres = tables.filter(t => t.statut === 'LIBRE');

  // Gestion de l'ajout/retrait d'un plat
  const handleTogglePlat = (plat: typeof cataloguePlats[0]) => {
    const existe = platsChoisis.find(p => p.id === plat.id);
    if (existe) {
      setPlatsChoisis(prev => prev.filter(p => p.id !== plat.id));
    } else {
      setPlatsChoisis(prev => [...prev, { id: plat.id, nom: plat.nom, prix: plat.prix, quantite: 1 }]);
    }
  };

  // Ajustement des quantités
  const handleUpdateQuantite = (platId: number, increment: number) => {
    setPlatsChoisis(prev => prev.map(p => {
      if (p.id === platId) {
        const nouvelleQte = Math.max(1, p.quantite + increment);
        return { ...p, quantite: nouvelleQte };
      }
      return p;
    }));
  };

  // Calcul du prix total des plats sélectionnés
  const montantTotalPlats = platsChoisis.reduce((sum, item) => sum + (item.prix * item.quantite), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    try {
      await apiService.post('/reservations', {
        reservation_time: `${date}T${time}`,
        party_size: guests,
        table_id: selectedTable === 'auto' ? null : selectedTable,
        customer_name: "Client", // À récupérer du profil
        customer_phone: "000000000" // À récupérer du profil
      });

      setSuccessMessage(true);
      setDate('');
      setTime('');
      setGuests(2);
      setSelectedTable('auto');
      setPlatsChoisis([]);
      fetchReservations();
      setTimeout(() => setSuccessMessage(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnnuler = async (id: number) => {
    await apiService.patch(`/reservations/${id}/status`, { status: 'cancelled' });
    fetchReservations();
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMEE': return 'bg-green-50 text-green-700 border-green-200';
      case 'ANNULEE': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <PageTransition>
      <div className="w-full min-h-screen bg-[#FAF9F5] pt-32 pb-24 px-6 text-[#112222]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          
          {/* COLONNE 1 & 2 : FORMULAIRE DE PLANIFICATION */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-medium mb-2">
              Réserver une Table
            </h2>
            <p className="text-sm text-gray-400 font-light mb-8">
              Planifiez votre venue pour une expérience gastronomique sans attente.
            </p>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm font-medium rounded-r-md">
                Votre demande de réservation a été enregistrée avec succès !
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Date souhaitée *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D96B27] focus:bg-white transition-all"
                  />
                </div>

                {/* Heure */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Heure de convocation *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D96B27] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre de personnes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Nombre de personnes *</label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                      className="w-9 h-9 bg-white border border-gray-200 text-lg rounded-lg font-bold flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-bold font-mono">{guests} Personne(s)</span>
                    <button
                      type="button"
                      onClick={() => setGuests(prev => prev + 1)}
                      className="w-9 h-9 bg-white border border-gray-200 text-lg rounded-lg font-bold flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Choix de la Table */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Choix de la table *</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D96B27] focus:bg-white transition-all"
                  >
                    <option value="auto">Placement automatique optimal</option>
                    {tablesLibres.map(table => (
                      <option key={table.numero} value={table.numero}>
                        Table N°{table.numero} ({table.capacite} places max)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AJOUT DES PLATS AVEC PRIX VISIBLE */}
              <div className="space-y-3 border-t border-gray-100 pt-6">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Choisissez vos plats pour votre repas (Optionnel)
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4  overflow-y-auto pr-2">
                  {cataloguePlats.map((plat) => {
                    const selection = platsChoisis.find(p => p.id === plat.id);
                    const estSelectionne = !!selection;

                    return (
                      <div 
                        key={plat.id} 
                        className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
                          estSelectionne ? 'border-[#D96B27] bg-[#D96B27]/5' : 'border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <p className="text-sm font-bold text-gray-800">{plat.nom}</p>
                          <span className="text-xs font-mono font-bold text-[#D96B27]">{plat.prix.toFixed(2)} $</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {estSelectionne ? (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantite(plat.id, -1)}
                                className="w-6 h-6 text-xs bg-gray-100 rounded flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold font-mono px-1">{selection.quantite}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantite(plat.id, 1)}
                                className="w-6 h-6 text-xs bg-gray-100 rounded flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePlat(plat)}
                                className="text-xs text-red-500 ml-1 px-1 font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTogglePlat(plat)}
                              className="px-3 py-1.5 bg-[#112222] hover:bg-[#D96B27] text-white text-[11px] font-bold uppercase rounded-lg transition-all"
                            >
                              Sélectionner
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AFFICHAGE DU PRIX TOTAL DES PLATS */}
              <div className="bg-[#112222] text-white rounded-xl p-4 flex justify-between items-center mt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total plats présélectionnés</p>
                  <p className="text-xs text-gray-300 font-light mt-0.5">
                    {platsChoisis.length} plat(s) ajouté(s) à votre table
                  </p>
                </div>
                <span className="text-2xl font-bold font-mono text-[#D96B27]">
                  {montantTotalPlats.toFixed(2)} $
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#112222] hover:bg-[#1c3a3a] text-white font-black text-xs rounded-xl tracking-widest uppercase shadow-lg transition-all transform active:scale-[0.99] mt-4"
              >
                Confirmer ma Demande de Réservation
              </button>
            </form>
          </div>

          {/* COLONNE 3 : MES RÉSERVATIONS ACTIVES */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col">
            <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-medium mb-1">
              Mes Réservations
            </h3>
            <p className="text-xs text-gray-400 font-light mb-6">Suivi en direct de vos demandes</p>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {dbReservations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-200">
                    <Calendar size={24} />
                  </div>
                  <p className="text-xs font-light">Aucune réservation planifiée.</p>
                </div>
              ) : (
                [...dbReservations].reverse().map((res) => (
                  <div key={res.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3 transition-all hover:border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider">Ref: #RES-{res.id}</p>
                        <p className="text-sm font-black mt-0.5">
                          {new Date(res.reservation_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à {new Date(res.reservation_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-md ${getStatusBadge(res.status)}`}>
                        {res.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-2 font-light">
                      <span className="flex items-center gap-1"><Users size={12} /> {res.party_size} pers.</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> Table {res.table_id || 'Auto'}</span>
                    </div>

                    {res.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleAnnuler(res.id)}
                        className="w-full py-1.5 mt-1 text-center bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Annuler
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosStore } from '../../post-salle/posSlice';
import { useAuthStore } from '../../auth/authSlice';

export const CartSummary: React.FC = () => {
  const navigate = useNavigate();
  const { panier, updateQuantity, removeItem } = usePosStore();
  
  // Récupération du statut de connexion du client
  const { isAuthenticated } = useAuthStore();

  const totalArticles = panier.reduce((total, ligne) => total + ligne.quantite, 0);
  const prixTotal = panier.reduce((total, ligne) => total + (ligne.product.prixVente * ligne.quantite), 0);

  const handleValiderCommande = () => {
    // ─── LOGIQUE DE TUNNEL DE COMMANDE INFAILLIBLE ───
    if (isAuthenticated) {
      // Si déjà connecté, on fonce directement au paiement en français
      navigate('/paiement'); 
    } else {
      // Si non connecté, on l'envoie sur la route '/connexion'
      // en lui injectant l'état "fromCart" pour s'en souvenir après
      navigate('/connexion', { state: { fromCart: true } }); 
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9F5] pt-32 pb-24 px-6 text-[#112222]">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* En-tête */}
        <div className="bg-[#112222] p-6 text-white flex justify-between items-center">
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-medium">
            Votre Panier Gourmet
          </h2>
          <span className="text-xs font-mono tracking-widest text-[#D96B27] bg-[#D96B27]/10 px-3 py-1 rounded-md">
            {totalArticles} ARTICLES
          </span>
        </div>

        {panier.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <p className="text-gray-400 text-base font-light">Votre panier est encore vide. Laissez-vous tenter par nos spécialités !</p>
            <button onClick={() => navigate('/menu')} className="px-6 py-2.5 bg-[#112222] text-white text-xs font-bold rounded-lg tracking-wider uppercase">
              Voir le Menu
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            {/* Liste des articles */}
            <div className="divide-y divide-gray-100  overflow-y-auto pr-2">
              {panier.map((ligne) => (
                <div key={ligne.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-left">
                    {ligne.product.imageUrl && (
                      <img src={ligne.product.imageUrl} alt={ligne.product.nom} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-[#112222]">{ligne.product.nom}</h4>
                      <p className="text-xs text-[#D96B27] font-medium">{(ligne.product.prixVente).toFixed(2)} $ / unité</p>
                    </div>
                  </div>

                  {/* Boutons d'action quantité */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button 
                        onClick={() => ligne.quantite === 1 ? removeItem(ligne.id) : updateQuantity(ligne.id, -1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-200 rounded-md transition-all"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono text-sm font-bold text-[#112222]">
                        {ligne.quantite}
                      </span>
                      <button 
                        onClick={() => updateQuantity(ligne.id, 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-200 rounded-md transition-all"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-[#112222]">
                        {(ligne.product.prixVente * ligne.quantite).toFixed(2)} $
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total et Validation */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="flex justify-between items-center text-base font-medium text-gray-500">
                <span>Sous-total</span>
                <span className="font-mono">{prixTotal.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between items-center text-xl font-black text-[#112222] border-b pb-4">
                <span>Montant Total</span>
                <span className="text-[#D96B27] font-mono">{prixTotal.toFixed(2)} $</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={() => navigate('/menu')} 
                  className="w-full sm:w-1/3 py-3 border-2 border-[#112222] text-[#112222] font-bold text-xs rounded-xl tracking-widest uppercase transition-all hover:bg-gray-50"
                >
                  Continuer mes achats
                </button>
                <button 
                  onClick={handleValiderCommande}
                  className="w-full sm:w-2/3 py-3 bg-[#D96B27] hover:bg-[#b8541d] text-white font-black text-xs rounded-xl tracking-widest uppercase shadow-lg shadow-[#D96B27]/20 transition-all transform hover:-translate-y-0.5"
                >
                  {isAuthenticated ? 'Passer au paiement' : "Valider et S'authentifier pour payer"}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
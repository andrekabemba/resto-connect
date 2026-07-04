import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosStore } from '../../post-salle/posSlice';
import { useAuthStore } from '../../auth/authSlice';
import { ShoppingBag, Trash2, ArrowRight, ShoppingCart, Info } from 'lucide-react';

export const CartSummary: React.FC = () => {
  const navigate = useNavigate();
  const { panier, updateQuantity, removeItem } = usePosStore();
  
  // Récupération du statut de connexion du client
  const { isAuthenticated } = useAuthStore();

  const totalArticles = panier.reduce((total, ligne) => total + (ligne.quantite || 0), 0);
  const prixTotal = panier.reduce((total, ligne) => total + ((ligne.product.prixVente || 0) * (ligne.quantite || 0)), 0);

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
          <div className="p-20 text-center space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <ShoppingCart size={40} />
            </div>
            <div>
              <p className="text-gray-900 text-lg font-black">Votre panier est vide</p>
              <p className="text-gray-400 text-sm font-medium mt-1">Découvrez nos délices et commencez votre commande.</p>
            </div>
            <button onClick={() => navigate('/menu')} className="px-8 py-3 bg-[#112222] text-white text-xs font-black rounded-2xl tracking-widest uppercase shadow-xl hover:bg-[#D96B27] transition-all">
              Explorer le Menu
            </button>
          </div>
        ) : (
          <div className="p-8 md:p-10 space-y-10">
            {/* Liste des articles */}
            <div className="space-y-6">
              {panier.map((ligne) => (
                <div key={ligne.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-3xl border border-gray-50 hover:border-gray-100 transition-colors">
                  <div className="flex items-center gap-5 text-left">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                       <img src={ligne.product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} alt={ligne.product.nom} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-[#112222]">{ligne.product.nom}</h4>
                      <p className="text-xs text-[#D96B27] font-bold mt-0.5">{(ligne.product.prixVente || 0).toFixed(2)} $ / unité</p>
                    </div>
                  </div>

                  {/* Boutons d'action quantité */}
                  <div className="flex items-center justify-between sm:justify-end gap-10">
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1.5">
                      <button 
                        onClick={() => (ligne.quantite || 0) === 1 ? removeItem(ligne.id) : updateQuantity(ligne.id, -1)}
                        className="w-10 h-10 flex items-center justify-center font-black text-gray-400 hover:bg-white hover:text-[#D96B27] rounded-xl transition-all shadow-sm"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-mono text-base font-black text-[#112222]">
                        {ligne.quantite}
                      </span>
                      <button 
                        onClick={() => updateQuantity(ligne.id, 1)}
                        className="w-10 h-10 flex items-center justify-center font-black text-gray-400 hover:bg-white hover:text-[#D96B27] rounded-xl transition-all shadow-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total</p>
                      <span className="font-black text-lg text-[#112222] font-mono">
                        {((ligne.product.prixVente || 0) * (ligne.quantite || 0)).toFixed(2)} $
                      </span>
                    </div>

                    <button onClick={() => removeItem(ligne.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total et Validation */}
            <div className="bg-gray-50/50 rounded-[2.5rem] p-8 md:p-10 space-y-8 border border-gray-50">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                  <span>Sous-total articles</span>
                  <span className="font-mono text-gray-900">{prixTotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                  <span>Frais de service</span>
                  <span className="font-mono text-gray-900">0.00 $</span>
                </div>
                <div className="h-px bg-gray-200/50 w-full" />
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-black text-[#112222]">Total à régler</span>
                    <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1"><Info size={12} /> Taxes incluses</p>
                  </div>
                  <span className="text-4xl font-black text-[#D96B27] font-mono tracking-tighter">{prixTotal.toFixed(2)} $</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <button 
                  onClick={() => navigate('/menu')} 
                  className="flex-1 py-5 border-2 border-[#112222] text-[#112222] font-black text-[11px] rounded-[1.5rem] tracking-[0.2em] uppercase transition-all hover:bg-[#112222] hover:text-white"
                >
                  Continuer vos achats
                </button>
                <button 
                  onClick={handleValiderCommande}
                  className="flex-[2] py-5 bg-[#D96B27] hover:bg-[#112222] text-white font-black text-[11px] rounded-[1.5rem] tracking-[0.2em] uppercase shadow-2xl shadow-orange-200 transition-all flex items-center justify-center gap-3 group"
                >
                  {isAuthenticated ? 'Confirmer et Payer' : "S'identifier pour commander"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
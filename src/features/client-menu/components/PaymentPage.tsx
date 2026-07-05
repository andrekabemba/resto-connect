import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosStore } from '../../post-salle/posSlice';
import { PageTransition } from '../../../components/PageTransition';
import { apiService } from '../../../services/apiService';
import { useAuthStore } from '../../auth/authSlice';

// Importation des images officielles des opérateurs
import orangeLogo from './orange-money.webp';
import mpesaLogo from './M-pesa.webp';
import airtelLogo from './airtel-money.webp';

type PaymentMethod = 'orange' | 'airtel' | 'mpesa';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const panier = usePosStore((state) => state.panier);
  const prixTotal = panier.reduce((total, ligne) => total + (ligne.product.prixVente * ligne.quantite), 0);

  const [method, setMethod] = useState<PaymentMethod>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'form' | 'waiting' | 'success'>('form');
  const [error, setError] = useState('');
  const [subStepVisible, setSubStepVisible] = useState(true);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    setSubStepVisible(false);
    
    try {
      // Préparation de la commande pour l'API
      const orderData = {
        items: panier.map(item => ({
          menu_item_id: item.product.id,
          quantity: item.quantite
        })),
        customer_name: user?.name || "Client",
        customer_phone: phoneNumber,
        order_type: "sur_place",
        payment_method: "cash", // Simulé pour l'instant
      };

      const response = await apiService.post('/orders', orderData);
      const orderId = response.data.order.id; // Récupération de l'ID

      setTimeout(() => {
        setStep('waiting');
        setSubStepVisible(true);
      }, 300);

      // Simulation du délai de paiement mobile
      setTimeout(() => {
        setSubStepVisible(false);

        setTimeout(() => {
          setStep('success');
          setSubStepVisible(true);
          usePosStore.setState({ panier: [] });
          
          // Redirection directe vers le suivi
          navigate(`/tracking/${orderId}`);
        }, 300);
      }, 4500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de la commande.");
      setSubStepVisible(true);
    }
  };

  // Configuration des opérateurs incluant les chemins d'images mis à jour
  const operatorsConfig = {
    orange: { name: 'Orange Money', color: 'border-[#FF6600]', bg: 'bg-[#FF6600]/10', text: 'text-[#FF6600]', image: orangeLogo },
    airtel: { name: 'Airtel Money', color: 'border-[#FF0000]', bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', image: airtelLogo },
    mpesa: { name: 'M-Pesa', color: 'border-[#4A90E2]', bg: 'bg-[#4A90E2]/10', text: 'text-[#4A90E2]', image: mpesaLogo },
  };

  return (
    <PageTransition>
      <div className="w-full min-h-screen bg-[#FAF9F5] pt-32 pb-24 px-6 flex items-center justify-center text-[#112222]">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all">
          
          <div className="bg-[#112222] p-6 text-white text-center">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-medium">
              Finalisation de votre Commande
            </h2>
          </div>

          <div className={`transition-all duration-300 ${subStepVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            
            {/* --- ÉTAPE A : FORMULAIRE DE SAISIE --- */}
            {step === 'form' && (
              <form onSubmit={handlePaymentSubmit} className="p-6 md:p-8 space-y-6 text-left">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Montant à payer</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{panier.length} article(s) inclus</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#D96B27] font-mono">{prixTotal.toFixed(2)} $</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">1. Veuillez selectionner le mode de paiement *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['orange', 'airtel', 'mpesa'] as PaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                          method === m 
                            ? `${operatorsConfig[m].color} ${operatorsConfig[m].bg} scale-[1.02] shadow-sm` 
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        {/* Conteneur de l'image pour assurer des proportions harmonieuses */}
                        <div className="h-10 w-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={operatorsConfig[m].image} 
                            alt={operatorsConfig[m].name} 
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        </div>
                        <span className="text-[11px] font-black text-[#112222] tracking-tight text-center">
                          {operatorsConfig[m].name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium rounded-r-md"> {error}</div>}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">2. Entrez votre numéro de téléphone  valide{operatorsConfig[method].name} *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-sm font-bold text-gray-400 font-mono">+243</span>
                    <input
                      type="tel"
                      placeholder="8XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#D96B27] focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-light italic">Format requis : 9 chiffres (ex: 8200000000)</p>
                </div>

                <button type="submit" className="w-full py-4 bg-[#D96B27] hover:bg-[#b8541d] text-white font-black text-xs rounded-xl tracking-widest uppercase shadow-lg shadow-[#D96B27]/20 transition-all transform active:scale-[0.99]">
                  Valider et paiyer pour {prixTotal.toFixed(2)} $
                </button>
              </form>
            )}

            {/* --- ÉTAPE B : EN ATTENTE DE CONFIRMATION CLIENT (PUSH) --- */}
            {step === 'waiting' && (
              <div className="p-8 md:p-12 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                  <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${operatorsConfig[method].text} border-current`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={operatorsConfig[method].image} 
                      alt="" 
                      className="w-8 h-8 object-contain rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-[#112222]">Vérifiez votre téléphone !</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto font-light leading-relaxed">
                    Une demande d'autorisation de débit de <span className="font-bold text-[#112222] font-mono">{prixTotal.toFixed(2)} $</span> a été envoyée au numéro <span className="font-mono font-bold text-[#112222]">+243 {phoneNumber}</span> via <span className={`font-bold ${operatorsConfig[method].text}`}>{operatorsConfig[method].name}</span>.
                  </p>
                </div>

                <div className="bg-[#FAF9F5] rounded-xl p-4 border border-dashed border-gray-200 max-w-xs mx-auto">
                  <p className="text-xs text-gray-600 font-medium flex items-center justify-center gap-2">
                    <span className="animate-pulse text-base"></span>
                    Tapez votre code secret PIN sur votre mobile pour confirmer la transaction.
                  </p>
                </div>
              </div>
            )}

            {/* --- ÉTAPE C : SUCCÈS TOTAL --- */}
            {step === 'success' && (
              <div className="p-8 md:p-12 text-center space-y-6  from-green-50/30 to-white">
                <div className="w-16 h-16 bg-green-500 text-white text-3xl flex items-center justify-center rounded-full mx-auto shadow-md animate-bounce">✓</div>
                <div className="space-y-2">
                  <h4 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-green-800">Paiement Confirmé !</h4>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto font-light">Votre transaction a été traitée avec succès. Notre équipe en cuisine vient de recevoir votre bon de commande !</p>
                </div>
                <div className="border-t border-gray-100 pt-6 max-w-xs mx-auto">
                  <button type="button" onClick={() => navigate('/menu')} className="w-full py-3 bg-[#112222] text-white text-xs font-bold rounded-xl tracking-widest uppercase shadow-md transition-all hover:bg-[#1a3535]">
                    Retourner au Menu
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </PageTransition>
  );
};
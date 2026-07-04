import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../authSlice';
import { usePosStore } from '../../post-salle/posSlice';
import { supabase } from '../../../config/supabaseClient';

export const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore((state) => state.login);

  const panier = usePosStore((state) => state.panier || []);
  const totalArticles = panier.reduce((sum: number, item: any) => sum + (item.quantite || 0), 0);

  const [isStaff, setIsStaff] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur de connexion");

        loginAction(data.user, data.token);

        // Redirection dynamique basée sur le rôle
        const roleRedirects: Record<string, string> = {
            admin: '/admin/dashboard',
            waiter: '/salle/tables',
            cook: '/cuisine/kds'
        };

        if (roleRedirects[data.user.role]) {
           navigate(roleRedirects[data.user.role]);
        } else if (location.state?.fromCart || totalArticles > 0) {
           navigate('/paiement'); 
        } else {
           navigate('/');
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nom, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur lors de la création du compte");

        setSuccessMessage("Compte créé avec succès ! Connectez-vous maintenant.");
        setIsLoginMode(true); 
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-4xl bg-[var(--color-card)] shadow-2xl border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden grid grid-cols-1 md:grid-cols-12 ">

        <div className="md:col-span-5 bg-[var(--color-foreground)] p-8 text-[var(--color-card)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full border border-white/5 -top-20 -left-20" />
          <div className="absolute w-40 h-40 rounded-full border-2 border-[var(--color-accent)]/20 -bottom-10 -right-10" />
          <div className="z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">RestoConnect</span>
            <h2 className="text-3xl font-semibold mt-4 leading-tight">
              {isStaff ? 'Espace Interne' : 'Espace Client'}
            </h2>
          </div>
          <div className="z-10">
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              {isStaff ? 'Accès réservé au personnel.' : 'Connectez-vous pour vos commandes.'}
            </p>
          </div>
        </div>

        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-[var(--color-card)]">

          <div className="flex gap-4 mb-6">
            <button onClick={() => { setIsStaff(false); setIsLoginMode(true); }} className={`text-sm font-bold ${!isStaff ? 'text-[var(--color-primary)] underline' : 'text-gray-400'}`}>Client</button>
            <button onClick={() => { setIsStaff(true); setIsLoginMode(true); }} className={`text-sm font-bold ${isStaff ? 'text-[var(--color-primary)] underline' : 'text-gray-400'}`}>Staff</button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-[var(--radius-sm)] font-medium flex items-center gap-3">
              <span className="material-symbols-outlined text-red-600">error</span> <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-[var(--radius-sm)] font-medium flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600">check_circle</span> <span>{successMessage}</span>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-bold">
              {isLoginMode ? 'Connexion' : 'Création de compte'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && !isStaff && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Nom Complet</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-gray-400">person</span>
                    <input 
                      type="text" required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Jean Dupont"
                      className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-[var(--radius-sm)] pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  </div>
                </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Adresse Email</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-gray-400">mail</span>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@email.com" 
                  className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-[var(--radius-sm)] pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Mot de passe</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-gray-400">lock</span>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" 
                  className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-[var(--radius-sm)] pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 text-[var(--color-primary-foreground)] font-bold text-sm uppercase tracking-widest rounded-[var(--radius-sm)] shadow-md transition-all bg-[var(--color-primary)] hover:opacity-90 active:scale-[0.98] flex items-center justify-center"
            >
              {isLoading ? 'Action en cours...' : isLoginMode ? 'Se Connecter' : 'Valider'}
            </button>
          </form>

          {!isStaff && (
            <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
              <p className="text-sm text-gray-500">
                {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[var(--color-primary)] font-bold ml-2 hover:underline focus:outline-none"
                >
                  {isLoginMode ? "Créer un compte" : "Se connecter"}
                </button>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
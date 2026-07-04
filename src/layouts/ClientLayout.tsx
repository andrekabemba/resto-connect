import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { usePosStore } from '../features/post-salle/posSlice';
import { useAuthStore } from '../features/auth/authSlice'; 

export const ClientLayout: React.FC = () => {
  const panier = usePosStore((state) => state.panier || []);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const totalArticles = panier.reduce((sum: number, item: any) => sum + (item.quantite || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--color-background)] antialiased text-[var(--color-foreground)]">
      
      {/* NAVBAR STYLE PREMIUM EXTRA-FIN */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-[var(--color-foreground)]/95 backdrop-blur-md border-b border-[var(--color-border)] z-50 px-6 sm:px-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-[var(--color-card)] tracking-wide">
          Resto<span className="text-[var(--color-secondary)] italic font-normal">Connect</span>
        </Link>

        <div className="flex items-center gap-6 sm:gap-8 text-xs font-semibold uppercase tracking-widest">
          <Link 
            to="/menu" 
            className="text-gray-300 hover:text-[var(--color-secondary)] transition-colors"
          >
            Voir le menu
          </Link>

          <Link 
            to="/reservation" 
            className="text-gray-300 hover:text-[var(--color-secondary)] transition-colors"
          >
            Réservation
          </Link>
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 bg-[var(--color-card)]/10 border border-[var(--color-card)]/10 px-4 py-1.5 rounded-full">
              <div className="relative">
                <div className="w-7 h-7 bg-[var(--color-secondary)] text-[var(--color-foreground)] font-bold text-xs rounded-full flex items-center justify-center uppercase">
                  {(user?.name || '??').substring(0, 2)}
                </div>
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-[var(--color-foreground)]" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[var(--color-card)] leading-none">{user?.name || 'Client'}</p>
                <span className="text-[9px] font-medium tracking-wider text-[var(--color-secondary)] uppercase block mt-1">
                  {user?.statut || 'Connecté'}
                </span>
              </div>
              <button 
                onClick={() => logout()} 
                className="text-[var(--color-card)]/60 cursor-pointer hover:text-red-400 ml-2 transition-colors flex items-center"
                title="Se déconnecter"
              >
                <span className="material-symbols-outlined text-base">power_settings_new</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/connexion" 
              className="text-gray-300 hover:text-[var(--color-secondary)] transition-colors"
            >
              Connexion
            </Link>
          )}

          {/* BOUTON PANIER AVEC BADGE ROUGE */}
          <Link 
            to="/panier" 
            className="relative flex items-center gap-2 bg-[var(--color-secondary)] hover:opacity-90 text-[var(--color-foreground)] px-5 py-2.5 rounded-[var(--radius-sm)] font-bold uppercase transition-all shadow-lg transform active:scale-95"
          >
            <span className="material-symbols-outlined text-base">shopping_cart</span> Panier
            {totalArticles > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-[var(--color-foreground)]">
                {totalArticles}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <main className="min-h-screen pt-20">
        <Outlet />
      </main>
    </div>
  );
};

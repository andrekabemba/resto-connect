import React from 'react';
import { Link, Outlet, NavLink } from 'react-router-dom';
import { usePosStore } from '../features/post-salle/posSlice';
import { useAuthStore } from '../features/auth/authSlice'; 
import { ShoppingCart, User, LogOut, UtensilsCrossed, CalendarDays, LogIn } from 'lucide-react';

export const ClientLayout: React.FC = () => {
  const panier = usePosStore((state) => state.panier || []);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const totalArticles = panier.reduce((sum: number, item: any) => sum + (item.quantite || 0), 0);

  return (
    <div className="min-h-screen bg-white antialiased text-[#112222]">
      
      {/* NAVBAR STYLE PREMIUM EXTRA-FIN */}
      <nav className="fixed top-0 left-0 right-0 h-24 bg-[#112222] backdrop-blur-xl border-b border-white/5 z-50 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-[#D96B27] rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <UtensilsCrossed size={22} className="text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">Resto<span className="text-[#D96B27]">Connect</span></span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          <NavLink to="/menu" className={({isActive}) => `text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'text-[#D96B27]' : 'text-gray-400 hover:text-white'}`}>Notre Carte</NavLink>
          <NavLink to="/reservation" className={({isActive}) => `text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'text-[#D96B27]' : 'text-gray-400 hover:text-white'}`}>Réservations</NavLink>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
              <div className="relative">
                <div className="w-8 h-8 bg-[#D96B27] text-white font-black text-xs rounded-xl flex items-center justify-center shadow-lg">
                  <User size={16} />
                </div>
                <span className="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-500 border-2 border-[#112222]" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[11px] font-black text-white leading-none tracking-tight">{user.name}</p>
                <p className="text-[9px] font-bold text-[#D96B27] uppercase tracking-widest mt-1">Client Elite</p>
              </div>
              <button 
                onClick={() => logout()} 
                className="text-gray-500 hover:text-red-500 ml-2 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/connexion" 
              className="text-[11px] font-black uppercase tracking-[0.2em] text-white bg-white/5 px-6 py-3 rounded-2xl border border-white/10 hover:bg-[#D96B27] hover:border-[#D96B27] transition-all flex items-center gap-2"
            >
              <LogIn size={14} /> Connexion
            </Link>
          )}

          {/* BOUTON PANIER AVEC BADGE */}
          <Link 
            to="/panier" 
            className="relative flex items-center gap-3 bg-[#D96B27] hover:bg-[#b8541d] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-orange-900/20 active:scale-95"
          >
            <ShoppingCart size={18} />
            <span className="hidden md:inline">Panier</span>
            {totalArticles > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#D96B27] text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-2xl border-2 border-[#D96B27] animate-bounce">
                {totalArticles}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <main className="min-h-screen">
        <Outlet />
      </main>

      <footer className="bg-[#112222] text-white py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <UtensilsCrossed size={24} className="text-[#D96B27]" />
              <span className="text-xl font-black tracking-tighter">RestoConnect</span>
           </div>
           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">© 2026 RestoConnect - Excellence Gastronomique</p>
           <div className="flex gap-6">
              <span className="text-gray-500 hover:text-white text-xs cursor-pointer">Instagram</span>
              <span className="text-gray-500 hover:text-white text-xs cursor-pointer">Facebook</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

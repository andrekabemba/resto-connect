import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authSlice';
import {
  LayoutDashboard,
  Users,
  Warehouse,
  Menu as MenuIcon,
  BarChart3,
  ChefHat,
  Grid,
  ClipboardList,
  LogOut,
  UtensilsCrossed
} from 'lucide-react';

const STAFF_NAV_CONFIG: Record<string, { name: string, path: string, icon: any }[]> = {
  admin: [
    { name: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Utilisateurs', path: '/admin/users', icon: Users },
    { name: 'Inventaire', path: '/admin/inventory', icon: Warehouse },
    { name: 'Menu', path: '/admin/menu', icon: MenuIcon },
    { name: 'Rapports', path: '/admin/reports', icon: BarChart3 },
  ],
  waiter: [
    { name: 'Plan de salle', path: '/salle/tables', icon: Grid },
    { name: 'Commandes', path: '/salle/commandes', icon: ClipboardList },
  ],
  cook: [
    { name: 'Cuisine (KDS)', path: '/cuisine/kds', icon: ChefHat },
  ],
};

export const StaffLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  // Utilisation du rôle du user connecté
  const role = user?.role || 'customer';

  const navItems = STAFF_NAV_CONFIG[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-[#112222] text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#D96B27] rounded-xl">
                <UtensilsCrossed size={20} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">RestoConnect</h1>
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] ml-11">Staff {role}</p>
        </div>
        
        <nav className="flex-1 mt-8 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive
                      ? 'bg-[#D96B27] text-white shadow-lg shadow-orange-900/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-8 border-t border-white/5">
          <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

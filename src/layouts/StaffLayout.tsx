import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authSlice';

const STAFF_NAV_CONFIG: Record<string, { name: string, path: string, icon: string }[]> = {
  admin: [
    { name: 'Tableau de bord', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Utilisateurs', path: '/admin/users', icon: 'people' },
    { name: 'Inventaire', path: '/admin/inventory', icon: 'inventory' },
    { name: 'Menu', path: '/admin/menu', icon: 'restaurant_menu' },
    { name: 'Rapports', path: '/admin/reports', icon: 'analytics' },
  ],
  waiter: [
    { name: 'Plan de salle', path: '/salle/tables', icon: 'table_restaurant' },
    { name: 'Commandes', path: '/salle/commandes', icon: 'list_alt' },
  ],
  cook: [
    { name: 'Cuisine (KDS)', path: '/cuisine/kds', icon: 'kitchen' },
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
    <div className="flex h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-foreground)] text-[var(--color-card)] flex flex-col shadow-xl">
        <div className="p-6">
            <h1 className="text-xl font-bold text-[var(--color-secondary)]">RestoConnect</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Espace Staff - {role}</p>
        </div>
        
        <nav className="flex-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[var(--color-secondary)] text-[var(--color-foreground)]' 
                    : 'text-gray-400 hover:bg-[var(--color-border)] hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <button 
            onClick={handleLogout} 
            className="p-6 text-gray-400 hover:text-red-400 flex items-center gap-3 text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined">logout</span> Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[var(--color-background)]">
        <Outlet />
      </main>
    </div>
  );
};

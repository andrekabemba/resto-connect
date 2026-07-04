import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  { name: 'Utilisateurs', path: '/admin/users', icon: 'people' },
  { name: 'Inventaire', path: '/admin/inventory', icon: 'inventory' },
  { name: 'Menu', path: '/admin/menu', icon: 'restaurant_menu' },
  { name: 'Rapports', path: '/admin/reports', icon: 'analytics' },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-foreground)] text-[var(--color-card)] flex flex-col">
        <div className="p-6 text-2xl font-bold tracking-wider text-[var(--color-secondary)]">RestoConnect</div>
        <nav className="flex-1 mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 transition-colors ${
                  isActive ? 'bg-[var(--color-secondary)] text-[var(--color-foreground)]' : 'text-gray-400 hover:bg-[var(--color-border)] hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-[var(--color-card)] border-b border-[var(--color-border)] flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Administration</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm text-[var(--color-foreground)]/60">Admin Panel</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

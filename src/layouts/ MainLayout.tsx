import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Menu, X, Home, FilePlus, Search, History, LogOut,
  Sun, Moon, Bell, User, GraduationCap, LayoutDashboard, FileText, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark(!dark);
  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path: string) => location.pathname === path;

  const getNavItems = () => {
    if (auth.userType === 'ETUDIANT') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Mes dossiers' },
        { to: '/historique', icon: History, label: 'Historique' },
      ];
    }
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
      { to: '/dossiers', icon: FileText, label: 'Mes dossiers' },
      { to: '/dossiers/creer', icon: FilePlus, label: 'Nouveau dossier' },
      { to: '/recherche', icon: Search, label: 'Rechercher étudiant' },
      { to: '/historique', icon: History, label: 'Historique' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Link to="/dashboard" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Student Go RDC
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <div className="flex items-center gap-2 border-l pl-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium hidden sm:inline">{auth.userType === 'ETUDIANT' ? 'Étudiant' : 'Établissement'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-4rem)]">
          <aside className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {navItems.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted hover:text-primary"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-4 left-0 right-0 px-3 text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Student Go RDC
            </div>
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
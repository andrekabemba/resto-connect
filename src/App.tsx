import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './features/auth/hooks/useAuth';
import LoginView from './features/auth/views/LoginView';
import RegisterEtablissementView from './features/auth/views/RegisterEtablissementView';
import RegisterEtudiantView from './features/auth/views/RegisterEtudiantView';
import DashboardView from './features/dossier/views/DashboardView';
import CreerDossierView from './features/dossier/views/CreerDossierView';
import DetailDossierView from './features/dossier/views/DetailDossierView';
import ParcoursView from './features/dossier/views/ParcoursView';
import SearchView from './features/dossier/views/SearchView';
import HistoriqueView from './features/dossier/views/HistoriqueView';
import LandingView from './views/LandingView';
import MainLayout from './layouts/ MainLayout';


function PrivateRoute({ children }: { children: JSX.Element }) {
  const { auth } = useAuth();
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { auth } = useAuth();
  return !auth.isAuthenticated ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route element={<PublicRoute><Outlet /></PublicRoute>}>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register/etablissement" element={<RegisterEtablissementView />} />
          <Route path="/register/etudiant" element={<RegisterEtudiantView />} />
        </Route>
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/dossiers" element={<DashboardView />} />
          <Route path="/dossiers/creer" element={<CreerDossierView />} />
          <Route path="/dossiers/:id" element={<DetailDossierView />} />
          <Route path="/dossiers/:id/parcours" element={<ParcoursView />} />
          <Route path="/dossiers/:id/historique" element={<HistoriqueView />} />
          <Route path="/recherche" element={<SearchView />} />
          <Route path="/historique" element={<HistoriqueView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
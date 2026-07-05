import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { ClientLayout } from '../layouts/ClientLayout';
import { StaffLayout } from '../layouts/StaffLayout';

// Auth
import { AuthForm } from '../features/auth/components/AuthForm';

// Client Features
import { ClientHome } from '../features/client-menu/components/ClientHome'; 
import { MenuDisplay } from '../features/client-menu/components/MenuDisplay';
import { CartSummary } from '../features/client-menu/components/CartSummary';
import { PaymentPage } from '../features/client-menu/components/PaymentPage';
import { ClientReservation } from '../features/client-menu/components/ClientReservation'; 
import { OrderTrackingPage } from '../features/client-menu/components/OrderTrackingPage';

// Admin Features
import { AdminDashboard } from '../features/admin-dashboard/components/AdminDashboard';
import { UserManager } from '../features/admin-dashboard/components/UserManager';
import { MenuManager } from '../features/admin-dashboard/components/MenuManager';
import { InventoryManager } from '../features/admin-dashboard/components/InventoryManager';

// Staff Features
import { TablePlanPage } from '../features/post-salle/components/TablePlan';
import { KdsCuisinePage } from '../features/kds-cuisine/components/StaffDashboard';
import { OrderManagerPage } from '../features/post-salle/components/OrderManagerPage';


export const appRouter = createBrowserRouter([
  // Routes Client
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { path: "", element: <ClientHome /> },
      { path: "menu", element: <MenuDisplay /> },
      { path: "panier", element: <CartSummary /> },
      { path: "connexion", element: <AuthForm /> },
      { path: "paiement", element: <PaymentPage /> },
      { path: "reservation", element: <ClientReservation /> },
      { path: "tracking/:id", element: <OrderTrackingPage /> },
    ],
  },

  // Routes Personnel (Staff)
  {
    path: "/",
    element: <StaffLayout />,
    children: [
      // Admin
      { path: "admin/dashboard", element: <AdminDashboard /> },
      { path: "admin/users", element: <UserManager /> },
      { path: "admin/inventory", element: <InventoryManager /> },
      { path: "admin/menu", element: <MenuManager /> },
      { path: "admin/reports", element: <AdminDashboard /> }, // Rapport intégré au dashboard pour l'instant
      
      // Serveur
      { path: "salle/tables", element: <TablePlanPage /> },
      { path: "salle/commandes", element: <OrderManagerPage /> },
      
      // Cuisinier
      { path: "cuisine/kds", element: <KdsCuisinePage /> },
    ],
  },

  // Redirections et 404
  { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
  { path: "*", element: <div className="p-20 text-center">404 - Page introuvable</div> },
]);

// Importation de React pour la création du composant racine
import React from 'react';
// Importation du fournisseur de routeur (Router Provider) depuis react-router-dom
import { RouterProvider } from 'react-router-dom';
// Importation de notre configuration de routes que nous venons de créer
import { appRouter } from './routes/appRoutes';

// Définition du composant principal racine App
const App: React.FC = () => {
  return (
    // Injection du RouterProvider configuré avec notre appRouter. 
    // C'est lui qui va écouter l'URL du navigateur et afficher le bon composant automatiquement.
    <RouterProvider router={appRouter} />
  );
};

// Exportation par défaut du composant racine pour qu'il soit rendu par main.tsx
export default App;
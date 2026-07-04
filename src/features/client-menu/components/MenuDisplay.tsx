import React, { useEffect, useState } from 'react';
// Importation directe du store Zustand
import { usePosStore } from '../../post-salle/posSlice';

interface MenuItem {
  id: string;
  nom: string;
  description: string;
  prix: number;
  imageUrl?: string;
  disponible: boolean;
  categorie: string;
}

export const MenuDisplay: React.FC = () => {
  const [animated, setAnimated] = useState(false);
  
  // États pour la recherche et le filtrage des catégories
  const [selectedCategorie, setSelectedCategorie] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  // Récupération de l'action du store Zustand
  const addToCart = usePosStore((state) => state.addToCart);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const handleAjouterAuPanier = (item: MenuItem) => {
    console.log("👉 Ajout au panier via Zustand :", item.nom);
    addToCart({
      id: item.id,
      nom: item.nom,
      prix: item.prix,
      imageUrl: item.imageUrl
    });
  };

  const itemsAffiches: MenuItem[] = [
    { id: '1', nom: 'Burger RestoConnect', description: "Un steak juteux, du fromage fondant, notre sauce secrète maison et un pain brioché toasté.", prix: 12.50, disponible: true, categorie: 'Burger', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
    { id: '2', nom: 'Pizza 4 Fromages', description: "Sauce tomate maison, mozzarella premium, gorgonzola, chèvre et copeaux de parmesan.", prix: 14.00, disponible: true, categorie: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80' },
    { id: '3', nom: 'Salade César', description: "Romaine croquante, émincé de poulet doré, croutons à l'ail et notre fameuse sauce César.", prix: 9.50, disponible: false, categorie: 'Salades', imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=400&q=80' }
  ];

  const listeCategories = ['Tous', ...Array.from(new Set(itemsAffiches.map(item => item.categorie)))];

  const itemsFilgres = itemsAffiches.filter(item => {
    const correspondCategorie = selectedCategorie === 'Tous' || item.categorie === selectedCategorie;
    const correspondRecherche = item.nom.toLowerCase().includes(searchQuery.toLowerCase());
    return correspondCategorie && correspondRecherche;
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF9F5] text-[#112222] pb-24">
      
      {/* 1. TOP BANNER : Style Sombre d'Origine étendu sur toute la largeur */}
      <div className="bg-[#112222] text-white pt-36 pb-20 px-6 sm:px-12 rounded-b-[40px] relative shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-left space-y-3">
            <span className="text-xs font-bold tracking-[0.3em] text-[#D96B27] uppercase block"> Notre Carte Client</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className={`text-3xl sm:text-4xl md:text-5xl text-white font-medium leading-tight transition-all duration-1000 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              Delicious Food,<br />Crafted <span className="text-[#D96B27]">With Passion</span>
            </h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 bg-[#1E3333] p-4 rounded-2xl border border-white/5 max-w-sm text-left">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#D96B27]"> Service en Salle & À Emporter</p>
              <p className="text-[11px] text-gray-300 font-light">Commandez vos plats favoris instantanément à votre table.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE DE CONTENU PRINCIPAL S'ADAPTANT À TOUT ÉCRAN */}
      <div className="max-w-6xl mx-auto px-6  relative z-10 space-y-8">
        
        {/* 2. CHAMP DE RECHERCHE FLUIDE (Flotte sur la bannière) */}
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100/80 flex items-center px-5 py-4 gap-4 transition-all focus-within:shadow-2xl">
            <span className="text-gray-400 text-base">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher un plat sur la carte..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm font-medium focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* 3. CAROUSEL DES CATÉGORIES (S'adapte élégamment) */}
        <div className="text-left">
          <div className="mb-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Catégories</h4>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {listeCategories.map((cat) => {
              const estActif = selectedCategorie === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategorie(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap snap-center border ${
                    estActif 
                      ? 'bg-[#D96B27] text-white border-[#D96B27] shadow-md scale-105' 
                      : 'bg-white text-[#112222] border-gray-200/60 hover:border-gray-300 shadow-xs'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. GRILLE DES PLATS (S'ajuste de 2 à 4 colonnes selon l'écran pour un max de visibilité !) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-l-2 border-[#D96B27] pl-3 text-left">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-[#112222]">
              {selectedCategorie === 'Tous' ? 'Nos meuilleures Selections du jour' : selectedCategorie}
            </h2>
          </div>

          {itemsFilgres.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-sm font-light bg-white rounded-3xl border border-gray-100">
              Aucun plat ne correspond à votre recherche actuelle.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {itemsFilgres.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-100 rounded-3xl p-3.5 shadow-xs hover:shadow-xl hover:border-gray-200/80 transition-all duration-300 flex flex-col justify-between text-left relative group"
                >
                  {/* Image du plat */}
                  <div className="w-full rounded-2xl overflow-hidden bg-gray-50 relative mb-3.5 shadow-inner">
                    <img 
                      src={item.imageUrl} 
                      alt={item.nom} 
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!item.disponible && 'grayscale opacity-50'}`}
                    />
                    {!item.disponible && (
                      <span className="absolute top-2.5 left-2.5 bg-[#112222]/95 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                        Épuisé
                      </span>
                    )}
                  </div>

                  {/* Zone de textes descriptive */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#112222] group-hover:text-[#D96B27] transition-colors line-clamp-1">{item.nom}</h3>
                      <p className="text-gray-400 text-xs font-light line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    
                    {/* Prix et Bouton d'action pro style maquette */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <span className="text-sm font-mono font-black text-[#D96B27]">
                        {item.prix.toFixed(2)} $
                      </span>
                      
                      {item.disponible ? (
                        <button 
                          onClick={() => handleAjouterAuPanier(item)} 
                          className="w-8 h-8 bg-[#D96B27] hover:bg-[#b8541d] text-white rounded-xl flex items-center justify-center font-bold text-base transition-all shadow-md transform active:scale-95"
                        >
                          +
                        </button>
                      ) : (
                        <button 
                          disabled 
                          className="w-8 h-8 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center font-bold text-xs cursor-not-allowed"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
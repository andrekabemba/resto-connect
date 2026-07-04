import React, { useEffect, useState } from 'react';
import { usePosStore } from '../../post-salle/posSlice';
import { apiService } from '../../../services/apiService';
import { Search, ShoppingBag, Utensils, Star, Info } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: number;
  category_name?: string;
}

export const MenuDisplay: React.FC = () => {
  const [animated, setAnimated] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = usePosStore((state) => state.addToCart);

  useEffect(() => {
    setAnimated(true);
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await apiService.get('/menu');
      setItems(response.data.menu || []);
    } catch (err) {
      console.error("Erreur chargement menu", err);
    }
  };

  const handleAjouterAuPanier = (item: MenuItem) => {
    addToCart({
      id: item.id,
      nom: item.name,
      prixVente: item.price,
      imageUrl: item.imageUrl
    });
  };

  const categoriesList = ['Tous', ...Array.from(new Set(items.map(item => item.category_name || 'Général')))];

  const filteredItems = items.filter(item => {
    const matchCat = selectedCategorie === 'Tous' || (item.category_name || 'Général') === selectedCategorie;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
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
            {categoriesList.map((cat) => {
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

        {/* 4. GRILLE DES PLATS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-l-4 border-[#D96B27] pl-4 text-left">
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-black text-[#112222]">
                {selectedCategorie === 'Tous' ? 'Nos meilleures sélections' : selectedCategorie}
              </h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Cuisiné avec amour et expertise</p>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-50 shadow-inner">
              <div className="p-4 bg-gray-50 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300">
                <Utensils size={32} />
              </div>
              <p className="text-gray-400 text-sm font-medium">Aucun plat ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-50 rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between text-left group"
                >
                  <div className="w-full h-48 rounded-3xl overflow-hidden bg-gray-50 relative mb-4">
                    <img 
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                      alt={item.name}
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${!item.available && 'grayscale opacity-50'}`}
                    />
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                         <span className="bg-white text-black font-black text-[10px] uppercase tracking-tighter px-3 py-1 rounded-full shadow-xl">Épuisé</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/90 backdrop-blur text-[#D96B27] p-2 rounded-full shadow-lg block">
                        <Star size={14} fill="currentColor" />
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col px-1">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-black text-[#112222] line-clamp-1">{item.name}</h3>
                      </div>
                      <p className="text-gray-400 text-[11px] font-medium line-clamp-2 leading-relaxed min-h-[2.75rem]">{item.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">Prix</p>
                        <span className="text-lg font-black text-[#D96B27] font-mono">
                          {item.price.toFixed(2)} $
                        </span>
                      </div>
                      
                      {item.available ? (
                        <button 
                          onClick={() => handleAjouterAuPanier(item)} 
                          className="bg-[#112222] hover:bg-[#D96B27] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                          <ShoppingBag size={14} /> Ajouter
                        </button>
                      ) : (
                        <button disabled className="bg-gray-100 text-gray-400 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                          Indisponible
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
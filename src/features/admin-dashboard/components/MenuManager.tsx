import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { UtensilsCrossed, Plus, Edit2, Trash2, Tag, Coffee } from 'lucide-react';

export const MenuManager: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
        const response = await apiService.get('/menu');
        setItems(response.data.menu || []);
    } catch(err) {
        console.error("Erreur chargement menu", err);
    }
  };

  const deleteItem = async (id: number) => {
    if(confirm("Supprimer ce plat du menu ?")) {
      await apiService.delete(`/menu/${id}`);
      fetchMenu();
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <UtensilsCrossed size={24} />
            </div>
            Gestion du Menu
        </h2>
        <button 
          className="bg-[#D96B27] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-orange-200 font-bold"
        >
          <Plus size={20} /> Nouveau Plat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
            {item.imageUrl && (
              <div className="h-40 overflow-hidden relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                     <Tag size={10} /> {item.category_name || 'Divers'}
                   </span>
                </div>
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
              <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{item.description}</p>

              <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix</p>
                  <p className="font-black text-[#D96B27] text-lg">{item.price} $</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

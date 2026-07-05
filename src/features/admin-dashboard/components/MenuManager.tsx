import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { LoadingButton } from '../../../components/ui/LoadingButton';
import { UtensilsCrossed, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { MenuForm } from './MenuForm';

export const MenuManager: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
        const response = await apiService.get('/menu');
        setItems(response.data.menu || []);
    } catch(err) {
        console.error("Erreur chargement menu", err);
    } finally {
        setIsLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if(confirm("Supprimer ce plat du menu ?")) {
      setDeleteId(id);
      try {
        await apiService.delete(`/menu/${id}`);
        fetchMenu();
      } catch (err) {
        console.error("Erreur suppression", err);
      } finally {
        setDeleteId(null);
      }
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
          onClick={() => setIsFormOpen(true)}
          className="bg-[#D96B27] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-orange-200 font-bold"
        >
          <Plus size={20} /> Nouveau Plat
        </button>
      </div>

      {isFormOpen && <MenuForm onClose={() => setIsFormOpen(false)} onSave={fetchMenu} />}

      {isLoading ? (
        <div className="flex justify-center p-20">
          <svg className="animate-spin h-10 w-10 text-[#D96B27]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
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
                    <LoadingButton 
                        isLoading={deleteId === item.id} 
                        onClick={() => deleteItem(item.id)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 size={18} />
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

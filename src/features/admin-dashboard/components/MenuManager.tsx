import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';

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

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">restaurant_menu</span>
            Gestion du Menu
        </h2>
        <button 
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-[var(--radius-sm)] flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span> Nouveau Plat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-[var(--color-card)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{item.description}</p>
            <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
              <span className="font-bold text-[var(--color-primary)]">{item.price} FCFA</span>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

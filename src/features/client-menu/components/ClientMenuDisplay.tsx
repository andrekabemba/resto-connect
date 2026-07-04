import React from 'react';
import { useClientStore } from '../clientMenuSlice';

export const ClientMenuDisplay: React.FC = () => {
  const addToCart = useClientStore((state) => state.addToCart);

  const menuItems = [
    { id: 1, name: 'Poulet Mayo', price: 15000, description: 'Poulet rôti à la mayonnaise maison', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=500&auto=format&fit=crop' },
    { id: 2, name: 'Fufu et Liboke', price: 12000, description: 'Fufu de manioc accompagné de poisson en papillote', image: 'https://images.unsplash.com/photo-1596560548697-f58c7353f47e?q=80&w=500&auto=format&fit=crop' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 pt-20">
      <h2 className="text-3xl font-bold">Notre Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <span className="text-[var(--color-primary)] font-black">{item.price} FCFA</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{item.description}</p>
              <button 
                onClick={() => addToCart(item)}
                className="w-full bg-[var(--color-foreground)] text-[var(--color-card)] py-2 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 font-bold text-sm"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span> Ajouter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

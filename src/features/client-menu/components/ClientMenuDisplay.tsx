import React, { useState, useEffect } from 'react';
import { useClientStore } from '../clientMenuSlice';
import { useAuthStore } from '../../auth/authSlice';
import { supabase } from '../../../config/supabaseClient';
import { apiService } from '../../../services/apiService';
import toast, { Toaster } from 'react-hot-toast';

export const ClientMenuDisplay: React.FC = () => {
  const addToCart = useClientStore((state) => state.addToCart);
  const user = useAuthStore((state) => state.user);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const fetchMenu = async () => {
    try {
        const response = await apiService.get('/menu');
        setMenuItems(response.data.menu || []);
    } catch (err) {
        console.error("Erreur chargement menu", err);
    }
  };

  useEffect(() => {
    fetchMenu();

    const channel = supabase
      .channel('client-menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => { fetchMenu(); }
      )
      .subscribe();

    let orderChannel: any;
    if (user?.id) {
        console.log("Subscribing to order status changes for user:", user.id);
        orderChannel = supabase
            .channel('order-status-changes')
            .on(
              'postgres_changes',
              { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'orders',
                filter: `user_id=eq.${user.id}` 
              },
              (payload) => {
                console.log("Realtime payload received:", payload);
                const nouveauStatut = payload.new.status;
                if (nouveauStatut === 'preparing') {
                  toast.success("Votre commande est en cours de préparation ! 👨‍🍳");
                } else if (nouveauStatut === 'ready') {
                  toast.success("Votre commande est prête ! 🍽️");
                } else if (nouveauStatut === 'cancelled') {
                  toast.error("Désolé, votre commande a été annulée.");
                }
              }
            )
            .subscribe((status) => {
                console.log("Subscription status:", status);
            });
    }

    return () => {
      supabase.removeChannel(channel);
      if (orderChannel) supabase.removeChannel(orderChannel);
    };
  }, [user]);

  return (
    <div className="p-4 sm:p-8 space-y-8 pt-20">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-bold">Notre Menu</h2>
      {/* ... reste du JSX ... */}

        {menuItems.map((item) => (
          <div key={item.id} className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <span className="text-[var(--color-primary)] font-black">{item.price} $</span>
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

import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { supabase } from '../../../config/supabaseClient';
import { LoadingButton } from '../../../components/ui/LoadingButton';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';

export const OrderManagerPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<Record<number, string>>({});

  const fetchOrders = async () => {
    try {
      const response = await apiService.get('/orders?active_only=true');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('order-manager-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchOrders(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateOrderStatus = async (id: number, status: string) => {
    setLoadingAction({ ...loadingAction, [id]: status });
    try {
      await apiService.patch(`/orders/${id}/status`, { status });
    } catch (error) {
      console.error('Erreur mise à jour commande:', error);
    } finally {
      setLoadingAction({ ...loadingAction, [id]: '' });
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
        <div className="p-2 bg-blue-600 text-white rounded-2xl">
            <ClipboardList size={28} />
        </div>
        Gestion des Commandes
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-black text-xl text-gray-900">Commande #{order.id}</h3>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    {order.order_type}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Client: <span className="font-bold text-gray-900">{order.customer_name}</span></p>
            <p className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-widest text-xs">Statut: {order.status}</p>
            
            <ul className="space-y-2 mb-6 bg-gray-50 p-4 rounded-xl">
                {order.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-mono font-bold">{item.price}$</span>
                    </li>
                ))}
            </ul>

            <div className="flex gap-2">
              <LoadingButton 
                isLoading={loadingAction[order.id] === 'served'} 
                onClick={() => updateOrderStatus(order.id, 'served')} 
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
              >
                <CheckCircle size={14}/> Servir
              </LoadingButton>
              <LoadingButton 
                isLoading={loadingAction[order.id] === 'cancelled'} 
                onClick={() => updateOrderStatus(order.id, 'cancelled')} 
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-700 transition-all"
              >
                <XCircle size={14}/> Annuler
              </LoadingButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

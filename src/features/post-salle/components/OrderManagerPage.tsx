import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';

export const OrderManagerPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const response = await apiService.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await apiService.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Erreur mise à jour commande:', error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined">list_alt</span> Gestion des Commandes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-[var(--color-card)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm">
            <h3 className="font-bold text-lg">Commande #{order.id}</h3>
            <p className="text-sm text-gray-500">Table: {order.table_number}</p>
            <p className="text-sm font-bold mt-2">Statut: <span className="uppercase text-[var(--color-primary)]">{order.status}</span></p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => updateOrderStatus(order.id, 'served')} className="text-xs bg-green-600 text-white px-3 py-1 rounded">Servir</button>
              <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="text-xs bg-red-600 text-white px-3 py-1 rounded">Annuler</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

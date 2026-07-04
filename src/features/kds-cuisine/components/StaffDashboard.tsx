import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';

const STATUS_CONFIG: Record<string, { color: string, icon: string, label: string }> = {
  pending: { color: 'border-yellow-500', icon: 'hourglass_empty', label: 'En attente' },
  preparing: { color: 'border-blue-500', icon: 'cooking', label: 'Préparation' },
  ready: { color: 'border-green-500', icon: 'check_circle', label: 'Prêt' },
};

export const KdsCuisinePage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
        const response = await apiService.get('/orders?active_only=true');
        setOrders(response.data.orders || []);
    } catch (err) {
        console.error("Erreur chargement commandes KDS", err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await apiService.patch(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">kitchen</span>
            Cuisine - Commandes
        </h2>
        <button onClick={fetchOrders} className="text-gray-500 hover:text-[var(--color-primary)]">
            <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          return (
            <div key={order.id} className={`bg-[var(--color-card)] p-6 rounded-[var(--radius-lg)] border-l-8 ${config.color} shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">Commande #{order.id}</h3>
                <span className="flex items-center gap-1 text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-sm">{config.icon}</span> {config.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 font-medium italic">Table : {order.table_number}</p>
              
              <ul className="mb-6 space-y-2 border-t pt-4">
                {order.items.map((item: any) => (
                  <li key={item.id} className="text-sm flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex gap-2 justify-end">
                {order.status !== 'preparing' && (
                    <button onClick={() => updateStatus(order.id, 'preparing')} className="bg-blue-600 text-white px-3 py-2 rounded-[var(--radius-sm)] text-xs flex items-center gap-1 hover:bg-blue-700">
                        <span className="material-symbols-outlined text-sm">cooking</span> Préparer
                    </button>
                )}
                {order.status !== 'ready' && (
                    <button onClick={() => updateStatus(order.id, 'ready')} className="bg-green-600 text-white px-3 py-2 rounded-[var(--radius-sm)] text-xs flex items-center gap-1 hover:bg-green-700">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Prêt
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

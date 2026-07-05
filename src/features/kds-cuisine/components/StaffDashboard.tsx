import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { supabase } from '../../../config/supabaseClient';
import { LoadingButton } from '../../../components/ui/LoadingButton';
import { ChefHat, Clock, CheckCircle, Flame, RefreshCw, Info } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string, icon: any, label: string, bgColor: string, textColor: string }> = {
  pending: { color: 'border-amber-500', icon: Clock, label: 'À préparer', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  preparing: { color: 'border-blue-500', icon: Flame, label: 'En cuisine', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  ready: { color: 'border-green-500', icon: CheckCircle, label: 'Prêt', bgColor: 'bg-green-50', textColor: 'text-green-700' },
};

export const KdsCuisinePage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<Record<number, string>>({});

  const fetchOrders = async () => {
    try {
        const response = await apiService.get('/orders?active_only=true');
        setOrders(response.data.orders || []);
    } catch (err) {
        console.error("Erreur chargement commandes KDS", err);
    }
  };

  useEffect(() => { 
    fetchOrders(); 

    const channel = supabase
      .channel('kds-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchOrders(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: number, status: string) => {
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-[#112222] flex items-center gap-3">
              <div className="p-2 bg-[#D96B27] text-white rounded-2xl">
                <ChefHat size={28} />
              </div>
              Écran Cuisine (KDS)
          </h2>
          <p className="text-gray-400 font-medium text-xs mt-1 uppercase tracking-widest">Temps réel des préparations</p>
        </div>
        <button onClick={fetchOrders} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
            <RefreshCw size={20} className="text-[#D96B27]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map(order => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const Icon = config.icon;
          return (
            <div key={order.id} className={`bg-white rounded-[2rem] border-t-8 ${config.color} shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300`}>
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl text-gray-900 leading-none">#{order.id}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Table {order.table_id || 'Ext.'}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
                      <Icon size={12} /> {config.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                   <div className="flex items-center gap-2 mb-3 border-b border-gray-200/50 pb-2">
                     <Info size={14} className="text-gray-400" />
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Articles à préparer</span>
                   </div>
                   <ul className="space-y-3">
                    {order.items.map((item: any) => (
                      <li key={item.id} className="flex justify-between items-center">
                        <span className="text-sm font-black text-gray-800">{item.name}</span>
                        <span className="bg-[#112222] text-white w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-auto p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                {order.status === 'pending' && (
                    <LoadingButton isLoading={loadingAction[order.id] === 'preparing'} onClick={() => updateStatus(order.id, 'preparing')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        <Flame size={14} /> Préparer
                    </LoadingButton>
                )}
                {order.status === 'preparing' && (
                    <LoadingButton isLoading={loadingAction[order.id] === 'ready'} onClick={() => updateStatus(order.id, 'ready')} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                        <CheckCircle size={14} /> Prêt
                    </LoadingButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

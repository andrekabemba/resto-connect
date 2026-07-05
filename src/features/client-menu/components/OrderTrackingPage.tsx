import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../../services/apiService';
import { supabase } from '../../../config/supabaseClient';
import { ClipboardList, Flame, CheckCircle, Coffee, Clock } from 'lucide-react';
import { PageTransition } from '../../../components/PageTransition';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);

  const fetchOrder = async () => {
    try {
      const response = await apiService.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (err) {
      console.error("Erreur chargement commande", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchOrder();

    const channel = supabase
      .channel('order-tracking')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${id}` 
      }, () => { fetchOrder(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (!order) return <div className="p-20 text-center">Chargement...</div>;

  const steps = [
    { id: 'pending', label: 'Reçue', icon: Clock },
    { id: 'preparing', label: 'En cuisine', icon: Flame },
    { id: 'ready', label: 'Prête', icon: Coffee },
    { id: 'served', label: 'Servie', icon: CheckCircle },
  ];

  const currentStep = steps.findIndex(s => s.id === order.status);

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto p-8 pt-32">
        <h2 className="text-3xl font-black mb-8">Suivi commande #{order.id}</h2>
        
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />
          <div className="flex justify-between relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isActive ? 'bg-[#D96B27] border-[#D96B27] text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-[#D96B27]' : 'text-gray-400'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-bold mb-4">Détails</h4>
            {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-50">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-mono">{item.price}$</span>
                </div>
            ))}
            <div className="flex justify-between pt-4 font-black text-lg">
                <span>Total</span>
                <span>{order.total}$</span>
            </div>
        </div>
      </div>
    </PageTransition>
  );
};
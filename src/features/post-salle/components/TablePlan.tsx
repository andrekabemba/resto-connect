import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { supabase } from '../../../config/supabaseClient';
import { LoadingButton } from '../../../components/ui/LoadingButton';
import { Grid, Users, CreditCard, Bookmark, CheckCircle, PlusCircle, RefreshCw } from 'lucide-react';

const TABLE_STATUSES: Record<string, { color: string, icon: any, label: string }> = {
  libre: { color: 'bg-green-50 border-green-100 text-green-700', icon: Grid, label: 'Libre' },
  occupee: { color: 'bg-red-50 border-red-100 text-red-700', icon: Users, label: 'Occupée' },
  encaissement: { color: 'bg-amber-50 border-amber-100 text-amber-700', icon: CreditCard, label: 'En caisse' },
  reservee: { color: 'bg-blue-50 border-blue-100 text-blue-700', icon: Bookmark, label: 'Réservée' },
};

export const TablePlanPage: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<Record<number, string>>({});

  const fetchTables = async () => {
    try {
      const response = await apiService.get('/tables');
      setTables(response.data.tables || []);
    } catch (error) {
      console.error('Erreur chargement tables:', error);
    }
  };

  useEffect(() => {
    fetchTables();
    const channel = supabase
      .channel('tables-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables_restaurant' }, () => { fetchTables(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateTableStatus = async (id: number, status: string) => {
    setLoadingAction({ ...loadingAction, [id]: status });
    try {
      await apiService.patch(`/tables/${id}/status`, { status });
    } catch (error) {
      console.error('Erreur mise à jour table:', error);
    } finally {
      setLoadingAction({ ...loadingAction, [id]: '' });
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-[#112222] flex items-center gap-3">
            <div className="p-2 bg-[#D96B27] text-white rounded-2xl shadow-lg shadow-orange-100">
              <Grid size={28} />
            </div>
            Plan de Salle
        </h2>
        <button onClick={fetchTables} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:rotate-180 transition-transform duration-500">
            <RefreshCw size={20} className="text-gray-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {tables.map(table => {
          const statusConfig = TABLE_STATUSES[table.status] || TABLE_STATUSES.libre;
          const Icon = statusConfig.icon;
          return (
            <div key={table.id} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-4 group hover:shadow-2xl ${statusConfig.color}`}>
              <div className="p-4 bg-white/50 backdrop-blur rounded-3xl group-hover:scale-110 transition-transform">
                <Icon size={32} />
              </div>
              <div className="text-center">
                <h3 className="font-black text-xl text-gray-900">Table {table.number}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{statusConfig.label}</p>
              </div>
              
              <div className="flex flex-col gap-2 w-full mt-2">
                {table.status === 'libre' && (
                    <LoadingButton isLoading={loadingAction[table.id] === 'occupee'} onClick={() => updateTableStatus(table.id, 'occupee')} className="bg-[#112222] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#D96B27] transition-all">
                        <PlusCircle size={14} /> Commander
                    </LoadingButton>
                )}
                {table.status === 'occupee' && (
                    <LoadingButton isLoading={loadingAction[table.id] === 'encaissement'} onClick={() => updateTableStatus(table.id, 'encaissement')} className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-100">
                        <CreditCard size={14} /> Encaisser
                    </LoadingButton>
                )}
                {table.status === 'encaissement' && (
                    <LoadingButton isLoading={loadingAction[table.id] === 'libre'} onClick={() => updateTableStatus(table.id, 'libre')} className="bg-green-700 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                        <CheckCircle size={14} /> Libérer
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

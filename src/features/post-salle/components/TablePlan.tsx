import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { useNavigate } from 'react-router-dom';

const TABLE_STATUSES = {
  libre: { color: 'bg-green-100 border-green-300 text-green-800', icon: 'table_restaurant' },
  occupee: { color: 'bg-red-100 border-red-300 text-red-800', icon: 'person' },
  encaissement: { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', icon: 'payments' },
  reservee: { color: 'bg-blue-100 border-blue-300 text-blue-800', icon: 'bookmark' },
};

export const TablePlanPage: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchTables = async () => {
    try {
      const response = await apiService.get('/tables');
      setTables(response.data.tables || []);
    } catch (error) {
      console.error('Erreur chargement tables:', error);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const updateTableStatus = async (id: number, status: string) => {
    await apiService.patch(`/tables/${id}/status`, { status });
    fetchTables();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">map</span> Plan de Salle
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => {
          const statusConfig = TABLE_STATUSES[table.status as keyof typeof TABLE_STATUSES] || TABLE_STATUSES.libre;
          return (
            <div key={table.id} className={`p-6 rounded-[var(--radius-lg)] border ${statusConfig.color} shadow-sm transition-all flex flex-col items-center gap-3`}>
              <span className="material-symbols-outlined text-4xl">{statusConfig.icon}</span>
              <h3 className="font-bold text-lg">Table {table.number}</h3>
              <p className="text-xs opacity-75 uppercase tracking-wider">{table.status}</p>
              
              <div className="flex flex-col gap-2 w-full mt-2">
                {table.status === 'libre' && (
                    <button onClick={() => updateTableStatus(table.id, 'occupee')} className="bg-[var(--color-primary)] text-white text-xs px-3 py-2 rounded-[var(--radius-sm)] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">add</span> Commander
                    </button>
                )}
                {table.status === 'occupee' && (
                    <button onClick={() => updateTableStatus(table.id, 'encaissement')} className="bg-yellow-600 text-white text-xs px-3 py-2 rounded-[var(--radius-sm)] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">payments</span> Payer
                    </button>
                )}
                {table.status === 'encaissement' && (
                    <button onClick={() => updateTableStatus(table.id, 'libre')} className="bg-green-700 text-white text-xs px-3 py-2 rounded-[var(--radius-sm)] flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Libérer
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

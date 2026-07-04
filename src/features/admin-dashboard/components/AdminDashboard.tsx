import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get('/reports/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-8">Chargement des données...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Activités en temps réel</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-[#D96B27] rounded-xl"><span className="material-symbols-outlined text-3xl">payments</span></div>
          <div>
            <p className="text-sm text-gray-500">Ventes du jour</p>
            <p className="text-2xl font-bold text-gray-900">{data.sales} CDF</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><span className="material-symbols-outlined text-3xl">list_alt</span></div>
          <div>
            <p className="text-sm text-gray-500">Commandes actives</p>
            <p className="text-2xl font-bold text-gray-900">{data.activeOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><span className="material-symbols-outlined text-3xl">table_restaurant</span></div>
          <div>
            <p className="text-sm text-gray-500">Tables occupées</p>
            <p className="text-2xl font-bold text-gray-900">{data.tableOccupancy}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><span className="material-symbols-outlined text-3xl">warning</span></div>
          <div>
            <p className="text-sm text-gray-500">Ingrédients critiques</p>
            <p className="text-2xl font-bold text-gray-900">{data.criticalStock}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

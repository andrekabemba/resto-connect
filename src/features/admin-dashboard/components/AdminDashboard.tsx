import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { DollarSign, ListOrdered, Table, AlertCircle, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tableau de bord</h1>
          <p className="text-gray-500 font-medium">Vue d'ensemble de votre établissement en temps réel</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 text-xs font-bold text-gray-600">
             <Calendar size={16} className="text-[#D96B27]" /> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
           </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-orange-50 text-[#D96B27] rounded-2xl group-hover:scale-110 transition-transform"><DollarSign size={28} /></div>
            <span className="text-green-500 text-xs font-black bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1"><TrendingUp size={12} /> +12%</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ventes du jour</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{data.sales} $</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><ListOrdered size={28} /></div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Commandes actives</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{data.activeOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform"><Table size={28} /></div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Occupation Tables</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{data.tableOccupancy}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform animate-pulse"><AlertCircle size={28} /></div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alertes Stock</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{data.criticalStock}</p>
          </div>
        </div>
      </div>

      {/* Rapports rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-gray-900">Performance Hebdomadaire</h3>
              <button className="text-xs font-bold text-[#D96B27] flex items-center gap-1 hover:underline">Voir le rapport complet <ChevronRight size={14} /></button>
           </div>
           <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm italic">Graphique des ventes (Chargement en cours...)</p>
           </div>
        </div>

        <div className="bg-[#112222] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={120} /></div>
           <h3 className="text-xl font-black mb-6 relative z-10">Bilan Financier</h3>
           <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                 <span className="text-gray-400 text-sm font-medium">Revenu Brut</span>
                 <span className="font-mono font-bold">{data.sales} $</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                 <span className="text-gray-400 text-sm font-medium">TVA (16%)</span>
                 <span className="font-mono font-bold">{(data.sales * 0.16).toFixed(2)} $</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="text-[#D96B27] text-lg font-black">Net Estimé</span>
                 <span className="text-2xl font-black font-mono text-[#D96B27]">{(data.sales * 0.84).toFixed(2)} $</span>
              </div>
           </div>
           <button className="w-full mt-8 bg-[#D96B27] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#c25a1e] transition-colors shadow-lg">
              Générer Rapport PDF
           </button>
        </div>
      </div>
    </div>
  );
};

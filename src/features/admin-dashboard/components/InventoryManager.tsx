import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { supabase } from '../../../config/supabaseClient'; // IMPORT AJOUTÉ
import { ProductForm } from './ProductForm';
import { LoadingButton } from '../../../components/ui/LoadingButton';
import { Package, Plus, Edit, Trash2, TrendingDown, TrendingUp, AlertTriangle, FileText } from 'lucide-react'; // Ajout FileText
import { jsPDF } from "jspdf"; // Assurez-vous d'installer jspdf: npm install jspdf
import "jspdf-autotable"; // npm install jspdf-autotable

export const InventoryManager: React.FC = () => {
  const [items, setItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchInventory = async () => {
    try {
      const response = await apiService.get('/inventory');
      setItems(response.data.ingredients || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error);
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.text("Rapport d'Inventaire - RestoConnect", 14, 15);

    // @ts-ignore
    doc.autoTable({
        head: [['Produit', 'Quantité', 'Seuil']],
        body: items.map((item: any) => [item.name, item.quantity, item.threshold]),
    });

    doc.save('inventaire.pdf');
  };

  useEffect(() => {
    fetchInventory();

    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ingredients' },
        () => { fetchInventory(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
// ... reste du composant

  const deleteItem = async (id: number) => {
    if(confirm("Confirmer la suppression ?")) {
        setDeleteId(id);
        try {
            await apiService.delete(`/inventory/${id}`);
            fetchInventory();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        } finally {
            setDeleteId(null);
        }
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Package size={24} />
            </div>
            Gestion des Stocks
        </h2>
        <div className="flex gap-2">
            <button 
              onClick={generatePDFReport}
              className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm font-bold"
            >
              <FileText size={20} /> Exporter PDF
            </button>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-[#D96B27] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-orange-200 font-bold"
            >
              <Plus size={20} /> Ajouter un ingrédient
            </button>
        </div>
      </div>
      
      {isFormOpen && (
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-xl animate-in slide-in-from-top-2">
            <ProductForm onClose={() => { setIsFormOpen(false); fetchInventory(); }} />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-bold uppercase tracking-wider text-gray-400 text-[11px]">Produit</th>
              <th className="p-5 font-bold uppercase tracking-wider text-gray-400 text-[11px]">Niveau Actuel</th>
              <th className="p-5 font-bold uppercase tracking-wider text-gray-400 text-[11px]">Seuil d'Alerte</th>
              <th className="p-5 font-bold uppercase tracking-wider text-gray-400 text-[11px]">État</th>
              <th className="p-5 text-center font-bold uppercase tracking-wider text-gray-400 text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item: any) => {
              const isLow = item.quantity <= item.threshold;
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.unit}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-mono font-bold ${isLow ? 'text-red-500' : 'text-gray-700'}`}>
                        {item.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-gray-500 font-mono">{item.threshold}</td>
                  <td className="p-5">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase">
                        <AlertTriangle size={12} /> Réapprovisionner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase">
                        Stock OK
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <LoadingButton isLoading={deleteId === item.id} onClick={() => deleteItem(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </LoadingButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

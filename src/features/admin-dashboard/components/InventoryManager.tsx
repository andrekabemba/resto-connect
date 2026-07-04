import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { ProductForm } from './ProductForm';

export const InventoryManager: React.FC = () => {
  const [items, setItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchInventory = async () => {
    try {
      const response = await apiService.get('/inventory');
      setItems(response.data.ingredients || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const deleteItem = async (id: number) => {
    if(confirm("Confirmer la suppression ?")) {
        await apiService.delete(`/inventory/${id}`);
        fetchInventory();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">inventory_2</span>
            Gestion des Stocks
        </h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-[var(--radius-sm)] flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span> Ajouter Produit
        </button>
      </div>
      
      {isFormOpen && (
        <div className="bg-[var(--color-card)] p-4 border border-[var(--color-border)] rounded-[var(--radius-lg)]">
            <ProductForm onClose={() => { setIsFormOpen(false); fetchInventory(); }} />
        </div>
      )}

      <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-input)] border-b border-[var(--color-border)]">
            <tr>
              <th className="p-4 text-left font-bold uppercase tracking-wider text-gray-500">Produit</th>
              <th className="p-4 text-left font-bold uppercase tracking-wider text-gray-500">Quantité</th>
              <th className="p-4 text-left font-bold uppercase tracking-wider text-gray-500">Seuil</th>
              <th className="p-4 text-center font-bold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id} className="border-t border-[var(--color-border)] hover:bg-gray-50">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4">{item.quantity} <span className="text-gray-500 text-xs">{item.unit}</span></td>
                <td className="p-4 text-gray-600">{item.threshold}</td>
                <td className="p-4 flex justify-center gap-3">
                  <button className="text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">edit</span> Éditer
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="text-red-500 flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">delete</span> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

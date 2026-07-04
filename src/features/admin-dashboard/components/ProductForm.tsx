import React, { useState } from 'react';
import { apiService } from '../../../services/apiService';
import { LoadingButton } from '../../../components/ui/LoadingButton';

export const ProductForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({ name: '', quantity: '', unit: 'kg' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await apiService.post('/inventory', formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[var(--color-card)] p-8 rounded-[var(--radius-lg)] w-full max-w-md border border-[var(--color-border)] space-y-4">
        <h3 className="text-xl font-bold">Ajouter un produit</h3>
        <input 
          placeholder="Nom du produit" 
          className="w-full p-3 border border-[var(--color-border)] rounded-[var(--radius-sm)]"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <input 
          type="number"
          placeholder="Quantité" 
          className="w-full p-3 border border-[var(--color-border)] rounded-[var(--radius-sm)]"
          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
        />
        <div className="flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold">Annuler</button>
          <LoadingButton isLoading={isLoading} type="submit" className="flex-1 py-3 bg-[var(--color-primary)] text-white font-bold rounded-[var(--radius-sm)]">Enregistrer</LoadingButton>
        </div>
      </form>
    </div>
  );
};

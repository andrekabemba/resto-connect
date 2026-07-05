import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { LoadingButton } from '../../../components/ui/LoadingButton';

export const MenuForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    category_id: '', 
    name: '', 
    description: '', 
    price: '', 
    station: 'plats', 
    image_url: '' 
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await apiService.get('/categories');
            setCategories(res.data.categories || []);
        } catch (err) {
            console.error("Erreur chargement catégories", err);
        }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    setError(null);
    
    const formDataFile = new FormData();
    formDataFile.append("image", e.target.files[0]);

    try {
      const res = await apiService.post('/upload', formDataFile, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData({ ...formData, image_url: res.data.imageUrl });
    } catch (err: any) {
      console.error("Détails erreur upload:", err);
      setError("Erreur upload: " + (err.response?.data?.error || "Vérifiez vos accès bucket"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        await apiService.post('/menu', {
            ...formData,
            price: parseFloat(formData.price),
            category_id: parseInt(formData.category_id as any)
        });
        onSave();
        onClose();
    } catch (err: any) {
        console.error("Erreur création plat", err);
        setError(err.response?.data?.error || "Une erreur est survenue lors de la création.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl w-full max-w-md border border-gray-100 shadow-xl space-y-4">
        <h3 className="text-xl font-bold">Nouveau Plat</h3>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <input type="file" onChange={handleImageUpload} className="w-full p-3 border border-gray-200 rounded-xl" />
        {formData.image_url && <img src={formData.image_url} className="h-20 w-20 object-cover rounded" alt="Plat" />}

        <input placeholder="Nom du plat" className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        <textarea placeholder="Description" className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, description: e.target.value})} required />
        <input type="number" placeholder="Prix" className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, price: e.target.value})} required />
        
        <select className="w-full p-3 border border-gray-200 rounded-xl" onChange={(e) => setFormData({...formData, category_id: e.target.value})} value={formData.category_id} required>
            <option value="">Choisir une catégorie</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold">Annuler</button>
          <LoadingButton isLoading={isLoading} type="submit" className="flex-1 py-3 bg-[#D96B27] text-white font-bold rounded-xl shadow-lg shadow-orange-200">Enregistrer</LoadingButton>
        </div>
      </form>
    </div>
  );
};
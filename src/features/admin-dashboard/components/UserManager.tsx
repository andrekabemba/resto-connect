import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { LoadingButton } from '../../../components/ui/LoadingButton';
import { UserPlus, Trash2, Shield, User, ChefHat, LogIn } from 'lucide-react';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'waiter' });
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await apiService.get('/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiService.post('/users', formData);
      setFormData({ name: '', email: '', password: '', role: 'waiter' });
      fetchUsers();
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if(confirm("Supprimer cet employé ?")) {
      setDeletingId(id);
      try {
        await apiService.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Erreur suppression utilisateur:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Gestion du Personnel</h2>
      
      <form onSubmit={handleAddUser} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</label>
          <input placeholder="Ex: André Kabemba" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
          <input placeholder="email@restaurant.com" type="email" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mot de passe</label>
          <input placeholder="••••••••" type="password" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rôle</label>
          <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="admin">Gestionnaire (Admin)</option>
            <option value="waiter">Serveur</option>
            <option value="cook">Cuisinier</option>
          </select>
        </div>
        <LoadingButton isLoading={isLoading} type="submit" className="bg-[#D96B27] text-white p-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
          <UserPlus size={18} /> Ajouter
        </LoadingButton>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-left text-gray-500 font-bold uppercase tracking-wider">Nom</th>
              <th className="p-4 text-left text-gray-500 font-bold uppercase tracking-wider">Email</th>
              <th className="p-4 text-left text-gray-500 font-bold uppercase tracking-wider">Rôle</th>
              <th className="p-4 text-right text-gray-500 font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{u.name}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                    u.role === 'cook' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {u.role === 'admin' && <Shield size={12} />}
                    {u.role === 'cook' && <ChefHat size={12} />}
                    {u.role === 'waiter' && <User size={12} />}
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <LoadingButton isLoading={deletingId === u.id} onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </LoadingButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

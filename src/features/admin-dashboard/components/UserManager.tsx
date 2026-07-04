import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { LoadingButton } from '../../../components/ui/LoadingButton';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'waiter' });
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Gestion du Personnel</h2>
      
      <form onSubmit={handleAddUser} className="bg-[var(--color-card)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <input placeholder="Nom" className="p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input placeholder="Email" type="email" className="p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input placeholder="Mot de passe" type="password" className="p-2 border rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        <select className="p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="admin">Admin</option>
          <option value="waiter">Serveur</option>
          <option value="cook">Cuisinier</option>
        </select>
        <LoadingButton isLoading={isLoading} type="submit" className="bg-[var(--color-primary)] text-white p-2 rounded">Ajouter</LoadingButton>
      </form>

      <div className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-input)]">
            <tr>
              <th className="p-4 text-left">Nom</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

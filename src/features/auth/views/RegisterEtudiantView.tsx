import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterEtudiantView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    dateNaissance: '',
    identifiantNational: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.registerEtudiant(form);
      toast.success('Inscription réussie, connectez-vous');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-rdc p-4">
      <Card className="w-full max-w-md card-glass animate-in slide-in-from-top-2">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <UserPlus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Inscription étudiant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nom *</Label>
                <Input 
                  value={form.nom} 
                  onChange={(e) => setForm({...form, nom: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <Label>Prénom *</Label>
                <Input 
                  value={form.prenom} 
                  onChange={(e) => setForm({...form, prenom: e.target.value})} 
                  required 
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>Mot de passe *</Label>
              <Input 
                type="password" 
                value={form.password} 
                onChange={(e) => setForm({...form, password: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>Date de naissance *</Label>
              <Input 
                type="date" 
                value={form.dateNaissance} 
                onChange={(e) => setForm({...form, dateNaissance: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>Identifiant national (optionnel)</Label>
              <Input 
                value={form.identifiantNational} 
                onChange={(e) => setForm({...form, identifiantNational: e.target.value})} 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full btn-elite gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "S'inscrire"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Retour à la connexion
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
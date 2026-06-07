import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Building2, ArrowLeft } from 'lucide-react';

export default function RegisterEtablissementView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    emailContact: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.registerEtablissement(form);
      toast.success('Établissement enregistré ! Connectez-vous.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-rdc p-4">
      <Card className="w-full max-w-md card-glass animate-in slide-in-from-top-2">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Inscription établissement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nom de l'établissement *</Label>
              <Input
                value={form.nom}
                onChange={(e) => setForm({...form, nom: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input
                value={form.adresse}
                onChange={(e) => setForm({...form, adresse: e.target.value})}
              />
            </div>
            <div>
              <Label>Email de contact *</Label>
              <Input
                type="email"
                value={form.emailContact}
                onChange={(e) => setForm({...form, emailContact: e.target.value})}
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
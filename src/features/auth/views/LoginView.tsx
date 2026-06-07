import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertCircle, Loader2, LogIn, GraduationCap, ArrowLeft } from 'lucide-react';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      toast.success('Connexion réussie');
      navigate('/dashboard');
    } else {
      toast.error(error || 'Échec de connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-rdc p-4">
      <Card className="w-full max-w-md card-glass animate-in slide-in-from-top-2">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Student Go RDC</CardTitle>
          <p className="text-center text-muted-foreground">Connectez-vous à votre compte</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="exemple@universite.cd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full btn-elite gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <LogIn className="h-4 w-4" />}
              Se connecter
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Pas encore de compte ? </span>
            <Link to="/register/etablissement" className="text-primary hover:underline">Inscrire mon établissement</Link>
            <span className="mx-2">|</span>
            <Link to="/register/etudiant" className="text-primary hover:underline">Inscription étudiant</Link>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { useDossier } from '../hooks/useDossier';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { DossierCard } from '../components/DossierCard';
import type { DossierTransfert } from '@/lib/api.types';

export default function SearchView() {
  const [email, setEmail] = useState('');
  const [dossiers, setDossiers] = useState<DossierTransfert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { rechercher } = useDossier();

  const handleSearch = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const result = await rechercher(email);
      setDossiers(result);
      if (result.length === 0) setError('Aucun dossier trouvé pour cet email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-top-2">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Rechercher un étudiant
      </h1>
      <Card className="card-inner">
        <CardContent className="flex gap-3 pt-6">
          <Input
            placeholder="Email étudiant"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading} className="btn-elite">
            {loading ? <Loader2 className="animate-spin" /> : <Search />} Chercher
          </Button>
        </CardContent>
      </Card>
      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {dossiers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {dossiers.map(d => <DossierCard key={d.id} dossier={d} />)}
        </div>
      )}
    </div>
  );
}
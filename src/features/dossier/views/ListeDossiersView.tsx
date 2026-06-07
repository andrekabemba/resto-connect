// features/dossier/views/ListeDossiersView.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDossier } from '../hooks/useDossier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DossierTransfert } from '@/lib/api.types';
import { DossierCard } from '../components/DossierCard';

export default function ListeDossiersView() {
  const { auth } = useAuth();
  const { rechercher, loading } = useDossier();
  const [dossiers, setDossiers] = useState<DossierTransfert[]>([]);
  const [searchEmail, setSearchEmail] = useState('');

  const handleSearch = async () => {
    if (!searchEmail) return;
    const result = await rechercher(searchEmail);
    setDossiers(result);
  };

  // Pour source, on pourrait charger tous ses dossiers (endpoint à ajouter)
  useEffect(() => {
    if (auth.role === 'SOURCE') {
      // Appel API pour lister les dossiers de l'établissement source
      // Simulons un appel
      // dossierService.getDossiersSource().then(setDossiers);
    }
  }, [auth]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-blue bg-clip-text text-transparent">
          {auth.role === 'SOURCE' ? 'Mes dossiers' : 'Transferts étudiants'}
        </h1>
        {auth.role === 'SOURCE' && (
          <Link to="/dossiers/creer">
            <Button className="btn-elite">+ Nouveau dossier</Button>
          </Link>
        )}
      </div>

      {auth.role === 'CIBLE' && (
        <Card className="card-inner">
          <CardContent className="flex gap-3 pt-4">
            <Input
              placeholder="Email étudiant"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Search />} Chercher
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>}

      {!loading && dossiers.length === 0 && (
        <p className="text-center text-muted-foreground">Aucun dossier trouvé.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dossiers.map((dossier) => (
          <DossierCard key={dossier.id} dossier={dossier} />
        ))}
      </div>
    </div>
  );
}
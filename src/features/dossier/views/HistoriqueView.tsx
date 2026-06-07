import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDossier } from '../hooks/useDossier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, History, Calendar, AlertCircle } from 'lucide-react';

export default function HistoriqueView() {
  const { id } = useParams();
  const { getHistorique, loading } = useDossier();
  const [historique, setHistorique] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getHistorique(id)
        .then(setHistorique)
        .catch(err => setError(err.message));
    }
  }, [id]);

  const getActionColor = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case 'CREATION_DOSSIER': return 'default';
      case 'VALIDATION_SOURCE': return 'secondary';
      case 'CONSENTEMENT': return 'outline';
      case 'ACCEPTATION_CIBLE': return 'default';
      case 'REFUS_CIBLE': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-top-2">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Historique du dossier
      </h1>
      <Card className="card-inner">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Toutes les actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historique.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucune action enregistrée.</p>
          ) : (
            <div className="space-y-4">
              {historique.map((h) => (
                <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition">
                  <Badge variant={getActionColor(h.action)}>{h.action}</Badge>
                  <div className="flex-1">
                    <p className="text-sm">{h.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(h.dateAction).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
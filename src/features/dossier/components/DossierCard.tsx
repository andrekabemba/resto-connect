import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar } from 'lucide-react';
import type { DossierTransfert } from '@/lib/api.types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACCEPTE: 'default',
  REFUSE: 'destructive',
  BROUILLON: 'secondary',
  EN_ATTENTE_VALIDATION_SOURCE: 'secondary',
  EN_ATTENTE_CONSENTEMENT_ETUDIANT: 'secondary',
  EN_COURS_CIBLE: 'secondary',
};

export function DossierCard({ dossier }: { dossier: DossierTransfert }) {
  return (
    <Card className="card-inner hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{dossier.etudiantPrenom} {dossier.etudiantNom}</p>
            <p className="text-sm text-muted-foreground">{dossier.etudiantEmail}</p>
          </div>
          <Badge variant={statusColors[dossier.statut] || 'secondary'}>{dossier.statut}</Badge>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(dossier.dateCreation).toLocaleDateString()}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/dossiers/${dossier.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full gap-1">
            <Eye className="h-4 w-4" /> Détails
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
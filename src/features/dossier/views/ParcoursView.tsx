import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDossier } from '../hooks/useDossier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ParcoursView() {
  const { id } = useParams();
  const { getParcours, loading } = useDossier();
  const [parcours, setParcours] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getParcours(id)
        .then(setParcours)
        .catch(err => setError(err.message));
    }
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!parcours) return <div className="text-center py-12">Aucun parcours trouvé</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-top-2">
      <Card className="card-inner">
        <CardHeader>
          <CardTitle>{parcours.intituleDiplome}</CardTitle>
          <p className="text-muted-foreground">Crédits obtenus : {parcours.creditsObtenus} ECTS</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcours.unites.map((ue: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{ue.code}</TableCell>
                  <TableCell>{ue.nom}</TableCell>
                  <TableCell>{ue.credits}</TableCell>
                  <TableCell>{ue.note ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Link to={`/dossiers/${id}`} className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Retour au dossier
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
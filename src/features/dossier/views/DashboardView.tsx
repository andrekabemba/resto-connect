import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDossier } from '../hooks/useDossier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CheckCircle, XCircle, Clock, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DossierTransfert, StatistiquesDTO } from '@/lib/api.types';

export default function DashboardView() {
  const { auth } = useAuth();
  const { getDossiers, getStatistiques, getMesDossiers, loading, error } = useDossier();
  const [dossiers, setDossiers] = useState<DossierTransfert[]>([]);
  const [stats, setStats] = useState<StatistiquesDTO | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pour l'étudiant, on stocke ses dossiers (une fois chargés, on ne les réinitialise pas)
  const [mesDossiers, setMesDossiers] = useState<DossierTransfert[]>([]);
  const [loadingEtudiant, setLoadingEtudiant] = useState<boolean>(true);
  const [errorEtudiant, setErrorEtudiant] = useState<string | null>(null);
  const studentLoadedRef = useRef(false); // évite de recharger

  // Chargement pour établissement
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (auth.userType !== 'ETABLISSEMENT') return;
      setRefreshing(true);
      try {
        const [dossiersData, statsData] = await Promise.all([getDossiers(), getStatistiques()]);
        if (mounted) {
          setDossiers(dossiersData);
          setStats(statsData);
          setIsFirstLoad(false);
        }
      } catch (err) {
        // géré par le hook error
      } finally {
        if (mounted) setRefreshing(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [auth.userType, getDossiers, getStatistiques]);

  // Chargement pour étudiant (une seule fois)
  useEffect(() => {
    if (auth.userType !== 'ETUDIANT') return;
    if (studentLoadedRef.current) return; // déjà chargé, ne pas recharger
    let mounted = true;
    const fetchEtudiant = async () => {
      setLoadingEtudiant(true);
      setErrorEtudiant(null);
      try {
        const data = await getMesDossiers();
        if (mounted) {
          setMesDossiers(data);
          studentLoadedRef.current = true;
        }
      } catch (err: any) {
        if (mounted) setErrorEtudiant(err.message);
      } finally {
        if (mounted) setLoadingEtudiant(false);
      }
    };
    fetchEtudiant();
    return () => { mounted = false; };
  }, [auth.userType, getMesDossiers]);

  // Vue étudiant (pas de clignotement car on affiche toujours la dernière valeur)
  if (auth.userType === 'ETUDIANT') {
    // Si c'est le premier chargement (pas encore de données) et pas d'erreur, on montre le skeleton
    if (loadingEtudiant && mesDossiers.length === 0 && !errorEtudiant) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      );
    }
    if (errorEtudiant) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500">{errorEtudiant}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      );
    }
    return (
      <div className="space-y-6 animate-in slide-in-from-top-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Mes dossiers de transfert
        </h1>
        {mesDossiers.length === 0 ? (
          <Card className="card-inner">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Aucun dossier de transfert pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mesDossiers.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-md transition">
                <div>
                  <p className="font-semibold">{d.etudiantPrenom} {d.etudiantNom}</p>
                  <p className="text-sm text-muted-foreground">{d.etudiantEmail}</p>
                  <Badge variant={d.statut === 'ACCEPTE' ? 'default' : 'secondary'} className="mt-1">{d.statut}</Badge>
                </div>
                <Link to={`/dossiers/${d.id}`}>
                  <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vue établissement (inchangée)
  if (isFirstLoad) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  const chartData = stats ? [
    { name: 'Acceptés', value: stats.dossiersAcceptes, color: '#10b981' },
    { name: 'Refusés', value: stats.dossiersRefuses, color: '#ef4444' },
    { name: 'En cours', value: stats.dossiersEnCours, color: '#eab308' },
  ] : [];
  const total = stats?.totalDossiers || 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-top-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Tableau de bord
        </h1>
        <Link to="/dossiers/creer"><Button className="btn-elite shadow-lg">+ Nouveau dossier</Button></Link>
      </div>
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-inner hover:scale-105 transition-transform duration-300">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total dossiers</p><p className="text-2xl font-bold">{stats.totalDossiers}</p></div>
              <FileText className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card className="card-inner hover:scale-105 transition-transform">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Acceptés</p><p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.dossiersAcceptes}</p></div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card className="card-inner hover:scale-105 transition-transform">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Refusés</p><p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.dossiersRefuses}</p></div>
              <XCircle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
          <Card className="card-inner hover:scale-105 transition-transform">
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">En cours</p><p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.dossiersEnCours}</p></div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>
        </div>
      )}
      {total > 0 && (
        <Card className="card-inner">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Répartition des dossiers</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: any) => [`${value} dossier(s)`, '']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="card-inner">
        <CardHeader><CardTitle>Derniers dossiers</CardTitle></CardHeader>
        <CardContent>
          {refreshing && dossiers.length === 0 ? (
            <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : dossiers.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun dossier créé pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {dossiers.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-md transition">
                  <div><p className="font-semibold">{d.etudiantPrenom} {d.etudiantNom}</p><p className="text-sm text-muted-foreground">{d.etudiantEmail}</p></div>
                  <Badge variant={d.statut === 'ACCEPTE' ? 'default' : 'secondary'}>{d.statut}</Badge>
                  <Link to={`/dossiers/${d.id}`}><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
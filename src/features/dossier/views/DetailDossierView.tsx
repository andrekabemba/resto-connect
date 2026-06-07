import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDossier } from '../hooks/useDossier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Send, UserCheck, Eye, History } from 'lucide-react';

export default function DetailDossierView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { getDossier, validerSource, consentement, repondre, loading } = useDossier();
  const [dossier, setDossier] = useState<any>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [commentaire, setCommentaire] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fetchedRef = useRef(false); // empêche de recharger plusieurs fois

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;
    const fetch = async () => {
      setLoadingPage(true);
      try {
        const data = await getDossier(id);
        setDossier(data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoadingPage(false);
      }
    };
    fetch();
  }, [id, getDossier]); // pas de dépendance volatile

  const handleValiderSource = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await validerSource(id, commentaire);
      setDossier(updated);
      toast.success('Dossier validé par la source');
      setCommentaire('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConsentement = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await consentement(id);
      const updated = await getDossier(id);
      setDossier(updated);
      toast.success('Consentement enregistré');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReponse = async () => {
    if (!id || !actionType) return;
    setActionLoading(true);
    try {
      const accepte = actionType === 'accept';
      const updated = await repondre(id, accepte, commentaire);
      setDossier(updated);
      toast.success(accepte ? 'Transfert accepté' : 'Transfert refusé');
      setShowDialog(false);
      setCommentaire('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (type: 'accept' | 'reject') => {
    if (!commentaire.trim()) {
      toast.error('Veuillez ajouter un commentaire');
      return;
    }
    setActionType(type);
    setShowDialog(true);
  };

  if (loadingPage) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>;
  if (!dossier) return <div className="text-center py-12">Dossier non trouvé</div>;

  const isSource = auth.userType === 'ETABLISSEMENT' && auth.etablissementId === dossier.etablissementSourceId;
  const isCible = auth.userType === 'ETABLISSEMENT' && auth.etablissementId !== dossier.etablissementSourceId;
  const statut = dossier.statut;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-top-2">
      <Card className="card-inner">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Dossier de {dossier.etudiantPrenom} {dossier.etudiantNom}</span>
            <Badge variant={statut === 'ACCEPTE' ? 'default' : 'secondary'}>{statut}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><strong>Email :</strong> {dossier.etudiantEmail}</div>
          <div><strong>Établissement source :</strong> {dossier.etablissementSourceNom}</div>
          <div><strong>Date création :</strong> {new Date(dossier.dateCreation).toLocaleString()}</div>
          {dossier.dateValidationSource && <div><strong>Validation source :</strong> {new Date(dossier.dateValidationSource).toLocaleString()}</div>}
          {dossier.dateAcceptationCible && <div><strong>Réponse cible :</strong> {new Date(dossier.dateAcceptationCible).toLocaleString()}</div>}
          {dossier.commentaireSource && <div><strong>Commentaire source :</strong> {dossier.commentaireSource}</div>}
          {dossier.commentaireCible && <div><strong>Commentaire cible :</strong> {dossier.commentaireCible}</div>}
        </CardContent>
      </Card>

      {isSource && statut === 'BROUILLON' && (
        <Card className="card-inner">
          <CardHeader><CardTitle>Validation par la source</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Commentaire (optionnel)"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
            <Button onClick={handleValiderSource} disabled={actionLoading} className="btn-elite">
              {actionLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              Valider le dossier
            </Button>
          </CardContent>
        </Card>
      )}

      {statut === 'EN_ATTENTE_VALIDATION_SOURCE' && (
        <Card className="card-inner">
          <CardHeader><CardTitle>Consentement étudiant</CardTitle></CardHeader>
          <CardContent>
            <Button onClick={handleConsentement} disabled={actionLoading} className="btn-elite">
              {actionLoading ? <Loader2 className="animate-spin mr-2" /> : <UserCheck className="mr-2 h-4 w-4" />}
              Je consens au transfert
            </Button>
          </CardContent>
        </Card>
      )}

      {isCible && statut === 'EN_COURS_CIBLE' && (
        <Card className="card-inner">
          <CardHeader><CardTitle>Décision de l'établissement cible</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Commentaire (obligatoire)"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={() => openActionDialog('accept')}
                disabled={actionLoading || !commentaire.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Accepter
              </Button>
              <Button
                variant="destructive"
                onClick={() => openActionDialog('reject')}
                disabled={actionLoading || !commentaire.trim()}
              >
                <XCircle className="mr-2 h-4 w-4" /> Refuser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(`/dossiers/${id}/parcours`)}>
          <Eye className="mr-2 h-4 w-4" /> Consulter le parcours
        </Button>
        <Button variant="outline" onClick={() => navigate(`/dossiers/${id}/historique`)}>
          <History className="mr-2 h-4 w-4" /> Historique
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'accept' ? 'Accepter le transfert' : 'Refuser le transfert'}</DialogTitle>
          </DialogHeader>
          <p>Confirmez-vous cette décision ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleReponse} variant={actionType === 'accept' ? 'default' : 'destructive'}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
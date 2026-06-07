import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDossier } from '../hooks/useDossier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

const uniteSchema = z.object({
  code: z.string().min(1, 'Code requis'),
  nom: z.string().min(1, 'Nom requis'),
  credits: z.number().min(0).max(30),
  note: z.number().min(0).max(20).optional(),
});

const dossierSchema = z.object({
  emailEtudiant: z.string().email('Email invalide'),
  nomEtudiant: z.string().optional(),
  prenomEtudiant: z.string().optional(),
  dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD').optional(),
  identifiantNational: z.string().optional(),
  intituleDiplome: z.string().optional(),
  creditsObtenus: z.number().min(0).max(300).optional(),
  unites: z.array(uniteSchema).optional(),
  commentaireSource: z.string().optional(),
});

type DossierForm = z.infer<typeof dossierSchema>;

export default function CreerDossierView() {
  const navigate = useNavigate();
  const { creerDossier, loading } = useDossier();
  const { register, handleSubmit, control, formState: { errors } } = useForm<DossierForm>({
    resolver: zodResolver(dossierSchema),
    defaultValues: {
      emailEtudiant: '',
      nomEtudiant: '',
      prenomEtudiant: '',
      dateNaissance: '',
      identifiantNational: '',
      intituleDiplome: '',
      creditsObtenus: 0,
      unites: [{ code: '', nom: '', credits: 0, note: undefined }],
      commentaireSource: '',
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'unites' });

  const onSubmit: SubmitHandler<DossierForm> = async (data) => {
    try {
      const payload: any = { emailEtudiant: data.emailEtudiant };
      if (data.nomEtudiant) payload.nomEtudiant = data.nomEtudiant;
      if (data.prenomEtudiant) payload.prenomEtudiant = data.prenomEtudiant;
      if (data.dateNaissance) payload.dateNaissance = data.dateNaissance;
      if (data.identifiantNational) payload.identifiantNational = data.identifiantNational;
      if (data.intituleDiplome) payload.intituleDiplome = data.intituleDiplome;
      if (data.creditsObtenus !== undefined && data.creditsObtenus !== null) payload.creditsObtenus = data.creditsObtenus;
      if (data.unites && data.unites.length > 0) {
        payload.unites = data.unites.map(u => ({
          code: u.code,
          nom: u.nom,
          credits: Number(u.credits),
          note: u.note ? Number(u.note) : undefined,
        }));
      }
      if (data.commentaireSource) payload.commentaireSource = data.commentaireSource;

      await creerDossier(payload);
      toast.success('Dossier créé avec succès');
      navigate('/dossiers');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-top-2">
      <Card className="card-inner">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Nouveau dossier de transfert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email étudiant *</Label>
                <Input {...register('emailEtudiant')} placeholder="jean.dupont@univ.cd" />
                {errors.emailEtudiant && <p className="text-red-500 text-sm mt-1">{errors.emailEtudiant.message}</p>}
              </div>
              <div>
                <Label>Nom</Label>
                <Input {...register('nomEtudiant')} placeholder="Dupont" />
              </div>
              <div>
                <Label>Prénom</Label>
                <Input {...register('prenomEtudiant')} placeholder="Jean" />
              </div>
              <div>
                <Label>Date de naissance</Label>
                <Input type="date" {...register('dateNaissance')} />
              </div>
              <div>
                <Label>Identifiant national</Label>
                <Input {...register('identifiantNational')} placeholder="CD12345678" />
              </div>
            </div>

            <div>
              <Label>Intitulé du diplôme</Label>
              <Input {...register('intituleDiplome')} placeholder="Licence en Informatique" />
            </div>

            <div>
              <Label>Crédits ECTS obtenus</Label>
              <Input type="number" {...register('creditsObtenus', { valueAsNumber: true })} placeholder="120" />
              {errors.creditsObtenus && <p className="text-red-500 text-sm mt-1">{errors.creditsObtenus.message}</p>}
            </div>

            <div>
              <Label>Unités d'enseignement</Label>
              {fields.map((field, idx) => (
                <div key={field.id} className="flex flex-wrap gap-2 mt-2 items-end border p-3 rounded-lg">
                  <div className="flex-1 min-w-[100px]"><Input placeholder="Code" {...register(`unites.${idx}.code`)} /></div>
                  <div className="flex-1 min-w-[140px]"><Input placeholder="Nom" {...register(`unites.${idx}.nom`)} /></div>
                  <div className="w-24"><Input type="number" placeholder="Crédits" {...register(`unites.${idx}.credits`, { valueAsNumber: true })} /></div>
                  <div className="w-24"><Input type="number" step="0.5" placeholder="Note" {...register(`unites.${idx}.note`, { valueAsNumber: true })} /></div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ code: '', nom: '', credits: 0, note: undefined })} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une UE
              </Button>
            </div>

            <div>
              <Label>Commentaire (optionnel)</Label>
              <Input {...register('commentaireSource')} placeholder="Informations complémentaires..." />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/dossiers')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Annuler
              </Button>
              <Button type="submit" disabled={loading} className="btn-elite">
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Créer le dossier
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';

type Props = {
  language: 'pt' | 'es';
};

export default function ProfileDialog({ language }: Props) {
  const isEs = language === 'es';
  const [open, setOpen] = useState(false);
  const [targetExamDate, setTargetExamDate] = useState('');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState<40 | 60 | 90>(60);
  const [planEnabled, setPlanEnabled] = useState(true);
  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: open });
  const utils = trpc.useUtils();
  const saveMutation = trpc.profile.save.useMutation({
    onSuccess: async () => {
      await Promise.all([profileQuery.refetch(), utils.guide.getStudyPlan.invalidate()]);
      setOpen(false);
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;
    setTargetExamDate(profileQuery.data.targetExamDate ?? '');
    setDailyStudyMinutes(profileQuery.data.dailyStudyMinutes as 40 | 60 | 90);
    setPlanEnabled(profileQuery.data.planEnabled);
  }, [profileQuery.data]);

  const text = isEs ? {
    trigger: 'Perfil', title: 'Perfil de estudio', description: 'Configura tu objetivo para recibir un plan de estudio adaptado.',
    track: 'Modalidad', goods: 'Mercancías', passengers: 'Viajeros — en implementación', date: 'Fecha prevista del examen',
    time: 'Tiempo disponible por día', minutes: 'minutos', plan: 'Activar plan de estudios', planHint: 'Puedes usar libremente el guía sin seguir el itinerario.',
    save: 'Guardar perfil', saving: 'Guardando...', error: 'No se pudo guardar el perfil.',
  } : {
    trigger: 'Perfil', title: 'Perfil de estudo', description: 'Configure seu objetivo para receber um plano de estudos adaptado.',
    track: 'Modalidade', goods: 'Mercadorias', passengers: 'Viajantes — em implementação', date: 'Data prevista da prova',
    time: 'Tempo disponível por dia', minutes: 'minutos', plan: 'Ativar plano de estudos', planHint: 'Você pode usar livremente o guia sem seguir o roteiro.',
    save: 'Salvar perfil', saving: 'Salvando...', error: 'Não foi possível salvar o perfil.',
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await saveMutation.mutateAsync({
      track: 'goods',
      targetExamDate: targetExamDate || null,
      dailyStudyMinutes,
      planEnabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">{text.trigger}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label>{text.track}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="rounded-lg border-2 border-blue-600 bg-blue-50 p-3 text-left font-semibold text-blue-800" aria-pressed="true">{text.goods}</button>
              <button type="button" className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 p-3 text-left text-sm text-slate-500" disabled>{text.passengers}</button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-exam-date">{text.date}</Label>
            <Input id="target-exam-date" type="date" value={targetExamDate} onChange={(event) => setTargetExamDate(event.target.value)} autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily-study-minutes">{text.time}</Label>
            <select id="daily-study-minutes" value={dailyStudyMinutes} onChange={(event) => setDailyStudyMinutes(Number(event.target.value) as 40 | 60 | 90)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {[40, 60, 90].map((minutes) => <option key={minutes} value={minutes}>{minutes} {text.minutes}</option>)}
            </select>
          </div>
          <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 p-3">
            <div><Label htmlFor="plan-enabled">{text.plan}</Label><p className="mt-1 text-xs text-slate-500">{text.planHint}</p></div>
            <Switch id="plan-enabled" checked={planEnabled} onCheckedChange={setPlanEnabled} />
          </div>
          {saveMutation.error && <p className="text-sm text-rose-600">{saveMutation.error.message || text.error}</p>}
          <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{saveMutation.isPending ? text.saving : text.save}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

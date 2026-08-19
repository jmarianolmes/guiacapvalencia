import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';

type Props = { language: 'pt' | 'es' };

export default function StudyPlanTab({ language }: Props) {
  const isEs = language === 'es';
  const planQuery = trpc.guide.getStudyPlan.useQuery();
  const text = isEs ? {
    title: 'Plan de estudio', subtitle: 'Itinerario diario basado en la prioridad histórica de los 8 exámenes oficiales más recientes.',
    readiness: 'Índice de preparación', attempts: 'simulacros válidos analizados', days: 'días hasta el examen', recent: 'Convocatorias recientes usadas',
    weak: 'Áreas para reforzar', noWeak: 'Aún no hay prácticas por capítulo suficientes para identificar áreas concretas.',
    daily: 'Itinerario diario', optional: 'Opcional', noDays: 'Configura la fecha del examen y activa el plan en Perfil para ver el itinerario.',
    warning: 'Este índice orienta el estudio con los resultados de esta plataforma; no garantiza un resultado en un examen real.',
    status: { insufficient: 'Datos insuficientes', reinforce: 'Refuerza ahora', evolving: 'En evolución', good: 'Buena preparación', high: 'Preparación alta' },
    plans: { complete: 'Plan completo', accelerated: 'Plan acelerado', emergency: 'Plan de emergencia', diagnostic: 'Modo diagnóstico', missing_date: 'Fecha pendiente', disabled: 'Plan desactivado', passengers_coming_soon: 'Viajeros en implementación' },
    loading: 'Preparando tu plan...',
  } : {
    title: 'Plano de Estudos', subtitle: 'Roteiro diário baseado na prioridade histórica das 8 provas oficiais mais recentes.',
    readiness: 'Índice de prontidão', attempts: 'simulados válidos analisados', days: 'dias até a prova', recent: 'Convocatórias recentes usadas',
    weak: 'Áreas para reforçar', noWeak: 'Ainda não há práticas por capítulo suficientes para identificar áreas concretas.',
    daily: 'Roteiro diário', optional: 'Opcional', noDays: 'Configure a data da prova e ative o plano no Perfil para visualizar o roteiro.',
    warning: 'Este índice orienta o estudo a partir dos resultados desta plataforma; não garante o resultado em uma prova real.',
    status: { insufficient: 'Dados insuficientes', reinforce: 'Reforçar agora', evolving: 'Em evolução', good: 'Boa prontidão', high: 'Prontidão alta' },
    plans: { complete: 'Plano completo', accelerated: 'Plano acelerado', emergency: 'Plano de emergência', diagnostic: 'Modo diagnóstico', missing_date: 'Data pendente', disabled: 'Plano desativado', passengers_coming_soon: 'Viajantes em implementação' },
    loading: 'Preparando seu plano...',
  };

  if (planQuery.isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!planQuery.data) return <Card><CardContent className="py-8 text-center text-slate-500">{text.loading}</CardContent></Card>;

  const { plan, chapterPriorities } = planQuery.data;
  const readiness = plan.readiness;
  const weakChapters = chapterPriorities.filter((chapter) => readiness.weakChapterIds.includes(chapter.id));
  const readinessColor = readiness.status === 'high' ? 'bg-emerald-100 text-emerald-800' : readiness.status === 'good' ? 'bg-blue-100 text-blue-800' : readiness.status === 'evolving' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';
  const planColor = plan.status === 'emergency' ? 'bg-rose-100 text-rose-800' : plan.status === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>{text.title}</CardTitle><CardDescription className="mt-1">{text.subtitle}</CardDescription></div><Badge className={planColor}>{text.plans[plan.status]}</Badge></div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-700">{isEs ? plan.messageEs : plan.messagePt}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-3 shadow-sm"><div className="text-2xl font-bold text-blue-700">{plan.daysUntilExam ?? '—'}</div><div className="text-xs text-slate-600">{text.days}</div></div>
            <div className="rounded-lg bg-white p-3 shadow-sm"><div className="text-2xl font-bold text-violet-700">{plan.dailyStudyMinutes}</div><div className="text-xs text-slate-600">min/dia</div></div>
            <div className="rounded-lg bg-white p-3 shadow-sm"><div className="text-2xl font-bold text-emerald-700">{plan.recentExamWindow}</div><div className="text-xs text-slate-600">{text.recent}</div></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>{text.readiness}</CardTitle><CardDescription>{readiness.validAttempts} {text.attempts}</CardDescription></div><Badge className={readinessColor}>{text.status[readiness.status]}{readiness.score !== null ? ` · ${readiness.score}/100` : ''}</Badge></div></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">{isEs ? readiness.explanationEs : readiness.explanationPt}</p>
          <div><h3 className="mb-2 text-sm font-semibold">{text.weak}</h3>{weakChapters.length ? <div className="flex flex-wrap gap-2">{weakChapters.map((chapter) => <Badge key={chapter.id} variant="outline">{chapter.code} · {isEs ? chapter.titleEs : chapter.titlePt}</Badge>)}</div> : <p className="text-sm text-slate-500">{text.noWeak}</p>}</div>
          <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">{text.warning}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{text.daily}</CardTitle></CardHeader>
        <CardContent>{plan.days.length ? <div className="space-y-3">{plan.days.map((day) => <details key={day.date} className="rounded-lg border border-slate-200 bg-white p-3" open={plan.days.length <= 14}><summary className="cursor-pointer font-semibold capitalize text-slate-800">{isEs ? day.labelEs : day.labelPt} <span className="ml-2 text-sm font-normal text-slate-500">({day.date})</span></summary><div className="mt-3 space-y-2">{day.activities.map((activity, index) => <div key={`${day.date}-${index}`} className="rounded-md bg-slate-50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">{isEs ? activity.titleEs : activity.titlePt}</strong><span className="text-xs text-slate-500">{activity.estimatedMinutes} min{activity.optional ? ` · ${text.optional}` : ''}</span></div><p className="mt-1 text-sm text-slate-600">{isEs ? activity.detailEs : activity.detailPt}</p></div>)}</div></details>)}</div> : <p className="py-6 text-center text-sm text-slate-500">{text.noDays}</p>}</CardContent>
      </Card>
    </div>
  );
}

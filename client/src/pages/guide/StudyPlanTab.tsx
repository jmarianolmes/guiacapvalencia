import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';

type Props = { language: 'pt' | 'es' };

type DayCard = {
  kind: 'review' | 'plan';
  date?: string;
  labelPt: string;
  labelEs: string;
  activities: Array<{
    titlePt: string;
    titleEs: string;
    detailPt: string;
    detailEs: string;
    estimatedMinutes: number;
    optional?: boolean;
  }>;
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function relativeDay(date: string | undefined, language: 'pt' | 'es') {
  if (!date) return language === 'pt' ? 'Revisão anterior' : 'Repaso anterior';
  const difference = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${isoToday()}T00:00:00Z`)) / 86_400_000);
  if (difference === 0) return language === 'pt' ? 'Hoje' : 'Hoy';
  if (difference === 1) return language === 'pt' ? 'Amanhã' : 'Mañana';
  if (difference === -1) return language === 'pt' ? 'Ontem' : 'Ayer';
  return language === 'pt' ? `Em ${difference} dias` : `En ${difference} días`;
}

export default function StudyPlanTab({ language }: Props) {
  const isEs = language === 'es';
  const planQuery = trpc.guide.getStudyPlan.useQuery();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedCard, setSelectedCard] = useState(1);
  const text = isEs ? {
    title: 'Plan de estudio', subtitle: 'Itinerario basado en las 34 pruebas oficiales; las 8 convocatorias más recientes aportan el factor de actualidad.',
    readiness: 'Índice de preparación', attempts: 'simulacros válidos analizados', days: 'días hasta el examen', recent: 'Convocatorias recientes usadas',
    weak: 'Áreas para reforzar', noWeak: 'Aún no hay prácticas por capítulo suficientes para identificar áreas concretas.',
    daily: 'Tu plan día a día', optional: 'Opcional', noDays: 'Configura la fecha del examen y activa el plan en Perfil para ver el itinerario.',
    warning: 'Este índice orienta el estudio con los resultados de esta plataforma; no garantiza un resultado en un examen real.',
    status: { insufficient: 'Datos insuficientes', reinforce: 'Refuerza ahora', evolving: 'En evolución', good: 'Buena preparación', high: 'Preparación alta' },
    plans: { complete: 'Plan completo', accelerated: 'Plan acelerado', emergency: 'Plan de emergencia', diagnostic: 'Modo diagnóstico', missing_date: 'Fecha pendiente', disabled: 'Plan desactivado', passengers_coming_soon: 'Viajeros en implementación' },
    loading: 'Preparando tu plan...', reviewTitle: 'Antes de avanzar', reviewDetail: 'Comprueba mentalmente qué parte del plan anterior conseguiste hacer. Esta primera versión no marca tareas como completadas automáticamente.',
    card: 'Tarjeta', of: 'de', previous: 'Día anterior', next: 'Día siguiente', todayHint: 'El carrusel empieza en hoy. Usa las flechas o las teclas ← y → para consultar otros días.',
  } : {
    title: 'Plano de Estudos', subtitle: 'Roteiro baseado nas 34 provas oficiais; as 8 convocações mais recentes entram como fator de atualidade.',
    readiness: 'Índice de prontidão', attempts: 'simulados válidos analisados', days: 'dias até a prova', recent: 'Convocatórias recentes usadas',
    weak: 'Áreas para reforçar', noWeak: 'Ainda não há práticas por capítulo suficientes para identificar áreas concretas.',
    daily: 'Seu plano dia a dia', optional: 'Opcional', noDays: 'Configure a data da prova e ative o plano no Perfil para visualizar o roteiro.',
    warning: 'Este índice orienta o estudo a partir dos resultados desta plataforma; não garante o resultado em uma prova real.',
    status: { insufficient: 'Dados insuficientes', reinforce: 'Reforçar agora', evolving: 'Em evolução', good: 'Boa prontidão', high: 'Prontidão alta' },
    plans: { complete: 'Plano completo', accelerated: 'Plano acelerado', emergency: 'Plano de emergência', diagnostic: 'Modo diagnóstico', missing_date: 'Data pendente', disabled: 'Plano desativado', passengers_coming_soon: 'Viajantes em implementação' },
    loading: 'Preparando seu plano...', reviewTitle: 'Antes de avançar', reviewDetail: 'Faça uma revisão mental do que conseguiu realizar no plano anterior. Nesta primeira versão, as tarefas não são marcadas automaticamente como concluídas.',
    card: 'Card', of: 'de', previous: 'Dia anterior', next: 'Próximo dia', todayHint: 'O carrossel começa em hoje. Use as setas ou as teclas ← e → para consultar outros dias.',
  };

  const cards = useMemo<DayCard[]>(() => {
    if (!planQuery.data?.plan.days.length) return [];
    return [
      {
        kind: 'review',
        labelPt: text.reviewTitle,
        labelEs: isEs ? text.reviewTitle : 'Repaso anterior',
        activities: [{ titlePt: 'Revisão de continuidade', titleEs: 'Revisión de continuidad', detailPt: text.reviewDetail, detailEs: isEs ? text.reviewDetail : 'Comprueba mentalmente qué parte del plan anterior conseguiste hacer. Esta primera versión no marca tareas como completadas automáticamente.', estimatedMinutes: 3 }],
      },
      ...planQuery.data.plan.days.map((day) => ({ kind: 'plan' as const, date: day.date, labelPt: day.labelPt, labelEs: day.labelEs, activities: day.activities })),
    ];
  }, [isEs, planQuery.data?.plan.days, text.reviewDetail, text.reviewTitle]);

  useEffect(() => {
    if (!carouselApi || cards.length < 2) return;
    carouselApi.scrollTo(1, true);
    setSelectedCard(1);
    const updateSelectedCard = () => setSelectedCard(carouselApi.selectedScrollSnap());
    carouselApi.on('select', updateSelectedCard);
    carouselApi.on('reInit', updateSelectedCard);
    return () => {
      carouselApi.off('select', updateSelectedCard);
      carouselApi.off('reInit', updateSelectedCard);
    };
  }, [carouselApi, cards.length]);

  if (planQuery.isLoading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!planQuery.data) return <Card><CardContent className="py-8 text-center text-slate-500">{text.loading}</CardContent></Card>;

  const { plan, chapterPriorities } = planQuery.data;
  const readiness = plan.readiness;
  const weakChapters = chapterPriorities.filter((chapter) => readiness.weakChapterIds.includes(chapter.id));
  const readinessColor = readiness.status === 'high' ? 'bg-emerald-100 text-emerald-800' : readiness.status === 'good' ? 'bg-blue-100 text-blue-800' : readiness.status === 'evolving' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';
  const planColor = plan.status === 'emergency' ? 'bg-rose-100 text-rose-800' : plan.status === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
  const activeCard = cards[selectedCard];

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
        <CardHeader><CardTitle>{text.daily}</CardTitle><CardDescription>{text.todayHint}</CardDescription></CardHeader>
        <CardContent>{cards.length ? <Carousel setApi={setCarouselApi} opts={{ align: 'start', loop: false }} className="mx-auto max-w-5xl px-1 sm:px-12"><div className="mb-4 flex items-center justify-between gap-3"><CarouselPrevious aria-label={text.previous} className="static left-auto top-auto h-10 w-10 shrink-0 translate-y-0" /><div className="min-w-0 text-center"><p className="text-sm font-bold text-slate-900">{relativeDay(activeCard?.date, language)}</p><p className="truncate text-xs capitalize text-slate-500">{activeCard ? (isEs ? activeCard.labelEs : activeCard.labelPt) : ''}{activeCard?.date ? ` · ${activeCard.date}` : ''}</p></div><CarouselNext aria-label={text.next} className="static right-auto top-auto h-10 w-10 shrink-0 translate-y-0" /></div><CarouselContent>{cards.map((day, index) => <CarouselItem key={day.date || day.kind} className="md:basis-[88%] lg:basis-[78%]"><article className={`min-h-[330px] rounded-2xl border p-5 shadow-sm ${index === selectedCard ? 'border-blue-300 bg-gradient-to-br from-white to-blue-50' : 'border-slate-200 bg-white'}`}><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><Badge className={day.kind === 'review' ? 'bg-slate-100 text-slate-700' : relativeDay(day.date, language) === (isEs ? 'Hoy' : 'Hoje') ? 'bg-blue-600 text-white' : 'bg-violet-100 text-violet-800'}>{relativeDay(day.date, language)}</Badge><h3 className="mt-2 text-xl font-bold capitalize text-slate-900">{isEs ? day.labelEs : day.labelPt}</h3>{day.date && <p className="mt-1 text-sm text-slate-500">{day.date}</p>}</div><span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">{text.card} {index + 1} {text.of} {cards.length}</span></div><div className="space-y-3">{day.activities.map((activity, activityIndex) => <div key={`${day.date || day.kind}-${activityIndex}`} className="rounded-xl border border-slate-100 bg-white/90 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-slate-900">{isEs ? activity.titleEs : activity.titlePt}</strong><span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{activity.estimatedMinutes} min{activity.optional ? ` · ${text.optional}` : ''}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{isEs ? activity.detailEs : activity.detailPt}</p></div>)}</div></article></CarouselItem>)}</CarouselContent></Carousel> : <p className="py-6 text-center text-sm text-slate-500">{text.noDays}</p>}</CardContent>
      </Card>
    </div>
  );
}

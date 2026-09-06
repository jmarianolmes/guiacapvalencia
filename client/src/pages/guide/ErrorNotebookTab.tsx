import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';
import { simulatorChapters } from '../../../../shared/simulatorChapters';

interface ErrorNotebookTabProps {
  language: 'pt' | 'es';
}

type Answer = 'A' | 'B' | 'C' | 'D';

export default function ErrorNotebookTab({ language }: ErrorNotebookTabProps) {
  const notebookQuery = trpc.guide.getErrorNotebook.useQuery(undefined, { staleTime: 30 * 1000, retry: 1 });
  const reviewMutation = trpc.guide.reviewErrorNotebookItem.useMutation();
  const utils = trpc.useUtils();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; resolved: boolean; nextReviewAt: Date | string | null; correctAnswer: string } | null>(null);

  const items = notebookQuery.data?.dueItems || [];
  const currentItem = items[Math.min(currentIndex, Math.max(0, items.length - 1))];
  const summary = notebookQuery.data?.summary;

  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) setCurrentIndex(0);
  }, [currentIndex, items.length]);

  const t = language === 'pt' ? {
    title: 'Caderno de erros',
    subtitle: 'Revise os erros no momento certo para consolidar o conteúdo.',
    due: 'Para revisar agora',
    scheduled: 'Agendadas',
    resolved: 'Consolidadas',
    total: 'Questões no caderno',
    chapterFocus: 'Onde concentrar a revisão',
    noErrorsTitle: 'Nenhuma revisão pendente hoje',
    noErrorsText: 'Continue praticando. Os erros de simulados entram aqui automaticamente e voltam conforme o intervalo de revisão.',
    emptyNotebook: 'Seu caderno ainda está vazio',
    emptyNotebookText: 'Finalize simulados com respostas incorretas para criar sua primeira revisão individual.',
    question: 'Questão',
    of: 'de',
    answer: 'Responder revisão',
    correct: 'Resposta correta. Ótimo avanço.',
    wrong: 'Ainda não. A resposta correta é',
    next: 'Próxima revisão',
    resolvedMessage: 'Esta questão foi consolidada após quatro acertos espaçados.',
    nextReview: 'Próxima revisão',
    unavailable: 'Não foi possível carregar seu caderno. Tente novamente.',
    retry: 'Tentar novamente',
    pending: 'pendentes',
  } : {
    title: 'Cuaderno de errores',
    subtitle: 'Revisa los errores en el momento adecuado para consolidar el contenido.',
    due: 'Para revisar ahora',
    scheduled: 'Programadas',
    resolved: 'Consolidadas',
    total: 'Preguntas en el cuaderno',
    chapterFocus: 'Dónde concentrar la revisión',
    noErrorsTitle: 'No tienes revisiones pendientes hoy',
    noErrorsText: 'Sigue practicando. Los errores de los simulacros entran aquí automáticamente y vuelven según el intervalo de revisión.',
    emptyNotebook: 'Tu cuaderno todavía está vacío',
    emptyNotebookText: 'Finaliza simulacros con respuestas incorrectas para crear tu primera revisión individual.',
    question: 'Pregunta',
    of: 'de',
    answer: 'Responder revisión',
    correct: 'Respuesta correcta. Buen avance.',
    wrong: 'Todavía no. La respuesta correcta es',
    next: 'Siguiente revisión',
    resolvedMessage: 'Esta pregunta se consolidó después de cuatro aciertos espaciados.',
    nextReview: 'Próxima revisión',
    unavailable: 'No se ha podido cargar tu cuaderno. Inténtalo de nuevo.',
    retry: 'Intentar de nuevo',
    pending: 'pendientes',
  };

  const formatReviewDate = (value: Date | string | null) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const submitAnswer = (answer: Answer) => {
    if (!currentItem || feedback) return;
    setSelectedAnswer(answer);
    reviewMutation.mutate({ itemId: currentItem.id, selectedAnswer: answer }, {
      onSuccess: (result) => {
        setFeedback(result);
        utils.guide.getErrorNotebook.invalidate();
      },
    });
  };

  const nextItem = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setCurrentIndex(0);
  };

  if (notebookQuery.isLoading) {
    return <Card><CardContent className="flex items-center justify-center gap-2 py-12"><Spinner />{t.title}</CardContent></Card>;
  }

  if (notebookQuery.isError || !summary) {
    return <Card className="border-red-200"><CardContent className="space-y-3 py-10 text-center"><p className="text-sm text-red-700">{t.unavailable}</p><Button variant="outline" onClick={() => notebookQuery.refetch()}>{t.retry}</Button></CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-amber-50 via-white to-rose-50 p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: t.due, value: summary.dueCount, className: 'bg-rose-50 text-rose-700' },
          { label: t.scheduled, value: summary.scheduledCount, className: 'bg-amber-50 text-amber-700' },
          { label: t.resolved, value: summary.resolvedCount, className: 'bg-emerald-50 text-emerald-700' },
          { label: t.total, value: summary.totalItems, className: 'bg-blue-50 text-blue-700' },
        ].map((metric) => <Card key={metric.label} className="border-slate-100 shadow-sm"><CardContent className="p-4"><div className={`text-2xl font-bold ${metric.className.split(' ')[1]}`}>{metric.value}</div><div className="mt-1 text-xs leading-4 text-slate-600">{metric.label}</div></CardContent></Card>)}
      </div>

      {summary.chapterCounts.length > 0 && <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">{t.chapterFocus}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {summary.chapterCounts.slice(0, 6).map((item) => {
            const chapter = item.chapterId ? simulatorChapters.find((entry) => entry.id === item.chapterId) : undefined;
            const label = chapter ? `${chapter.code} · ${language === 'pt' ? chapter.titlePt : chapter.titleEs}` : (language === 'pt' ? 'Sem capítulo' : 'Sin capítulo');
            return <Badge key={item.chapterId || 'none'} variant="secondary" className="h-auto max-w-full whitespace-normal px-3 py-2 text-left text-sm">{label}: {item.count} {t.pending}</Badge>;
          })}
        </CardContent>
      </Card>}

      {!currentItem ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
            <h3 className="text-lg font-bold text-slate-900">{summary.totalItems ? t.noErrorsTitle : t.emptyNotebook}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{summary.totalItems ? t.noErrorsText : t.emptyNotebookText}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-orange-100 shadow-md">
          <CardHeader className="border-b border-slate-100 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg">{t.question} {Math.min(currentIndex + 1, items.length)} {t.of} {items.length}</CardTitle>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{currentItem.wrongCount}× {language === 'pt' ? 'erros' : 'errores'}</Badge>
            </div>
            <CardDescription>{currentItem.chapterId ? (() => { const chapter = simulatorChapters.find((entry) => entry.id === currentItem.chapterId); return chapter ? `${chapter.code} · ${language === 'pt' ? chapter.titlePt : chapter.titleEs}` : ''; })() : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <p className="text-base font-semibold leading-7 text-slate-900 md:text-lg">{currentItem.question.question}</p>
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as Answer[]).map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = feedback?.correctAnswer === option;
                const optionClass = feedback
                  ? isCorrect ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : isSelected ? 'border-rose-600 bg-rose-50 text-rose-950' : 'border-slate-200 opacity-75'
                  : isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/40';
                return <button key={option} type="button" disabled={Boolean(feedback) || reviewMutation.isPending} onClick={() => submitAnswer(option)} className={`w-full rounded-xl border-2 p-4 text-left text-sm transition-all disabled:cursor-default md:text-base ${optionClass}`}><span className="font-bold">{option})</span> {String(currentItem.question[`option${option}` as keyof typeof currentItem.question])}</button>;
              })}
            </div>
            {feedback && <div className={`rounded-xl border p-4 text-sm leading-6 ${feedback.correct ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
              <strong>{feedback.correct ? t.correct : `${t.wrong} ${feedback.correctAnswer}.`}</strong>
              <p className="mt-1">{feedback.resolved ? t.resolvedMessage : `${t.nextReview}: ${formatReviewDate(feedback.nextReviewAt)}.`}</p>
            </div>}
            {reviewMutation.isError && <p className="text-sm text-red-700">{t.unavailable}</p>}
            {feedback && <Button className="w-full" onClick={nextItem}>{t.next}</Button>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';

interface TricksTabProps {
  language: 'pt' | 'es';
}

function cleanDisplayedOption(option: string, letter: string) {
  const value = String(option ?? '').trim();
  const prefix = new RegExp(`^${letter}\\s*[)\\.\\-:]\\s*`, 'i');
  return value.replace(prefix, '').trim();
}

export default function TricksTab({ language }: TricksTabProps) {
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [visibleQuestions, setVisibleQuestions] = useState<Record<string, number>>({});
  const analysisQuery = trpc.guide.getOfficialExamAnalysis.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const t = {
    pt: {
      title: 'Pegadinhas nas Provas Oficiais',
      desc: 'Cada padrão abaixo foi levantado exclusivamente nas 3.400 questões das 34 provas oficiais. Clique para abrir as questões relacionadas, conferir as alternativas e estudar o gabarito oficial.',
      loading: 'Carregando as pegadinhas oficiais...',
      error: 'Não foi possível carregar a análise das pegadinhas.',
      questions: 'questões oficiais relacionadas',
      occurrences: 'ocorrências',
      exams: 'Provas em que apareceu',
      correct: 'Gabarito oficial',
      trap: 'Alternativa-trampa',
      collapse: 'Ocultar questões',
      expand: 'Abrir questões oficiais',
      officialOnly: 'Base: 34 provas oficiais · 3.400 questões',
      loadMore: 'Mostrar mais questões oficiais',
      showing: 'Mostrando',
    },
    es: {
      title: 'Trampas en los Exámenes Oficiales',
      desc: 'Cada patrón siguiente se ha obtenido exclusivamente de las 3.400 preguntas de los 34 exámenes oficiales. Pulsa para abrir las preguntas relacionadas, comprobar las alternativas y estudiar la respuesta oficial.',
      loading: 'Cargando las trampas oficiales...',
      error: 'No se ha podido cargar el análisis de trampas.',
      questions: 'preguntas oficiales relacionadas',
      occurrences: 'apariciones',
      exams: 'Exámenes en los que apareció',
      correct: 'Respuesta oficial',
      trap: 'Alternativa-trampa',
      collapse: 'Ocultar preguntas',
      expand: 'Abrir preguntas oficiales',
      officialOnly: 'Base: 34 exámenes oficiales · 3.400 preguntas',
      loadMore: 'Mostrar más preguntas oficiales',
      showing: 'Mostrando',
    },
  } as const;
  const texts = t[language];

  if (analysisQuery.isLoading) {
    return <Card><CardContent className="flex items-center justify-center gap-2 py-8"><Spinner />{texts.loading}</CardContent></Card>;
  }

  if (analysisQuery.isError || !analysisQuery.data) {
    return <Card><CardContent className="py-8 text-center text-sm text-red-700">{texts.error}</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <h2 className="font-bold text-slate-900">{texts.title}</h2>
          <p className="mt-2 text-sm text-slate-700">{texts.desc}</p>
          <Badge variant="outline" className="mt-3 border-red-200 bg-white text-red-800">{texts.officialOnly}</Badge>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {analysisQuery.data.trapInsights.map((trick) => {
          const expanded = expandedTitle === trick.title;
          const visibleLimit = visibleQuestions[trick.title] ?? 25;
          const displayedQuestions = trick.questions.slice(0, visibleLimit);
          return (
            <Card key={trick.title} className="overflow-hidden border-l-4 border-red-500">
              <button
                type="button"
                className="w-full px-6 py-5 text-left transition-colors hover:bg-red-50"
                onClick={() => {
                  if (!expanded && !visibleQuestions[trick.title]) {
                    setVisibleQuestions((current) => ({ ...current, [trick.title]: 25 }));
                  }
                  setExpandedTitle(expanded ? null : trick.title);
                }}
                aria-expanded={expanded}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{trick.title}</h3>
                    <p className="mt-1 text-sm text-slate-700">{language === 'pt' ? trick.descriptionPt : trick.descriptionEs}</p>
                  </div>
                  <Badge className="shrink-0 bg-red-100 text-red-800">{trick.percentage}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                  <span>{trick.uniqueQuestionCount} {texts.questions}</span>
                  <span>·</span>
                  <span>{trick.count} {texts.occurrences}</span>
                  <span className="ml-auto text-red-700">{expanded ? texts.collapse : texts.expand}</span>
                </div>
              </button>

              {expanded && (
                <CardContent className="border-t border-red-100 bg-slate-50 pt-5">
                  <div className="space-y-4">
                    {displayedQuestions.map((question, index) => (
                      <article key={`${question.question}-${index}`} className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-xs text-slate-600">{question.occurrences} {texts.occurrences}</span>
                        </div>
                        <p className="font-semibold text-slate-900">{question.question}</p>
                        <div className="mt-3 space-y-2">
                          {(['A', 'B', 'C', 'D'] as const).map((option) => {
                            const correct = option === question.correctAnswer;
                            const text = question[`option${option}`];
                            return (
                              <div key={option} className={`rounded-md border px-3 py-2 text-sm ${correct ? 'border-green-300 bg-green-50 text-green-950' : 'border-red-100 bg-red-50 text-red-950'}`}>
                                <span className="font-bold">{option})</span> {cleanDisplayedOption(text, option)}
                                <span className={`ml-2 text-xs font-semibold ${correct ? 'text-green-700' : 'text-red-700'}`}>— {correct ? texts.correct : texts.trap}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 text-xs text-slate-600">
                          <span className="font-semibold">{texts.exams}:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {question.exams.map((exam) => <Badge key={exam} variant="secondary" className="text-xs">{exam}</Badge>)}
                          </div>
                        </div>
                      </article>
                    ))}
                    {displayedQuestions.length < trick.questions.length && (
                      <div className="flex flex-col items-center gap-2 pt-2">
                        <p className="text-xs text-slate-600">{texts.showing} {displayedQuestions.length} / {trick.questions.length}</p>
                        <button
                          type="button"
                          className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50"
                          onClick={() => setVisibleQuestions((current) => ({ ...current, [trick.title]: visibleLimit + 25 }))}
                        >
                          {texts.loadMore}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

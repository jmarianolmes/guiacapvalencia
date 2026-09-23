import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';

interface OverviewTabProps {
  language: 'pt' | 'es';
}

const ANSWER_COLORS: Record<string, string> = { A: '#2563eb', B: '#7c3aed', C: '#db2777', D: '#16a34a' };

export default function OverviewTab({ language }: OverviewTabProps) {
  const [priorityIndex, setPriorityIndex] = useState(0);
  const analysisQuery = trpc.guide.getOfficialExamAnalysis.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: 1 });
  const resultsQuery = trpc.guide.getUserResults.useQuery(undefined, { staleTime: 60 * 1000, retry: 1 });
  const t = {
    pt: {
      title: 'Visão Geral — Estatísticas Oficiais',
      subtitle: 'Todos os indicadores desta página usam exclusivamente as 3.400 questões das 34 provas oficiais (2020–2026). O pool estatístico não entra nos cálculos.',
      exams: 'Provas oficiais', questions: 'Questões oficiais', unique: 'Enunciados únicos', repeated: 'Grupos repetidos',
      recurringShare: 'questões em grupos recorrentes',
      priority: 'Índice de Prioridade por Capítulo',
      priorityDescription: 'Ranking dos capítulos a partir de volume, repetição, presença nas 34 provas e presença nas 8 convocatórias mais recentes.',
      recurrence: 'Recorrência por Convocatória',
      recurrenceDescription: 'Percentual de questões de cada prova cujo conjunto de enunciado, alternativas e gabarito também aparece em outra prova oficial.',
      recurrenceRate: 'Recorrência de questões',
      recurrenceSummary: 'Pico de recorrência',
      answers: 'Distribuição dos Gabaritos Oficiais',
      answerAnalysis: 'A distribuição A–D é equilibrada. Não há “letra da sorte”; o gabarito deve ser escolhido pelo conteúdo e pelas condições do enunciado.',
      studyPlan: 'Roteiro de Revisão Prioritária por Capítulo',
      studyPlanDescription: 'Cada posição combina peso na prova, recorrência literal, cobertura histórica e presença recente. Use o roteiro para distribuir as revisões, não para adivinhar o gabarito.',
      studyStep: 'Prioridade',
      score: 'Índice', volume: 'peso na prova', recurring: 'recorrentes', coverage: 'provas', recent: 'recentes',
      intensive: 'Estudo completo', reinforce: 'Reforço dirigido', maintain: 'Revisão de manutenção',
      intensiveDescription: 'Leia o Temario, fixe regras e exceções e faça uma versão completa do treino por capítulo.',
      reinforceDescription: 'Revise o resumo, concentre-se nas questões repetidas e refaça os erros do histórico.',
      maintainDescription: 'Mantenha uma revisão curta de conceitos e resolva as questões disponíveis do capítulo.',
      previousPriority: 'Prioridade anterior', nextPriority: 'Próxima prioridade', position: 'de',
      recurringGroups: 'grupos de questões recorrentes',
      methodology: 'Como interpretar',
      methodologyText: 'O índice pondera 55% de volume relativo, 25% de recorrência literal, 10% de presença nas 34 provas e 10% de presença nas 8 convocatórias mais recentes. Recorrência usa enunciado, quatro alternativas e gabarito; apenas provas oficiais entram no cálculo.',
      loading: 'Calculando a análise oficial...', error: 'Não foi possível carregar a análise oficial.',
      questionsShort: 'questões', percentage: 'percentual', simulatorSummary: 'Resumo dos seus simulados', simulatorAttempts: 'simulados válidos', simulatorTotal: 'total no histórico', simulatorAverage: 'média das notas válidas', simulatorBest: 'melhor nota válida', simulatorPassed: 'aprovados válidos', simulatorRecent: 'Todos os simulados', simulatorNone: 'Você ainda não finalizou nenhum simulado.', simulatorOfficial: 'Data', simulatorModel: 'Modelo', simulatorChapter: 'Capítulo', simulatorQuestions: 'questões', simulatorScore: 'nota', simulatorLoading: 'Carregando histórico...', simulatorCutoff: 'Faixa de corte: provas de 100 exigem 50 respostas; simulados de 50 exigem 40. Tentativas abaixo disso não entram na média nem na probabilidade.', simulatorIncomplete: 'incompleto para estatísticas',
    },
    es: {
      title: 'Visión General — Estadísticas Oficiales',
      subtitle: 'Todos los indicadores de esta página usan exclusivamente las 3.400 preguntas de los 34 exámenes oficiales (2020–2026). El pool estadístico no entra en los cálculos.',
      exams: 'Exámenes oficiales', questions: 'Preguntas oficiales', unique: 'Enunciados únicos', repeated: 'Grupos repetidos',
      recurringShare: 'preguntas en grupos recurrentes',
      priority: 'Índice de Prioridad por Capítulo',
      priorityDescription: 'Ranking de capítulos según volumen, repetición, presencia en los 34 exámenes y presencia en las 8 convocatorias más recientes.',
      recurrence: 'Recurrencia por Convocatoria',
      recurrenceDescription: 'Porcentaje de preguntas de cada examen cuyo conjunto de enunciado, alternativas y respuesta también aparece en otro examen oficial.',
      recurrenceRate: 'Recurrencia de preguntas',
      recurrenceSummary: 'Pico de recurrencia',
      answers: 'Distribución de Respuestas Oficiales',
      answerAnalysis: 'La distribución A–D está equilibrada. No hay “letra de la suerte”; la respuesta debe elegirse por el contenido y las condiciones del enunciado.',
      studyPlan: 'Plan de Repaso Prioritario por Capítulo',
      studyPlanDescription: 'Cada posición combina peso en el examen, recurrencia literal, cobertura histórica y presencia reciente. Usa el plan para distribuir los repasos, no para adivinar la respuesta.',
      studyStep: 'Prioridad',
      score: 'Índice', volume: 'peso en el examen', recurring: 'recurrentes', coverage: 'exámenes', recent: 'recientes',
      intensive: 'Estudio completo', reinforce: 'Refuerzo dirigido', maintain: 'Repaso de mantenimiento',
      intensiveDescription: 'Lee el Temario, fija reglas y excepciones y realiza una versión completa de la práctica por capítulo.',
      reinforceDescription: 'Repasa el resumen, céntrate en las preguntas repetidas y rehace los errores del historial.',
      maintainDescription: 'Mantén un repaso breve de conceptos y resuelve las preguntas disponibles del capítulo.',
      previousPriority: 'Prioridad anterior', nextPriority: 'Siguiente prioridad', position: 'de',
      recurringGroups: 'grupos de preguntas recurrentes',
      methodology: 'Cómo interpretar',
      methodologyText: 'El índice pondera 55% de volumen relativo, 25% de recurrencia literal, 10% de presencia en los 34 exámenes y 10% de presencia en las 8 convocatorias más recientes. La recurrencia usa enunciado, cuatro alternativas y respuesta; solo entran exámenes oficiales.',
      loading: 'Calculando el análisis oficial...', error: 'No se ha podido cargar el análisis oficial.',
      questionsShort: 'preguntas', percentage: 'porcentaje', simulatorSummary: 'Resumen de tus simulacros', simulatorAttempts: 'simulacros válidos', simulatorTotal: 'total en el historial', simulatorAverage: 'media de notas válidas', simulatorBest: 'mejor nota válida', simulatorPassed: 'aprobados válidos', simulatorRecent: 'Todos los simulacros', simulatorNone: 'Todavía no has finalizado ningún simulacro.', simulatorOfficial: 'Fecha', simulatorModel: 'Modelo', simulatorChapter: 'Capítulo', simulatorQuestions: 'preguntas', simulatorScore: 'nota', simulatorLoading: 'Cargando historial...', simulatorCutoff: 'Rango mínimo: los exámenes de 100 exigen 50 respuestas; los simulacros de 50 exigen 40. Los intentos inferiores no entran en la media ni en la probabilidad.', simulatorIncomplete: 'incompleto para estadísticas',
    },
  } as const;
  const texts = t[language];

  if (analysisQuery.isLoading) return <Card><CardContent className="flex items-center justify-center gap-2 py-10"><Spinner />{texts.loading}</CardContent></Card>;
  if (analysisQuery.isError || !analysisQuery.data) return <Card><CardContent className="py-10 text-center text-sm text-red-700">{texts.error}</CardContent></Card>;

  const analysis = analysisQuery.data;
  const results = resultsQuery.data || [];
  const validResults = results.filter((result) => {
    const answered = result.correctAnswers + result.wrongAnswers;
    return result.questionCount === 100 ? answered >= 50 : result.questionCount === 50 ? answered >= 40 : false;
  });
  const averageScore = validResults.length ? validResults.reduce((total, result) => total + result.score, 0) / validResults.length : 0;
  const bestScore = validResults.length ? Math.max(...validResults.map((result) => result.score)) : 0;
  const passedCount = validResults.filter((result) => result.score >= 50).length;
  const recurringRate = analysis.totalQuestions ? ((analysis.repeatedAppearances / analysis.totalQuestions) * 100).toFixed(1) : '0.0';
  const priorityData = analysis.chapterPriorities.map((chapter) => ({
    ...chapter,
    name: `${chapter.code} · ${language === 'pt' ? chapter.titlePt : chapter.titleEs}`,
    shortName: chapter.code,
    fill: chapter.action === 'intensive' ? '#dc2626' : chapter.action === 'reinforce' ? '#f59e0b' : '#2563eb',
  }));
  const actionText = (action: string) => action === 'intensive'
    ? { title: texts.intensive, description: texts.intensiveDescription, color: 'border-red-200 bg-red-50 text-red-900' }
    : action === 'reinforce'
      ? { title: texts.reinforce, description: texts.reinforceDescription, color: 'border-amber-200 bg-amber-50 text-amber-950' }
      : { title: texts.maintain, description: texts.maintainDescription, color: 'border-blue-200 bg-blue-50 text-blue-950' };
  const recurrenceData = analysis.recurrenceByExam.map((exam) => ({ ...exam, label: exam.date.slice(0, 5), rate: Number.parseFloat(exam.percentage) }));
  const peakRecurrence = recurrenceData.reduce((peak, exam) => exam.rate > peak.rate ? exam : peak, recurrenceData[0] ?? { date: '—', rate: 0 });
  const selectedPriorityIndex = Math.min(priorityIndex, Math.max(0, priorityData.length - 1));
  const selectedPriority = priorityData[selectedPriorityIndex];

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50"><CardContent className="py-5"><h2 className="text-lg font-bold text-slate-900">{texts.title}</h2><p className="mt-1 text-sm text-slate-700">{texts.subtitle}</p></CardContent></Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { value: analysis.totalExams, label: texts.exams, color: 'text-violet-700' },
          { value: analysis.totalQuestions, label: texts.questions, color: 'text-blue-700' },
          { value: analysis.uniqueQuestions, label: texts.unique, color: 'text-pink-700' },
          { value: analysis.repeatedGroups, label: texts.repeated, color: 'text-amber-700' },
        ].map((stat) => <Card key={stat.label}><CardContent className="p-4"><div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div><div className="mt-1 text-xs text-slate-600">{stat.label}</div></CardContent></Card>)}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardHeader className="pb-3"><CardTitle>{texts.simulatorSummary}</CardTitle></CardHeader>
        <CardContent>
          {resultsQuery.isLoading ? <div className="flex items-center gap-2 text-sm text-slate-600"><Spinner />{texts.simulatorLoading}</div> : results.length === 0 ? <p className="text-sm text-slate-600">{texts.simulatorNone}</p> : <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg bg-white p-3"><div className="text-2xl font-bold text-emerald-700">{validResults.length}</div><div className="text-xs text-slate-600">{texts.simulatorAttempts}</div><div className="text-[11px] text-slate-500">{results.length} {texts.simulatorTotal}</div></div>
              <div className="rounded-lg bg-white p-3"><div className="text-2xl font-bold text-blue-700">{averageScore.toFixed(1)}%</div><div className="text-xs text-slate-600">{texts.simulatorAverage}</div></div>
              <div className="rounded-lg bg-white p-3"><div className="text-2xl font-bold text-violet-700">{bestScore}%</div><div className="text-xs text-slate-600">{texts.simulatorBest}</div></div>
              <div className="rounded-lg bg-white p-3"><div className="text-2xl font-bold text-amber-700">{passedCount}</div><div className="text-xs text-slate-600">{texts.simulatorPassed}</div></div>
            </div>
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">{texts.simulatorRecent}</h3>
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{texts.simulatorCutoff}</p>
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {results.map((result) => {
                const label = result.mode === 'official' ? `${texts.simulatorOfficial} ${result.model}` : result.mode === 'chapter' ? `${texts.simulatorChapter} ${result.chapterId || ''}` : `${texts.simulatorModel} ${result.model}`;
                const answered = result.correctAnswers + result.wrongAnswers;
                const valid = result.questionCount === 100 ? answered >= 50 : result.questionCount === 50 ? answered >= 40 : false;
                return <div key={result.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm"><span className="font-medium text-slate-800">{label}</span><span className="text-slate-600">{result.correctAnswers}/{result.questionCount} {texts.simulatorQuestions} · <strong>{result.score}%</strong> {texts.simulatorScore}{!valid && <span className="ml-2 text-xs text-amber-700">· {texts.simulatorIncomplete}</span>}</span></div>;
              })}
              </div>
            </div>
          </>}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{texts.priority}</CardTitle><p className="text-sm text-slate-600">{texts.priorityDescription}</p></CardHeader>
          <CardContent className="h-[340px] px-2 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ top: 6, right: 22, left: 6, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="shortName" width={42} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(_label, payload) => payload[0]?.payload.name} />
                <Bar dataKey="priorityScore" name={texts.score} radius={[0, 5, 5, 0]}>{priorityData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{texts.recurrence}</CardTitle><p className="text-sm text-slate-600">{texts.recurrenceDescription}</p></CardHeader>
          <CardContent className="h-[340px] px-2 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recurrenceData} margin={{ top: 10, right: 20, left: -16, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={3} tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} unit="%" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(_label, payload) => payload[0]?.payload.date} />
                <Line type="monotone" dataKey="rate" name={texts.recurrenceRate} unit="%" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-3 text-center text-sm text-slate-600">{texts.recurrenceSummary}: <strong>{peakRecurrence.date}</strong> · <strong>{peakRecurrence.rate.toFixed(1)}%</strong></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{texts.answers}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[240px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analysis.answerDistribution} dataKey="count" nameKey="answer" innerRadius="54%" outerRadius="82%" paddingAngle={3}>{analysis.answerDistribution.map((item) => <Cell key={item.answer} fill={ANSWER_COLORS[item.answer]} />)}</Pie><Tooltip formatter={(value, _name, context) => [`${value} (${context.payload.percentage})`, texts.questions]} /></PieChart></ResponsiveContainer></div>
            <div className="mt-1 grid grid-cols-4 gap-2 text-center text-xs font-semibold">{analysis.answerDistribution.map((item) => <span key={item.answer} style={{ color: ANSWER_COLORS[item.answer] }}>{item.answer}: {item.percentage}</span>)}</div>
            <p className="mt-4 text-center text-sm text-slate-600">{texts.answerAnalysis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{texts.studyPlan}</CardTitle><p className="text-sm text-slate-600">{texts.studyPlanDescription}</p></CardHeader>
          <CardContent className="pt-2">
            {selectedPriority && (() => {
              const action = actionText(selectedPriority.action);
              const goToPrevious = () => setPriorityIndex((current) => (current - 1 + priorityData.length) % priorityData.length);
              const goToNext = () => setPriorityIndex((current) => (current + 1) % priorityData.length);
              return <div className={`rounded-xl border p-4 ${action.color}`}>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={goToPrevious} aria-label={texts.previousPriority} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xl font-bold text-slate-700 transition-colors hover:bg-slate-100">←</button>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{texts.studyStep} {selectedPriorityIndex + 1} {texts.position} {priorityData.length}</p>
                    <p className="mt-1 text-base font-bold text-slate-950 sm:text-lg">{selectedPriority.name}</p>
                    <p className="mt-1 text-sm font-semibold">{action.title} · {texts.score} {selectedPriority.priorityScore}/100</p>
                  </div>
                  <button type="button" onClick={goToNext} aria-label={texts.nextPriority} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-xl font-bold text-slate-700 transition-colors hover:bg-slate-100">→</button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white/70 p-3 text-xs sm:grid-cols-4"><span><strong>{texts.volume}:</strong> {selectedPriority.count} {texts.questionsShort} · {selectedPriority.percentage}</span><span><strong>{texts.recurring}:</strong> {selectedPriority.recurringCount} ({selectedPriority.recurrenceRate})</span><span><strong>{texts.coverage}:</strong> {selectedPriority.examCoverage}/34</span><span><strong>{texts.recent}:</strong> {selectedPriority.recentCoverage}/8</span></div>
                <p className="mt-3 text-center text-sm leading-5">{action.description}</p>
                <div className="mt-4 flex justify-center gap-1.5" aria-label={`${texts.studyPlan}: ${selectedPriorityIndex + 1} ${texts.position} ${priorityData.length}`}>{priorityData.map((chapter, index) => <button key={chapter.id} type="button" onClick={() => setPriorityIndex(index)} aria-label={`${texts.studyStep} ${index + 1}: ${chapter.name}`} className={`h-2.5 rounded-full transition-all ${index === selectedPriorityIndex ? 'w-6 bg-slate-900' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`} />)}</div>
              </div>;
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

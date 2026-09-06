import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateStrategySummary, STRATEGY_TOTAL_QUESTIONS } from '@/lib/strategyScore';

interface StrategyTabProps {
  language: 'pt' | 'es';
}

export default function StrategyTab({ language }: StrategyTabProps) {
  const [correctInput, setCorrectInput] = useState(60);
  const [wrongInput, setWrongInput] = useState(0);
  const summary = calculateStrategySummary(correctInput, wrongInput);

  const t = {
    pt: {
      title: 'Estratégia de Estudo',
      certainty: 'Certeza',
      certainty_desc: 'Comece pelas questões que você domina. Cada acerto soma 1 ponto e cria uma base segura para a aprovação.',
      doubt: 'Dúvida',
      doubt_desc: 'Arrisque somente quando conseguir eliminar alternativas. Lembre-se: cada erro desconta 0,5 ponto.',
      simulator: 'Simulador de Pontuação',
      correctLabel: 'Questões certas / com certeza',
      wrongLabel: 'Questões erradas',
      skippedLabel: 'Questões puladas',
      skippedHint: 'Calculadas automaticamente com o restante da prova.',
      distribution: 'Distribuição das 100 questões',
      distributionHint: 'A barra se ajusta automaticamente conforme você informa acertos e erros.',
      correct: 'Certas',
      wrong: 'Erradas',
      skipped: 'Puladas',
      answered: 'Respondidas',
      score: 'Pontuação',
      status: 'Status',
      passed: 'Aprovado',
      failed: 'Reprovado',
      tips: 'Dicas Importantes',
      tip1_title: 'Leia com Atenção',
      tip1_desc: 'Muitas questões têm pegadinhas. Leia duas vezes antes de responder.',
      tip2_title: 'Elimine Alternativas',
      tip2_desc: 'Sempre comece eliminando as alternativas claramente erradas.',
      tip3_title: 'Gerencie o Tempo',
      tip3_desc: 'Você tem 2 horas. Dedique 1h30 às questões e 30 min para revisar.',
    },
    es: {
      title: 'Estrategia de Estudio',
      certainty: 'Certeza',
      certainty_desc: 'Empieza por las preguntas que dominas. Cada acierto suma 1 punto y crea una base segura para aprobar.',
      doubt: 'Duda',
      doubt_desc: 'Arriesga solo cuando puedas eliminar alternativas. Recuerda: cada error descuenta 0,5 punto.',
      simulator: 'Simulador de Puntuación',
      correctLabel: 'Preguntas correctas / con certeza',
      wrongLabel: 'Preguntas incorrectas',
      skippedLabel: 'Preguntas omitidas',
      skippedHint: 'Se calculan automáticamente con las preguntas restantes.',
      distribution: 'Distribución de las 100 preguntas',
      distributionHint: 'La barra se ajusta automáticamente según los aciertos y errores indicados.',
      correct: 'Correctas',
      wrong: 'Incorrectas',
      skipped: 'Omitidas',
      answered: 'Respondidas',
      score: 'Puntuación',
      status: 'Estado',
      passed: 'Aprobado',
      failed: 'Reprobado',
      tips: 'Consejos Importantes',
      tip1_title: 'Lee con Atención',
      tip1_desc: 'Muchas preguntas tienen trampas. Lee dos veces antes de responder.',
      tip2_title: 'Elimina Alternativas',
      tip2_desc: 'Empieza siempre eliminando las alternativas claramente incorrectas.',
      tip3_title: 'Gestiona el Tiempo',
      tip3_desc: 'Tienes 2 horas. Dedica 1h30 a las preguntas y 30 min para revisar.',
    },
  };

  const texts = t[language];
  const isPassed = summary.score >= 50;

  const handleCorrectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextCorrect = Number(event.target.value) || 0;
    const nextSummary = calculateStrategySummary(nextCorrect, wrongInput);
    setCorrectInput(nextSummary.correct);
    setWrongInput(nextSummary.wrong);
  };

  const handleWrongChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextWrong = Number(event.target.value) || 0;
    const nextSummary = calculateStrategySummary(correctInput, nextWrong);
    setCorrectInput(nextSummary.correct);
    setWrongInput(nextSummary.wrong);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader><CardTitle className="text-blue-700">{texts.certainty}</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-700">{texts.certainty_desc}</p></CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="text-amber-700">{texts.doubt}</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-700">{texts.doubt_desc}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{texts.simulator}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="correct-answers">{texts.correctLabel}</Label>
              <Input id="correct-answers" type="number" min="0" max={STRATEGY_TOTAL_QUESTIONS - summary.wrong} value={summary.correct} onChange={handleCorrectChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wrong-answers">{texts.wrongLabel}</Label>
              <Input id="wrong-answers" type="number" min="0" max={STRATEGY_TOTAL_QUESTIONS - summary.correct} value={summary.wrong} onChange={handleWrongChange} />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-medium text-slate-700">{texts.skippedLabel}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{summary.skipped}</div>
              <p className="mt-1 text-xs text-slate-500">{texts.skippedHint}</p>
            </div>
          </div>

          <section aria-label={texts.distribution} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{texts.distribution}</h3>
                <p className="text-sm text-slate-600">{texts.distributionHint}</p>
              </div>
              <span className="text-sm font-medium text-slate-700">{texts.answered}: {summary.answered}/{STRATEGY_TOTAL_QUESTIONS}</span>
            </div>
            <div className="flex h-6 w-full overflow-hidden rounded-full bg-slate-100" aria-label={`${texts.correct}: ${summary.correct}; ${texts.wrong}: ${summary.wrong}; ${texts.skipped}: ${summary.skipped}`}>
              {summary.correct > 0 && <div className="bg-emerald-500 transition-[width] duration-300" style={{ width: `${summary.correct}%` }} title={`${texts.correct}: ${summary.correct}`} />}
              {summary.wrong > 0 && <div className="bg-rose-500 transition-[width] duration-300" style={{ width: `${summary.wrong}%` }} title={`${texts.wrong}: ${summary.wrong}`} />}
              {summary.skipped > 0 && <div className="bg-slate-300 transition-[width] duration-300" style={{ width: `${summary.skipped}%` }} title={`${texts.skipped}: ${summary.skipped}`} />}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{texts.correct}: <strong>{summary.correct}</strong></div>
              <div className="flex items-center gap-2 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />{texts.wrong}: <strong>{summary.wrong}</strong></div>
              <div className="flex items-center gap-2 text-slate-700"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />{texts.skipped}: <strong>{summary.skipped}</strong></div>
            </div>
          </section>

          <div className={`rounded-lg border-2 p-6 text-center ${isPassed ? 'border-emerald-500 bg-emerald-100' : 'border-rose-500 bg-rose-100'}`}>
            <div className={`mb-2 text-4xl font-bold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>{summary.score.toFixed(1)}</div>
            <div className="text-sm font-semibold">{texts.score}: {summary.score.toFixed(1)} | {texts.status}: {isPassed ? texts.passed : texts.failed}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{texts.tips}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><h4 className="mb-2 font-semibold text-slate-900">{texts.tip1_title}</h4><p className="text-sm text-slate-700">{texts.tip1_desc}</p></div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><h4 className="mb-2 font-semibold text-slate-900">{texts.tip2_title}</h4><p className="text-sm text-slate-700">{texts.tip2_desc}</p></div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><h4 className="mb-2 font-semibold text-slate-900">{texts.tip3_title}</h4><p className="text-sm text-slate-700">{texts.tip3_desc}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

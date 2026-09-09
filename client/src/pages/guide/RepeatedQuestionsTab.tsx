import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';

interface RepeatedQuestionsTabProps {
  language: 'pt' | 'es';
}

export default function RepeatedQuestionsTab({ language }: RepeatedQuestionsTabProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const questionsQuery = trpc.guide.getRepeatedQuestions.useQuery();

  const t = {
    pt: {
      desc: 'Análise atualizada das 34 provas oficiais. Os grupos estão ordenados pela frequência de reaparição; estudar os mais recorrentes é prioridade.',
      answer: 'Resposta', exams: 'Provas', appearances: 'em 34 provas', loading: 'Carregando...',
    },
    es: {
      desc: 'Análisis actualizado de los 34 exámenes oficiales. Los grupos están ordenados por la frecuencia de reaparición; estudiar los más recurrentes es prioritario.',
      answer: 'Respuesta', exams: 'Exámenes', appearances: 'en 34 exámenes', loading: 'Cargando...',
    },
  };
  const texts = t[language];

  if (questionsQuery.isLoading) return <Card><CardContent className="flex items-center justify-center py-8"><Spinner /><span className="ml-2">{texts.loading}</span></CardContent></Card>;
  const questions = questionsQuery.data || [];

  return <div className="space-y-4">
    <Card className="border-blue-200 bg-blue-50"><CardContent className="pt-6"><p className="text-sm text-slate-700">{texts.desc}</p></CardContent></Card>
    <div className="space-y-3">
      {questions.map((q, idx) => {
        const examDates = q.exams ? JSON.parse(q.exams) as string[] : [];
        const expanded = expandedId === idx;
        return <Card key={idx} className="transition-shadow hover:shadow-md">
          <CardContent className="pt-6">
            <button type="button" className="w-full text-left" onClick={() => setExpandedId(expanded ? null : idx)} aria-expanded={expanded}>
              <div className="flex items-start gap-4"><Badge className="shrink-0 bg-amber-100 text-amber-800">{q.percentage}</Badge><p className="flex-1 font-semibold text-slate-900">{q.question}</p></div>
            </button>
            {expanded && <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <div className="space-y-2"><p className="text-sm font-semibold text-slate-700">Opções:</p>{([q.optionA, q.optionB, q.optionC, q.optionD] as const).map((opt, i) => <div key={i} className="pl-4 text-sm text-slate-600"><span className="font-semibold text-slate-800">{['A', 'B', 'C', 'D'][i]})</span> {opt}</div>)}</div>
              <div className="rounded border border-green-200 bg-green-50 p-3"><p className="text-sm font-semibold text-green-800">{texts.answer}:</p><p className="mt-1 text-sm text-green-700">{q.correctAnswer}</p></div>
              {q.exams && <div className="text-xs text-slate-600"><span className="font-semibold">{texts.exams}: {examDates.length} {texts.appearances}</span><div className="mt-1 flex flex-wrap gap-1">{examDates.map((exam: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{exam}</Badge>)}</div></div>}
            </div>}
          </CardContent>
        </Card>;
      })}
    </div>
  </div>;
}

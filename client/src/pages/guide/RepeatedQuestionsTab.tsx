import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      title: 'Questões Repetidas',
      desc: 'Análise atualizada das 34 provas oficiais. Os grupos estão ordenados pela frequência de reaparição; estudar os mais recorrentes é prioridade.',
      answer: 'Resposta',
      exams: 'Provas',
      appearances: 'em 34 provas',
      loading: 'Carregando...',
    },
    es: {
      title: 'Preguntas Repetidas',
      desc: 'Análisis actualizado de los 34 exámenes oficiales. Los grupos están ordenados por frecuencia de reaparición; estudiar los más recurrentes es prioritario.',
      answer: 'Respuesta',
      exams: 'Exámenes',
      appearances: 'en 34 exámenes',
      loading: 'Cargando...',
    },
  };

  const texts = t[language];

  if (questionsQuery.isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Spinner />
          <span className="ml-2">{texts.loading}</span>
        </CardContent>
      </Card>
    );
  }

  const questions = questionsQuery.data || [];

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-700">{texts.desc}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const examDates = q.exams ? JSON.parse(q.exams) as string[] : [];
          return (
          <Card
            key={idx}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setExpandedId(expandedId === idx ? null : idx)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Badge className="bg-amber-100 text-amber-800 flex-shrink-0">
                  {q.percentage}
                </Badge>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{q.question}</p>
                </div>
              </div>

              {expandedId === idx && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Opções:</p>
                    <div className="space-y-1">
                      {([q.optionA, q.optionB, q.optionC, q.optionD] as const).map((opt, i) => (
                        <div key={i} className="text-sm text-slate-600 pl-4">
                          <span className="font-semibold text-slate-800">{['A', 'B', 'C', 'D'][i]})</span> {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-sm font-semibold text-green-800">
                      ✅ {texts.answer}:
                    </p>
                    <p className="text-sm text-green-700 mt-1">{q.correctAnswer}</p>
                  </div>

                  {q.exams && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">{texts.exams}: {examDates.length} {texts.appearances}</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {examDates.map((exam: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {exam}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}

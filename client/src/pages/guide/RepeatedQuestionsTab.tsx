import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';

interface RepeatedQuestionsTabProps {
  language: 'pt' | 'es';
}

type Answer = 'A' | 'B' | 'C' | 'D';

export default function RepeatedQuestionsTab({ language }: RepeatedQuestionsTabProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, Answer>>({});
  const questionsQuery = trpc.guide.getRepeatedQuestions.useQuery();

  const t = {
    pt: {
      title: 'Pesquisar questões',
      placeholder: 'Digite palavras da pergunta para localizar uma questão...',
      searchHint: 'A busca procura no enunciado e nas alternativas. A resposta é apenas para aprendizagem e não altera estatísticas ou provas.',
      noResults: 'Nenhuma questão encontrada com essas palavras.',
      choose: 'Escolha uma opção para conferir',
      correct: 'Resposta correta.',
      incorrect: 'Resposta incorreta.',
      answer: 'Resposta correta',
      exams: 'Provas',
      appearances: 'em 34 provas',
      loading: 'Carregando...',
      clear: 'Limpar busca',
    },
    es: {
      title: 'Buscar preguntas',
      placeholder: 'Escribe palabras de la pregunta para localizarla...',
      searchHint: 'La búsqueda revisa el enunciado y las opciones. La respuesta es solo para aprendizaje y no cambia estadísticas ni exámenes.',
      noResults: 'No se encontró ninguna pregunta con esas palabras.',
      choose: 'Elige una opción para comprobar',
      correct: 'Respuesta correcta.',
      incorrect: 'Respuesta incorrecta.',
      answer: 'Respuesta correcta',
      exams: 'Exámenes',
      appearances: 'en 34 exámenes',
      loading: 'Cargando...',
      clear: 'Limpiar búsqueda',
    },
  };

  const texts = t[language];
  const questions = questionsQuery.data || [];
  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return questions;
    return questions.filter((question) => [
      question.question,
      question.optionA,
      question.optionB,
      question.optionC,
      question.optionD,
    ].some((value) => String(value || '').toLocaleLowerCase().includes(normalizedSearch)));
  }, [questions, search]);

  if (questionsQuery.isLoading) {
    return <Card><CardContent className="flex items-center justify-center py-8"><Spinner /><span className="ml-2">{texts.loading}</span></CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="space-y-3 pt-6">
          <p className="text-sm font-semibold text-slate-900">{texts.title}</p>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={texts.placeholder} aria-label={texts.placeholder} />
          <p className="text-xs leading-5 text-slate-600">{texts.searchHint}</p>
          {search && <Button type="button" variant="outline" size="sm" onClick={() => setSearch('')}>{texts.clear}</Button>}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-700">{language === 'pt'
            ? 'Questões repetidas das 34 provas oficiais. Os grupos estão ordenados pela frequência de reaparição.'
            : 'Preguntas repetidas de los 34 exámenes oficiales. Los grupos están ordenados por frecuencia de reaparición.'}</p>
        </CardContent>
      </Card>

      {filteredQuestions.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-slate-600">{texts.noResults}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question, idx) => {
            const answer = selectedAnswers[idx];
            const examDates = question.exams ? JSON.parse(question.exams) as string[] : [];
            const options: Array<[Answer, string]> = [
              ['A', String(question.optionA || '')],
              ['B', String(question.optionB || '')],
              ['C', String(question.optionC || '')],
              ['D', String(question.optionD || '')],
            ];
            const isCorrect = answer === question.correctAnswer;
            const isExpanded = expandedId === idx;
            return (
              <Card key={idx} className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <button type="button" className="w-full text-left" onClick={() => setExpandedId(isExpanded ? null : idx)} aria-expanded={isExpanded}>
                    <div className="flex items-start gap-4">
                      <Badge className="flex-shrink-0 bg-amber-100 text-amber-800">{question.percentage}</Badge>
                      <p className="flex-1 font-semibold text-slate-900">{question.question}</p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                      <p className="text-sm font-semibold text-slate-700">{texts.choose}</p>
                      <div className="space-y-2">
                        {options.map(([option, text]) => {
                          const optionCorrect = option === question.correctAnswer;
                          const optionSelected = answer === option;
                          const optionClass = answer
                            ? optionCorrect ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : optionSelected ? 'border-rose-600 bg-rose-50 text-rose-950' : 'border-slate-200 opacity-75'
                            : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50';
                          return <button type="button" key={option} disabled={Boolean(answer)} onClick={() => setSelectedAnswers((current) => ({ ...current, [idx]: option }))} className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all disabled:cursor-default ${optionClass}`}><span className="font-bold">{option})</span> {text}</button>;
                        })}
                      </div>
                      {answer && <div className={`rounded-lg border p-3 text-sm ${isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}><strong>{isCorrect ? texts.correct : `${texts.incorrect} ${texts.answer}: ${question.correctAnswer}.`}</strong></div>}
                      {examDates.length > 0 && <div className="text-xs text-slate-600"><span className="font-semibold">{texts.exams}: {examDates.length} {texts.appearances}</span><div className="mt-1 flex flex-wrap gap-1">{examDates.map((exam, examIndex) => <Badge key={examIndex} variant="outline" className="text-xs">{exam}</Badge>)}</div></div>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

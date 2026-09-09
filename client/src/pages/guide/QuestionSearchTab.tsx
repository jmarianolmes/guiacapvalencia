import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';

type Language = 'pt' | 'es';
type Answer = 'A' | 'B' | 'C' | 'D';

interface QuestionSearchTabProps {
  language: Language;
}

export default function QuestionSearchTab({ language }: QuestionSearchTabProps) {
  const [term, setTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const searchQuery = trpc.guide.searchQuestions.useQuery(
    { search: submittedTerm },
    { enabled: submittedTerm.trim().length >= 2, staleTime: 60_000 }
  );

  const texts = language === 'pt' ? {
    title: 'Pesquisa de questões',
    description: 'Pesquise em todas as questões do banco por palavras do enunciado ou das alternativas.',
    placeholder: 'Digite palavras da questão...',
    search: 'Pesquisar',
    minChars: 'Digite pelo menos duas letras para pesquisar.',
    results: 'resultados encontrados',
    noResults: 'Nenhuma questão encontrada com essas palavras.',
    learning: 'Modo aprendizagem',
    choose: 'Escolha uma alternativa para conferir',
    correct: 'Você acertou.',
    incorrect: 'Você errou.',
    answer: 'Resposta correta',
    official: 'Oficial',
    nonOfficial: 'Não oficial',
    clear: 'Limpar',
  } : {
    title: 'Búsqueda de preguntas',
    description: 'Busca en todas las preguntas de la base por palabras del enunciado o de las opciones.',
    placeholder: 'Escribe palabras de la pregunta...',
    search: 'Buscar',
    minChars: 'Escribe al menos dos letras para buscar.',
    results: 'resultados encontrados',
    noResults: 'No se encontró ninguna pregunta con esas palabras.',
    learning: 'Modo aprendizaje',
    choose: 'Elige una opción para comprobar',
    correct: 'Respuesta correcta.',
    incorrect: 'Respuesta incorrecta.',
    answer: 'Respuesta correcta',
    official: 'Oficial',
    nonOfficial: 'No oficial',
    clear: 'Limpiar',
  };

  useEffect(() => {
    setOpenId(null);
    setAnswers({});
  }, [submittedTerm]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextTerm = term.trim();
    if (nextTerm.length >= 2) setSubmittedTerm(nextTerm);
  };

  const questions = searchQuery.data || [];

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="space-y-3 pt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{texts.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{texts.description}</p>
          </div>
          <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row">
            <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder={texts.placeholder} aria-label={texts.placeholder} />
            <Button type="submit" className="sm:shrink-0">{texts.search}</Button>
            {term && <Button type="button" variant="outline" onClick={() => { setTerm(''); setSubmittedTerm(''); }}>{texts.clear}</Button>}
          </form>
          {term.trim().length === 1 && <p className="text-xs text-slate-600">{texts.minChars}</p>}
        </CardContent>
      </Card>

      {searchQuery.isFetching && <Card><CardContent className="flex items-center justify-center py-8"><Spinner /><span className="ml-2">{texts.search}...</span></CardContent></Card>}
      {submittedTerm && !searchQuery.isFetching && !searchQuery.isError && <p className="text-sm text-slate-600">{questions.length} {texts.results}</p>}
      {submittedTerm && !searchQuery.isFetching && !searchQuery.isError && questions.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-slate-600">{texts.noResults}</CardContent></Card>}

      <div className="space-y-3">
        {questions.map((question) => {
          const answer = answers[question.id];
          const isOpen = openId === question.id;
          const options: Array<[Answer, string]> = [['A', question.optionA], ['B', question.optionB], ['C', question.optionC], ['D', question.optionD]];
          const isCorrect = answer === question.correctAnswer;
          return (
            <Card key={question.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-5">
                <button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => setOpenId(isOpen ? null : question.id)} aria-expanded={isOpen}>
                  <Badge variant="outline" className="mt-0.5 shrink-0">{question.internalCode || question.chapterCode || (question.origin === 'official' ? texts.official : texts.nonOfficial)}</Badge>
                  <span className="font-semibold text-slate-900">{question.question}</span>
                </button>
                {isOpen && <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-700">{texts.learning}</p><span className="text-xs text-slate-500">{texts.choose}</span></div>
                  <div className="space-y-2">
                    {options.map(([option, text]) => {
                      const selected = answer === option;
                      const correct = option === question.correctAnswer;
                      const optionClass = answer ? correct ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : selected ? 'border-rose-600 bg-rose-50 text-rose-950' : 'border-slate-200 opacity-70' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50';
                      return <button type="button" key={option} disabled={Boolean(answer)} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))} className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all disabled:cursor-default ${optionClass}`}><strong>{option})</strong> {text}</button>;
                    })}
                  </div>
                  {answer && <div className={`rounded-lg border p-3 text-sm ${isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}><strong>{isCorrect ? texts.correct : `${texts.incorrect} ${texts.answer}: ${question.correctAnswer}.`}</strong></div>}
                </div>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

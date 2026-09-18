import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';

interface SimulatorTabProps {
  language: 'pt' | 'es';
}

const quickGlossary = [
  ['freno de servicio', 'travão de serviço'],
  ['ralentizador', 'retardador / travão auxiliar'],
  ['par motor', 'binário / torque do motor'],
  ['cuentarrevoluciones', 'conta-rotações'],
  ['caja de cambios', 'caixa de velocidades'],
  ['estiba', 'estiva / acondicionamento da carga'],
  ['tacógrafo', 'tacógrafo'],
  ['descanso', 'período de descanso'],
  ['adelantamiento', 'ultrapassagem'],
  ['avería', 'avaria'],
  ['calzada', 'faixa de rodagem / pista'],
  ['firme deslizante', 'pavimento escorregadio'],
] as const;

type SimulatorProgress = {
  mode: 'statistical' | 'official' | 'chapter';
  model?: string;
  date?: string;
  chapterId?: string;
  attemptNumber?: number;
  studyMode: 'exam' | 'learning';
  currentQuestion: number;
  answers: Record<number, string>;
  timeLeft: number;
  savedAt: number;
};

const PROGRESS_STORAGE_KEY = 'cap-simulator-progress-v1';

function progressKey(progress: Pick<SimulatorProgress, 'mode' | 'model' | 'date' | 'chapterId' | 'attemptNumber'>) {
  if (progress.mode === 'chapter') return `chapter:${progress.chapterId}:${progress.attemptNumber || 1}`;
  if (progress.mode === 'official') return `official:${progress.date || progress.model || ''}`;
  return `statistical:${progress.model || ''}`;
}

function readAllProgress(): Record<string, SimulatorProgress> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}') as Record<string, SimulatorProgress>;
  } catch {
    return {};
  }
}

function readProgress(key: string) {
  return readAllProgress()[key];
}

function writeProgress(key: string, progress: SimulatorProgress) {
  if (typeof window === 'undefined') return;
  const all = readAllProgress();
  all[key] = progress;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('cap-simulator-progress-changed'));
}

function removeProgress(key: string) {
  if (typeof window === 'undefined') return;
  const all = readAllProgress();
  delete all[key];
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('cap-simulator-progress-changed'));
}

export default function SimulatorTab({ language }: SimulatorTabProps) {
  const [simulatorMode, setSimulatorMode] = useState<'statistical' | 'byDate' | 'byChapter'>('byDate');
  const [studyMode, setStudyMode] = useState<'exam' | 'learning'>('learning');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [chapterToStart, setChapterToStart] = useState<string | null>(null);
  const [chapterAttempt, setChapterAttempt] = useState(1);
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [officialDialogOpen, setOfficialDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [reportedQuestionIds, setReportedQuestionIds] = useState<Set<number>>(new Set());
  const [progressVersion, setProgressVersion] = useState(0);
  const simulatorSessionRef = useRef<HTMLDivElement>(null);

  const isSimulatorSessionActive = Boolean(selectedModel || selectedDate || selectedChapter);

  useEffect(() => {
    document.body.classList.toggle('simulator-session-active', isSimulatorSessionActive);
    document.documentElement.classList.toggle('simulator-session-active', isSimulatorSessionActive);

    if (isSimulatorSessionActive) {
      requestAnimationFrame(() => {
        simulatorSessionRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      });
    }

    return () => {
      document.body.classList.remove('simulator-session-active');
      document.documentElement.classList.remove('simulator-session-active');
    };
  }, [isSimulatorSessionActive]);

  const modelQueryInput = useMemo(() => ({ model: selectedModel || '' }), [selectedModel]);
  const chapterQueryInput = useMemo(() => ({ chapterId: selectedChapter || '', attemptNumber: chapterAttempt }), [selectedChapter, chapterAttempt]);
  const modelsQuery = trpc.guide.getSimulatorModels.useQuery(undefined, {
    enabled: simulatorMode === 'statistical',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const officialExamDatesQuery = trpc.guide.getOfficialExamDates.useQuery(undefined, {
    enabled: simulatorMode === 'byDate',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const questionsQuery = trpc.guide.getSimulatorQuestions.useQuery(
    modelQueryInput,
    { enabled: !!selectedModel && !selectedChapter, staleTime: 5 * 60 * 1000, retry: 1 }
  );
  const chaptersQuery = trpc.guide.getSimulatorChapters.useQuery(undefined, {
    enabled: simulatorMode === 'byChapter',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const chapterQuestionsQuery = trpc.guide.getSimulatorQuestionsByChapter.useQuery(
    chapterQueryInput,
    { enabled: !!selectedChapter, staleTime: 5 * 60 * 1000, retry: 1 }
  );
  const saveResultMutation = trpc.guide.saveSimulatorResult.useMutation();
  const reportQuestionMutation = trpc.guide.reportQuestionForReview.useMutation();
  const cancelQuestionReviewMutation = trpc.guide.cancelQuestionReview.useMutation();
  const simulatorUtils = trpc.useUtils();
  const historyQuery = trpc.guide.getUserResults.useQuery(undefined, { staleTime: 60 * 1000, retry: 1 });
  const activeQuestionsQuery = selectedChapter ? chapterQuestionsQuery : questionsQuery;
  const chapterAttemptData = chapterQuestionsQuery.data;
  const questions = selectedChapter ? (chapterAttemptData?.questions || []) : (questionsQuery.data || []);
  const mobileNavigationStart = Math.min(
    Math.max(currentQuestion - 4, 0),
    Math.max(questions.length - 10, 0),
  );
  const mobileNavigationQuestions = questions.slice(mobileNavigationStart, mobileNavigationStart + 10);
  const mobileTouchStart = useRef<number | null>(null);

  type SimulatorStatus = 'passed' | 'failed' | null;
  const getSimulatorStatus = (matches: (result: NonNullable<typeof historyQuery.data>[number]) => boolean): SimulatorStatus => {
    const result = (historyQuery.data || []).find(matches);
    if (!result) return null;
    return result.score >= 50 ? 'passed' : 'failed';
  };
  const statusClass = (status: SimulatorStatus) => status === 'passed'
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
    : status === 'failed'
      ? 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
      : '';
  const getProgress = (key: string) => {
    void progressVersion;
    return readProgress(key);
  };
  const restoreProgress = (progress: SimulatorProgress) => {
    setStudyMode(progress.studyMode);
    setCurrentQuestion(progress.currentQuestion);
    setAnswers(progress.answers);
    setShowResults(false);
    setTimeLeft(progress.timeLeft);
  };
  const beginProgress = (progress: Pick<SimulatorProgress, 'mode' | 'model' | 'date' | 'chapterId' | 'attemptNumber'>, start: () => void) => {
    const saved = getProgress(progressKey(progress));
    start();
    if (saved) restoreProgress(saved);
  };
  const startChapter = (chapterId: string, attempt: number) => {
    const saved = readProgress(progressKey({ mode: 'chapter', chapterId, attemptNumber: attempt }));
    setSelectedChapter(chapterId);
    setSelectedModel(null);
    setSelectedDate(null);
    setChapterAttempt(attempt);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(7200);
    setChapterDialogOpen(false);
    if (saved) restoreProgress(saved);
  };

  const startOfficialExam = (date: string) => {
    const saved = readProgress(progressKey({ mode: 'official', date }));
    setSelectedDate(date);
    setSelectedModel(date);
    setSelectedChapter(null);
    setChapterAttempt(1);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(7200);
    setOfficialDialogOpen(false);
    if (saved) restoreProgress(saved);
  };

  const startStatisticalModel = (model: string) => {
    const saved = readProgress(progressKey({ mode: 'statistical', model }));
    setSelectedModel(model);
    setSelectedDate(null);
    setSelectedChapter(null);
    setChapterAttempt(1);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(7200);
    if (saved) restoreProgress(saved);
  };

  const resumeSavedProgress = (saved: SimulatorProgress) => {
    if (saved.mode === 'chapter' && saved.chapterId) {
      setSelectedChapter(saved.chapterId);
      setSelectedModel(null);
      setSelectedDate(null);
      setChapterAttempt(saved.attemptNumber || 1);
    } else if (saved.mode === 'official' && (saved.date || saved.model)) {
      setSelectedDate(saved.date || saved.model || null);
      setSelectedModel(saved.model || saved.date || null);
      setSelectedChapter(null);
      setChapterAttempt(1);
    } else if (saved.model) {
      setSelectedModel(saved.model);
      setSelectedDate(null);
      setSelectedChapter(null);
      setChapterAttempt(1);
    }
    restoreProgress(saved);
  };

  useEffect(() => {
    if (!questions.length || showResults || (!selectedModel && !selectedChapter)) return;
    const mode = selectedChapter ? 'chapter' : selectedDate ? 'official' : 'statistical';
    const key = progressKey({ mode, model: selectedModel || undefined, date: selectedDate || undefined, chapterId: selectedChapter || undefined, attemptNumber: selectedChapter ? chapterAttempt : undefined });
    writeProgress(key, {
      mode,
      model: selectedModel || undefined,
      date: selectedDate || undefined,
      chapterId: selectedChapter || undefined,
      attemptNumber: selectedChapter ? chapterAttempt : undefined,
      studyMode,
      currentQuestion: Math.min(currentQuestion, questions.length - 1),
      answers,
      timeLeft,
      savedAt: Date.now(),
    });
    setProgressVersion((version) => version + 1);
  }, [answers, chapterAttempt, currentQuestion, questions.length, selectedChapter, selectedDate, selectedModel, showResults, studyMode, timeLeft]);

  const getResultStats = () => {
    const correct = Object.entries(answers).filter(([idx, answer]) => questions[Number(idx)]?.correctAnswer === answer).length;
    const wrong = Object.entries(answers).filter(([idx, answer]) => questions[Number(idx)]?.correctAnswer !== answer).length;
    return { correct, wrong, blank: questions.length - Object.keys(answers).length };
  };

  const finishSimulator = () => {
    const stats = getResultStats();
    const mode = selectedChapter ? 'chapter' : selectedDate ? 'official' : 'statistical';
    const model = selectedChapter || selectedDate || selectedModel || '';
    const wrongQuestions = Object.entries(answers).flatMap(([index, selectedAnswer]) => {
      const question = questions[Number(index)];
      if (!question || question.correctAnswer === selectedAnswer) return [];
      return [{ questionId: question.id, selectedAnswer: selectedAnswer as 'A' | 'B' | 'C' | 'D' }];
    });
    setShowResults(true);
    removeProgress(progressKey({ mode, model: selectedModel || undefined, date: selectedDate || undefined, chapterId: selectedChapter || undefined, attemptNumber: selectedChapter ? chapterAttempt : undefined }));
    setProgressVersion((version) => version + 1);
    saveResultMutation.mutate({
      model,
      mode,
      chapterId: selectedChapter || undefined,
      attemptNumber: selectedChapter ? chapterAttempt : undefined,
      questionCount: questions.length,
      ...stats,
      studyMode,
      wrongQuestions,
      timeTaken: questions.length === 100 ? Math.max(0, 7200 - timeLeft) : 0,
    }, {
      onSuccess: () => {
        simulatorUtils.guide.getUserResults.invalidate();
        simulatorUtils.guide.getErrorNotebook.invalidate();
      },
    });
  };

  const t = {
    pt: {
      title: 'Simulado CAP',
      selectMode: 'Escolha o Modo de Simulado',
      statistical: '📊 Modo Estatístico',
      statisticalDesc: 'Questões aleatórias para estudar por tópico',
      byDate: '📅 Por Data Oficial',
      byDateDesc: 'Provas reais de acordo com a data',
      byChapter: '📚 Por Capítulo',
      byChapterDesc: 'Pratique por objetivo do CAP Comunes ou Mercancías',
      select_model: 'Selecione um Modelo de Prova',
      original_models: 'Modelos estatísticos originais (A–J)',
      official_practice_models: 'Modelos de prática derivados das provas GVA (S01–S24)',
      select_date: 'Selecione uma data de prova',
      select_chapter: 'Selecione um capítulo para praticar',
      common_chapters: 'CAP Comunes',
      goods_chapters: 'CAP Mercancías',
      available_questions: 'questões disponíveis',
      no_questions: 'Sem questões classificadas neste capítulo ainda',
      chapter_limit: 'Cada prática utiliza até 50 questões do capítulo.',
      chapter_limit_short: 'prática com 50',
      chapter_versions: 'versões sem repetição',
      attempt: 'Versão',
      official_priority: 'Questões oficiais prioritárias',
      official_in_attempt: 'oficiais nesta versão',
      otherChapterAttempt: 'Outro simulado deste capítulo',
      history: 'Histórico de resultados',
      noHistory: 'Ainda não há resultados guardados.',
      glossary: 'Glossário rápido ES → PT',
      glossaryNote: 'Apoio contextual CAP. Para frases completas, use também o tradutor do navegador.',
      chapter: 'Capítulo',
      start: 'Iniciar Simulado',
      examMode: 'Modo exame',
      examModeDesc: 'Sem revelar correções até o resultado final. Conta para seu índice de prontidão.',
      learningMode: 'Modo aprendizagem',
      learningModeDesc: 'Mostra a correção ao responder. Ideal para aprender; não entra no índice de prontidão.',
      selectedStudyMode: 'Método escolhido',
      learning: 'Aprendizagem',
      exam: 'Exame',
      model: 'Modelo',
      date: 'Data',
      officialExams: 'provas',
      question: 'Questão',
      choose_attempt: 'Escolha a prova/versão deste capítulo',
      start_chapter: 'Iniciar esta prova',
      keyboard_hint: 'Computador: teclas A–D respondem · setas navegam',
      of: 'de',
      time: 'Tempo',
      next: 'Próxima',
      previous: 'Anterior',
      finish: 'Finalizar',
      results: 'Resultados',
      correct: 'Acertos',
      wrong: 'Erros',
      blank: 'Em Branco',
      score: 'Pontuação',
      status: 'Status',
      passed: 'Aprovado',
      failed: 'Reprovado',
      loading: 'Carregando...',
      loadError: 'Não foi possível carregar o Simulado. Tente novamente.',
      retry: 'Tentar novamente',
      correctNow: 'Resposta correta.',
      incorrectNow: 'Resposta incorreta.',
      answerKey: 'Gabarito correto:',
      newSimulator: 'Novo Simulado',
      back: 'Voltar',
      exitToSimulatorMenu: 'Voltar ao menu',
      conformity: 'Averiguação de conformidade',
      markedForReview: 'Marcada para revisão administrativa',
      continue: 'Continuar de onde parou',
    },
    es: {
      title: 'Simulacro CAP',
      selectMode: 'Elige el Modo de Simulacro',
      statistical: '📊 Modo Estadístico',
      statisticalDesc: 'Preguntas aleatorias para estudiar por tema',
      byDate: '📅 Por Fecha Oficial',
      byDateDesc: 'Exámenes reales según la fecha',
      byChapter: '📚 Por Capítulo',
      byChapterDesc: 'Practica por objetivo de CAP Comunes o Mercancías',
      select_model: 'Selecciona un Modelo de Examen',
      original_models: 'Modelos estadísticos originales (A–J)',
      official_practice_models: 'Modelos de práctica derivados de los exámenes GVA (S01–S24)',
      select_date: 'Selecciona una fecha de examen',
      select_chapter: 'Selecciona un capítulo para practicar',
      common_chapters: 'CAP Comunes',
      goods_chapters: 'CAP Mercancías',
      available_questions: 'preguntas disponibles',
      no_questions: 'Aún no hay preguntas clasificadas en este capítulo',
      chapter_limit: 'Cada práctica utiliza hasta 50 preguntas del capítulo.',
      chapter_limit_short: 'práctica con 50',
      chapter_versions: 'versiones sin repetición',
      attempt: 'Versión',
      official_priority: 'Preguntas oficiales prioritarias',
      official_in_attempt: 'oficiales en esta versión',
      otherChapterAttempt: 'Otro simulacro de este capítulo',
      history: 'Historial de resultados',
      noHistory: 'Todavía no hay resultados guardados.',
      glossary: 'Glosario rápido ES → PT',
      glossaryNote: 'Apoyo contextual CAP. Para frases completas, utiliza también el traductor del navegador.',
      chapter: 'Capítulo',
      start: 'Iniciar Simulacro',
      examMode: 'Modo examen',
      examModeDesc: 'No muestra correcciones hasta el resultado final. Cuenta para tu índice de preparación.',
      learningMode: 'Modo aprendizaje',
      learningModeDesc: 'Muestra la corrección al responder. Es ideal para aprender; no entra en el índice de preparación.',
      selectedStudyMode: 'Método elegido',
      learning: 'Aprendizaje',
      exam: 'Examen',
      model: 'Modelo',
      date: 'Fecha',
      officialExams: 'exámenes',
      question: 'Pregunta',
      choose_attempt: 'Elige el examen/versión de este capítulo',
      start_chapter: 'Iniciar este examen',
      keyboard_hint: 'Ordenador: teclas A–D responden · flechas navegan',
      of: 'de',
      time: 'Tiempo',
      next: 'Siguiente',
      previous: 'Anterior',
      finish: 'Finalizar',
      results: 'Resultados',
      correct: 'Aciertos',
      wrong: 'Errores',
      blank: 'En Blanco',
      score: 'Puntuación',
      status: 'Estado',
      passed: 'Aprobado',
      failed: 'Reprobado',
      loading: 'Cargando...',
      loadError: 'No se ha podido cargar el simulacro. Inténtalo de nuevo.',
      retry: 'Intentar de nuevo',
      correctNow: 'Respuesta correcta.',
      incorrectNow: 'Respuesta incorrecta.',
      answerKey: 'Respuesta correcta:',
      newSimulator: 'Nuevo Simulacro',
      back: 'Volver',
      exitToSimulatorMenu: 'Voltar al menú',
      conformity: 'Verificación de conformidad',
      markedForReview: 'Marcada para revisión administrativa',
      continue: 'Continuar donde lo dejaste',
    },
  };

  const texts = t[language];
  const resumableProgress = Object.values(readAllProgress())
    .filter((progress) => Object.keys(progress.answers || {}).length > 0)
    .sort((left, right) => right.savedAt - left.savedAt);
  const discardSavedProgress = (saved: SimulatorProgress) => {
    removeProgress(progressKey(saved));
    setProgressVersion((version) => version + 1);
  };
  const hasChapterProgress = (chapterId: string) => {
    void progressVersion;
    return Object.values(readAllProgress()).some((progress) => progress.chapterId === chapterId && Object.keys(progress.answers || {}).length > 0);
  };

  const resetSimulatorState = () => {
    setSelectedModel(null);
    setSelectedDate(null);
    setSelectedChapter(null);
    setChapterToStart(null);
    setChapterAttempt(1);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTimeLeft(7200);
  };

  // Atalhos apenas para desktop; o fluxo e o teclado virtual do celular não mudam.
  useEffect(() => {
    if (!selectedModel && !selectedChapter) return;
    const handleKeyboard = (event: KeyboardEvent) => {
      if (window.matchMedia('(max-width: 767px)').matches) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target?.tagName || '')) return;
      const key = event.key.toUpperCase();
      const current = questions[currentQuestion];
      if (['A', 'B', 'C', 'D'].includes(key) && !showResults && current) {
        if (!(studyMode === 'learning' && answers[currentQuestion])) {
          event.preventDefault();
          setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestion]: key }));
        }
      } else if (event.key === 'ArrowLeft' && currentQuestion > 0) {
        event.preventDefault();
        setCurrentQuestion((index) => index - 1);
      } else if (event.key === 'ArrowRight' && currentQuestion < questions.length - 1) {
        event.preventDefault();
        setCurrentQuestion((index) => index + 1);
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [selectedModel, selectedChapter, showResults, studyMode, answers, currentQuestion, questions]);

  // Timer
  useEffect(() => {
    if ((!selectedModel && !selectedDate && !selectedChapter) || showResults || questions.length !== 100) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedModel, selectedDate, selectedChapter, showResults, questions.length]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tela inicial: Escolher modo
  if (!selectedModel && !selectedDate && !selectedChapter) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{texts.title}</h2>
          <p className="text-slate-600">{texts.selectMode}</p>
        </div>

        <Card className="border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50">
          <CardHeader className="pb-3"><CardTitle className="text-lg">{texts.selectedStudyMode}</CardTitle></CardHeader>
          <CardContent><div className="grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => setStudyMode('exam')} aria-pressed={studyMode === 'exam'} className={`rounded-xl border-2 p-4 text-left transition-all ${studyMode === 'exam' ? 'border-blue-600 bg-white shadow-sm' : 'border-transparent bg-white/60 hover:border-blue-200'}`}><span className="block text-base font-bold text-slate-900">{texts.examMode}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{texts.examModeDesc}</span></button>
            <button type="button" onClick={() => setStudyMode('learning')} aria-pressed={studyMode === 'learning'} className={`rounded-xl border-2 p-4 text-left transition-all ${studyMode === 'learning' ? 'border-emerald-600 bg-white shadow-sm' : 'border-transparent bg-white/60 hover:border-emerald-200'}`}><span className="block text-base font-bold text-slate-900">{texts.learningMode}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{texts.learningModeDesc}</span></button>
          </div></CardContent>
        </Card>

        {resumableProgress.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3"><CardTitle className="text-lg">{language === 'pt' ? 'Simulados em andamento' : 'Simulacros en curso'}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {resumableProgress.map((saved) => {
                const label = saved.mode === 'official' ? `${texts.date} ${saved.date || saved.model}` : saved.mode === 'chapter' ? `${texts.chapter} ${saved.chapterId} · ${texts.attempt} ${saved.attemptNumber || 1}` : `${texts.model} ${saved.model}`;
                return <div key={progressKey(saved)} className="flex items-stretch gap-2"><Button type="button" variant="outline" className="h-auto min-w-0 flex-1 justify-between border-amber-300 bg-white py-3 text-left hover:bg-amber-100" onClick={() => resumeSavedProgress(saved)}><span><span className="block font-semibold">{label}</span><span className="text-xs font-normal text-slate-600">{texts.continue}</span></span><span>→</span></Button><Button type="button" variant="outline" aria-label={language === 'pt' ? 'Excluir progresso' : 'Eliminar progreso'} title={language === 'pt' ? 'Excluir progresso' : 'Eliminar progreso'} className="w-11 border-red-200 bg-red-50 px-0 text-red-700 hover:bg-red-100" onClick={() => discardSavedProgress(saved)}>×</Button></div>;
              })}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Modo Estatístico */}
          <Card 
            className={`cursor-pointer transition-all ${
              simulatorMode === 'statistical' 
                ? 'border-blue-500 border-2 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSimulatorMode('statistical')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="text-xl font-bold mb-2">{texts.statistical}</h3>
                <p className="text-slate-600 text-sm mb-4">{texts.statisticalDesc}</p>
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSimulatorMode('statistical');
                  }}
                >
                  {texts.start}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Modo Por Data */}
          <Card 
            className={`cursor-pointer transition-all ${
              simulatorMode === 'byDate' 
                ? 'border-blue-500 border-2 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSimulatorMode('byDate')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📅</div>
                <h3 className="text-xl font-bold mb-2">{texts.byDate}</h3>
                <p className="text-slate-600 text-sm mb-4">{texts.byDateDesc}</p>
                <Button 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSimulatorMode('byDate');
                  }}
                >
                  {texts.start}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              simulatorMode === 'byChapter'
                ? 'border-blue-500 border-2 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSimulatorMode('byChapter')}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <h3 className="text-xl font-bold mb-2">{texts.byChapter}</h3>
                <p className="text-slate-600 text-sm mb-4">{texts.byChapterDesc}</p>
                <Button className="w-full" onClick={(e) => { e.stopPropagation(); setSimulatorMode('byChapter'); }}>
                  {texts.start}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seleção de Modelo/Data */}
        {simulatorMode === 'statistical' && (
          <Card>
            <CardHeader>
              <CardTitle>{texts.select_model}</CardTitle>
            </CardHeader>
            <CardContent>
              {modelsQuery.isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner />
                </div>
              ) : modelsQuery.isError ? (
                <div className="space-y-3 py-4 text-center text-sm text-red-700">
                  <p>{texts.loadError}</p>
                  <Button variant="outline" onClick={() => modelsQuery.refetch()}>{texts.retry}</Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    { title: texts.original_models, models: (modelsQuery.data || []).filter((model) => !model.startsWith('S')) },
                    { title: texts.official_practice_models, models: (modelsQuery.data || []).filter((model) => model.startsWith('S')) },
                  ].map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 text-sm font-semibold text-slate-700">{group.title}</p>
                      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
                        {group.models.map(model => (
                          <Button
                            key={model}
                            onClick={() => startStatisticalModel(model)}
                            className={`w-full text-sm ${statusClass(getSimulatorStatus((result) => result.mode === 'statistical' && result.model === model))} ${getProgress(progressKey({ mode: 'statistical', model })) ? 'ring-2 ring-red-300 ring-offset-1' : ''}`}
                            variant="outline"
                          >
                            <span>{model}{getProgress(progressKey({ mode: 'statistical', model })) && <span className="ml-1 text-xs">↻</span>}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {simulatorMode === 'byDate' && (
          <Card>
            <CardHeader>
              <CardTitle>{texts.select_date}</CardTitle>
            </CardHeader>
            <CardContent>
              {officialExamDatesQuery.isLoading ? (
                <div className="flex justify-center items-center py-8"><Spinner /></div>
              ) : officialExamDatesQuery.isError ? (
                <div className="space-y-3 py-4 text-center text-sm text-red-700">
                  <p>{texts.loadError}</p>
                  <Button variant="outline" onClick={() => officialExamDatesQuery.refetch()}>{texts.retry}</Button>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full justify-between rounded-xl border-2 px-4 py-4 text-left hover:border-blue-300 hover:bg-blue-50"
                    disabled={(officialExamDatesQuery.data || []).length === 0}
                    onClick={() => setOfficialDialogOpen(true)}
                  >
                    <span>
                      <span className="block font-semibold">{texts.select_date}</span>
                      <span className="mt-1 block text-sm font-normal text-slate-500">{(officialExamDatesQuery.data || []).length} {texts.officialExams}</span>
                    </span>
                    <span className="text-xl text-blue-600">→</span>
                  </Button>
                  <Dialog open={officialDialogOpen} onOpenChange={setOfficialDialogOpen}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{texts.select_date}</DialogTitle>
                        <DialogDescription>{language === 'pt' ? 'Verde: aprovado · vermelho: reprovado · normal: ainda não realizado.' : 'Verde: aprobado · rojo: suspendido · normal: aún no realizado.'}</DialogDescription>
                      </DialogHeader>
                      <div className="grid max-h-[60vh] gap-2 overflow-y-auto pr-1 pt-2 sm:grid-cols-2">
                        {(officialExamDatesQuery.data || []).map((date) => {
                          const status = getSimulatorStatus((result) => result.mode === 'official' && result.model === date);
                          return (
                            <Button
                              key={date}
                              type="button"
                              variant="outline"
                              className={`h-auto justify-between py-3 ${statusClass(status)} ${getProgress(progressKey({ mode: 'official', date })) ? 'ring-2 ring-red-300 ring-offset-1' : ''}`}
                              onClick={() => startOfficialExam(date)}
                            >
                              <span>{date}{getProgress(progressKey({ mode: 'official', date })) && <span className="ml-1 text-xs">↻</span>}</span>
                              <span className="text-xs font-normal">{status === 'passed' ? '✓' : status === 'failed' ? '×' : '·'}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {simulatorMode === 'byChapter' && (
          <Card>
            <CardHeader><CardTitle>{texts.select_chapter}</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{texts.chapter_limit}</p>
              {chaptersQuery.isLoading ? (
                <div className="flex justify-center items-center py-8"><Spinner /></div>
              ) : chaptersQuery.isError ? (
                <div className="space-y-3 py-4 text-center text-sm text-red-700">
                  <p>{texts.loadError}</p>
                  <Button variant="outline" onClick={() => chaptersQuery.refetch()}>{texts.retry}</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {(['common', 'goods'] as const).map((group) => {
                    const chapters = (chaptersQuery.data || []).filter((chapter) => chapter.group === group);
                    if (!chapters.length) return null;
                    return (
                      <div key={group}>
                        <h4 className="mb-3 text-sm font-bold text-slate-700">{group === 'common' ? texts.common_chapters : texts.goods_chapters}</h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {chapters.map((chapter) => (
                            <Button
                              key={chapter.id}
                              variant="outline"
                              className={`h-auto justify-start whitespace-normal px-3 py-3 text-left ${hasChapterProgress(chapter.id) ? 'ring-2 ring-red-300 ring-offset-1' : ''}`}
                              disabled={chapter.count === 0}
                              onClick={() => {
                                setChapterToStart(chapter.id);
                                setChapterAttempt(1);
                                setChapterDialogOpen(true);
                              }}
                            >
                              <span><Badge variant="secondary" className="mr-2">{chapter.code}</Badge>{language === 'pt' ? chapter.titlePt : chapter.titleEs}<span className="mt-1 block text-xs font-normal text-slate-500">{chapter.count > 0 ? `${chapter.count} ${texts.available_questions}${chapter.availableAttempts > 1 ? ` · ${chapter.availableAttempts} ${texts.chapter_versions}` : ''}` : texts.no_questions}</span></span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
          <DialogContent className="max-w-lg">
            {chapterToStart && (() => {
              const chapter = (chaptersQuery.data || []).find((item) => item.id === chapterToStart);
              if (!chapter) return null;
              return <>
                <DialogHeader>
                  <DialogTitle>{texts.choose_attempt}: {chapter.code}</DialogTitle>
                  <DialogDescription>{language === 'pt' ? 'Verde: aprovado · vermelho: reprovado · normal: ainda não realizado.' : 'Verde: aprobado · rojo: suspendido · normal: aún no realizado.'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 pt-2">
                  {Array.from({ length: Math.max(1, chapter.availableAttempts) }, (_, index) => {
                    const attempt = index + 1;
                    const status = getSimulatorStatus((result) => result.mode === 'chapter' && result.chapterId === chapter.id && result.attemptNumber === attempt);
                    return <Button
                      key={attempt}
                      variant="outline"
                      className={`h-auto justify-between py-3 ${statusClass(status)} ${getProgress(progressKey({ mode: 'chapter', chapterId: chapter.id, attemptNumber: attempt })) ? 'border-red-300 bg-red-50/70 text-red-900 hover:bg-red-100' : ''}`}
                      onClick={() => startChapter(chapter.id, attempt)}
                    >
                      <span>{texts.attempt} {attempt}{getProgress(progressKey({ mode: 'chapter', chapterId: chapter.id, attemptNumber: attempt })) && <span className="ml-1 text-xs">↻ {texts.continue}</span>}</span>
                      <span className="text-xs font-normal">{status === 'passed' ? '✓' : status === 'failed' ? '×' : '·'}</span>
                    </Button>;
                  })}
                </div>
              </>;
            })()}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (activeQuestionsQuery.isLoading) {
    return (
      <Card ref={simulatorSessionRef} className="simulator-session">
        <CardContent className="flex justify-center items-center py-8">
          <Spinner />
          <span className="ml-2">{texts.loading}</span>
        </CardContent>
      </Card>
    );
  }

  if (activeQuestionsQuery.isError) {
    return (
      <Card ref={simulatorSessionRef} className="simulator-session">
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-sm text-red-700">{texts.loadError}</p>
          <Button variant="outline" onClick={() => activeQuestionsQuery.refetch()}>{texts.retry}</Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  if (showResults) {
    const { correct, wrong, blank } = getResultStats();
    const score = correct - wrong * 0.5;
    const isPassed = score >= (selectedChapter ? questions.length / 2 : 50);

    return (
      <Card ref={simulatorSessionRef} className="simulator-session">
        <CardHeader>
          <CardTitle>{texts.results}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{correct}</div>
              <div className="text-sm text-slate-600">{texts.correct}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{wrong}</div>
              <div className="text-sm text-slate-600">{texts.wrong}</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-3xl font-bold text-slate-600">{blank}</div>
              <div className="text-sm text-slate-600">{texts.blank}</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              isPassed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <div className={`text-3xl font-bold ${
                isPassed ? 'text-green-700' : 'text-red-700'
              }`}>
                {score.toFixed(1)}
              </div>
              <div className="text-sm font-semibold">
                {isPassed ? texts.passed : texts.failed}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 font-bold text-slate-900">{texts.history}</h4>
            {historyQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600"><Spinner />{texts.loading}</div>
            ) : (historyQuery.data || []).length === 0 ? (
              <p className="text-sm text-slate-600">{texts.noHistory}</p>
            ) : (
              <div className="space-y-2">
                {(historyQuery.data || []).slice(0, 6).map((result) => {
                  const chapter = (chaptersQuery.data || []).find((item) => item.id === result.chapterId);
                  const label = result.mode === 'chapter'
                    ? `${texts.chapter} ${chapter?.code || result.chapterId || ''}`
                    : result.mode === 'official' ? `${texts.date} ${result.model}` : `${texts.model} ${result.model}`;
                  return <div key={result.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                    <span className="font-medium text-slate-800">{label}</span>
                    <span className="text-slate-600">{result.correctAnswers}/{result.questionCount} · {result.score}%</span>
                  </div>;
                })}
              </div>
            )}
          </div>

          <Button
            onClick={() => {
              if (selectedChapter && chapterAttemptData?.availableAttempts) {
                const availableAttempts = chapterAttemptData.availableAttempts ?? 1;
                setChapterAttempt((current) => current >= availableAttempts ? 1 : current + 1);
                setCurrentQuestion(0);
                setAnswers({});
                setShowResults(false);
                setTimeLeft(7200);
                return;
              }
              setSelectedModel(null);
              setSelectedDate(null);
              setSelectedChapter(null);
              setChapterAttempt(1);
              setCurrentQuestion(0);
              setAnswers({});
              setShowResults(false);
            }}
            className="w-full"
          >
            {selectedChapter && (chapterAttemptData?.availableAttempts ?? 0) > 1 ? texts.otherChapterAttempt : texts.newSimulator}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!question) {
    return <Card ref={simulatorSessionRef} className="simulator-session"><CardContent className="space-y-4 pt-6 text-center"><p>{texts.loadError}</p><Button variant="outline" onClick={() => activeQuestionsQuery.refetch()}>{texts.retry}</Button></CardContent></Card>;
  }

  return (
    <div ref={simulatorSessionRef} className="simulator-session scroll-mt-0 space-y-1 text-[0.98rem] md:text-base">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="secondary" className="fixed bottom-4 right-4 z-30 rounded-full border border-blue-200 bg-white px-4 shadow-lg hover:bg-blue-50">
            {texts.glossary}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="max-h-[60vh] w-80 overflow-y-auto p-4">
          <p className="mb-3 text-xs leading-5 text-slate-600">{texts.glossaryNote}</p>
          <dl className="space-y-2">
            {quickGlossary.map(([spanish, portuguese]) => <div key={spanish} className="rounded-md bg-slate-50 px-3 py-2"><dt className="font-semibold text-slate-900">{spanish}</dt><dd className="mt-0.5 text-sm text-slate-600">{portuguese}</dd></div>)}
          </dl>
        </PopoverContent>
      </Popover>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1.5">
          <Badge className="text-xs md:text-sm">{selectedChapter ? texts.chapter : texts.model}: {selectedChapter ? (chaptersQuery.data || []).find((chapter) => chapter.id === selectedChapter)?.code : selectedModel}</Badge>
          <Badge variant="outline" className={`text-xs md:text-sm ${studyMode === 'learning' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>{studyMode === 'learning' ? texts.learning : texts.exam}</Badge>
          {selectedChapter && chapterAttemptData && <Badge variant="outline" className="text-xs md:text-sm">{texts.attempt} {chapterAttemptData.attemptNumber}/{chapterAttemptData.availableAttempts}</Badge>}
          {selectedChapter && chapterAttemptData && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-800 md:text-sm">{chapterAttemptData.officialQuestionsInAttempt}/{questions.length} {texts.official_in_attempt}</Badge>}
          <Badge variant="outline" className="text-xs md:text-sm">
            {texts.question} {currentQuestion + 1}/{questions.length}
          </Badge>
        </div>
        <div className="flex flex-col items-start gap-0 md:items-end">
          {questions.length === 100 && <div className={`font-semibold text-sm md:text-base ${timeLeft <= 600 ? 'text-red-700' : 'text-slate-800'}`}>{texts.time}: {formatTime(timeLeft)}</div>}
          <span className="hidden text-xs text-slate-500 md:block">{texts.keyboard_hint}</span>
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="px-3 py-2.5 md:px-4 md:py-3">
          <p className="simulator-question-text mb-2.5 text-base font-semibold leading-5.5 md:text-lg md:leading-6">
            {(question.model === 'OF' || question.model === 'ORIGINAL') && question.internalCode?.match(/-(\d+)$/)?.[1] && (
              <span className="mr-2 inline-block rounded bg-slate-100 px-2 py-0.5 align-middle text-xs font-semibold text-slate-600">ID: {question.internalCode.match(/-(\d+)$/)?.[1]}</span>
            )}
            {question.question}
          </p>
          <label className="mb-1.5 flex min-h-6 cursor-pointer items-center gap-2 text-[0.72rem] text-slate-500 hover:text-slate-700 md:text-xs">
            <Checkbox
              checked={reportedQuestionIds.has(question.id)}
              aria-label={texts.conformity}
              onCheckedChange={(checked) => {
                if (checked) {
                  reportQuestionMutation.mutate({ questionId: question.id }, {
                    onSuccess: (result) => result.success && setReportedQuestionIds((current) => new Set(current).add(question.id)),
                  });
                } else {
                  cancelQuestionReviewMutation.mutate({ questionId: question.id }, {
                    onSuccess: (result) => result.success && setReportedQuestionIds((current) => { const next = new Set(current); next.delete(question.id); return next; }),
                  });
                }
              }}
              disabled={reportQuestionMutation.isPending || cancelQuestionReviewMutation.isPending}
            />
            <span>{reportedQuestionIds.has(question.id) ? texts.markedForReview : texts.conformity}</span>
          </label>

          <div className="space-y-1.5">
            {(['A', 'B', 'C', 'D'] as const).map(option => {
              const selectedAnswer = answers[currentQuestion];
              const isLearningFeedback = Boolean(studyMode === 'learning' && selectedAnswer);
              const isCorrectOption = option === question.correctAnswer;
              const isSelectedOption = option === selectedAnswer;
              const optionClass = isLearningFeedback
                ? isCorrectOption
                  ? 'border-green-600 bg-green-50 text-green-950'
                  : isSelectedOption
                    ? 'border-red-600 bg-red-50 text-red-950'
                    : 'border-slate-200 opacity-80'
                : isSelectedOption
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300';

              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestion]: option }))}
                  disabled={isLearningFeedback}
                  aria-pressed={isSelectedOption}
                  className={`simulator-option-text w-full rounded-lg border-2 px-3 py-1.5 text-left text-[0.92rem] leading-5 transition-all disabled:cursor-default md:px-3 md:py-2 md:text-base md:leading-5.5 ${optionClass}`}
                >
                  <span className="font-semibold">{option})</span> {String(question[`option${option}` as keyof typeof question])}
                </button>
              );
            })}
          </div>
          {studyMode === 'learning' && answers[currentQuestion] && (
            <div className={`simulator-learning-feedback mt-2 rounded-lg border px-3 py-2 text-xs font-medium ${
              answers[currentQuestion] === question.correctAnswer
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {answers[currentQuestion] === question.correctAnswer
                ? texts.correctNow
                : <>{texts.incorrectNow} {texts.answerKey} <strong>{question.correctAnswer}</strong>.</>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="space-y-2">
        <div
          className="simulator-mobile-nav space-y-2 md:hidden"
          onTouchStart={(event) => { mobileTouchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            const start = mobileTouchStart.current;
            const end = event.changedTouches[0]?.clientX;
            mobileTouchStart.current = null;
            if (start === null || end === undefined || Math.abs(end - start) < 40) return;
            setCurrentQuestion((questionIndex) => Math.max(0, Math.min(
              questions.length - 1,
              questionIndex + (end < start ? 1 : -1),
            )));
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <Button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} variant="outline" className="px-2 text-xs">←</Button>
            <div className="grid flex-1 grid-cols-10 gap-1">
              {mobileNavigationQuestions.map((navigationQuestion, offset) => {
                const idx = mobileNavigationStart + offset;
                const answer = answers[idx];
                const isCurrent = currentQuestion === idx;
                const wasCorrect = answer === navigationQuestion.correctAnswer;
                const colorClass = answer
                  ? studyMode === 'learning'
                    ? wasCorrect ? 'bg-green-100 text-green-800 ring-green-300' : 'bg-red-100 text-red-800 ring-red-300'
                    : 'bg-green-100 text-green-800 ring-green-300'
                  : isCurrent ? 'bg-blue-600 text-white ring-blue-300' : 'bg-slate-200 text-slate-700 ring-slate-300';
                return <button type="button" key={idx} onClick={() => setCurrentQuestion(idx)} aria-label={`${texts.question} ${idx + 1}`} className={`h-8 w-full rounded text-xs font-semibold ${colorClass} ${isCurrent ? 'ring-2 ring-offset-1' : ''}`}>{idx + 1}</button>;
              })}
            </div>
            <Button onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))} disabled={currentQuestion === questions.length - 1} variant="outline" className="px-2 text-xs">→</Button>
          </div>
          <div className="flex justify-center gap-1.5 border-t border-slate-200 pt-2">
            <Button variant="outline" onClick={resetSimulatorState} className="text-xs">{texts.exitToSimulatorMenu}</Button>
            <Button onClick={finishSimulator} className="bg-red-600 text-xs text-white hover:bg-red-700">{texts.finish}</Button>
          </div>
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-1.5 md:flex">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
            className="text-xs md:text-sm"
          >
            ← {texts.previous}
          </Button>

          <div className="flex flex-wrap justify-center gap-0.5">
            {questions.slice(0, 20).map((navigationQuestion, idx) => {
              const answer = answers[idx];
              const wasAnswered = Boolean(answer);
              const isCurrent = currentQuestion === idx;
              const wasCorrect = answer === navigationQuestion.correctAnswer;
              const colorClass = wasAnswered
                ? studyMode === 'learning'
                  ? wasCorrect ? 'bg-green-100 text-green-800 ring-green-300' : 'bg-red-100 text-red-800 ring-red-300'
                  : 'bg-green-100 text-green-800 ring-green-300'
                : isCurrent ? 'bg-blue-600 text-white ring-blue-300' : 'bg-slate-200 text-slate-700 ring-slate-300';
              return <button type="button" key={idx} onClick={() => setCurrentQuestion(idx)} aria-label={`${texts.question} ${idx + 1}`} className={`h-8 w-8 rounded text-xs font-semibold transition-all md:h-10 md:w-10 ${colorClass} ${isCurrent ? 'ring-2 ring-offset-1' : ''}`}>{idx + 1}</button>;
            })}
          </div>

          <Button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === questions.length - 1}
            variant="outline"
            className="text-xs md:text-sm"
          >
            {texts.next} →
          </Button>
        </div>

        {questions.length > 20 && (
          <div className="hidden flex-wrap justify-center gap-0.5 md:flex">
            {questions.slice(20).map((navigationQuestion, offset) => {
              const idx = offset + 20;
              const answer = answers[idx];
              const wasAnswered = Boolean(answer);
              const isCurrent = currentQuestion === idx;
              const wasCorrect = answer === navigationQuestion.correctAnswer;
              const colorClass = wasAnswered
                ? studyMode === 'learning'
                  ? wasCorrect ? 'bg-green-100 text-green-800 ring-green-300' : 'bg-red-100 text-red-800 ring-red-300'
                  : 'bg-green-100 text-green-800 ring-green-300'
                : isCurrent ? 'bg-blue-600 text-white ring-blue-300' : 'bg-slate-200 text-slate-700 ring-slate-300';
              return <button type="button" key={idx} onClick={() => setCurrentQuestion(idx)} aria-label={`${texts.question} ${idx + 1}`} className={`h-8 w-8 rounded text-xs font-semibold transition-all md:h-10 md:w-10 ${colorClass} ${isCurrent ? 'ring-2 ring-offset-1' : ''}`}>{idx + 1}</button>;
            })}
          </div>
        )}

        <div className="hidden flex-wrap justify-center gap-1.5 border-t border-slate-200 pt-2 md:flex">
          <Button
            variant="outline"
            onClick={() => {
              resetSimulatorState();
            }}
            className="text-xs md:text-sm"
          >
            {texts.exitToSimulatorMenu}
          </Button>
          <Button onClick={finishSimulator} className="ml-4 bg-red-600 text-xs text-white hover:bg-red-700 md:text-sm">
            {texts.finish}
          </Button>
        </div>
      </div>
    </div>
  );
}

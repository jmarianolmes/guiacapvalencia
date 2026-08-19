import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import OverviewTab from './guide/OverviewTab';
import StrategyTab from './guide/StrategyTab';
import RepeatedQuestionsTab from './guide/RepeatedQuestionsTab';
import TricksTab from './guide/TricksTab';
import StudyTab from './guide/StudyTab';
import SiglasTab from './guide/SiglasTab';
import SimulatorTab from './guide/SimulatorTab';
import TemariosTab from './guide/TemariosTab';
import StudyPlanTab from './guide/StudyPlanTab';
import ErrorNotebookTab from './guide/ErrorNotebookTab';
import ProfileDialog from '@/components/ProfileDialog';

function LoginRequiredCard({ message }: { message: string }) {
  return <Card className="border-yellow-200 bg-yellow-50"><CardHeader><CardTitle className="text-yellow-800">{message}</CardTitle></CardHeader></Card>;
}

export default function Guide() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') === 'temarios' ? 'temarios' : 'overview');
  const [profileOpen, setProfileOpen] = useState(false);

  const statsQuery = trpc.guide.getStats.useQuery();
  const officialExamDatesQuery = trpc.guide.getOfficialExamDates.useQuery();
  const profileQuery = trpc.profile.get.useQuery(undefined, { enabled: Boolean(user), staleTime: 60 * 1000, retry: 1 });

  useEffect(() => {
    if (!user || profileQuery.isLoading || profileQuery.isError || profileQuery.data) return;
    const dismissedKey = `cap-profile-onboarding-dismissed-${user.id}`;
    if (sessionStorage.getItem(dismissedKey) !== 'true') setProfileOpen(true);
  }, [profileQuery.data, profileQuery.isError, profileQuery.isLoading, user]);

  const handleProfileOpenChange = (nextOpen: boolean) => {
    setProfileOpen(nextOpen);
    if (!nextOpen && user && !profileQuery.data) {
      sessionStorage.setItem(`cap-profile-onboarding-dismissed-${user.id}`, 'true');
    }
  };

  const t = {
    pt: {
      title: 'Guia CAP Inicial — Valência',
      subtitle: (count?: number) => count ? `Acervo de ${count} provas oficiais (2020–2026)` : 'Acervo de provas oficiais (2020–2026)',
      overview: '📊 Visão Geral',
      strategy: '🎯 Estratégia',
      repeated: '🔁 Repetidas',
      tricks: '⚠️ Pegadinhas',
      study: '📋 Cola de Estudo',
      siglas: '🔤 Siglas',
      temarios: '📚 Temarios',
      simulator: '📝 Simulado',
      questions: 'Questões disponíveis',
      officialExams: 'Provas oficiais',
      officialQuestions: 'Questões oficiais',
      statisticalModels: 'Modelos estatísticos',
      repeatedQuestions: 'Grupos repetidos',
      login_required: 'Faça login para acessar o conteúdo de estudo',
      plan: '🗓️ Plano de Estudos',
      errorNotebook: '📒 Caderno de erros',
    },
    es: {
      title: 'Guía CAP Inicial — Valencia',
      subtitle: (count?: number) => count ? `Colección de ${count} exámenes oficiales (2020–2026)` : 'Colección de exámenes oficiales (2020–2026)',
      overview: '📊 Visión General',
      strategy: '🎯 Estrategia',
      repeated: '🔁 Repetidas',
      tricks: '⚠️ Trampas',
      study: '📋 Hoja de Trucos',
      siglas: '🔤 Siglas',
      temarios: '📚 Temarios',
      simulator: '📝 Simulacro',
      questions: 'Preguntas disponibles',
      officialExams: 'Exámenes oficiales',
      officialQuestions: 'Preguntas oficiales',
      statisticalModels: 'Modelos estadísticos',
      repeatedQuestions: 'Grupos repetidos',
      login_required: 'Inicia sesión para acceder al contenido de estudio',
      plan: '🗓️ Plan de Estudio',
      errorNotebook: '📒 Cuaderno de errores',
    },
  };

  const texts = t[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="overflow-x-hidden bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-8 text-white sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div className="min-w-0">
              <h1 className="mb-2 break-words text-3xl font-bold sm:text-4xl">{texts.title}</h1>
              <p className="text-blue-100">{texts.subtitle(officialExamDatesQuery.data?.length)}</p>
            </div>
            <div className="flex shrink-0 self-end gap-2 sm:self-auto">
              {user && <ProfileDialog language={language} open={profileOpen} onOpenChange={handleProfileOpenChange} onboarding={!profileQuery.data} />}
              {user?.role === 'admin' && <button onClick={() => { window.location.href = '/admin'; }} className="rounded bg-amber-400 px-3 py-1 font-semibold text-amber-950 transition-colors hover:bg-amber-300">Admin</button>}
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  language === 'pt'
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  language === 'es'
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                ES
              </button>
            </div>
          </div>

          {/* Stats */}
          {statsQuery.data && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              <div className="bg-blue-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {statsQuery.data.totalQuestions}
                </div>
                <div className="text-sm text-blue-100">{texts.questions}</div>
              </div>
              <div className="bg-purple-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {statsQuery.data.totalOfficialExams}
                </div>
                <div className="text-sm text-blue-100">{texts.officialExams}</div>
              </div>
              <div className="bg-pink-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{statsQuery.data.totalOfficialQuestions}</div>
                <div className="text-sm text-blue-100">{texts.officialQuestions}</div>
              </div>
              <div className="bg-green-500 bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{statsQuery.data.totalModels}</div>
                <div className="text-sm text-blue-100">{texts.statisticalModels}</div>
              </div>
              <div className="col-span-2 rounded-lg bg-amber-500 bg-opacity-20 p-4 sm:col-span-1">
                <div className="text-3xl font-bold text-white">{statsQuery.data.totalRepeatedQuestions}</div>
                <div className="text-sm text-blue-100">{texts.repeatedQuestions}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8 overflow-x-auto pb-2 [scrollbar-width:thin] lg:overflow-visible">
            <TabsList className="inline-flex h-auto min-w-max w-max gap-1 bg-transparent p-0 lg:grid lg:min-w-0 lg:w-full lg:grid-cols-10">
              <TabsTrigger value="overview" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.overview}
              </TabsTrigger>
              <TabsTrigger value="strategy" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.strategy}
              </TabsTrigger>
              <TabsTrigger value="repeated" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.repeated}
              </TabsTrigger>
              <TabsTrigger value="tricks" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.tricks}
              </TabsTrigger>
              <TabsTrigger value="study" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.study}
              </TabsTrigger>
              <TabsTrigger value="siglas" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.siglas}
              </TabsTrigger>
              <TabsTrigger value="temarios" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.temarios}
              </TabsTrigger>
              <TabsTrigger value="simulator" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.simulator}
              </TabsTrigger>
              {user && <TabsTrigger value="study-plan" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.plan}
              </TabsTrigger>}
              {user && <TabsTrigger value="error-notebook" className="shrink-0 bg-white px-3 py-2 shadow-sm lg:w-full lg:whitespace-normal lg:px-1 lg:text-xs">
                {texts.errorNotebook}
              </TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="overview">
            {user ? <OverviewTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          <TabsContent value="strategy">
            {user ? <StrategyTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          <TabsContent value="repeated">
            {user ? <RepeatedQuestionsTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          <TabsContent value="tricks">
            {user ? <TricksTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          <TabsContent value="study">
            {user ? <StudyTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          <TabsContent value="siglas">
            {user ? <SiglasTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          <TabsContent value="temarios">
            {user ? <TemariosTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          <TabsContent value="simulator">
            {user ? <SimulatorTab language={language} /> : <LoginRequiredCard message={texts.login_required} />}
          </TabsContent>

          {user && <TabsContent value="study-plan"><StudyPlanTab language={language} /></TabsContent>}
          {user && <TabsContent value="error-notebook"><ErrorNotebookTab language={language} /></TabsContent>}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-400 mb-2">
            Criador: J.M.L.M. · Versão 1.4.0
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            ⚠️ PROIBIDA A REPRODUÇÃO SEM AUTORIZAÇÃO
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const statsQuery = trpc.guide.getStats.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: 1 });
  const stats = statsQuery.data;
  const copy = language === 'es'
    ? {
        welcome: 'Bienvenido,', logout: 'Salir', login: 'Iniciar sesión', register: 'Registro',
        examsArchive: 'Archivo de', officialExams: 'exámenes oficiales', author: 'Por',
        questionsAvailable: 'Preguntas disponibles', officialQuestions: 'Preguntas oficiales', statisticalModels: 'Modelos estadísticos', repeatedGroups: 'Grupos repetidos',
        accessGuide: 'Acceder a la guía completa →', featuresTitle: 'Lo que encontrarás',
        overview: '📊 Visión general', overviewDescription: 'Análisis completo de la distribución de temas, patrones de respuesta y prioridades de estudio.',
        strategy: '🎯 Estrategia', strategyDescription: 'Consejos prácticos y simulador de puntuación para optimizar tu rendimiento en el examen.',
        repeated: '🔁 Preguntas repetidas', repeatedDescription: 'grupos de preguntas recurrentes en los exámenes oficiales: una prioridad para el repaso.',
        pitfalls: '⚠️ Trampas frecuentes', pitfallsDescription: 'Patrones de atención extraídos de los 34 exámenes oficiales para repasar condiciones, límites y excepciones.',
        quickGuide: '📋 Guía rápida de estudio', quickGuideDescription: 'Tablas y resúmenes sobre tiempos de conducción, legislación y primeros auxilios.',
        simulator: '📝 Simulacro', simulatorDescription: 'modelos interactivos con cronómetro, corrección automática y prácticas por capítulo.',
        reproductionNotice: '⚠️ REPRODUCCIÓN PROHIBIDA SIN AUTORIZACIÓN',
      }
    : {
        welcome: 'Bem-vindo,', logout: 'Sair', login: 'Login', register: 'Cadastro',
        examsArchive: 'Acervo de', officialExams: 'provas oficiais', author: 'Por',
        questionsAvailable: 'Questões disponíveis', officialQuestions: 'Questões oficiais', statisticalModels: 'Modelos estatísticos', repeatedGroups: 'Grupos repetidos',
        accessGuide: 'Acessar o Guia Completo →', featuresTitle: 'O que você vai encontrar',
        overview: '📊 Visão geral', overviewDescription: 'Análise completa de distribuição de temas, padrões de respostas e ranking de prioridade de estudo.',
        strategy: '🎯 Estratégia', strategyDescription: 'Dicas práticas e simulador de pontuação para otimizar sua performance no exame.',
        repeated: '🔁 Questões repetidas', repeatedDescription: 'grupos de questões recorrentes nas provas oficiais — prioridade para a revisão.',
        pitfalls: '⚠️ Pegadinhas', pitfallsDescription: 'Padrões de atenção extraídos das 34 provas oficiais para revisar condições, limites e exceções.',
        quickGuide: '📋 Cola de estudo', quickGuideDescription: 'Tabelas e resumos de tempos de condução, legislação e primeiros socorros.',
        simulator: '📝 Simulado', simulatorDescription: 'modelos interativos com cronômetro, correção automática e práticas por capítulo.',
        reproductionNotice: '⚠️ PROIBIDA A REPRODUÇÃO SEM AUTORIZAÇÃO',
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Guia CAP Valência
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-1 border border-slate-300 rounded">
              <button
                onClick={() => setLanguage('pt')}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  language === 'pt'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  language === 'es'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ES
              </button>
            </div>
            <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">
                  {copy.welcome} <strong>{user?.name || user?.email}</strong>
                </span>
                {user?.role === 'admin' && (
                  <Button
                    onClick={() => setLocation('/admin')}
                    variant="outline"
                    size="sm"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  size="sm"
                >
                  {copy.logout}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setLocation("/login")}
                  variant="outline"
                  size="sm"
                >
                  {copy.login}
                </Button>
                <Button
                  onClick={() => setLocation("/register")}
                  size="sm"
                >
                  {copy.register}
                </Button>
              </>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Guia CAP Inicial — Valência
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            {copy.examsArchive} {stats?.totalOfficialExams ?? '—'} {copy.officialExams} (2020-2026)
          </p>
          <p className="text-sm text-slate-500">
            {copy.author} J.M.L.M.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats?.totalQuestions ?? '—'}</div>
              <div className="text-sm text-slate-600">{copy.questionsAvailable}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">{stats?.totalOfficialExams ?? '—'}</div>
              <div className="text-sm text-slate-600">{copy.officialExams}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-pink-600 mb-2">{stats?.totalOfficialQuestions ?? '—'}</div>
              <div className="text-sm text-slate-600">{copy.officialQuestions}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats?.totalModels ?? '—'}</div>
              <div className="text-sm text-slate-600">{copy.statisticalModels}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-pink-600 mb-2">{stats?.totalRepeatedQuestions ?? '—'}</div>
              <div className="text-sm text-slate-600">{copy.repeatedGroups}</div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <Button
            onClick={() => setLocation("/guide")}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            {copy.accessGuide}
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{copy.featuresTitle}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">{copy.overview}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {copy.overviewDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">{copy.strategy}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {copy.strategyDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-pink-600">{copy.repeated}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {stats?.totalRepeatedQuestions ?? '—'} {copy.repeatedDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">{copy.pitfalls}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {copy.pitfallsDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">{copy.quickGuide}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {copy.quickGuideDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-cyan-600">{copy.simulator}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {stats?.totalModels ?? '—'} {copy.simulatorDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-400 mb-2">
            © 2026 Guia CAP Valência — J.M.L.M.
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            {copy.reproductionNotice}
          </p>
        </div>
      </footer>
    </div>
  );
}

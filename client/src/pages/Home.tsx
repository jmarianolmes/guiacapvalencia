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
                  Bem-vindo, <strong>{user?.name || user?.email}</strong>
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
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setLocation("/login")}
                  variant="outline"
                  size="sm"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setLocation("/register")}
                  size="sm"
                >
                  Cadastro
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
            Acervo de {stats?.totalOfficialExams ?? '—'} provas oficiais (2020-2026)
          </p>
          <p className="text-sm text-slate-500">
            Por João Mariano L. Macedo
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats?.totalQuestions ?? '—'}</div>
              <div className="text-sm text-slate-600">Questões Disponíveis</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">{stats?.totalOfficialExams ?? '—'}</div>
              <div className="text-sm text-slate-600">Provas Oficiais</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-pink-600 mb-2">{stats?.totalOfficialQuestions ?? '—'}</div>
              <div className="text-sm text-slate-600">Questões Oficiais</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats?.totalModels ?? '—'}</div>
              <div className="text-sm text-slate-600">Modelos Estatísticos</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-pink-600 mb-2">{stats?.totalRepeatedQuestions ?? '—'}</div>
              <div className="text-sm text-slate-600">Grupos Repetidos</div>
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
            Acessar o Guia Completo →
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">O que você vai encontrar</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">📊 Visão Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Análise completa de distribuição de temas, padrões de respostas e ranking de prioridade de estudo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">🎯 Estratégia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Dicas práticas e simulador de pontuação para otimizar sua performance no exame.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-pink-600">🔁 Questões Repetidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {stats?.totalRepeatedQuestions ?? '—'} grupos de questões recorrentes nas provas oficiais — prioridade para a revisão.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">⚠️ Pegadinhas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Padrões de atenção extraídos das 34 provas oficiais para revisar condições, limites e exceções.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">📋 Cola de Estudo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Tabelas e resumos de tempos de condução, legislação e primeiros socorros.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-cyan-600">📝 Simulado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {stats?.totalModels ?? '—'} modelos interativos com cronômetro, correção automática e práticas por capítulo.
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
            © 2026 Guia CAP Valência — João Mariano L. Macedo
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            ⚠️ PROIBIDA A REPRODUÇÃO SEM AUTORIZAÇÃO
          </p>
        </div>
      </footer>
    </div>
  );
}

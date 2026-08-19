import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { refresh } = useAuth();
  const { language } = useLanguage();
  const isEs = language === 'es';
  const text = isEs
    ? { title: 'Acceso', description: 'Entre con el correo y la contraseña proporcionados por la administración.', email: 'Correo electrónico', password: 'Contraseña', submit: 'Entrar', loading: 'Entrando...', incomplete: 'Por favor, complete todos los campos.', request: 'Para solicitar acceso, contacte con la administración del curso.', failed: 'No fue posible iniciar sesión. Inténtelo de nuevo.' }
    : { title: 'Acesso', description: 'Entre com o email e a senha fornecidos pela administração.', email: 'Email', password: 'Senha', submit: 'Entrar', loading: 'Entrando...', incomplete: 'Por favor, preencha todos os campos.', request: 'Para solicitar acesso, entre em contato com a administração do curso.', failed: 'Falha no login. Tente novamente.' };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async result => {
      await refresh();
      setIsLoading(false);
      navigate(result.user.mustChangePassword ? '/change-password' : '/guide');
    },
    onError: mutationError => {
      setError(mutationError.message || text.failed);
      setIsLoading(false);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError(text.incomplete);
      return;
    }
    setIsLoading(true);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md"><CardHeader className="space-y-2"><CardTitle className="text-2xl">{text.title}</CardTitle><CardDescription>{text.description}</CardDescription></CardHeader><CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2"><Label htmlFor="email">{text.email}</Label><Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={event => setEmail(event.target.value)} disabled={isLoading} required /></div>
          <div className="space-y-2"><Label htmlFor="password">{text.password}</Label><Input id="password" type="password" placeholder="••••••••" value={password} onChange={event => setPassword(event.target.value)} disabled={isLoading} required /></div>
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading && <Spinner className="mr-2 h-4 w-4" />}{isLoading ? text.loading : text.submit}</Button>
          <p className="pt-1 text-center text-sm text-muted-foreground">{text.request}</p>
        </form>
      </CardContent></Card>
    </div>
  );
}

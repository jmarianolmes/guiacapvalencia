import { useEffect, useState } from 'react';
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

export function ChangePassword() {
  const { user, loading, isAuthenticated, refresh } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const isEs = language === 'es';
  const text = isEs
    ? { title: 'Defina su contraseña', description: 'Por seguridad, debe sustituir la contraseña temporal antes de acceder a la guía.', password: 'Nueva contraseña', confirmation: 'Confirme la nueva contraseña', submit: 'Guardar y continuar', saving: 'Guardando...', mismatch: 'Las contraseñas no coinciden.', minimum: 'La contraseña debe tener al menos 8 caracteres.', failed: 'No fue posible guardar la contraseña.' }
    : { title: 'Defina sua senha', description: 'Por segurança, você precisa substituir a senha temporária antes de acessar o guia.', password: 'Nova senha', confirmation: 'Confirme a nova senha', submit: 'Salvar e continuar', saving: 'Salvando...', mismatch: 'As senhas não coincidem.', minimum: 'A senha deve ter no mínimo 8 caracteres.', failed: 'Não foi possível salvar a senha.' };

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login');
    if (!loading && user && !user.mustChangePassword) navigate('/');
  }, [isAuthenticated, loading, navigate, user]);

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: async () => {
      await refresh();
      navigate('/');
    },
    onError: mutationError => setError(mutationError.message || text.failed),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 8) return setError(text.minimum);
    if (newPassword !== confirmation) return setError(text.mismatch);
    changePasswordMutation.mutate({ newPassword });
  };

  if (loading || !isAuthenticated || !user?.mustChangePassword) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md"><CardHeader className="space-y-2"><CardTitle className="text-2xl">{text.title}</CardTitle><CardDescription>{text.description}</CardDescription></CardHeader><CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2"><Label htmlFor="new-password">{text.password}</Label><Input id="new-password" type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} disabled={changePasswordMutation.isPending} required /></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">{text.confirmation}</Label><Input id="confirm-password" type="password" minLength={8} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={changePasswordMutation.isPending} required /></div>
          <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>{changePasswordMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}{changePasswordMutation.isPending ? text.saving : text.submit}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}

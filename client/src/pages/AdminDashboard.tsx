import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [accessDurationDays, setAccessDurationDays] = useState(90);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<number | null>(null);
  const [replacementPassword, setReplacementPassword] = useState('');
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEs = language === 'es';
  const text = isEs
    ? {
        title: 'Panel administrativo', back: 'Volver', total: 'Total de usuarios', pending: 'Pendientes de aprobación', approved: 'Usuarios aprobados', blocked: 'Usuarios bloqueados',
        createTitle: 'Crear acceso de estudio', createDescription: 'La cuenta queda aprobada inmediatamente y deberá definir una nueva contraseña en el primer acceso.',
        name: 'Nombre (opcional)', email: 'Correo electrónico', temporaryPassword: 'Contraseña temporal', create: 'Crear cuenta', creating: 'Creando cuenta...',
        manager: 'Gestión de usuarios', noUsers: 'No hay usuarios registrados', status: 'Estado', actions: 'Acciones', account: 'Cuenta',
        approve: 'Aprobar', block: 'Bloquear', unblock: 'Desbloquear', approvedStatus: 'Aprobado', blockedStatus: 'Bloqueado', pendingStatus: 'Pendiente', temporary: 'Cambio de contraseña pendiente', master: 'Cuenta maestra',
        resetPassword: 'Nueva contraseña temporal', savePassword: 'Guardar contraseña', showPassword: 'Mostrar', hidePassword: 'Ocultar', delete: 'Eliminar', confirmDelete: 'Confirmar eliminación', cancel: 'Cancelar', resetDone: 'Contraseña temporal actualizada. La persona deberá cambiarla en su próximo acceso.', deleted: 'Cuenta eliminada correctamente.',
        created: 'Cuenta creada y aprobada. Comparta la contraseña temporal con la persona usuaria por un canal seguro.',
      }
    : {
        title: 'Painel administrativo', back: 'Voltar', total: 'Total de Usuários', pending: 'Pendentes de Aprovação', approved: 'Usuários Aprovados', blocked: 'Usuários Bloqueados',
        createTitle: 'Criar acesso de estudo', createDescription: 'A conta fica aprovada imediatamente e deverá definir uma nova senha no primeiro acesso.',
        name: 'Nome (opcional)', email: 'Email', temporaryPassword: 'Senha temporária', create: 'Criar conta', creating: 'Criando conta...',
        manager: 'Gerenciamento de usuários', noUsers: 'Nenhum usuário cadastrado', status: 'Status', actions: 'Ações', account: 'Conta',
        approve: 'Aprovar', block: 'Bloquear', unblock: 'Desbloquear', approvedStatus: 'Aprovado', blockedStatus: 'Bloqueado', pendingStatus: 'Pendente', temporary: 'Troca de senha pendente', master: 'Conta mestre',
        resetPassword: 'Nova senha temporária', savePassword: 'Salvar senha', showPassword: 'Mostrar', hidePassword: 'Ocultar', delete: 'Excluir', confirmDelete: 'Confirmar exclusão', cancel: 'Cancelar', resetDone: 'Senha temporária atualizada. A pessoa deverá alterá-la no próximo acesso.', deleted: 'Conta excluída com sucesso.',
        created: 'Conta criada e aprovada. Compartilhe a senha temporária com a pessoa usuária por um canal seguro.',
      };

  const statsQuery = trpc.admin.getStats.useQuery();
  const usersQuery = trpc.admin.getAllUsers.useQuery();
  const approveMutation = trpc.admin.approveUser.useMutation();
  const blockMutation = trpc.admin.blockUser.useMutation();
  const createUserMutation = trpc.admin.createUser.useMutation();
  const resetPasswordMutation = trpc.admin.resetUserPassword.useMutation();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();
  const renewAccessMutation = trpc.admin.renewUserAccess.useMutation();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const refreshUsers = async () => {
    await Promise.all([usersQuery.refetch(), statsQuery.refetch()]);
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    try {
      await createUserMutation.mutateAsync({
        name: name || undefined,
        email,
        temporaryPassword,
        accessDurationDays,
      });
      setName('');
      setEmail('');
      setTemporaryPassword('');
      setAccessDurationDays(90);
      setSuccessMessage(`${text.created} Acesso liberado por ${accessDurationDays} dias.`);
      await refreshUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    }
  };

  const handleApprove = async (userId: number) => {
    setFormError('');
    try {
      await approveMutation.mutateAsync({ userId });
      await refreshUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível aprovar a conta.');
    }
  };

  const handleBlock = async (userId: number, blocked: boolean) => {
    setFormError('');
    try {
      await blockMutation.mutateAsync({ userId, blocked });
      await refreshUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível atualizar a conta.');
    }
  };

  const handleResetPassword = async (userId: number) => {
    setFormError('');
    setSuccessMessage('');
    try {
      await resetPasswordMutation.mutateAsync({ userId, temporaryPassword: replacementPassword });
      setReplacementPassword('');
      setEditingPasswordUserId(null);
      setShowTemporaryPassword(false);
      setSuccessMessage(text.resetDone);
      await refreshUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível atualizar a senha.');
    }
  };

  const handleRenewAccess = async (userId: number) => {
    setFormError('');
    try {
      await renewAccessMutation.mutateAsync({ userId, accessDurationDays });
      setSuccessMessage(`Acesso renovado por ${accessDurationDays} dias.`);
      await refreshUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível renovar o acesso.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setFormError('');
    setSuccessMessage('');
    try {
      await deleteUserMutation.mutateAsync({ userId });
      setConfirmDeleteUserId(null);
      setSuccessMessage(text.deleted);
      await refreshUsers();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível excluir a conta.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold">{text.title}</div>
          <Button onClick={() => setLocation('/')} variant="outline" size="sm">{text.back}</Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
        {successMessage && <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900"><AlertDescription>{successMessage}</AlertDescription></Alert>}

        {statsQuery.isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [statsQuery.data?.totalUsers || 0, text.total, 'text-slate-700'],
              [statsQuery.data?.pendingApproval || 0, text.pending, 'text-amber-600'],
              [statsQuery.data?.approvedUsers || 0, text.approved, 'text-emerald-600'],
              [statsQuery.data?.blockedUsers || 0, text.blocked, 'text-rose-600'],
            ].map(([value, label, color]) => (
              <Card key={String(label)}><CardContent className="pt-6"><div className={`mb-2 text-4xl font-bold ${color}`}>{value}</div><div className="text-sm text-slate-600">{label}</div></CardContent></Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{text.createTitle}</CardTitle>
            <CardDescription>{text.createDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} autoComplete="off" className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2"><Label htmlFor="new-name">{text.name}</Label><Input id="new-name" name="student-name" autoComplete="off" value={name} onChange={event => setName(event.target.value)} disabled={createUserMutation.isPending} /></div>
              <div className="space-y-2"><Label htmlFor="new-email">{text.email}</Label><Input id="new-email" name="student-email" type="email" autoComplete="off" value={email} onChange={event => setEmail(event.target.value)} disabled={createUserMutation.isPending} required /></div>
              <div className="space-y-2"><Label htmlFor="temporary-password">{text.temporaryPassword}</Label><div className="flex gap-2"><Input id="temporary-password" name="student-temporary-password" autoComplete="new-password" type={showTemporaryPassword ? 'text' : 'password'} minLength={8} value={temporaryPassword} onChange={event => setTemporaryPassword(event.target.value)} disabled={createUserMutation.isPending} required /><Button type="button" variant="outline" size="sm" onClick={() => setShowTemporaryPassword(value => !value)}>{showTemporaryPassword ? text.hidePassword : text.showPassword}</Button></div></div>
              <div className="space-y-2"><Label htmlFor="access-days">Período de acesso</Label><Input id="access-days" type="number" min={1} max={3650} value={accessDurationDays} onChange={event => setAccessDurationDays(Math.max(1, Number(event.target.value) || 1))} disabled={createUserMutation.isPending} required /><div className="flex gap-2"><Button type="button" size="sm" variant={accessDurationDays === 90 ? 'default' : 'outline'} onClick={() => setAccessDurationDays(90)}>3 meses</Button><Button type="button" size="sm" variant={accessDurationDays === 365 ? 'default' : 'outline'} onClick={() => setAccessDurationDays(365)}>1 ano</Button></div><p className="text-xs text-slate-500">Use 90 dias para acesso intensivo ou 365 para acesso estendido; o campo aceita exceções.</p></div>
              <div className="md:col-span-4"><Button type="submit" disabled={createUserMutation.isPending}>{createUserMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}{createUserMutation.isPending ? text.creating : text.create}</Button></div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{text.manager}</CardTitle></CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (usersQuery.data || []).length === 0 ? (
              <div className="py-8 text-center text-slate-500">{text.noUsers}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead><tr className="border-b border-slate-200"><th className="px-4 py-3 text-left font-semibold">{text.email}</th><th className="px-4 py-3 text-left font-semibold">{text.name}</th><th className="px-4 py-3 text-left font-semibold">{text.status}</th><th className="px-4 py-3 text-left font-semibold">Acesso até</th><th className="px-4 py-3 text-left font-semibold">{text.actions}</th></tr></thead>
                  <tbody>{(usersQuery.data || []).map(account => (
                    <tr key={account.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                      <td className="px-4 py-3">{account.email}</td><td className="px-4 py-3">{account.name || '-'}</td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                        {account.isMaster && <Badge className="bg-violet-100 text-violet-800">{text.master}</Badge>}
                        {account.isBlocked && <Badge className="bg-rose-100 text-rose-800">{text.blockedStatus}</Badge>}
                        {!account.isApproved && <Badge className="bg-amber-100 text-amber-800">{text.pendingStatus}</Badge>}
                        {account.isApproved && !account.isBlocked && <Badge className="bg-emerald-100 text-emerald-800">{text.approvedStatus}</Badge>}
                        {account.mustChangePassword && <Badge className="bg-blue-100 text-blue-800">{text.temporary}</Badge>}
                      </div></td>
                      <td className="px-4 py-3">{account.isMaster ? 'Sem vencimento' : account.accessExpiresAt ? <div><div>{new Date(account.accessExpiresAt).toLocaleDateString(isEs ? 'es-ES' : 'pt-BR')}</div>{account.accessExpired && <Badge className="mt-1 bg-rose-100 text-rose-800">Vencido</Badge>}</div> : <Badge variant="secondary">Sem prazo</Badge>}</td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-2">
                        {!account.isApproved && <Button onClick={() => handleApprove(account.id)} size="sm" variant="outline" disabled={approveMutation.isPending}>{text.approve}</Button>}
                        {!account.isMaster && !account.isBlocked && <Button onClick={() => handleBlock(account.id, true)} size="sm" variant="outline" className="text-rose-600 hover:text-rose-700" disabled={blockMutation.isPending}>{text.block}</Button>}
                        {!account.isMaster && account.isBlocked && <Button onClick={() => handleBlock(account.id, false)} size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700" disabled={blockMutation.isPending}>{text.unblock}</Button>}
                        {!account.isMaster && <Button onClick={() => handleRenewAccess(account.id)} size="sm" variant="outline" className="text-emerald-700 hover:text-emerald-800" disabled={renewAccessMutation.isPending}>Renovar {accessDurationDays} dias</Button>}
                        {!account.isMaster && <Button onClick={() => { setEditingPasswordUserId(editingPasswordUserId === account.id ? null : account.id); setReplacementPassword(''); }} size="sm" variant="outline" disabled={resetPasswordMutation.isPending}>{text.resetPassword}</Button>}
                        {!account.isMaster && confirmDeleteUserId !== account.id && <Button onClick={() => setConfirmDeleteUserId(account.id)} size="sm" variant="outline" className="text-rose-700 hover:text-rose-800" disabled={deleteUserMutation.isPending}>{text.delete}</Button>}
                        {!account.isMaster && confirmDeleteUserId === account.id && <><Button onClick={() => handleDeleteUser(account.id)} size="sm" variant="destructive" disabled={deleteUserMutation.isPending}>{text.confirmDelete}</Button><Button onClick={() => setConfirmDeleteUserId(null)} size="sm" variant="outline">{text.cancel}</Button></>}
                      </div></td>
                    </tr>
                  ))}{(usersQuery.data || []).map(account => editingPasswordUserId === account.id ? (
                    <tr key={`password-${account.id}`} className="border-b border-slate-100 bg-blue-50"><td colSpan={5} className="px-4 py-3"><div className="flex flex-wrap items-end gap-2"><div className="min-w-56 flex-1"><Label htmlFor={`reset-password-${account.id}`}>{text.resetPassword}</Label><Input id={`reset-password-${account.id}`} name={`reset-user-${account.id}-password`} autoComplete="new-password" className="mt-1" type={showTemporaryPassword ? 'text' : 'password'} minLength={8} value={replacementPassword} onChange={event => setReplacementPassword(event.target.value)} /></div><Button type="button" variant="outline" size="sm" onClick={() => setShowTemporaryPassword(value => !value)}>{showTemporaryPassword ? text.hidePassword : text.showPassword}</Button><Button type="button" size="sm" onClick={() => handleResetPassword(account.id)} disabled={replacementPassword.length < 8 || resetPasswordMutation.isPending}>{text.savePassword}</Button><Button type="button" size="sm" variant="outline" onClick={() => { setEditingPasswordUserId(null); setReplacementPassword(''); }}>{text.cancel}</Button></div></td></tr>
                  ) : null)}</tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

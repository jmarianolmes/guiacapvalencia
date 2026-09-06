import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setPaymentReference(data.paymentReference);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setIsLoading(false);
    },
    onError: (mutationError) => {
      setError(mutationError.message || "Falha no cadastro. Tente novamente.");
      setIsLoading(false);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    registerMutation.mutate({ email, password, name: name || undefined });
  };

  const copyReference = async () => {
    if (!paymentReference) return;
    try {
      await navigator.clipboard.writeText(paymentReference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar automaticamente. Selecione e copie o código exibido.');
    }
  };

  if (paymentReference) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-green-700">Cadastro realizado</CardTitle>
            <CardDescription>Guarde o seu código individual antes de sair desta página.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Alert className="border-amber-300 bg-amber-50"><AlertDescription className="text-amber-950">A conta permanece pendente até a aprovação manual do administrador. Este código apenas ajuda a identificar o pagamento no extrato; ele não comprova pagamento e não libera acesso automaticamente.</AlertDescription></Alert>
            <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-5 text-center">
              <p className="text-sm font-medium text-indigo-800">Seu código de referência</p>
              <p className="mt-2 font-mono text-3xl font-bold tracking-[0.2em] text-indigo-950">{paymentReference}</p>
              <Button type="button" variant="outline" className="mt-4" onClick={copyReference}>{copied ? 'Código copiado' : 'Copiar código'}</Button>
            </div>
            <p className="text-sm text-slate-600">Se receber instruções de pagamento do administrador, cole somente o código <strong>{paymentReference}</strong> no campo <strong>conceito</strong>, <strong>complemento</strong> ou <strong>mensagem</strong>. Guarde também o comprovante até a liberação da conta.</p>
            <Button className="w-full" onClick={() => navigate('/login')}>Ir para o login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta para acessar o Guia CAP Valência.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2"><Label htmlFor="name">Nome (opcional)</Label><Input id="name" type="text" placeholder="Seu nome completo" value={name} onChange={(event) => setName(event.target.value)} disabled={isLoading} /></div>
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} required /></div>
            <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} required /><p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirmar senha</Label><Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={isLoading} required /></div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <><Spinner className="mr-2 h-4 w-4" />Cadastrando...</> : 'Cadastrar e gerar código'}</Button>
            <div className="text-center text-sm text-muted-foreground">Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Faça login</Link></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

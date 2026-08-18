# Administração e Recuperação de Senha

## Primeiro administrador

O cadastro por email e senha cria, por padrão, uma conta com papel de usuário e aprovação pendente. Depois de registrar a primeira conta, promova-a no painel de banco de dados ou execute a instrução abaixo, substituindo o email pelo endereço da conta criada:

```sql
UPDATE users
SET role = 'admin', isApproved = 1, isBlocked = 0
WHERE email = 'seu@email.com';
```

Após sair e entrar novamente, essa conta poderá abrir o painel em `/admin`, aprovar novos cadastros, bloquear ou desbloquear usuários e consultar os registros de acesso.

## Recuperação de senha

O sistema já cria tokens de redefinição com expiração e disponibiliza as rotas de solicitação e redefinição. Por decisão do projeto, a recuperação está em **modo de desenvolvimento documentado**: o token é somente registrado no log do servidor para fins de validação. Essa alternativa **não é adequada para publicação**.

Para habilitar envio real, configure uma chave de API do Resend como `RESEND_API_KEY` e um endereço remetente verificado como `RESEND_FROM_EMAIL`. Após a configuração, o projeto deverá enviar um link seguro contendo o token de redefinição para o email cadastrado.

> Nunca compartilhe tokens de redefinição, senhas ou a chave de API em páginas públicas, mensagens ou repositórios.

# Validação do Fluxo de Gestão de Acesso

As validações abaixo cobrem as alterações recentes de criação administrativa de contas, senha temporária, troca obrigatória de senha e proteção da conta mestre. Nenhuma senha ou dado pessoal de contas de teste é registrado neste documento.

| Fluxo validado | Evidência de execução | Resultado |
| --- | --- | --- |
| Criação administrativa de conta | Procedure `admin.createUser` com conta descartável aprovada | A conta foi criada com aprovação automática e exigência de troca de senha ativa. |
| Primeiro login com senha temporária | Login de conta descartável pelo backend e pela interface desktop | A sessão foi criada e o fluxo seguiu para `/change-password`. |
| Troca obrigatória de senha | Procedure `auth.changePassword` e formulário da interface | A exigência foi removida após a definição da nova senha. |
| Proteção de rotas | Navegação desktop após a troca de senha | Uma conta comum acessou `/guide` e foi redirecionada ao tentar abrir `/admin`. |
| Painel administrativo no celular | Interface em viewport de 375 × 812 | O painel carregou e exibiu corretamente o formulário de criação. |
| Estados de erro no celular | Login inválido, confirmação de senha divergente e email duplicado no painel | As mensagens de erro foram apresentadas sem bloquear o fluxo posterior válido. |
| Conta mestre | Consulta de banco e autenticação real | A conta está aprovada, é administradora, não exige troca de senha e possui proteção contra bloqueio. |

Além das validações em runtime, a verificação de tipos TypeScript e a suíte Vitest foram executadas com êxito após as alterações.

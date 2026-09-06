# Configuração de ambiente: Render + TiDB Cloud

Este documento lista somente os **nomes** das variáveis. Valores reais de banco, tokens, chaves de sessão e credenciais administrativas nunca devem ser escritos em arquivos versionados, commits, capturas de tela, logs ou mensagens. Em produção, cadastre cada valor exclusivamente no painel seguro do Render.

## Variáveis necessárias em produção

| Variável | Necessária | Onde configurar | Uso |
| --- | --- | --- | --- |
| `NODE_ENV` | Sim | Variável de ambiente do Render | Definir como `production`. |
| `PORT` | Fornecida pelo Render | Não cadastrar manualmente | Porta HTTP atribuída ao serviço. O servidor a utiliza diretamente. |
| `DATABASE_URL` | Sim | Campo seguro do Render | Cadeia TLS fornecida pelo TiDB Cloud Starter. Não copiar para arquivo ou Git. |
| `JWT_SECRET` | Sim | Campo seguro do Render | Chave aleatória longa e exclusiva para assinar cookies de sessão. Gerar no painel seguro e nunca revelar. |

A `DATABASE_URL` deve ser emitida pelo painel do TiDB Cloud Starter e manter a configuração TLS exigida pelo endpoint público. Antes de cadastrá-la no Render, o firewall do TiDB deve limitar a conexão às faixas CIDR de saída da região Render escolhida e, quando necessário, a um IP administrativo temporário.

## Variáveis opcionais

| Variável | Quando usar | Regra |
| --- | --- | --- |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Somente se o envio real de e-mail para redefinição de senha for autorizado e implementado | Cadastrar no painel seguro. Sem essa integração, nenhum token de redefinição é gravado em log de produção. |
| `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID` | Somente se uma ferramenta de analítica for aprovada | São valores de build e podem ser visíveis no navegador; não usar para dados secretos. |

## Variáveis da plataforma de origem que não devem ser cadastradas

O login de produção é o fluxo local por e-mail e senha. Não configure as variáveis abaixo sem uma nova análise técnica e autorização explícita:

| Variável | Motivo |
| --- | --- |
| `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL` | Relacionadas ao OAuth da plataforma de origem. |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` | Relacionadas a serviços integrados da plataforma de origem. |

## Desenvolvimento local

No computador de desenvolvimento, um arquivo `.env` pode existir apenas localmente e deve permanecer ignorado pelo Git. Use credenciais de desenvolvimento separadas das de produção. Nunca envie esse arquivo por e-mail, anexo público, repositório ou chat.

## Verificação segura

Após cadastrar os segredos no Render, verifique apenas que a aplicação iniciou, que a conexão TLS ao banco responde e que o login local cria uma sessão. Não imprima valores das variáveis e não cole URLs completas de banco em logs de diagnóstico.

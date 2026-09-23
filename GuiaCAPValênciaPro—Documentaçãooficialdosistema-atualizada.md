# Guia CAP Valência Pro — Documentação oficial do sistema

**Status:** fonte de verdade técnica baseada na análise do repositório em 22/09/2026.  
**Escopo desta revisão:** código, configuração versionada, migrações SQL, schema Drizzle, testes e dados mantidos no repositório.  
**Regra de precisão:** esta documentação não presume comportamentos que não puderam ser confirmados. Quando uma informação não está disponível no repositório ou não foi observada diretamente, ela aparece como **Não identificado**.

> **Importante:** a criação deste documento não alterou o código da aplicação, o banco de dados, as APIs ou as configurações de deploy.

## 1. Resumo executivo

O Guia CAP Valência Pro é uma aplicação web full-stack para estudo e simulação de exames CAP. O frontend é uma aplicação React compilada pelo Vite. O backend é um servidor Express que publica uma API tRPC em `/api/trpc` e, em produção, serve os arquivos estáticos compilados. O acesso aos dados é feito por Drizzle ORM sobre MySQL/TiDB Cloud. O navegador envia chamadas tRPC com cookies de sessão; o backend valida autenticação e permissão, consulta ou altera o TiDB e devolve a resposta serializada ao React.

O repositório principal é `jmarianolmes/guiacapvalencia`. O endereço operacional de produção identificado no contexto de trabalho é `https://guia-cap-valencia-pro.onrender.com/`. O site legado em GitHub Pages não é o alvo atual da aplicação Render; não há configuração local que faça o Render publicar naquele endereço legado.

As áreas funcionais confirmadas são:

- autenticação por email e senha, sessão por cookie e fluxo de troca ou redefinição de senha;
- home pública com estatísticas do acervo;
- guia protegida com análise, estratégia, questões repetidas, pesquisa, pegadinhas, cola de estudo, siglas, temários, simulados, plano de estudo e caderno de erros;
- simulados estatísticos, por data oficial e por capítulo;
- salvamento de resultados e respostas individuais;
- denúncias de questões para revisão;
- painel administrativo para usuários, acesso público, importação pontual e verificação manual/assistida de respostas oficiais;
- propagação de correções para versões equivalentes e recálculo de tentativas que possuem todas as respostas individuais.

## 2. Arquitetura e comunicação

O fluxo principal é:

```text
Usuário
  → navegador / React / React Query
  → cliente tRPC em /api/trpc
  → Express no Render
  → middleware de autenticação e autorização
  → router tRPC
  → funções de domínio em server/db.ts e módulos auxiliares
  → Drizzle ORM + mysql2
  → TiDB Cloud
  → resposta tRPC serializada com superjson
  → cache React Query
  → atualização da interface
```

### 2.1 Frontend

O ponto de entrada é `client/src/main.tsx`. Ele cria um `QueryClient`, configura o cliente tRPC com `httpBatchLink` para `/api/trpc`, usa `superjson` e envia `credentials: "include"` para que o cookie de sessão acompanhe as requisições. Erros tRPC com a mensagem de não autenticado redirecionam o navegador para `/login`.

`client/src/App.tsx` monta o `ErrorBoundary`, o `ThemeProvider`, o `TooltipProvider`, o `Toaster` e o roteador Wouter. As rotas de tela são implementadas por componentes React. O servidor recebe as chamadas de API separadamente das rotas de tela.

### 2.2 Backend

`server/_core/index.ts` cria a aplicação Express, aplica cabeçalhos de segurança, limita requisições tRPC, instala os parsers JSON e URL-encoded, registra o proxy de armazenamento, registra OAuth quando configurado, monta o middleware tRPC em `/api/trpc` e serve Vite em desenvolvimento ou arquivos estáticos em produção.

A porta é obtida de `PORT`, com padrão `3000`, e o servidor escuta em `0.0.0.0`. O processo de produção é `node dist/index.js`.

### 2.3 Banco

`server/db.ts` inicializa o Drizzle de forma tardia somente quando `DATABASE_URL` existe. Para URLs cujo host termina em `tidbcloud.com`, o código cria um pool `mysql2` com TLS mínimo 1.2, verificação do certificado, limite de cinco conexões e keep-alive. Para outras URLs, usa diretamente `drizzle(connectionString)`.

As operações de simulados usam uma rotina de nova tentativa quando a mensagem do erro indica perda de conexão. A rotina fecha o pool antigo, recria a conexão e repete a operação uma vez. O banco lógico, o usuário, a senha, o host e o schema concreto são derivados de `DATABASE_URL`; seus valores não são versionados neste documento.

### 2.4 Endpoints técnicos

- `/api/trpc`: API tRPC da aplicação. Recebe chamadas batched do cliente e não deve ser indexada.
- `/robots.txt`: bloqueia `/guide`, `/admin`, `/api/`, `/login` e `/register` para robôs.
- `/oauth/*`: rotas OAuth são registradas somente quando `OAUTH_SERVER_URL` e `VITE_APP_ID` estão presentes.
- Proxy de armazenamento: registrado por `server/_core/storageProxy.ts`; a rota exata depende da implementação desse módulo. **Não identificado neste documento sem inventariar o arquivo completo do proxy.**
- `/__manus__/logs`: existe somente no servidor Vite de desenvolvimento, conforme o plugin de debug em `vite.config.ts`; não é exposto no build de produção pelo transform de HTML.

## 3. Repositório GitHub

### 3.1 Estrutura de alto nível

| Caminho | Responsabilidade confirmada |
|---|---|
| `client/` | Frontend React, estilos, componentes e páginas. |
| `server/` | Backend Express/tRPC, autenticação, acesso ao banco, regras e dados auxiliares. |
| `server/_core/` | Infraestrutura do servidor: contexto, cookies, tRPC, OAuth, Vite, limites e serviços auxiliares. |
| `server/data/` | JSON, relatórios e inventários usados pelo catálogo e pelos bancos de questões. |
| `drizzle/` | Schema TypeScript, relações e migrações SQL/metadados. |
| `shared/` | Tipos e regras compartilhadas entre frontend e backend. |
| `tools/` | Scripts de inventário, classificação, comparação e reparo de dados. |
| `scripts/` | Scripts de geração, auditoria e manutenção. |
| `patches/` | Patches locais de dependências. |
| `index.html` | Arquivo de entrada presente na raiz; o HTML efetivamente usado pelo Vite fica em `client/index.html`. |
| `package.json` | Scripts, dependências e versão do projeto. |
| `pnpm-lock.yaml` | Lockfile do pnpm. |
| `vite.config.ts` | Build e servidor de desenvolvimento do frontend. |
| `tsconfig.json` | Compilação TypeScript compartilhada. |
| `vitest.config.ts` | Configuração dos testes. |
| `todo.md` | Anotações de trabalho existentes; conteúdo não é contrato de runtime. |

### 3.2 Arquivos de entrada e configuração

- `package.json`: scripts efetivos são `dev`, `dev:demo`, `build`, `start`, `check`, `format`, `test`, `db:push`, `db:seed-of`, `catalog:build` e `catalog:seed`.
- `vite.config.ts`: aliases `@` para `client/src`, `@shared` para `shared` e `@assets` para `attached_assets`; build em `dist/public`; em desenvolvimento permite hosts Manus e localhost.
- `tsconfig.json`: inclui `client/src`, `shared` e `server`; usa modo estrito, `noEmit`, resolução `bundler` e aliases TypeScript correspondentes.
- `vitest.config.ts`: configura a suíte Vitest. Detalhes adicionais de configuração não são repetidos aqui porque não alteram o fluxo de produção.
- `.gitignore`: exclui dependências, builds, ambientes `.env`, logs, bancos locais, artefatos Manus e diretórios temporários.
- `template.json`: metadado do template de origem. Não deve ser tratado como a configuração atual da aplicação; o `package.json`, o schema e o código do repositório são a fonte atual.

### 3.3 Backend e domínio

| Arquivo | Função |
|---|---|
| `server/routers.ts` | Declara o `appRouter`, os procedimentos tRPC, validações Zod e permissões de cada API. |
| `server/db.ts` | Acesso ao TiDB, consultas, mutações, cálculos, cache de índices e persistência dos resultados. |
| `server/auth.ts` | Registro, login, hashes, expiração, redefinição e troca de senhas. |
| `server/officialQuestionLookup.ts` | Mapeia capítulos para URLs oficiais e tenta localizar respostas oficiais; a comparação oficial é assistida e exige confirmação administrativa. |
| `server/ofQuestionBank.ts` | Importa dados do banco OF para a tabela de questões. |
| `server/officialExamAnalysis.ts` | Constrói a análise estatística das provas oficiais. |
| `server/officialStatisticalModels.ts` | Regras e dados dos modelos estatísticos oficiais. |
| `server/studyStrategy.ts` | Calcula a estratégia e a prontidão a partir de resultados e foco de erros. |
| `server/studyPlan.ts` | Gera o plano de estudo a partir do perfil, análise oficial, resultados e erros. |
| `server/errorNotebook.ts` | Define intervalos de revisão do caderno de erros. |
| `server/chapterClassifier.ts` | Classifica perguntas por capítulo conforme texto, assunto e regras do catálogo. |
| `server/chapterAssignments.ts` | Apoia a atribuição de capítulos e auditorias. |
| `server/storage.ts` | Integração de armazenamento usada por funções do servidor. |
| `server/demoData.ts` | Dados e persistência em modo demonstração. |
| `server/seed-*.ts` e `server/seed-*.mjs` | Scripts de carga inicial ou manutenção de bancos de questões e conteúdo. |

### 3.4 Frontend e componentes

| Arquivo | Responsabilidade |
|---|---|
| `client/src/App.tsx` | Shell da aplicação e rotas Wouter. |
| `client/src/pages/Home.tsx` | Landing page, autenticação visível e estatísticas públicas. |
| `client/src/pages/Guide.tsx` | Página protegida da guia, cabeçalho, abas, estatísticas e onboarding de perfil. |
| `client/src/pages/AdminDashboard.tsx` | Gestão administrativa, revisão de questões e acesso público. |
| `client/src/pages/Login.tsx` | Login por email e senha. |
| `client/src/pages/Register.tsx` | Cadastro. |
| `client/src/pages/ForgotPassword.tsx` | Solicitação de redefinição. |
| `client/src/pages/ResetPassword.tsx` | Definição de nova senha usando token. |
| `client/src/pages/ChangePassword.tsx` | Troca de senha autenticada. |
| `client/src/pages/NotFound.tsx` | Fallback de rota. |
| `client/src/pages/ComponentShowcase.tsx` | Showcase/demonstração de componentes; não é parte do fluxo principal confirmado. |
| `client/src/pages/guide/OverviewTab.tsx` | Visão geral e análise oficial. |
| `client/src/pages/guide/StrategyTab.tsx` | Estratégia pessoal e simulador de pontuação. |
| `client/src/pages/guide/RepeatedQuestionsTab.tsx` | Grupos de questões repetidas. |
| `client/src/pages/guide/QuestionSearchTab.tsx` | Pesquisa de questões com categoria. |
| `client/src/pages/guide/TricksTab.tsx` | Pegadinhas e questões relacionadas. |
| `client/src/pages/guide/StudyTab.tsx` | Cola de estudo baseada na análise. |
| `client/src/pages/guide/SiglasTab.tsx` | Glossário de siglas. |
| `client/src/pages/guide/TemariosTab.tsx` | Temarios e conteúdo de capítulos. |
| `client/src/pages/guide/SimulatorTab.tsx` | Seleção, execução, persistência local, finalização e histórico de simulados. |
| `client/src/pages/guide/StudyPlanTab.tsx` | Plano personalizado e carrossel de dias. |
| `client/src/pages/guide/ErrorNotebookTab.tsx` | Caderno de erros e revisão espaçada. |
| `client/src/components/DashboardLayout.tsx` | Layout reutilizável de dashboard. |
| `client/src/components/ProfileDialog.tsx` | Perfil e preferências de estudo. |
| `client/src/components/ProtectedRoute.tsx` | Proteção de rota no frontend, quando utilizada. |
| `client/src/components/ui/*` | Componentes visuais Radix/Tailwind reutilizáveis. |
| `client/src/contexts/LanguageContext.tsx` | Idioma PT/ES. |
| `client/src/contexts/ThemeContext.tsx` | Tema visual. |
| `client/src/hooks/useMobile.tsx` | Detecção de viewport móvel. |
| `client/src/lib/trpc.ts` | Tipo do cliente tRPC derivado do `AppRouter`. |
| `client/src/lib/strategyScore.ts` | Cálculos de pontuação usados na interface de estratégia. |

## 4. Render e deploy

### 4.1 Comandos efetivos

- Desenvolvimento: `pnpm dev`, que executa `NODE_ENV=development tsx watch server/_core/index.ts`.
- Desenvolvimento com dados demo: `pnpm dev:demo`, que adiciona `DEMO_MODE=true`.
- Build: `pnpm build`, que executa `vite build` e empacota `server/_core/index.ts` com esbuild para `dist/index.js`.
- Produção: `pnpm start`, que executa `NODE_ENV=production node dist/index.js`.
- Verificação TypeScript: `pnpm check`.
- Testes: `pnpm test`.
- Migração Drizzle: `pnpm db:push`, que gera e aplica migrações conforme o ambiente configurado.

### 4.2 Serviço de produção

O serviço web de produção identificado durante o trabalho é `https://guia-cap-valencia-pro.onrender.com/`. O repositório usa GitHub como origem e o fluxo operacional observado é o auto-deploy do Render após push na branch `main`.

O `render.yaml`, se existir fora do inventário atual, não foi encontrado no repositório analisado. O ID interno do serviço Render, workspace, região, plano, health check e política exata de deploy são **Não identificado** no código versionado.

### 4.3 Variáveis de ambiente

Os nomes lidos pelo código são:

| Variável | Uso confirmado |
|---|---|
| `NODE_ENV` | Seleciona desenvolvimento/produção e influencia redefinição de senha. |
| `PORT` | Porta HTTP; padrão `3000`. |
| `DATABASE_URL` | URL MySQL/TiDB usada pelo Drizzle. Deve conter credenciais; valor é `[REDACTED]`. |
| `JWT_SECRET` | Segredo de cookie/sessão exposto ao módulo `ENV` como `cookieSecret`; valor `[REDACTED]`. |
| `VITE_APP_ID` | ID da aplicação OAuth e condição para registrar as rotas OAuth. Valor `[REDACTED]` quando secreto. |
| `OAUTH_SERVER_URL` | URL do servidor OAuth. Valor `[REDACTED]` quando necessário. |
| `OWNER_OPEN_ID` | Identifica o proprietário para atribuição administrativa no upsert. Valor `[REDACTED]`. |
| `BUILT_IN_FORGE_API_URL` | URL de serviço interno de Forge/LLM quando utilizada. Valor `[REDACTED]`. |
| `BUILT_IN_FORGE_API_KEY` | Chave de serviço interno; sempre `[REDACTED]`. |
| `DEMO_MODE` | Ativa os dados e persistência de demonstração conforme `server/demoData.ts`. |
| `VITE_ANALYTICS_ENDPOINT` | Endpoint inserido no HTML do cliente para analytics. Valor não identificado. |
| `VITE_ANALYTICS_WEBSITE_ID` | Identificador do site de analytics. Valor não identificado. |

Nenhum valor de segredo, token, senha ou chave é documentado.

### 4.4 Cabeçalhos e proteção HTTP

`server/_core/index.ts` envia `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` e uma `Permissions-Policy` que desabilita câmera, microfone e geolocalização. `/api/trpc` recebe `Cache-Control: no-store, private` e `X-Robots-Tag: noindex, nofollow, noarchive`.

O limite de requisições do tRPC é 300 requisições por janela de 10 minutos por chave calculada pelo módulo `rateLimit.ts`. A limpeza dos buckets ocorre a cada 15 minutos.

## 5. Banco TiDB Cloud

### 5.1 Banco e relações

O código usa Drizzle com dialeto MySQL e conexão compatível com TiDB Cloud. O nome exato do schema de produção não aparece em código; ele é o pathname da `DATABASE_URL`. No trabalho operacional anterior, o banco utilizado foi identificado como `test` no editor TiDB Cloud. A confirmação independente do schema de produção fora dessa sessão é **Não identificado**.

O schema Drizzle declara relações lógicas por campos `userId`, `questionId` e `resultId`, mas `drizzle/relations.ts` não declara relações Drizzle e as migrações analisadas não criam foreign keys para esses vínculos. Portanto, a integridade referencial é mantida pelo código, não por constraints de foreign key confirmadas.

### 5.2 Tabelas e campos

#### `users`

Tabela principal de contas.

| Campo | Tipo lógico | Regras e finalidade |
|---|---|---|
| `id` | int | PK autoincrementada. |
| `openId` | varchar(64) | Identificador OAuth/sessão; único no schema atual. |
| `name` | text | Nome exibido. Pode ser nulo. |
| `email` | varchar(320) | Email de login; único no schema atual. |
| `loginMethod` | varchar(64) | Método de login. |
| `role` | enum `user/admin` | Padrão `user`. |
| `passwordHash` | text | Hash da senha; senha em claro não é armazenada. |
| `isApproved` | boolean | Padrão falso; login exige aprovação. |
| `isBlocked` | boolean | Padrão falso; contas bloqueadas não autenticam. |
| `mustChangePassword` | boolean | Indica senha temporária ou troca obrigatória. |
| `isMaster` | boolean | Marca conta mestre. |
| `accessExpiresAt` | timestamp | Limite de acesso; nulo mantém legado/mestre sem expiração segundo o comentário do schema. |
| `paymentReference` | varchar(8) | Referência numérica para conferência manual; não é senha nem libera acesso automaticamente. Única. |
| `createdAt` | timestamp | Criação. |
| `updatedAt` | timestamp | Atualização automática. |
| `lastSignedIn` | timestamp | Último login. |

#### `password_resets`

Armazena tokens de redefinição.

| Campo | Tipo lógico | Regras |
|---|---|---|
| `id` | int | PK autoincrementada. |
| `userId` | int | Usuário associado por vínculo lógico. |
| `token` | varchar(255) | Único. |
| `expiresAt` | timestamp | Expiração obrigatória. |
| `createdAt` | timestamp | Criação. |

O token expirado é removido quando é validado. Em produção, a API não revela se um email existe. O token é impresso em log somente fora de produção, conforme `server/routers.ts`.

#### `user_access_logs`

Registra ações de acesso.

| Campo | Tipo lógico | Finalidade |
|---|---|---|
| `id` | int | PK autoincrementada. |
| `userId` | int | Usuário associado. |
| `action` | varchar(100) | Ação, por exemplo `login`, `logout` ou `view_guide`. |
| `ipAddress` | varchar(45) | Endereço IP, quando registrado. |
| `userAgent` | text | User agent, quando registrado. |
| `createdAt` | timestamp | Data do evento. |

A utilização detalhada de todas as ações no fluxo atual não foi identificada em `routers.ts`.

#### `simulator_questions`

Tabela central de perguntas, usada por simulados, pesquisa, capítulos, revisão e estatísticas.

| Campo | Tipo lógico | Finalidade |
|---|---|---|
| `id` | int | PK autoincrementada. |
| `model` | varchar(10) | Modelo ou origem operacional, como `ORIGINAL`, `OF` ou modelos estatísticos. |
| `provaDate` | varchar(20) | Data textual da prova, por exemplo `01/02/2025`. |
| `questionNumber` | int | Posição na prova. |
| `subject` | varchar(100) | Matéria, como Mercancías ou matérias comuns. |
| `question` | text | Texto principal. |
| `stem` | text | Enunciado complementar. |
| `optionA`–`optionD` | text | Alternativas. |
| `correctAnswer` | varchar(1) | Letra correta `A`, `B`, `C` ou `D`. |
| `normalized` | text | Texto normalizado para pesquisa/equivalência. |
| `internalCode` | varchar(24) | Código interno de origem/capítulo, como os códigos `C...` do catálogo. |
| `equivalenceKey` | text | Chave de equivalência usada para propagação e deduplicação. |
| `chapterId` | varchar(50) | Capítulo classificado. |
| `chapterCode` | varchar(12) | Código textual do capítulo. |
| `origin` | varchar(20) | Padrão `official`; valores comentados: `official` e `non_official`. |
| `reviewStatus` | varchar(20) | Padrão `pending_review`; valores comentados: `reviewed`, `provisional`, `pending_review`. |
| `isVariant` | boolean | Identifica variante. |
| `createdAt` | timestamp | Criação. |

Índices confirmados: `(model, questionNumber)`, `(model, provaDate, questionNumber)` e unicidade `(model, provaDate, questionNumber)`.

#### `question_review_reports`

Fila de questões denunciadas para conferência.

| Campo | Tipo lógico | Finalidade |
|---|---|---|
| `id` | int | PK. |
| `questionId` | int | Questão denunciada. |
| `userId` | int | Usuário que abriu a denúncia. |
| `status` | enum `open/resolved` | Estado da análise. |
| `note` | text | Observação opcional. |
| `createdAt` | timestamp | Abertura. |
| `resolvedAt` | timestamp | Resolução/cancelamento administrativo. |

Há unicidade por `(userId, questionId)` e índice por `(status, createdAt)`. Cancelar remove somente uma denúncia aberta do usuário; resolver administrativo mantém a linha como resolvida.

#### `site_settings`

Configurações simples chave/valor. A chave confirmada é `public_access_enabled`, cujo valor é armazenado como texto `true` ou `false`.

| Campo | Tipo lógico | Regras |
|---|---|---|
| `key` | varchar(64) | PK. |
| `value` | varchar(255) | Obrigatório. |
| `updatedAt` | timestamp | Atualização automática. |

#### `repeated_questions`

Grupos de questões recorrentes.

| Campo | Finalidade |
|---|---|
| `id` | PK. |
| `percentage` | Percentual textual, por exemplo `33.3%`. |
| `question` | Pergunta. |
| `optionA`–`optionD` | Alternativas. |
| `correctAnswer` | Texto integral da resposta correta. |
| `exams` | Datas dos exames em formato textual/JSON. |
| `createdAt` | Criação. |

#### `tricks`

Conteúdo de pegadinhas.

| Campo | Finalidade |
|---|---|
| `id` | PK. |
| `title` | Título do padrão. |
| `percentage` | Percentual textual. |
| `descriptionPt` | Descrição em português. |
| `descriptionEs` | Descrição em espanhol. |
| `createdAt` | Criação. |

#### `siglas`

Glossário de siglas.

| Campo | Finalidade |
|---|---|
| `id` | PK. |
| `acronym` | Sigla única, máximo lógico de 20 caracteres. |
| `fullName` | Nome completo. |
| `descriptionPt` | Explicação em português. |
| `descriptionEs` | Explicação em espanhol. |
| `createdAt` | Criação. |

#### `user_simulator_results`

Resultado agregado de cada tentativa.

| Campo | Finalidade |
|---|---|
| `id` | PK autoincrementada, embora a definição Drizzle também marque `notNull`. |
| `userId` | Dono da tentativa. |
| `model` | Modelo, data ou identificador operacional. |
| `mode` | `statistical`, `official` ou `chapter`; padrão `statistical`. |
| `studyMode` | `exam` ou `learning`; padrão `exam`. |
| `chapterId` | Capítulo, quando aplicável. |
| `attemptNumber` | Versão do capítulo; padrão 1. |
| `questionCount` | Quantidade de questões; padrão 100. |
| `correctAnswers` | Total de acertos. |
| `wrongAnswers` | Total de erros. |
| `blankAnswers` | Total sem resposta. |
| `score` | Pontuação de 0 a 100. |
| `timeTaken` | Segundos consumidos. |
| `createdAt` | Momento de finalização. |

Índice confirmado: `(userId, createdAt)`.

#### `user_simulator_answers`

Respostas individuais necessárias para auditoria e recálculo.

| Campo | Finalidade |
|---|---|
| `id` | PK autoincrementada. |
| `resultId` | Resultado agregado ao qual a resposta pertence. |
| `userId` | Usuário da tentativa. |
| `questionId` | Pergunta respondida. |
| `questionIndex` | Posição da pergunta dentro da tentativa. |
| `selectedAnswer` | Letra escolhida ou nulo para branco. |
| `correctAnswerAtAttempt` | Gabarito vigente no momento da tentativa. |
| `isCorrect` | Resultado booleano calculado no salvamento e atualizado após correção. |
| `createdAt` | Criação da linha. |

Índices confirmados: `resultId` e `questionId`. A migração `drizzle/0016_user_simulator_answers.sql` cria essa tabela com `CREATE TABLE IF NOT EXISTS`, sem foreign keys declaradas.

#### `user_error_notebook_items`

Caderno individual de erros.

| Campo | Finalidade |
|---|---|
| `id` | PK. |
| `userId` | Usuário. |
| `questionId` | Questão de origem; o conteúdo continua em `simulator_questions`. |
| `chapterId` | Capítulo classificado. |
| `wrongCount` | Quantidade de erros acumulados. |
| `reviewLevel` | Nível da revisão espaçada. |
| `lastAnswer` | Última alternativa escolhida. |
| `nextReviewAt` | Próxima data de revisão. |
| `lastReviewedAt` | Última revisão. |
| `resolvedAt` | Data em que foi resolvido. |
| `createdAt` / `updatedAt` | Auditoria temporal. |

Índices confirmados: unicidade `(userId, questionId)` e `(userId, nextReviewAt)`.

#### `user_study_profiles`

Preferências usadas para gerar plano personalizado.

| Campo | Finalidade |
|---|---|
| `id` | PK. |
| `userId` | Usuário, único. |
| `track` | `goods` ou `passengers`; padrão `goods`. |
| `targetExamDate` | Data ISO `YYYY-MM-DD`, opcional. |
| `dailyStudyMinutes` | Padrão 60; a API aceita 40, 60 ou 90. |
| `planEnabled` | Ativa o plano; padrão verdadeiro. |
| `createdAt` / `updatedAt` | Auditoria temporal. |

### 5.3 Migrações versionadas

As migrações presentes incluem a criação inicial de usuários (`0000`), conteúdo e simulados (`0001`–`0013`), código interno (`0014`), reparo de código (`0015`), respostas individuais (`0016`) e revisão/acesso público (`0020`). Os arquivos `drizzle/meta/*` guardam snapshots e `_journal.json` guarda o histórico do Drizzle.

A existência de arquivos de migração no GitHub não prova, isoladamente, que cada migração foi aplicada em todos os ambientes. A aplicação da `0016_user_simulator_answers.sql` foi confirmada anteriormente no editor TiDB Cloud durante esta operação; a data, quantidade de linhas e todos os índices do ambiente remoto não são reconsultados nesta documentação.

## 6. APIs tRPC

Todas as APIs são membros de `appRouter` em `server/routers.ts`. `publicProcedure` não exige login. `protectedProcedure` exige usuário autenticado e acesso não expirado. `adminProcedure` exige `role === 'admin'`; algumas APIs administrativas usam `protectedProcedure` e fazem a mesma checagem explicitamente.

### 6.1 `auth`

| API | Tipo | Entrada | Efeito |
|---|---|---|---|
| `auth.me` | query pública | nenhuma | Retorna usuário sanitizado, papel, aprovação, bloqueio, conta pública e expiração. |
| `auth.logout` | mutation pública | nenhuma | Limpa o cookie `app_session_id`. |
| `auth.register` | mutation pública | email válido, senha mínima 6, nome opcional | Cria cadastro e retorna mensagem/referência. |
| `auth.login` | mutation pública | email e senha | Valida estado da conta, cria token de sessão de um ano e define cookie. |
| `auth.requestPasswordReset` | mutation pública | email válido | Prepara redefinição sem revelar existência do email. |
| `auth.resetPassword` | mutation pública | token, senha mínima 6 | Valida token, atualiza hash e remove token. |
| `auth.changePassword` | protegida | nova senha mínima 8 e senha atual opcional | Troca senha; senha atual é exigida salvo troca obrigatória inicial. |

### 6.2 `guide`

| API | Acesso | Entrada/saída principal |
|---|---|---|
| `getSimulatorModels` | público | Lista modelos estatísticos. |
| `getOfficialExamDates` | público | Lista datas oficiais. |
| `getOfficialExamAnalysis` | protegido | Análise de provas oficiais. |
| `getSimulatorQuestions` | protegido | `model`; retorna perguntas do modelo. |
| `getSimulatorChapters` | protegido | Lista capítulos disponíveis. |
| `getSimulatorQuestionsByChapter` | protegido | `chapterId` e `attemptNumber`; retorna até 50 perguntas da versão. |
| `searchQuestions` | protegido | texto de 2–120 caracteres e categoria `all`, `official` ou `chapter`. |
| `getRepeatedQuestions` | protegido | Lista grupos recorrentes. |
| `getTricks` | protegido | Lista pegadinhas. |
| `getSiglas` | protegido | Lista siglas. |
| `getStats` | público | Estatísticas do acervo. |
| `saveSimulatorResult` | protegido | Resultado agregado e array opcional de respostas individuais. |
| `getUserResults` | protegido | Histórico do usuário, mais recente primeiro. |
| `getStudyStrategy` | protegido | Estratégia calculada por resultados e erros oficiais. |
| `reportQuestionForReview` | protegido | `questionId`; abre ou reabre denúncia. |
| `cancelQuestionReview` | protegido | `questionId`; remove denúncia aberta daquele usuário. |
| `getErrorNotebook` | protegido | Itens devidos e resumo do caderno. |
| `reviewErrorNotebookItem` | protegido | `itemId` e alternativa; atualiza revisão espaçada. |
| `getStudyPlan` | protegido | Perfil, prioridades e plano calculado. |

`saveSimulatorResult` aceita `mode` em `statistical`, `official` ou `chapter`, `studyMode` em `exam` ou `learning`, contagens agregadas e até 200 respostas individuais. A rota ignora persistência para o usuário especial `public-guest`.

### 6.3 `profile`

- `profile.get`: retorna o perfil do usuário autenticado.
- `profile.save`: grava por upsert `track`, data-alvo, minutos diários em 40/60/90 e `planEnabled`.

### 6.4 `admin`

| API | Acesso | Função |
|---|---|---|
| `getQuestionReviewReports` | admin | Lista denúncias abertas com pergunta. |
| `getOfficialQuestionSource` | admin | Retorna URL oficial mapeada para a pergunta. |
| `lookupOfficialQuestion` | admin | Compara banco OF, metadados e fonte online; retorna sugestão, diagnóstico e respostas encontradas. |
| `resolveQuestionReview` | admin | Aceita letra correta, propaga para equivalentes e recalcula tentativas completas. |
| `dismissQuestionReview` | admin | Marca a denúncia como resolvida sem alterar gabarito. |
| `getPublicAccess` | admin | Lê `site_settings.public_access_enabled`. |
| `setPublicAccess` | admin | Atualiza o acesso público. |
| `importObjective32` | admin | Importa `server/data/of_cap_objetivo_3_2.json`. |
| `getStats` | admin explícito | Estatísticas de usuários. |
| `getAllUsers` | admin explícito | Lista usuários sem retornar hashes. |
| `createUser` | admin explícito | Cria conta aprovada com senha temporária e prazo de 1–3650 dias. |
| `renewUserAccess` | admin explícito | Renova prazo por 1–3650 dias. |
| `approveUser` | admin explícito | Aprova usuário. |
| `blockUser` | admin explícito | Bloqueia/desbloqueia usuário. |
| `resetUserPassword` | admin explícito | Define nova senha temporária. |
| `deleteUser` | admin explícito | Exclui conta; a própria conta da sessão não pode ser excluída. |

## 7. Frontend: páginas, abas e ações

### 7.1 Home (`/`)

`Home.tsx` consulta `guide.getStats`, mostra o acervo oficial, total de questões, questões oficiais, modelos e grupos repetidos. O usuário pode trocar PT/ES, fazer login, cadastrar-se, entrar no Admin quando possui papel administrativo, sair e acessar `/guide`. Existe um CTA adicional visível em telas móveis antes do bloco de estatísticas e outro CTA abaixo das estatísticas.

Fluxo de acesso: botão → `useLocation` → `/guide` ou `/login` → carregamento da página → chamadas tRPC correspondentes. As estatísticas vêm de `simulator_questions` e `repeated_questions` via `getSimulatorStats`.

### 7.2 Guia (`/guide`)

`Guide.tsx` consulta `guide.getStats`, `guide.getOfficialExamDates` e `profile.get` quando existe usuário. As abas são:

- **Visão geral:** análise de distribuição e prioridades; usa `OverviewTab` e `guide.getOfficialExamAnalysis`.
- **Estratégia/Pontuação:** usa `StrategyTab`, `guide.getStudyStrategy` e entradas locais para simular pontuação.
- **Repetidas:** lista grupos recorrentes por `guide.getRepeatedQuestions`.
- **Pesquisa de questões:** pesquisa texto com categoria por `guide.searchQuestions`.
- **Pegadinhas:** apresenta padrões e perguntas relacionadas pela análise oficial.
- **Cola de estudo:** mostra conteúdo de estudo derivado da análise.
- **Siglas:** lista o glossário de `siglas`.
- **Temarios:** usa dados estáticos em `client/src/data/temarios.ts`, `temarioLiterales.ts` e `temarioDetailedSummaries.ts`.
- **Simulado:** monta `SimulatorTab`.
- **Plano de estudo:** aparece para usuário autenticado e usa `guide.getStudyPlan`.
- **Caderno de erros:** aparece para usuário autenticado e usa `guide.getErrorNotebook` e `guide.reviewErrorNotebookItem`.

A aba inicial pode ser `temarios` quando a query string contém `?tab=temarios`. O progresso local do simulador é monitorado por eventos de `localStorage`.

### 7.3 Simulador

`SimulatorTab.tsx` tem três modos:

1. **Estatístico:** busca modelos em `getSimulatorModels` e perguntas em `getSimulatorQuestions`.
2. **Por data oficial:** busca datas em `getOfficialExamDates` e usa a data selecionada como modelo operacional.
3. **Por capítulo:** busca capítulos em `getSimulatorChapters` e uma versão em `getSimulatorQuestionsByChapter`.

Cada sessão pode estar em `exam` ou `learning`. O modo exame revela a correção somente no resultado final e entra nos sinais de prontidão; o modo aprendizagem revela a correção ao responder e não é considerado evidência justa para prontidão no plano.

Durante a sessão, a pergunta atual, respostas, cronômetro e progresso são mantidos. A chave `cap-simulator-progress-v1` no `localStorage` separa estatístico, oficial e capítulo. O usuário pode continuar ou descartar uma sessão salva. Ao iniciar uma sessão, classes no `html` e `body` travam o enquadramento visual; há navegação móvel em janela de dez posições e swipe.

Ao finalizar:

```text
respostas locais
  → getResultStats()
  → contagem de acertos, erros e brancos
  → montagem de answers e wrongQuestions
  → remove progresso local
  → guide.saveSimulatorResult
  → user_simulator_results
  → user_simulator_answers
  → caderno de erros para modo official/chapter
  → invalidação do histórico e do caderno no React Query
```

A pontuação persistida é `Math.round(correct / questionCount * 100)`. O tempo é calculado como `7200 - timeLeft` somente para sessões de 100 questões; nas demais, o código envia zero.

### 7.4 Administração

`AdminDashboard.tsx` só renderiza conteúdo para usuário com `role === 'admin'` e redireciona outros para `/`. A tela mostra estatísticas de usuários, formulário de criação de acesso, lista de contas e ações de aprovação, bloqueio, renovação, senha temporária e exclusão.

Na área de revisão, o administrador pode:

- consultar automaticamente a questão nos dados oficiais e na fonte externa;
- abrir a URL oficial em nova aba pelo botão de comparação;
- ver resposta do banco OF, registro interno, resposta online e diagnóstico técnico;
- escolher manualmente A/B/C/D;
- aceitar a sugestão somente após confirmação humana;
- cancelar a averiguação.

Ao resolver uma denúncia, a interface mostra quantos resultados históricos foram recalculados. O botão de comparação não é uma confirmação automática: a correção só é persistida por `resolveQuestionReview`.

## 8. Regras de negócio e cálculos

### 8.1 Autenticação e acesso

O login exige email válido, senha correta, conta não bloqueada, conta aprovada e acesso não expirado. A sessão é criada pelo SDK com validade de um ano e armazenada no cookie `app_session_id` com as opções definidas em `server/_core/cookies.ts`. A conta criada administrativamente é aprovada imediatamente, recebe prazo e deve trocar a senha temporária no primeiro acesso.

O middleware `protectedProcedure` rejeita usuário ausente e conta expirada. `adminProcedure` rejeita usuário ausente ou sem papel `admin`. O endpoint `auth.me` é público para permitir que o frontend descubra o estado atual.

### 8.2 Questões e capítulos

Perguntas `ORIGINAL` e `OF` são tratadas como oficiais para priorização de capítulos. No índice de capítulos, perguntas `non_official` que possuem `internalCode` são excluídas dos simulados atuais. Registros catalogados sem capítulo não entram por fallback automático quando possuem código interno.

A classificação sem código interno usa `classifySimulatorQuestion`, que combina assunto e texto com palavras-chave dos capítulos em `shared/simulatorChapters.ts`. A escolha de equivalência prefere `equivalenceKey`; na ausência dela, usa texto normalizado, alternativas ordenadas e o texto da alternativa correta.

Perguntas de capítulos são deduplicadas por assinatura e priorizadas por oficialidade, data, modelo e número. Cada versão de capítulo contém no máximo 50 perguntas. A tentativa solicitada é limitada ao número de blocos disponíveis e volta para 1 depois da última versão.

### 8.3 Salvamento de respostas

O frontend envia uma linha em `answers` para cada pergunta, inclusive com `selectedAnswer: null` quando em branco. O backend cria primeiro o resultado agregado. Depois, consulta as perguntas reais, captura o gabarito atual em `correctAnswerAtAttempt` e calcula `isCorrect`. Se o salvamento detalhado falhar, o resultado agregado permanece salvo e o erro é registrado; isso é uma característica importante para diagnóstico e não deve ser confundida com garantia de atomicidade entre as duas tabelas.

### 8.4 Recálculo após correção

`resolveQuestionReview` procura a questão denunciada, identifica a alternativa textual correspondente e localiza equivalentes por `equivalenceKey` ou `normalized`. Para cada equivalente, ajusta a letra correta conforme a posição da mesma alternativa textual e marca `reviewStatus` como `reviewed`.

Na mesma transação, procura linhas de `user_simulator_answers` para as questões corrigidas, atualiza `isCorrect`, agrupa os `resultId` afetados e recalcula somente resultados cuja quantidade de respostas individuais seja exatamente igual a `questionCount`. O novo cálculo é:

```text
correctCount = quantidade de answers com isCorrect = true
blankCount   = quantidade com selectedAnswer = null
wrongCount   = quantidade total - correctCount - blankCount
score        = round(correctCount / questionCount * 100)
```

Resultados legados sem o conjunto completo de respostas individuais permanecem inalterados. O relatório de retorno contém `updatedQuestions` e `recalculatedResults`. O histórico não é uma cópia estática: quando reconsultado, mostra os valores atualizados persistidos em `user_simulator_results`.

### 8.5 Caderno de erros

Erros de simulados oficiais e por capítulo entram no caderno. A unicidade por usuário e questão transforma nova ocorrência em incremento de `wrongCount`, reinicia o nível e agenda nova revisão. O ciclo definido em `server/errorNotebook.ts` usa 1, 3, 7 e 14 dias. Acerto marca o item como resolvido; erro agenda nova revisão em um dia e incrementa a contagem.

O caderno filtra as questões de evidência de estudo e separa itens devidos, agendados e resolvidos. Os contadores por capítulo consideram itens não resolvidos.

### 8.6 Estratégia e plano

A estratégia é construída em `server/studyStrategy.ts` usando resultados do usuário e foco de erros oficiais. A fórmula detalhada de cada indicador deve ser alterada somente após leitura desse módulo e dos testes correspondentes; a fonte atual é o código, não este resumo.

O plano em `server/studyPlan.ts` usa perfil, análise oficial, resultados de modo `official`/`chapter`, data atual e foco de erros. A janela de provas recentes confirmada no código é de oito provas. Os estados de plano são `complete`, `accelerated` e `emergency`. Os minutos diários aceitos são 40, 60 e 90, distribuídos entre temario, prática e revisão, com uma atividade oficial estendida em intervalos definidos pelo estado.

## 9. Filtros, estatísticas e origem dos dados

### 9.1 Estatísticas públicas do acervo

`getSimulatorStats` consulta `simulator_questions` e `repeated_questions`.

| Resultado | Origem e cálculo | Exibição |
|---|---|---|
| `totalQuestions` | `count(*)` de `simulator_questions`. | Home e cabeçalho da Guia. |
| `totalOfficialQuestions` | Conta modelo `ORIGINAL`. | Home e Guia. |
| `totalStatisticalQuestions` | Conta modelos diferentes de `ORIGINAL` e `OF`. | Resposta da API; exibição direta não identificada em todos os componentes. |
| `totalOfficialExams` | Datas distintas de `ORIGINAL`. | Home e Guia. |
| `totalModels` | Modelos distintos que não são `ORIGINAL` nem `OF`. | Home e Guia. |
| `totalRepeatedQuestions` | `count(*)` em `repeated_questions`. | Home e Guia. |
| métricas de catálogo | `count(distinct equivalenceKey)` filtrado por origem, variante e status. | Disponíveis na API; uso visual específico não identificado. |

Se o banco não estiver disponível, `getStats` retorna `null`, salvo modo demo.

### 9.2 Pesquisa

`guide.searchQuestions` exige pelo menos dois e no máximo 120 caracteres, remove espaços nas extremidades e aceita categoria `all`, `official` ou `chapter`. A consulta e a ordenação exatas estão em `getSearch...` dentro de `server/db.ts`; a regra de filtro da categoria é parte do backend e não deve ser duplicada no frontend.

### 9.3 Histórico

`getUserSimulatorResults` filtra pelo `userId` autenticado e ordena por `createdAt` decrescente. O frontend mantém essa query por até 60 segundos (`staleTime`); depois de finalizar uma prova, invalida o histórico. Se uma correção administrativa ocorrer enquanto uma página antiga está aberta, o usuário deve reabrir, atualizar ou aguardar a invalidação/renovação da query para visualizar o valor recalculado.

## 10. Fluxos de dados principais

### 10.1 Login

```text
Login.tsx
  → auth.login(email, password)
  → authService.authenticateUser
  → users
  → sdk.createSessionToken
  → cookie app_session_id
  → auth.me
  → estado do useAuth
  → navegação para a guia ou página solicitada
```

### 10.2 Criação de conta pelo usuário

```text
Register.tsx
  → auth.register
  → validação Zod
  → authService.registerUser
  → users + hash da senha + paymentReference
  → mensagem de cadastro e espera de aprovação
```

### 10.3 Consulta de simulados

```text
SimulatorTab
  → seleciona modo
  → guide.getSimulatorModels / getOfficialExamDates / getSimulatorChapters
  → seleciona modelo, data ou capítulo
  → guide.getSimulatorQuestions ou getSimulatorQuestionsByChapter
  → server/db.ts
  → simulator_questions + classificação/cache
  → perguntas na sessão
```

### 10.4 Correção administrativa

```text
usuário denuncia pergunta
  → guide.reportQuestionForReview
  → question_review_reports(status=open)

AdminDashboard
  → admin.lookupOfficialQuestion ou admin.getOfficialQuestionSource
  → banco OF + mapeamento de capítulo + fonte oficial
  → diagnóstico e sugestão

administrador confirma letra
  → admin.resolveQuestionReview
  → simulator_questions equivalentes
  → user_simulator_answers
  → user_simulator_results
  → retorno updatedQuestions/recalculatedResults
  → mensagem e refetch do painel
```

### 10.5 Plano e caderno

```text
ProfileDialog
  → profile.save
  → user_study_profiles

StudyPlanTab
  → guide.getStudyPlan
  → perfil + análise oficial + histórico + foco do caderno
  → plano calculado

SimulatorTab official/chapter
  → saveSimulatorResult
  → user_error_notebook_items
  → ErrorNotebookTab
  → reviewErrorNotebookItem
  → nova data ou resolvedAt
```

## 11. Mapa de dependências e impacto

| Funcionalidade | Arquivos principais | APIs/tabelas | Dependências e riscos |
|---|---|---|---|
| Autenticação | `auth.ts`, `routers.ts`, `_core/trpc.ts`, `useAuth.ts` | `auth.*`, `users`, `password_resets` | Alterar cookie ou expiração afeta todas as páginas protegidas. |
| Home/estatísticas | `Home.tsx`, `Guide.tsx`, `db.ts` | `guide.getStats`, `simulator_questions`, `repeated_questions` | Alterar filtros muda números públicos e cabeçalho. |
| Simulados | `SimulatorTab.tsx`, `db.ts`, `shared/simulatorChapters.ts` | APIs de perguntas e salvamento; `simulator_questions`, `user_simulator_results`, `user_simulator_answers` | Alterar IDs, gabaritos ou índices afeta histórico, caderno e recálculo. |
| Correção de questões | `AdminDashboard.tsx`, `officialQuestionLookup.ts`, `db.ts` | APIs admin; `question_review_reports`, `simulator_questions`, respostas e resultados | Alterar equivalência pode corrigir ou deixar de corrigir múltiplas versões. Exige teste de alternativas reordenadas. |
| Histórico | `SimulatorTab.tsx`, `db.ts` | `getUserResults`, `user_simulator_results` | Cache React Query pode atrasar visualização; linhas legadas não possuem respostas suficientes. |
| Caderno de erros | `ErrorNotebookTab.tsx`, `errorNotebook.ts`, `db.ts` | `getErrorNotebook`, `reviewErrorNotebookItem`; `user_error_notebook_items` | Alterar classificação de capítulos muda prioridades e estatísticas de foco. |
| Plano de estudo | `StudyPlanTab.tsx`, `studyPlan.ts`, `db.ts` | `profile.*`, `getStudyPlan`; perfil, resultados, análise, caderno | Alterar quais resultados são evidência muda prontidão e agenda. |
| Análise oficial | `officialExamAnalysis.ts`, abas de análise, `db.ts` | `getOfficialExamAnalysis`; perguntas oficiais e dados locais | Cache de cinco minutos; dados ou datas alterados mudam prioridades, pegadinhas e plano. |
| Usuários/admin | `AdminDashboard.tsx`, `auth.ts`, `db.ts` | APIs admin; `users`, `site_settings` | Alterar permissões pode expor operações destrutivas. |
| Acesso público | `AdminDashboard.tsx`, `db.ts`, `site_settings` | `getPublicAccess`, `setPublicAccess` | O comportamento final da criação de usuário público depende também de onde o setting é lido; uso completo fora do trecho analisado é **Não identificado**. |
| Fontes oficiais | `officialQuestionLookup.ts`, arquivos OF | `lookupOfficialQuestion`, `simulator_questions` e JSON OF | A fonte externa pode retornar HTTP 403; comparação deve permanecer assistida. |

## 12. Problemas, limitações e inconsistências identificadas

Esta seção registra problemas sem corrigi-los, conforme a instrução deste documento.

### 12.1 Ausência de foreign keys explícitas

- **Localização:** `drizzle/schema.ts`, `drizzle/relations.ts` e migrações SQL.
- **Constatação:** há vínculos lógicos entre usuários, resultados, respostas, questões e relatórios, mas não foram confirmadas constraints de foreign key.
- **Risco:** exclusões ou cargas manuais podem deixar registros órfãos.
- **Possível solução:** somente após inventário de dados e autorização explícita, avaliar constraints ou rotinas de limpeza; não executar automaticamente.

### 12.2 Salvamento agregado e detalhado não são atômicos entre si

- **Localização:** `server/db.ts`, `saveSimulatorResult`.
- **Constatação:** o resultado agregado é inserido antes da transação de respostas individuais; falha no segundo passo é capturada e apenas registrada.
- **Risco:** pode existir tentativa no histórico sem conjunto detalhado, impossibilitando recálculo posterior.
- **Possível solução:** avaliar uma transação única ou rotina de reparo, considerando compatibilidade com produção e resultados já existentes.

### 12.3 Resultados legados não são recalculados sem respostas individuais

- **Localização:** `resolveQuestionReview`, condição `answers.length !== result.questionCount`.
- **Constatação:** o sistema deliberadamente preserva resultados antigos quando não há uma resposta por pergunta.
- **Risco:** uma correção pode alterar novas tentativas, mas não uma tentativa histórica incompleta.
- **Possível solução:** não há como reconstruir com precisão respostas ausentes; qualquer backfill exigiria fonte confiável e aprovação.

### 12.4 Campos de gabarito histórico não são reescritos

- **Localização:** `user_simulator_answers.correctAnswerAtAttempt`.
- **Constatação:** a correção atualiza `isCorrect` e o resultado agregado; `correctAnswerAtAttempt` preserva o gabarito registrado no momento da tentativa.
- **Risco:** relatórios que interpretarem esse campo como gabarito vigente poderão divergir do resultado recalculado.
- **Possível solução:** documentar claramente a semântica histórica; não renomear nem sobrescrever sem analisar consumidores.

### 12.5 Configuração externa do Render não está versionada no repositório analisado

- **Localização:** ausência de `render.yaml` identificada no inventário local.
- **Constatação:** o serviço de produção é conhecido pelo endereço operacional, mas workspace, service ID e parâmetros completos não estão no código.
- **Risco:** uma IA futura pode confundir produção Render com o site legado GitHub Pages.
- **Possível solução:** manter esses dados em configuração segura do projeto, sem secrets, se for desejado.

### 12.6 Fonte oficial pode bloquear automação

- **Localização:** `server/officialQuestionLookup.ts` e diagnóstico exibido no Admin.
- **Constatação:** o fluxo prevê HTTP 403 e mantém comparação manual por URL; não há garantia de acesso automatizado ao site externo.
- **Risco:** sugestão online pode faltar ou ser incompleta.
- **Possível solução:** manter confirmação humana e melhorar headers somente mediante nova solicitação e observância dos termos do site.

### 12.7 Migração e schema devem ser tratados como fontes complementares

- **Localização:** `drizzle/schema.ts`, migrações `0000`–`0020` e snapshots.
- **Constatação:** o schema atual inclui evolução posterior à migração inicial; arquivos históricos podem refletir tipos ou defaults antigos.
- **Risco:** assumir que um único arquivo histórico representa a estrutura atual.
- **Procedimento seguro:** conferir o schema atual, a sequência de migrações e a estrutura efetiva do ambiente TiDB antes de alterar tabelas.

### 12.8 Inconsistências de idioma e conteúdo são possíveis

- **Localização:** textos de `AdminDashboard.tsx`, `Home.tsx`, `Guide.tsx` e dados de conteúdo.
- **Constatação:** há strings em português dentro de blocos de espanhol e vice-versa, além de conteúdo estático e conteúdo vindo do banco.
- **Risco:** uma correção de tradução pode alterar apenas uma tela e deixar outra inconsistente.
- **Possível solução:** tratar como tarefa separada, sem modificar durante manutenção de banco ou regra de negócio.

## 13. Procedimento obrigatório para alterações futuras

Antes de modificar qualquer funcionalidade:

1. localizar o componente, endpoint ou função responsável;
2. identificar todas as chamadas e consumidores;
3. listar tabelas, campos, índices e migrações envolvidas;
4. verificar autenticação, papel e usuário público;
5. verificar impacto em histórico, caderno, plano, estatísticas e filtros;
6. verificar se existe cache local, React Query ou cache de servidor;
7. escolher a menor alteração compatível com o pedido;
8. não mudar nomes ou semântica de campos sem migração e análise de dependências;
9. executar `pnpm check`, `pnpm test` e `pnpm build`;
10. executar testes manuais da funcionalidade afetada e das dependentes;
11. conferir o banco de produção somente com autorização e consultas seguras;
12. registrar no commit o objetivo e o impacto;
13. confirmar o deploy no serviço Render correto, nunca no site legado;
14. atualizar este documento se a arquitetura, API, tabela ou regra tiver mudado.

## 14. Checklist de verificação pós-alteração

### Código e build

- [ ] `git diff` contém somente arquivos solicitados.
- [ ] `pnpm check` passa.
- [ ] `pnpm test` passa.
- [ ] `pnpm build` passa.
- [ ] Não foram incluídos secrets, tokens ou dados de usuário no commit.

### API e autenticação

- [ ] Procedimentos públicos continuam públicos.
- [ ] Procedimentos protegidos continuam rejeitando usuário ausente ou expirado.
- [ ] Procedimentos administrativos continuam exigindo `admin`.
- [ ] O cliente tRPC continua usando `/api/trpc` e cookies.
- [ ] Erros não revelam existência de contas ou segredos.

### Banco

- [ ] O schema Drizzle e a migração correspondente estão alinhados.
- [ ] Índices e unicidades continuam preservados.
- [ ] Não há duplicação de perguntas ou resultados.
- [ ] IDs e chaves lógicas permanecem compatíveis.
- [ ] Dados legados foram considerados.
- [ ] A tabela `user_simulator_answers` mantém uma linha por pergunta quando o salvamento detalhado é esperado.

### Funcionalidades relacionadas

- [ ] Home e estatísticas.
- [ ] Todas as três modalidades do simulador.
- [ ] Modo exame e modo aprendizagem.
- [ ] Continuação e descarte de progresso local.
- [ ] Histórico e recálculo.
- [ ] Caderno de erros.
- [ ] Plano de estudo.
- [ ] Pesquisa e filtros.
- [ ] Revisão oficial assistida.
- [ ] Gestão de usuários e acesso público.
- [ ] Layout móvel e desktop.

## 15. Segunda análise e limites desta documentação

Foi feita uma segunda conferência cruzando o inventário de arquivos, `package.json`, `routers.ts`, `db.ts`, `schema.ts`, migrações recentes, entrada do servidor, entrada do frontend, páginas principais, abas, módulos de domínio e testes. A documentação cobre os pontos que puderam ser confirmados nesses arquivos.

Não foi possível confirmar somente pelo repositório: o service ID e workspace do Render, os valores atuais de variáveis de ambiente, o inventário real de linhas do TiDB em todas as tabelas, a execução atual de cada integração externa, a implementação completa do proxy de armazenamento, a fórmula interna de todos os indicadores quando ela está encapsulada em módulos não reproduzidos integralmente aqui, e o comportamento de serviços externos no momento da leitura. Essas informações são **Não identificadas** ou devem ser verificadas no ambiente correspondente antes de qualquer alteração estrutural.

## 16. Referências

[1]: https://github.com/jmarianolmes/guiacapvalencia "Repositório GitHub do Guia CAP Valência Pro"

[2]: https://guia-cap-valencia-pro.onrender.com/ "Aplicação de produção identificada no Render"

[3]: https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap "Fonte oficial espanhola de exames e formação CAP"

[4]: https://orm.drizzle.team/docs/overview "Documentação do Drizzle ORM"

[5]: https://trpc.io/docs "Documentação do tRPC"

[6]: https://vite.dev/guide/ "Documentação do Vite"

[7]: https://react.dev/ "Documentação do React"

[8]: https://render.com/docs "Documentação do Render"

[9]: https://docs.pingcap.com/tidbcloud/ "Documentação do TiDB Cloud"

[10]: https://www.mysql.com/ "Referência do dialeto MySQL usado pelo TiDB e mysql2"

---

**Regra de manutenção:** esta documentação deve ser atualizada no mesmo commit de qualquer alteração que mude arquitetura, API, tabela, migração, regra de negócio, fluxo de autenticação, integração externa ou processo de deploy.


---

# Adendo de atualização — 23/09/2026

Este adendo complementa e, quando indicado, prevalece sobre as descrições anteriores deste documento. Ele registra as alterações implementadas depois da revisão original, mantendo como regra superior a preservação integral dos arquivos oficiais homologados.

## 13. Banco oficial homologado das 34 provas

Foram incorporados ao repositório **34 arquivos JSON homologados pelo usuário**, armazenados em `server/data/verified-official-exams/`. Os arquivos são tratados como fonte oficial somente leitura. A aplicação não reescreve, reordena, recategoriza nem corrige o conteúdo desses arquivos durante a execução.

A conferência estrutural realizada sobre a coleção confirmou **3.502 registros**, sendo **3.400 questões principais**, correspondentes às questões 1 a 100 de cada prova, e **102 questões de reserva**, correspondentes a três reservas por prova. As reservas aparecem no simulado oficial para prática, mas ficam fora da pontuação final. A análise estratégica oficial exclui as reservas e utiliza somente as 3.400 questões principais.

A tabela `verified_official_questions` é isolada da tabela legada `simulator_questions`. O importador `server/seed-verified-official-exam.ts` é idempotente e não substitui a fonte homologada. O identificador operacional das questões verificadas usa um deslocamento separado para evitar colisão com IDs legados quando respostas, caderno de erros e histórico são persistidos.

## 14. Camada separada de correções administrativas

As correções administrativas ficam em `verified_official_corrections`, separadas da tabela e dos arquivos das perguntas homologadas. Uma correção vigente é aplicada como projeção operacional para correção, estatísticas do usuário, caderno de erros e recálculo de tentativas. A pergunta oficial de origem permanece imutável.

Essa separação conserva três propriedades: o conteúdo homologado pode ser auditado byte a byte; a administração pode registrar uma decisão posterior sem contaminar a fonte; e o sistema pode recalcular novas tentativas e resultados históricos que possuem respostas individuais suficientes.

## 15. Exibição das provas oficiais

Na tela do simulado, o servidor separa visualmente o enunciado das alternativas sem alterar o registro oficial. Alguns arquivos de origem contêm o enunciado e as alternativas no mesmo campo textual, além de fornecerem as alternativas estruturadas. A função de projeção remove somente a repetição visual das alternativas do campo apresentado como pergunta; os campos oficiais persistidos e as quatro alternativas continuam intactos.

A tela oficial mantém a ordem original, o número original, o texto original, as alternativas A–D e o gabarito correspondente. As questões 101, 102 e 103 aparecem para prática e não entram em acertos, erros, brancos, nota ou tempo da prova principal.

## 16. Continuidade de simulados

O progresso local é salvo em `localStorage` sob a chave `cap-simulator-progress-v1`. A chave lógica separa simulados estatísticos, provas oficiais por data e tentativas por capítulo. O estado salvo contém modo de estudo, questão atual, respostas, tempo restante e momento da gravação.

A retomada restaura o modo visual correto, a prova, a tentativa, a questão atual, as respostas e o tempo restante. Datas oficiais em ISO e em formato europeu são normalizadas para a mesma chave. Se existirem registros antigos equivalentes, o sistema consolida-os e mantém o progresso mais completo e recente, evitando dois botões para a mesma prova.

## 17. Histórico de notas na Visão Geral

A aba `OverviewTab` consulta `guide.getUserResults` e apresenta um resumo persistente dos simulados finalizados. O bloco mostra a quantidade de tentativas, a média das notas, a melhor nota, o número de aprovações e até cinco resultados recentes com modelo, data ou capítulo, acertos e nota.

A inclusão do histórico não substitui o histórico detalhado existente no resultado do simulado. Ela apenas coloca um resumo em uma área de maior visibilidade da Guia. A fonte continua sendo `user_simulator_results`, filtrada pelo usuário autenticado e ordenada da tentativa mais recente para a mais antiga.

## 18. Nova análise estratégica das provas homologadas

`getOfficialExamAnalysis` lê diretamente `verified_official_questions`, exclui as reservas e constrói novamente a análise com `buildOfficialExamAnalysis`. O texto integral homologado é usado para recorrência, temas, pegadinhas, grupos de memorização e prioridades; a separação visual do enunciado pertence somente à tela do simulado.

A análise recalculada preserva os tipos de gráfico existentes. O gráfico de barras continua representando a prioridade por capítulo, o gráfico de linha continua representando a recorrência por convocatória e o gráfico circular continua representando a distribuição dos gabaritos A–D. O que muda é a fonte e o conteúdo dos dados, não a linguagem visual.

As métricas estratégicas permanecem definidas da seguinte forma:

- prioridade por capítulo: 55% de volume relativo, 25% de recorrência literal, 10% de cobertura das provas e 10% de presença nas oito provas mais recentes;
- recorrência: comparação do enunciado, das quatro alternativas e do gabarito;
- distribuição de gabaritos: contagem das respostas A, B, C e D das questões principais;
- temas e pegadinhas: classificação textual das questões principais homologadas;
- plano de revisão: ordenação dos capítulos pelo índice calculado, sem usar as questões de reserva.

A análise atualizada é, portanto, baseada nas **34 convocatórias oficiais e 3.400 questões principais** do banco homologado. O pool estatístico e as questões não oficiais não entram nesses gráficos nem nas métricas estratégicas oficiais.

## 19. Pesquisa de questões e fontes

A pesquisa de questões consulta tanto a fonte legada quanto a fonte homologada, conforme a categoria solicitada. As questões homologadas aparecem com seus dados estruturados e com origem oficial. A inclusão na pesquisa não altera a ordem ou o conteúdo dos arquivos de origem.

## 20. Validações realizadas nesta atualização

A aplicação passou por `pnpm check` e `pnpm build`. A coleção local contém 34 arquivos JSON e 3.502 registros, com 3.400 questões principais e 102 reservas. O endpoint público da prova de 18/07/2026 foi conferido após o deploy: o enunciado foi retornado separado das alternativas, e a primeira questão manteve o gabarito B.

Também foi confirmado que o serviço Render iniciou normalmente após os deploys anteriores e que a URL pública respondeu com HTTP 200. Os commits operacionais anteriores foram `2a25ae9`, que corrigiu a retomada, e `02a377b`, que normalizou o progresso duplicado e a exibição das alternativas. Esta atualização acrescenta o histórico na Visão Geral e reforça a análise estratégica sobre a fonte homologada.

## 21. Regra de integridade permanente

Nenhuma melhoria de interface, análise, pesquisa, correção administrativa, histórico ou probabilidade pode alterar os arquivos oficiais homologados. O número da questão, a ordem, o texto, as alternativas e o gabarito de cada convocatória são dados de referência imutáveis. Qualquer correção futura deve ser registrada somente na camada separada de correções e deve manter a origem auditável.

## Referências

[1]: https://github.com/jmarianolmes/guiacapvalencia "Repositório oficial do Guia CAP Valência Pro"

[2]: https://guia-cap-valencia-pro.onrender.com/guide "Guia CAP Valência Pro em produção"

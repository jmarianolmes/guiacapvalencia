# Checklist de publicação — Guia CAP Valência Pro

## Estado atual

A versão local está na branch `publish-study-profile`, com os commits:

- `2b9a646` — organização das questões por capítulo e origem;
- `b0ac1c2` — correção das repetições nos simulados estratégicos;
- `70cfb85` — modo de demonstração local.

O remoto configurado no snapshot é um bundle local, não o repositório GitHub. Portanto, a promoção deve ser feita adicionando a URL real do repositório e enviando a branch ou os três commits.

## Arquivos que devem ir para o GitHub

Não é necessário substituir arquivos manualmente. O ideal é enviar os commits. Se for necessário copiar arquivos, use o conjunto abaixo:

| Área | Arquivos |
|---|---|
| Interface e métricas | `client/src/pages/guide/OverviewTab.tsx` |
| Modelo e migração | `drizzle/schema.ts`, `drizzle/0013_common_titania.sql` |
| Consultas e seleção | `server/db.ts`, `server/_core/context.ts` |
| Dados do catálogo | `server/data/question_catalog.json`, `server/data/question_catalog_report.json`, `server/data/question_catalog_llm_suggestions.json` |
| Pool estratégico | `server/data/simulator_questions.json`, `server/data/statistical_pool_repair_report.json` |
| Demonstração local | `server/demoData.ts`, `package.json` |
| Testes | `server/statistical-pool-composition.test.ts` |
| Auditoria e reprodução | `tools/build_question_catalog.ts`, `tools/repair_statistical_pool.py`, `tools/audit_simulator_compositions.py`, `tools/simulator_composition_audit.json`, `tools/classify_catalog_with_llm.py` |

Não enviar `.env`, senhas, `DATABASE_URL`, tokens, cookies, `node_modules`, `dist` ou arquivos temporários de execução.

## GitHub

Na cópia local, configure o repositório real e envie a branch:

```bash
git remote set-url origin https://github.com/ORGANIZACAO/REPOSITORIO.git
git push origin publish-study-profile
```

Se o Render estiver configurado para `main`, abra um Pull Request de `publish-study-profile` para `main` e faça a revisão antes do merge. Não faça `git push --force`.

## TiDB Cloud

Use primeiro um banco de preview ou faça um backup/exportação do banco de produção. A alteração estrutural é a migração `drizzle/0013_common_titania.sql`; ela adiciona os campos internos do catálogo à tabela `simulator_questions`.

Depois de aplicar a migração, execute o seed do catálogo a partir da raiz do projeto:

```bash
pnpm catalog:build
DATABASE_URL='mysql://.../banco' pnpm catalog:seed
```

Em produção, prefira executar a migração pelo mecanismo de migrações do projeto ou aplicar o SQL revisado no SQL Editor do TiDB Cloud. Não execute o seed antes da migração. Verifique depois se a contagem de questões, modelos e códigos foi preservada.

## Render

No serviço do Render, confirme:

- Branch de deploy: a branch que recebeu o merge, normalmente `main`;
- Build command: `pnpm install --frozen-lockfile && pnpm build`;
- Start command: `pnpm start`;
- Variáveis existentes preservadas: `DATABASE_URL`, `JWT_SECRET`, variáveis OAuth e demais segredos do serviço;
- `DEMO_MODE` ausente ou definido como `false` em produção.

O Render deve fazer um novo deploy após o push ou merge no GitHub. Depois do deploy, valide login, Visão Geral, um modelo estratégico, uma prática por capítulo e uma prova oficial por data.

## Validação pós-publicação

```bash
pnpm test
pnpm check
pnpm build
```

A versão local foi validada com 64 testes, TypeScript sem erros e build de produção aprovado. O modo local de demonstração é iniciado com `pnpm dev:demo` e não deve ser usado no Render de produção.

# Publicação segura: GitHub privado + Render + TiDB Cloud

## Arquitetura aprovada

| Camada | Serviço | Responsabilidade |
| --- | --- | --- |
| Código | GitHub, repositório privado | Guardar o código-fonte, as migrações e a documentação. Não executa a aplicação. |
| Aplicação | Render Free Web Service | Executar Node.js/Express/tRPC e servir o front-end React compilado no mesmo domínio. |
| Banco de dados | TiDB Cloud Starter | Manter dados persistentes de usuários, permissões, questões e resultados. |

> **Importante:** GitHub Pages não é compatível com este projeto, pois não executa Express/tRPC nem fornece banco persistente. O disco local do Render também é efêmero e nunca deve conter banco, uploads ou backups.

## 1. Preparar o repositório privado

Extraia o pacote e entre na pasta interna `guia-cap-valencia-pro/`. O conteúdo dela, e não o ZIP nem a pasta externa, deve ser a raiz do repositório. Antes do primeiro commit, confirme que `package.json`, `client/`, `server/`, `shared/` e `drizzle/` estão visíveis no mesmo nível.

Os seguintes itens devem permanecer fora do Git: `.env*`, `node_modules/`, `dist/`, `.manus/`, `.manus-logs/`, `.project-config.json`, logs, capturas de tela, dumps de banco, cópias de backup e tokens. O `.gitignore` do projeto cobre os artefatos locais e a configuração sensível da plataforma de origem.

Depois de criar manualmente um repositório **privado** no GitHub, o fluxo local é:

```bash
git init
git add .
git status
git commit -m "Preparação de publicação do Guia CAP Valência Pro"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/guia-cap-valencia-pro.git
git push -u origin main
```

Execute `git status` antes do commit. Se aparecer qualquer arquivo `.env`, dump, token, `node_modules/`, `dist/`, `.manus/` ou `.project-config.json`, interrompa o processo e corrija o `.gitignore` antes do `git add` definitivo.

## 2. Criar e proteger o TiDB Cloud Starter

Crie uma instância **TiDB Cloud Starter**, sem configurar limite de gasto. O TiDB Starter aceita MySQL e o driver `mysql2`, já usados pelo projeto. Use o usuário de banco criado no painel e a cadeia de conexão TLS fornecida pelo TiDB somente nos campos de segredo, nunca em arquivo ou chat.

A instância Starter disponibiliza endpoint público com regras de firewall. Remova a regra que permite todas as redes e mantenha apenas os acessos necessários:

| Momento | Regra de firewall permitida |
| --- | --- |
| Importação/validação inicial | IP administrativo temporário e controlado. |
| Aplicação publicada | Faixas CIDR de saída da região Render escolhida. |
| Administração posterior | IP administrativo temporário, removido ao encerrar a manutenção. |

A conexão do TiDB Cloud Starter exige TLS. A `DATABASE_URL` gerada pelo painel deve preservar essa configuração. Não crie uma URL manual sem validar TLS.

## 3. Migrar os dados sem perdas

O ZIP não inclui o banco atual, as contas existentes, os hashes de senha nem os resultados de simulados. Antes de publicar, gere um dump lógico completo e consistente da origem, contendo schema, dados, índices e histórico de migração. Mantenha duas cópias cifradas fora do Git e registre o checksum SHA-256.

Importe o dump em uma instância TiDB de destino vazia. Não execute `pnpm db:push` como atalho e não rode scripts `server/seed-*.ts` no banco já importado: eles podem recriar, duplicar ou divergir do estado real. Após importar, compare estrutura e contagens agregadas antes de apontar a aplicação para o destino.

## 4. Criar o serviço Web no Render

No Render, crie um **Web Service** a partir do repositório privado GitHub. Não é necessário `render.yaml`, `Dockerfile`, `Procfile` ou `.nvmrc` para esta configuração.

| Campo no Render | Valor |
| --- | --- |
| Runtime | Node.js 22 ou superior |
| Diretório raiz | Deixar vazio, se `package.json` estiver na raiz do repositório |
| Comando de instalação | `pnpm install --frozen-lockfile` |
| Comando de build | `pnpm build` |
| Comando de início | `pnpm start` |
| Health check | `/` |
| Porta | Não cadastrar `PORT`; o Render a fornece automaticamente |
| URL inicial | Subdomínio gratuito `onrender.com` fornecido pelo Render |

Cadastre os segredos somente pelo painel seguro do Render:

| Variável | Valor/fonte | Regra |
| --- | --- | --- |
| `NODE_ENV` | `production` | Variável não secreta, definida no serviço. |
| `DATABASE_URL` | Conexão TLS emitida pelo TiDB Cloud Starter | Segredo. Nunca versionar, imprimir ou colocar em `.env` publicado. |
| `JWT_SECRET` | Valor novo, aleatório e exclusivo, gerado no painel seguro | Segredo. Nunca reutilizar a chave do ambiente de origem. |

As variáveis de OAuth e Forge da plataforma de origem **não são necessárias** para o login local por e-mail e senha publicado. Não cadastrar `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL` ou `BUILT_IN_FORGE_API_KEY` sem uma necessidade comprovada e análise específica.

## 5. Validar antes de divulgar a URL

Depois do primeiro deploy, obtenha as faixas de IP de saída da região do serviço no Render e adicione-as ao firewall do TiDB. Em seguida, remova qualquer regra ampla ou IP temporário que não seja mais necessário.

Execute e registre, sem expor dados pessoais:

1. `pnpm check`, `pnpm test` e `pnpm build` no código que será enviado.
2. Carregamento da raiz em HTTPS e ausência de mensagens de segredo no navegador.
3. Login por e-mail/senha e persistência de sessão por cookie seguro.
4. Acesso de administrador e bloqueio de rota administrativa para usuário comum.
5. Consulta de uma prova oficial, um simulador estatístico e um simulador por capítulo.
6. Gravação de um resultado de teste não destrutivo, quando houver autorização e ambiente apropriado.
7. Comparação das contagens de origem/destino e confirmação de que `ORIGINAL` continua separado do pool estatístico.

## 6. Atualização, backup e continuidade

Para atualizar, faça alterações no clone local, rode `pnpm check`, `pnpm test` e `pnpm build`, revise `git status` e envie para a branch configurada. O Render fará novo deploy a partir do GitHub.

O TiDB Cloud Starter gratuito realiza backup diário com retenção de apenas um dia, sem backup manual e sem restauração ponto a ponto. Portanto, mantenha uma exportação lógica periódica cifrada fora do TiDB e fora do Git, com checksum e teste de restauração em uma instância separada quando houver mudança crítica.

Se o serviço do Render ficar ocioso, ele pode hibernar e a primeira visita posterior pode levar aproximadamente um minuto. Se o TiDB atingir a franquia mensal de armazenamento ou Request Units, novas conexões podem ser bloqueadas até a reposição mensal. Monitore esses limites e mantenha um plano de contingência antes de depender da aplicação para uso contínuo.

## Referências oficiais

- [Render — instâncias gratuitas](https://render.com/docs/free)
- [Render — serviços web](https://render.com/docs/web-services)
- [Render — faixas de IP de saída](https://render.com/docs/outbound-ip-addresses)
- [TiDB Cloud Starter — plano e franquia](https://docs.pingcap.com/tidbcloud/select-cluster-tier/)
- [TiDB Cloud Starter — firewall](https://docs.pingcap.com/tidbcloud/configure-serverless-firewall-rules-for-public-endpoints/)
- [TiDB Cloud Starter — backup e restauração](https://docs.pingcap.com/tidbcloud/backup-and-restore-serverless/)

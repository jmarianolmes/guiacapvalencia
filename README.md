# Guia CAP Valência Pro

Aplicação web para preparação do CAP Inicial de Valência, com autenticação por e-mail e senha, painel administrativo, interface em português e espanhol, análise de 34 provas oficiais e simulados de prática.

## Arquitetura

| Camada | Tecnologia |
| --- | --- |
| Interface | React 19, Vite e Tailwind CSS 4 |
| API | Express 4, tRPC 11 e TypeScript |
| Banco de dados | MySQL/TiDB via Drizzle ORM |
| Autenticação local | E-mail/senha com bcryptjs e sessões JWT |
| Gerenciador de pacotes | pnpm |

> **Importante:** este é um projeto **full-stack**. Ele não pode ser hospedado no GitHub Pages, pois necessita de um processo Node.js persistente para a API, sessões e conexão ao banco de dados. O GitHub deve armazenar o código; a execução deve ocorrer em um serviço compatível com Node.js, como Render, Railway, Fly.io ou uma máquina virtual. A plataforma Manus também oferece publicação integrada e domínio personalizado.

## Executar localmente

Instale o Node.js 22+ e o pnpm. Em seguida, crie o arquivo `.env` localmente com base em [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md), preencha as variáveis obrigatórias e execute:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm dev
```

O servidor de desenvolvimento usa a porta definida em `PORT` ou, por padrão, a porta `3000`.

## Gerar a versão de produção

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

O comando `pnpm build` gera o cliente e o servidor em `dist/`. O comando `pnpm start` executa o servidor Express e entrega a interface estática no mesmo domínio.

## Publicar a partir do GitHub

O caminho recomendado está descrito em [DEPLOYMENT.md](./DEPLOYMENT.md). Em resumo, crie um repositório privado, envie estes arquivos sem `.env`, conecte esse repositório a um provedor Node.js e configure as variáveis de ambiente no painel do provedor.

## Segurança e conteúdo excluído

O repositório e o pacote de código-fonte **não devem conter** senhas, cookies, chaves, arquivos `.env`, dependências instaladas, logs ou o banco de dados atual. Os dados das 34 provas oficiais e as contas existentes permanecem no banco ligado ao ambiente atual; uma nova hospedagem requer um banco MySQL/TiDB provisionado e uma migração/importação controlada.

Nunca versione uma senha real de usuário ou administrador. A conta mestre e quaisquer senhas devem ser criadas ou alteradas somente por variáveis/fluxos seguros no ambiente de destino.

## Verificações de qualidade

```bash
pnpm check
pnpm test
```

Na versão preparada deste projeto, ambos os comandos devem terminar sem erros.

## Créditos

Conteúdo e concepção: **João Mariano L. Macedo**.

O material é destinado exclusivamente a estudo. É proibida a reprodução não autorizada.

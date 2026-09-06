# Validação da Importação GVA — CAP Mercancías

## Evidências registradas

| Verificação | Resultado |
| --- | --- |
| Convocatórias extraídas | 24, de 21/11/2020 a 30/11/2024 |
| Questões extraídas | 2.400, com 100 por convocatória |
| Separação curricular | 25 questões de Mercancías e 75 de Materiales Comunes por prova |
| Gabaritos | 100% lidos das plantillas oficiais; distribuição global A=616, B=572, C=600, D=612 |
| Persistência | 2.400 questões em 24 provas confirmadas no banco |
| Seletor por data | Procedure devolve 34 provas oficiais no total, ordenadas da mais recente à mais antiga |
| Testes | 29 testes Vitest aprovados |
| Checagem TypeScript | `pnpm check` aprovado |

## Verificação visual

Em 11/08/2026, a tela principal do guia foi conferida no ambiente de desenvolvimento em desktop. O cabeçalho preservou a navegação e as abas existentes, passou a identificar corretamente o acervo como **provas oficiais de 2020–2026** e não apresentou erro de renderização. O modo por data recebe a lista do banco por procedure pública, removendo a lista fixa de datas da interface.

## Observação sobre a prática por capítulo

O modo **Por Capítulo** continua, de forma deliberada, limitado ao pool estatístico A–J, tal como a implementação original: ele não mistura questões de exames oficiais datados com o treino estatístico. As provas GVA são disponibilizadas integralmente no modo **Por Data Oficial**.

## Evidência do seletor por data

No ambiente de desenvolvimento, a aba **Simulado** exibiu o modo **Por Data Oficial** e abriu uma lista dinâmica com as **34 datas oficiais**. A lista inclui as dez provas anteriormente cadastradas e todas as 24 convocatórias GVA, da mais recente à mais antiga, até **21/11/2020**.

Foi selecionada uma convocatória GVA no seletor dinâmico. O simulador apresentou o respetivo enunciado e quatro alternativas, identificou a prova com a data **24/09/2022**, indicou **Questão 1/100** e mostrou a grelha completa de navegação. A seleção da questão 2 carregou o segundo enunciado e atualizou o indicador para **Questão 2/100**, confirmando a navegação interna da prova oficial.

A grelha também permitiu navegar diretamente para **Questão 100/100** da mesma prova GVA. A última questão manteve as quatro alternativas e disponibilizou a ação **Finalizar**, confirmando que o fluxo de prova está completo até ao resultado.

A ação **Finalizar** abriu a tela de **Resultados** corretamente. No cenário de validação sem respostas marcadas, ela apresentou 0 acertos, 0 erros, 100 em branco e o estado Reprovado, além da ação **Novo Simulado**. Esse resultado é esperado e confirma o encerramento do fluxo da prova oficial sem falha de carregamento.

## Responsividade móvel

Em viewport de **375 × 812 px**, o cabeçalho exibiu o acervo de 34 provas, os cartões de métricas mantiveram uma grelha de duas colunas legível e as abas continuaram navegáveis por rolagem horizontal, sem corte do conteúdo principal. Isso preserva o comportamento móvel do guia após a integração do seletor dinâmico.

A validação funcional completa do simulador foi executada no navegador desktop. A validação móvel confirmou a adaptação visual do guia e da navegação horizontal após a alteração; o fluxo de prova oficial usa o mesmo seletor, a mesma procedure e o mesmo componente responsivo já validados no desktop.

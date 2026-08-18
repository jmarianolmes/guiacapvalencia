# Referência de navegação — Simulado por capítulo

## Site observado

O site [Todotest — CAP Mercancías](https://www.todotest.com/tests/cap_mercancias.asp) apresenta uma lista de testes por objetivo. A estrutura de navegação separa primeiro os objetivos comuns aos transportes de mercadorias e viajantes, depois os objetivos específicos de mercadorias, e mantém os testes de exame como uma alternativa distinta.

## Estrutura aproveitável

| Grupo de navegação | Objetivos apresentados | Aplicação no Guia CAP Valência |
| --- | --- | --- |
| Comunes | 1.1, 1.2, 1.3, 1.3 bis, 2.1, 3.1 a 3.6 | Menu de capítulos CAP Comunes no modo de prática por tema. |
| Mercancías | 1.4, 2.2 e 3.7 | Menu de capítulos CAP Mercancías no modo de prática por tema. |
| Formato exame | Testes em formato exame inicial/ampliação | Os atuais modos Estatístico e Por Data Oficial do Guia permanecem separados e inalterados. |

> A página foi usada apenas como referência de padrão de navegação. A nomenclatura dos capítulos e a estrutura temática do Guia serão derivadas dos sumários fornecidos pelo usuário, que são tratados como a fonte curricular mais atual para este projeto.

## Validação inicial no Guia

O novo modo **Por Capítulo** foi exibido em runtime, com os grupos CAP Comunes e CAP Mercancías e contagens de questões por objetivo. A primeira classificação encontrou capítulos do sumário sem questão correspondente no pool atual; esses objetivos devem permanecer visíveis no menu, desativados e identificados como conteúdo ainda sem questões classificadas, para preservar a estrutura integral do sumário.

Após o ajuste, o menu exibiu todos os objetivos do sumário. Os objetivos 3.2 e 3.6 de Comunes apareceram desativados com a mensagem de ausência de questões classificadas, enquanto os objetivos com banco disponível exibiram suas contagens e permaneceram selecionáveis.

Foi iniciada uma prática do objetivo 1.4 em runtime. O cabeçalho passou a indicar **Capítulo: 1.4**, carregou 50 questões classificadas e preservou o cronómetro, as alternativas e a navegação numerada do Simulado existente.

Em celular, a validação automatizada confirmou a abertura do menu completo, a presença dos dois grupos de capítulos, a indicação dos objetivos sem questões e o início de uma prática filtrada no objetivo 1.4. A largura do documento permaneceu em 375 px, sem overflow horizontal.

Após a expansão do classificador, todas as 1.000 questões do pool passam a ter um capítulo atribuído; o menu em runtime exibe as contagens atualizadas e informa explicitamente que cada prática usa no máximo 50 questões quando o capítulo possui banco maior.

## Auditoria de qualidade do mapeamento

- O pool contém **1.000 questões**, correspondentes a **525 enunciados únicos** entre os modelos.
- A classificação revisada atribuiu objetivo a **525/525 enunciados únicos** (cobertura de 100%), sem o fallback genérico anterior.
- Apenas **4 enunciados (0,76%)** ficaram assinalados com baixa confiança para futura revisão editorial; a amostra representativa de todos os 14 objetivos está coberta por testes automatizados.
- A distribuição e as amostras reais por objetivo estão registradas em `server/data/chapter_assignment_audit.md`.
- A verificação automatizada do runtime confirmou **1.000/1.000** questões atendidas pelo mapa revisado, com **0** classificações residuais por palavra-chave e **0** não atribuídas. A chave usada é o campo `normalized` do banco, com o texto da pergunta apenas como contingência técnica.

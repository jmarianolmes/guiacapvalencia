# Validação de Desempenho e Integridade do Simulado

## Evidências iniciais

Após a otimização das consultas, a tela do Simulado carregou o modo **Estatístico** com os dez modelos A–J disponíveis, sem permanecer no estado de carregamento. O cabeçalho passou a refletir os totais consultados no banco: **4.400 questões analisadas**, **34 provas oficiais**, **3.400 questões oficiais**, **10 modelos estatísticos** e **146 questões repetidas**.

As consultas diretas devolveram 100 questões para o modelo A e 50 questões para o capítulo `common-1-1`. A auditoria do banco confirmou 0 gabaritos fora do conjunto A–D e 0 questões com enunciado ou alternativa vazia.

No navegador, a seleção do **modelo A** deixou imediatamente a tela de escolha e exibiu a questão 1 de 100, as quatro alternativas e a grelha de navegação de 100 posições. O modo Estatístico, portanto, não permaneceu em carregamento.

No modo **Por Capítulo**, os 14 objetivos foram apresentados com as respetivas contagens. A seleção do capítulo 1.1 carregou a questão 1 de 50, as quatro alternativas e a navegação da prática, confirmando que o modo deixou de permanecer em carregamento.

Ao selecionar deliberadamente a alternativa B para a primeira questão do capítulo 1.1, a alternativa A correta foi exibida em verde, a alternativa B escolhida foi exibida em vermelho e a interface informou o gabarito correto A. Esse comportamento está restrito ao modo Por Capítulo, como solicitado.

## Desempenho e integridade finais

Os índices por modelo/questão e por modelo/data/questão foram aplicados e confirmados no plano de execução das consultas. A consulta de estatísticas respondeu em aproximadamente 0,09 s; a primeira consulta de capítulos respondeu em aproximadamente 0,16 s, e a consulta atendida pelo cache respondeu em aproximadamente 0,002 s.

Depois da sincronização transacional da fonte oficial, a base contém 146 questões repetidas. A auditoria final encontrou **4.400 questões**, **0 gabaritos inválidos** (fora de A–D) e **0 questões incompletas**. Os testes automatizados verificam as 1.000 questões estatísticas, as 10 provas recentes e as 24 provas GVA, incluindo alternativas e gabaritos.

## Proteção contra posições conflitantes

Foi identificada uma inconsistência histórica no pool estatístico: alguns registros tinham o número que constava no enunciado de origem, e não a posição sequencial do modelo. O pool foi reimportado a partir da fonte versionada, mantendo os enunciados, alternativas e gabaritos originais, mas usando posições de 1 a 100 em cada modelo A–J.

O banco agora possui uma restrição única para **modelo + data da prova + posição da questão**. A auditoria após a normalização confirmou **0 grupos duplicados** e **0 gabaritos inválidos**. Essa proteção faz uma inserção conflitante falhar no banco, em vez de permitir ambiguidade na posição ou no gabarito.

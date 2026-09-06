# Validação visual — Temarios

## Desktop autenticado

- A aba **Temarios** aparece na navegação do Guia, ao lado de Siglas e Simulado.
- A tela mostra os dois percursos selecionáveis: **CAP Comunes** e **CAP Mercancías**.
- O percurso CAP Comunes apresenta os três blocos e todos os objetivos estruturados.
- Um tópico expansível foi aberto em runtime: exibe resumo, pontos de estudo e links das fontes relacionadas.
- A navegação existente do Guia permaneceu disponível durante a validação.

## Percurso Mercancías

- A seleção de **CAP Mercancías** troca corretamente a estrutura para os blocos de carga, regulamentação e mercado.
- O tópico de embalagem, estiva, amarração e verificação foi aberto em runtime.
- O detalhe apresenta as práticas de inspeção e links para o regulamento CAP, guia europeu de fixação e módulo de estudo sobre sujeción de cargas.

## Siglas e Cola de Estudo

- A aba **Siglas** apresenta em runtime as novas entradas ADAS, EBD, MMA, EN 12195, LC, LOTT, ROTT, EPI, PRL, SIT e e-CMR, além das existentes.
- A aba **Cola de Estudo** preserva as seções originais e inclui os novos resumos de condução eficiente, carga/estiva, documentação internacional e saúde/emergência.

## Idioma espanhol

- O seletor ES atualiza a navegação e os textos do percurso CAP Comunes.
- Os títulos, resumos, objetivos, blocos e aviso didático de Temarios foram exibidos em espanhol em runtime.

## Celular e preservação de abas

- Em viewport de 375 px, foram alternados os percursos Comunes e Mercancías e abertos tópicos de ambos os percursos em runtime.
- Siglas e Cola de Estudo foram verificadas em celular, incluindo EN 12195, e-CMR, checklist de estiva e documentação internacional.
- As abas Visão Geral, Estratégia, Repetidas, Pegadinhas e Simulado continuaram navegáveis no fluxo móvel automatizado.
- Foi corrigido o overflow horizontal do cabeçalho em celular; a validação final confirmou largura do documento de 375 px, sem overflow introduzido pelas novas áreas.

## Inspeção visual móvel

As capturas específicas em 375 px confirmaram que os cartões novos de Siglas permanecem empilhados, legíveis e sem corte. A Cola de Estudo também exibiu os novos blocos de sistemas, estiva, documentação e saúde em cartões de largura integral, com texto visível e sem overflow por seção.

As assertivas automatizadas posteriores confirmaram, em viewport de 375 px, que **EN 12195**, **e-CMR**, **MMA** e os títulos dos três novos blocos da Cola de Estudo têm largura de 293 px, `white-space: normal`, nenhum overflow do próprio elemento ou de seus contêineres e largura total de documento de 375 px.

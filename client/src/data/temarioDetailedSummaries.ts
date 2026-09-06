export type DetailedSummaryItem = {
  code: string;
  title: { pt: string; es: string };
  concept: { pt: string; es: string };
  essentials: { pt: string[]; es: string[] };
};

export const common11DetailedSummary: DetailedSummaryItem[] = [
  {
    code: 'Base',
    title: { pt: 'Cadeia cinemática', es: 'Cadena cinemática' },
    concept: {
      pt: 'É o conjunto que transforma a energia química do combustível em movimento e tração nas rodas. Reúne motor, embreagem, caixa de velocidades, árvore de transmissão, grupo cónico-diferencial, semieixos e rodas.',
      es: 'Es el conjunto que transforma la energía química del combustible en movimiento y tracción en las ruedas. Reúne motor, embrague, caja de velocidades, árbol de transmisión, grupo cónico-diferencial, palieres y ruedas.',
    },
    essentials: {
      pt: ['A força de tração necessária depende da inclinação, da massa total e da velocidade desejada.', 'O diferencial permite que as rodas motrizes percorram distâncias diferentes numa curva sem perder a transmissão.'],
      es: ['La fuerza de tracción necesaria depende de la pendiente, de la masa total y de la velocidad deseada.', 'El diferencial permite que las ruedas motrices recorran distancias distintas en una curva sin perder la transmisión.'],
    },
  },
  {
    code: '1',
    title: { pt: 'Curvas de par, potência e consumo específico', es: 'Curvas de par, potencia y consumo específico' },
    concept: {
      pt: 'A combustão controlada expande gases, empurra o pistão e faz o virabrequim girar. As curvas fornecidas pelo fabricante relacionam rotações com par, potência e consumo, permitindo usar o motor com rendimento.',
      es: 'La combustión controlada expande gases, empuja el pistón y hace girar el cigüeñal. Las curvas facilitadas por el fabricante relacionan revoluciones con par, potencia y consumo, permitiendo usar el motor con rendimiento.',
    },
    essentials: {
      pt: ['Par máximo e potência máxima descrevem o desempenho, mas ocorrem em regimes diferentes.', 'O manual ou diagrama do fabricante é a referência para localizar a faixa útil do motor.'],
      es: ['El par máximo y la potencia máxima describen las prestaciones, pero aparecen a regímenes distintos.', 'El manual o diagrama del fabricante es la referencia para localizar la zona útil del motor.'],
    },
  },
  {
    code: '1.1',
    title: { pt: 'Conceito de par', es: 'Concepto de par' },
    concept: {
      pt: 'Par é a força de rotação aplicada num eixo. É o efeito que faz um mecanismo girar; no exemplo de uma chave de roda, mais par permite apertar mais a porca.',
      es: 'El par es la fuerza de rotación aplicada a un eje. Es el efecto que hace girar un mecanismo; en el ejemplo de una llave de rueda, más par permite apretar más la tuerca.',
    },
    essentials: {
      pt: ['O momento resulta da força multiplicada pela distância perpendicular: M = F × d.', 'Não confundir “força” linear com par: o par mede capacidade de rotação.'],
      es: ['El momento resulta de multiplicar fuerza por distancia perpendicular: M = F × d.', 'No debe confundirse fuerza lineal con par: el par mide capacidad de giro.'],
    },
  },
  {
    code: '1.1.1',
    title: { pt: 'Par motor (força)', es: 'Par motor (fuerza)' },
    concept: {
      pt: 'É o esforço que o pistão transmite ao virabrequim por efeito da combustão e mede-se normalmente em Nm. Depende da expansão dos gases, da geometria do virabrequim e, sobretudo, do enchimento do cilindro.',
      es: 'Es el esfuerzo que transmite el pistón al cigüeñal por efecto de la combustión y se mide normalmente en Nm. Depende de la expansión de los gases, de la geometría del cigüeñal y, sobre todo, del llenado del cilindro.',
    },
    essentials: {
      pt: ['Mais acelerador aumenta o enchimento e o par até ao limite em que o ar disponível já não permite queimar todo o combustível.', 'Em rotações muito elevadas falta tempo para encher o cilindro; por isso, mais rotação não significa necessariamente mais par.', 'Motor elástico ou plano é o que mantém par máximo numa ampla faixa de rotações.'],
      es: ['Más acelerador aumenta el llenado y el par hasta el límite en que el aire disponible ya no permite quemar todo el combustible.', 'A revoluciones muy altas falta tiempo para llenar el cilindro; por ello, más revoluciones no significan necesariamente más par.', 'Un motor elástico o plano conserva el par máximo en una amplia gama de revoluciones.'],
    },
  },
  {
    code: '1.1.2',
    title: { pt: 'Par motor máximo', es: 'Par motor máximo' },
    concept: {
      pt: 'É a maior força de giro que o motor consegue entregar num regime concreto, expressa em Nm e indicada na documentação do veículo. A curva sobe, atinge o máximo num regime médio e depois desce.',
      es: 'Es la mayor fuerza de giro que el motor consigue entregar a un régimen concreto, expresada en Nm e indicada en la documentación del vehículo. La curva sube, alcanza su máximo a un régimen medio y después desciende.',
    },
    essentials: {
      pt: ['O melhor aproveitamento ocorre quando há carga elevada, mas ainda existe ar suficiente para a combustão completa.', 'Ao ralenti, par e rotações são mínimos; servem para vencer os atritos internos.', 'O ponto de par máximo não é o ponto de potência máxima.'],
      es: ['El mejor aprovechamiento se produce con carga elevada, pero cuando todavía existe aire suficiente para una combustión completa.', 'Al ralentí, par y revoluciones son mínimos; sirven para vencer los rozamientos internos.', 'El punto de par máximo no es el punto de potencia máxima.'],
    },
  },
  {
    code: '1.1.3',
    title: { pt: 'Par na roda (tração)', es: 'Par en rueda (tracción)' },
    concept: {
      pt: 'É o esforço que chega às rodas motrizes e gera a força de tração real. A caixa de velocidades e o grupo cónico reduzem rotações e multiplicam o par recebido do motor.',
      es: 'Es el esfuerzo que llega a las ruedas motrices y genera la fuerza de tracción real. La caja de velocidades y el grupo cónico reducen revoluciones y multiplican el par recibido del motor.',
    },
    essentials: {
      pt: ['O par na roda é superior ao par motor devido à desmultiplicação.', 'Quanto maior a redução entre motor e rodas, maior a força disponível nas rodas e menor a velocidade.'],
      es: ['El par en rueda es superior al par motor debido a la desmultiplicación.', 'Cuanto mayor sea la reducción entre motor y ruedas, mayor será la fuerza disponible en las ruedas y menor la velocidad.'],
    },
  },
  {
    code: '1.2',
    title: { pt: 'Potência do motor (trabalho)', es: 'Potencia del motor (trabajo)' },
    concept: {
      pt: 'Potência é o trabalho realizado por unidade de tempo: indica a rapidez com que o motor pode trabalhar e equivale ao par multiplicado pelas rotações. Mede-se em W; no veículo usa-se sobretudo kW ou CV.',
      es: 'La potencia es el trabajo realizado por unidad de tiempo: indica la rapidez con que puede trabajar el motor y equivale al par multiplicado por las revoluciones. Se mide en W; en el vehículo se usan sobre todo kW o CV.',
    },
    essentials: {
      pt: ['Conversões: 1 kW = 1,36 CV; 1 CV = 0,736 kW.', 'Cilindrada, compressão e rotações influenciam a potência; a rotação é o fator mais determinante.', 'A potência necessária nas rodas varia com tara e carga, velocidade e perfil da via.'],
      es: ['Conversiones: 1 kW = 1,36 CV; 1 CV = 0,736 kW.', 'Cilindrada, compresión y revoluciones influyen en la potencia; las revoluciones son el factor más determinante.', 'La potencia necesaria en las ruedas varía con tara y carga, velocidad y perfil de la vía.'],
    },
  },
  {
    code: '1.3',
    title: { pt: 'Consumo específico', es: 'Consumo específico' },
    concept: {
      pt: 'É a quantidade de combustível necessária para gerar uma unidade de potência durante uma unidade de tempo, normalmente em g/kWh. Quanto menor, maior é o rendimento do motor.',
      es: 'Es la cantidad de combustible necesaria para generar una unidad de potencia durante una unidad de tiempo, normalmente en g/kWh. Cuanto menor sea, mayor es el rendimiento del motor.',
    },
    essentials: {
      pt: ['O mínimo consumo específico costuma ocorrer perto do par máximo, com potência intermédia e motor quase em carga máxima.', 'Estilo de condução, manutenção, rotações e mudança selecionada alteram o consumo em l/100 km.', 'No conteúdo do livro, diesel de injeção direta apresenta o menor consumo específico da ordem comparada.'],
      es: ['El consumo específico mínimo suele aparecer cerca del par máximo, con potencia intermedia y motor casi a plena carga.', 'El estilo de conducción, mantenimiento, revoluciones y marcha seleccionada modifican el consumo en l/100 km.', 'En el contenido del libro, el diésel de inyección directa presenta el menor consumo específico del orden comparado.'],
    },
  },
  {
    code: '1.4',
    title: { pt: 'Curvas características e de equiconsumo', es: 'Curvas características y de equiconsumo' },
    concept: {
      pt: 'As curvas mostram como par, potência e consumo específico variam com as rotações. São medidas em banco de ensaio e ajudam a encontrar a zona de uso que entrega desempenho com economia.',
      es: 'Las curvas muestran cómo par, potencia y consumo específico varían con las revoluciones. Se miden en banco de pruebas y ayudan a encontrar la zona de uso que ofrece prestaciones con economía.',
    },
    essentials: {
      pt: ['Servem para localizar a zona ótima no conta-rotações, definir relações de caixa e aumentar o rendimento.', 'Os valores que constam da ficha técnica são valores máximos, não valores permanentes em todas as rotações.'],
      es: ['Sirven para localizar la zona óptima en el cuentarrevoluciones, definir relaciones de caja y aumentar el rendimiento.', 'Los valores que figuran en la ficha técnica son valores máximos, no valores permanentes a todas las revoluciones.'],
    },
  },
  {
    code: '1.4.1',
    title: { pt: 'Curvas de par e potência', es: 'Curvas de par y potencia' },
    concept: {
      pt: 'A curva de par apresenta o esforço disponível a cada rotação; a de potência apresenta a capacidade de trabalho ao longo dessa faixa. Ambas podem ser de carga total ou parcial, consoante a posição do acelerador.',
      es: 'La curva de par presenta el esfuerzo disponible a cada revolución; la de potencia presenta la capacidad de trabajo a lo largo de esa gama. Ambas pueden ser de carga total o parcial, según la posición del acelerador.',
    },
    essentials: {
      pt: ['Curva a plena carga: acelerador a fundo; é a habitualmente fornecida pelo fabricante.', 'Curva a carga parcial: mostra os valores com o acelerador, por exemplo, a 25%, 50% ou 75%.', 'O comportamento da curva de par influencia diretamente o desenho e o escalonamento da caixa de velocidades.'],
      es: ['Curva a plena carga: acelerador a fondo; es la facilitada habitualmente por el fabricante.', 'Curva a carga parcial: muestra valores con el acelerador, por ejemplo, al 25 %, 50 % o 75 %.', 'El comportamiento de la curva de par influye directamente en el diseño y escalonamiento de la caja de velocidades.'],
    },
  },
  {
    code: '1.4.2',
    title: { pt: 'Curvas de equiconsumo', es: 'Curvas de equiconsumo' },
    concept: {
      pt: 'São linhas de igual consumo específico sobrepostas às curvas do motor. Cada linha reúne situações que exigem a mesma quantidade de combustível por potência produzida.',
      es: 'Son líneas de igual consumo específico superpuestas a las curvas del motor. Cada línea reúne situaciones que exigen la misma cantidad de combustible por potencia producida.',
    },
    essentials: {
      pt: ['O “polo de mínimo consumo” fica normalmente pouco abaixo ou no início da zona de par máximo, com acelerador cerca de 75% pressionado.', 'A zona corresponde à parte inferior da faixa verde do conta-rotações; nela, a mesma potência pode ser obtida com menos combustível.'],
      es: ['El “polo de mínimo consumo” se sitúa normalmente algo por debajo o al inicio de la zona de par máximo, con el acelerador pisado alrededor del 75 %.', 'La zona corresponde a la parte inferior de la franja verde del cuentarrevoluciones; en ella, la misma potencia puede obtenerse con menos combustible.'],
    },
  },
  {
    code: '2',
    title: { pt: 'Zona ótima de utilização do conta-rotações', es: 'Zona óptima de utilización del cuentarrevoluciones' },
    concept: {
      pt: 'O conta-rotações mostra o regime do motor em rpm e, nos veículos industriais, assinala zonas de utilização. Serve para manter o motor na faixa em que entrega força útil sem consumo e desgaste excessivos.',
      es: 'El cuentarrevoluciones muestra el régimen del motor en rpm y, en vehículos industriales, señala zonas de utilización. Sirve para mantener el motor en la franja que entrega fuerza útil sin consumo y desgaste excesivos.',
    },
    essentials: {
      pt: ['A zona económica combina máximo aproveitamento do combustível com par útil.', 'O conta-rotações é uma ferramenta para escolher o momento de mudar de marcha, não apenas um indicador de velocidade.'],
      es: ['La zona económica combina máximo aprovechamiento del combustible con par útil.', 'El cuentarrevoluciones es una herramienta para elegir el momento de cambiar de marcha, no solo un indicador de velocidad.'],
    },
  },
  {
    code: '2.1',
    title: { pt: 'Leitura e interpretação do conta-rotações', es: 'Lectura e interpretación del cuentarrevoluciones' },
    concept: {
      pt: 'A área vermelha ou laranja é zona de risco: rotações excessivas aumentam consumo e podem danificar o motor. A área verde é a zona económica, onde o motor se aproxima do melhor compromisso entre par e consumo.',
      es: 'La zona roja o naranja es zona de riesgo: revoluciones excesivas aumentan el consumo y pueden dañar el motor. La zona verde es la zona económica, donde el motor se aproxima al mejor equilibrio entre par y consumo.',
    },
    essentials: {
      pt: ['O texto do livro indica zona perigosa a partir de aproximadamente 2.300 rpm e zona de melhor empuxo aproximadamente entre 1.100 e 1.600 rpm; confirme sempre o instrumento do veículo concreto.', 'O EDC pode cortar a injeção para evitar exceder o regime máximo.', 'O limite inferior corresponde ao ralenti; o superior, ao corte de injeção.'],
      es: ['El texto del libro indica zona peligrosa a partir de unas 2.300 rpm y zona de mejor empuje aproximadamente entre 1.100 y 1.600 rpm; confirma siempre el instrumento del vehículo concreto.', 'El EDC puede cortar la inyección para evitar superar el régimen máximo.', 'El límite inferior corresponde al ralentí; el superior, al corte de inyección.'],
    },
  },
  {
    code: '2.2',
    title: { pt: 'Rotações do motor', es: 'Revoluciones del motor' },
    concept: {
      pt: 'A posição do acelerador e as rpm determinam o consumo. A técnica eficiente procura a maior relação de caixa compatível com a situação, mantendo o motor na zona verde.',
      es: 'La posición del acelerador y las rpm determinan el consumo. La técnica eficiente busca la relación de caja más larga compatible con la situación, manteniendo el motor en la zona verde.',
    },
    essentials: {
      pt: ['Em terreno plano, a agulha deve ficar mais para a esquerda da zona verde; numa subida, mais para a direita.', 'Zona alta: mais consumo e menos par do que na faixa média; zona baixa: queda brusca de par.', 'Menores rpm reduzem perdas por atrito, desde que o motor não fique abaixo da faixa de funcionamento útil.'],
      es: ['En llano, la aguja debe situarse más a la izquierda de la zona verde; en una subida, más a la derecha.', 'Zona alta: más consumo y menos par que en la franja media; zona baja: caída brusca de par.', 'Menores rpm reducen pérdidas por rozamiento, siempre que el motor no quede por debajo de la franja útil.'],
    },
  },
  {
    code: '3',
    title: { pt: 'Diagramas de cobertura das relações da caixa', es: 'Diagramas de cobertura de las relaciones de caja' },
    concept: {
      pt: 'A caixa adapta o par do motor ao arranque, às subidas, descidas, carga e velocidade. Os diagramas representam como cada mudança cobre uma parte da faixa de rotações útil.',
      es: 'La caja adapta el par del motor al arranque, a subidas, bajadas, carga y velocidad. Los diagramas representan cómo cada marcha cubre una parte de la franja de revoluciones útil.',
    },
    essentials: {
      pt: ['Uma caixa com relações bem escalonadas ajuda a manter o motor perto do par útil.', 'Mais relações permitem mudanças menores entre velocidades e podem reduzir consumo, ruído e emissões.'],
      es: ['Una caja con relaciones bien escalonadas ayuda a mantener el motor cerca del par útil.', 'Más relaciones permiten saltos menores entre velocidades y pueden reducir consumo, ruido y emisiones.'],
    },
  },
  {
    code: '3.1',
    title: { pt: 'Funcionamento da caixa de velocidades', es: 'Funcionamiento de la caja de velocidades' },
    concept: {
      pt: 'Os trens de engrenagens alteram a relação entre o giro do motor e o giro das rodas. Um pinhão conduzido com mais dentes gira mais devagar, mas aumenta o par; com menos dentes, gira mais depressa e reduz o par.',
      es: 'Los trenes de engranajes alteran la relación entre el giro del motor y el giro de las ruedas. Un piñón conducido con más dientes gira más despacio, pero aumenta el par; con menos dientes, gira más deprisa y reduce el par.',
    },
    essentials: {
      pt: ['Marcha curta: mais desmultiplicação, mais força nas rodas e menos velocidade.', 'Marcha longa: menos par nas rodas, mais velocidade e normalmente menos rpm para a mesma marcha.', 'Numa caixa de cinco velocidades, a quarta é direta; a marcha-atrás é geralmente a de maior desmultiplicação.'],
      es: ['Marcha corta: más desmultiplicación, más fuerza en las ruedas y menos velocidad.', 'Marcha larga: menos par en las ruedas, más velocidad y normalmente menos rpm para la misma marcha.', 'En una caja de cinco velocidades, la cuarta es directa; la marcha atrás suele ser la de mayor desmultiplicación.'],
    },
  },
  {
    code: '3.2',
    title: { pt: 'Leitura dos diagramas de cobertura', es: 'Lectura de los diagramas de cobertura' },
    concept: {
      pt: 'No diagrama, as curvas do motor e as faixas de cada mudança mostram onde efetuar trocas para não sair da zona de resposta. A curva de par atinge o pico antes da de potência.',
      es: 'En el diagrama, las curvas del motor y las franjas de cada marcha muestran dónde efectuar cambios para no salir de la zona de respuesta. La curva de par alcanza su pico antes que la de potencia.',
    },
    essentials: {
      pt: ['A proximidade das relações numa caixa de oito velocidades permite utilizar melhor o par do que numa de seis.', 'O condutor deve combinar posição do acelerador e mudança para entregar a potência necessária com o menor consumo; numa automática, a eletrónica faz essa seleção.'],
      es: ['La proximidad de las relaciones en una caja de ocho velocidades permite aprovechar mejor el par que en una de seis.', 'El conductor debe combinar posición del acelerador y marcha para entregar la potencia necesaria con el menor consumo; en una automática, la electrónica realiza esa selección.'],
    },
  },
];

export const common12DetailedSummary: DetailedSummaryItem[] = [
  {
    code: '1',
    title: { pt: 'Limites de utilização dos travões e retardadores', es: 'Límites de utilización de los frenos y los ralentizadores' },
    concept: {
      pt: 'Uma travagem segura é antecipada, suave e progressiva. A meta é reduzir velocidade sem exceder a aderência disponível, sem bloquear rodas e sem sobrecarregar o travão de serviço.',
      es: 'Una frenada segura es anticipada, suave y progresiva. La meta es reducir velocidad sin superar la adherencia disponible, sin bloquear ruedas y sin sobrecargar el freno de servicio.',
    },
    essentials: {
      pt: ['Pneus, pressão no pedal, pavimento, massa, velocidade, estiva e estado dos travões determinam a eficácia.', 'Travões desiguais fazem o veículo desviar para o lado da roda que trava mais.', 'Com pouca aderência nas rodas motrizes, os retardadores devem ser desativados.'],
      es: ['Neumáticos, presión del pedal, pavimento, masa, velocidad, estiba y estado de los frenos determinan la eficacia.', 'Frenos desiguales hacen que el vehículo se desvíe hacia el lado de la rueda que frena más.', 'Con poca adherencia en las ruedas motrices deben desconectarse los ralentizadores.'],
    },
  },
  {
    code: '2',
    title: { pt: 'Utilização combinada de travões e retardador', es: 'Utilización combinada de frenos y ralentizador' },
    concept: {
      pt: 'Ao travar, a energia cinética transforma-se em calor. Se esse calor não for dissipado, o travão perde eficácia; por isso, motor e retardadores devem aliviar o travão de serviço.',
      es: 'Al frenar, la energía cinética se transforma en calor. Si ese calor no se disipa, el freno pierde eficacia; por eso, motor y ralentizadores deben aliviar el freno de servicio.',
    },
    essentials: {
      pt: ['A combinação correta reduz temperatura, desgaste e risco de falha.', 'O calor resulta do atrito nos elementos de travagem e dos pneus com o asfalto.'],
      es: ['La combinación correcta reduce temperatura, desgaste y riesgo de fallo.', 'El calor resulta del rozamiento en los elementos de frenado y de los neumáticos con el asfalto.'],
    },
  },
  {
    code: '2.1',
    title: { pt: 'Sistemas de travagem', es: 'Sistemas de frenado' },
    concept: {
      pt: 'O veículo pesado deve ter travão de serviço, de estacionamento e de socorro/emergência. A redundância de circuitos permite conservar uma capacidade de travagem quando um circuito falha.',
      es: 'El vehículo pesado debe tener freno de servicio, estacionamiento y socorro/emergencia. La redundancia de circuitos permite conservar capacidad de frenado cuando falla un circuito.',
    },
    essentials: {
      pt: ['O travão de serviço aplica-se forte no início e reduz-se progressivamente com a diminuição da velocidade.', 'O estacionamento imobiliza o veículo, atua de forma independente e pode ser usado em emergência; não se deve usar com travões quentes.', 'Ao acionar o estacionamento, a regulação ABS deixa de atuar.'],
      es: ['El freno de servicio se aplica con presión al inicio y se reduce progresivamente al disminuir la velocidad.', 'El estacionamiento inmoviliza el vehículo, actúa de forma independiente y puede usarse en emergencia; no debe usarse con frenos calientes.', 'Al accionar el estacionamiento, la regulación ABS deja de actuar.'],
    },
  },
  {
    code: '2.2',
    title: { pt: 'Travões auxiliares (retardadores)', es: 'Frenos auxiliares (ralentizadores)' },
    concept: {
      pt: 'Os retardadores retêm o veículo em descidas, atuando na transmissão ou no motor, e não diretamente nas rodas. São auxiliares: preservam o travão de serviço e elevam a segurança.',
      es: 'Los ralentizadores retienen el vehículo en descensos, actuando en la transmisión o en el motor, y no directamente sobre las ruedas. Son auxiliares: preservan el freno de servicio y elevan la seguridad.',
    },
    essentials: {
      pt: ['Podem ser pneumáticos, hidráulicos/hidrodinâmicos ou eletromagnéticos.', 'Podem ser acionados manualmente ou automaticamente em conjunto com outros sistemas.'],
      es: ['Pueden ser neumáticos, hidráulicos/hidrodinámicos o electromagnéticos.', 'Pueden accionarse manualmente o automáticamente junto a otros sistemas.'],
    },
  },
  {
    code: '2.2.1',
    title: { pt: 'Travão-motor', es: 'Freno motor' },
    concept: {
      pt: 'Funciona ao soltar o acelerador com uma mudança engrenada: deixa de haver injeção e a resistência interna do motor retém as rodas motrizes. É mais eficaz com maior regime de motor e relação mais curta.',
      es: 'Funciona al soltar el acelerador con una marcha engranada: deja de haber inyección y la resistencia interna del motor retiene las ruedas motrices. Es más eficaz con mayor régimen de motor y relación más corta.',
    },
    essentials: {
      pt: ['A eficácia depende do tipo de motor, das rpm e da desmultiplicação da transmissão.', 'O travão no escape limita a saída dos gases e aumenta a resistência ao movimento dos pistões.', 'Quanto mais baixa a relação de mudança, maior a retenção pelo motor.'],
      es: ['La eficacia depende del tipo de motor, de las rpm y de la desmultiplicación de la transmisión.', 'El freno de escape limita la salida de gases y aumenta la resistencia al movimiento de los pistones.', 'Cuanto más baja sea la relación de cambio, mayor será la retención por el motor.'],
    },
  },
  {
    code: '2.2.2',
    title: { pt: 'Travão elétrico ou retardador', es: 'Freno eléctrico o ralentizador' },
    concept: {
      pt: 'O retardador elétrico atua sobre a árvore de transmissão por um campo magnético alimentado pela bateria. Reduz as rotações da transmissão e diminui o uso do travão de serviço.',
      es: 'El ralentizador eléctrico actúa sobre el árbol de transmisión mediante un campo magnético alimentado por la batería. Reduce las revoluciones de la transmisión y disminuye el uso del freno de servicio.',
    },
    essentials: {
      pt: ['É mais eficaz com mais rpm e maior fornecimento de eletricidade.', 'Não há fricção, mas o uso abusivo pode causar sobreaquecimento.', 'Pode atuar pelo pedal ou combinado com o travão de serviço.'],
      es: ['Es más eficaz con más rpm y mayor suministro de electricidad.', 'No hay fricción, pero el uso abusivo puede causar sobrecalentamiento.', 'Puede actuar mediante el pedal o combinado con el freno de servicio.'],
    },
  },
  {
    code: '2.2.3',
    title: { pt: 'Retardador hidráulico ou hidrodinâmico', es: 'Retardador hidráulico o hidrodinámico' },
    concept: {
      pt: 'É um dispositivo com rotor e estátor, instalado na caixa, que trava a transmissão pela energia do óleo em circulação. Para uso continuado, o livro indica manter o motor pelo menos a 1.500 rpm.',
      es: 'Es un dispositivo con rotor y estátor, instalado en la caja, que frena la transmisión mediante la energía del aceite en circulación. Para uso continuado, el libro indica mantener el motor al menos a 1.500 rpm.',
    },
    essentials: {
      pt: ['Primário: no eixo primário, vantajoso a baixa velocidade; secundário: vantajoso em descidas longas.', 'Intarder fica no secundário da caixa; retarder fica na árvore de transmissão.', 'Usar progressivamente; exige troca periódica de óleo e é compatível com ABS.'],
      es: ['Primario: en el eje primario, ventajoso a baja velocidad; secundario: ventajoso en descensos largos.', 'El intarder se sitúa en el secundario de la caja; el retarder en el árbol de transmisión.', 'Debe usarse progresivamente; exige cambio periódico de aceite y es compatible con ABS.'],
    },
  },
  {
    code: '3',
    title: { pt: 'Combinação entre velocidade e relação de transmissão', es: 'Combinación entre velocidad y relación de transmisión' },
    concept: {
      pt: 'A mudança selecionada deve manter o motor na zona económica, considerando velocidade, perfil da estrada, massa do veículo e carga. A caixa adapta o giro do motor à força exigida pelo deslocamento.',
      es: 'La marcha seleccionada debe mantener el motor en la zona económica, considerando velocidad, perfil de la carretera, masa del vehículo y carga. La caja adapta el giro del motor a la fuerza exigida por el desplazamiento.',
    },
    essentials: {
      pt: ['Relação curta: mais força e menos velocidade; relação longa: mais velocidade e menos força.', 'A quarta de uma caixa de cinco é direta, pois liga diretamente os eixos primário e secundário.', 'Existem caixas manuais, automáticas e automatizadas.'],
      es: ['Relación corta: más fuerza y menos velocidad; relación larga: más velocidad y menos fuerza.', 'La cuarta de una caja de cinco es directa, porque une directamente los ejes primario y secundario.', 'Existen cajas manuales, automáticas y automatizadas.'],
    },
  },
  {
    code: '4',
    title: { pt: 'Utilização da inércia do veículo', es: 'Utilización de la inercia del vehículo' },
    concept: {
      pt: 'A inércia dinâmica é a energia cinética acumulada pelo veículo em movimento. Depende da massa e, sobretudo, do quadrado da velocidade: EC = ½ × massa × velocidade².',
      es: 'La inercia dinámica es la energía cinética acumulada por el vehículo en movimiento. Depende de la masa y, sobre todo, del cuadrado de la velocidad: EC = ½ × masa × velocidad².',
    },
    essentials: {
      pt: ['Antecipar permite soltar o acelerador com antecedência, manter mudança engrenada e reduzir consumo até consumo nulo em condições adequadas.', 'Evite acelerações e travagens desnecessárias; mantenha distância para ter visibilidade e tempo de usar a inércia.', 'Mudanças rápidas para relações mais longas reduzem a perda de inércia.'],
      es: ['Anticipar permite soltar el acelerador con antelación, mantener una marcha engranada y reducir el consumo hasta consumo nulo en condiciones adecuadas.', 'Evita aceleraciones y frenadas innecesarias; mantén distancia para tener visibilidad y tiempo para usar la inercia.', 'Los cambios rápidos a relaciones más largas reducen la pérdida de inercia.'],
    },
  },
  {
    code: '5',
    title: { pt: 'Retardação e travagem em descidas', es: 'Ralentización y frenado en descensos' },
    concept: {
      pt: 'Antes de uma descida prolongada, reduza a velocidade e use preferencialmente o retardador. Se a velocidade aumentar, aplique o travão de serviço progressivamente e selecione uma relação mais curta.',
      es: 'Antes de un descenso prolongado, reduce la velocidad y usa preferentemente el ralentizador. Si aumenta la velocidad, aplica el freno de servicio progresivamente y selecciona una relación más corta.',
    },
    essentials: {
      pt: ['O livro indica reduzir até 20 km/h abaixo da velocidade considerada segura antes de gerir a descida.', 'Fading é o sobreaquecimento do travão de serviço que reduz o atrito e a eficácia; os retardadores ajudam a evitá-lo.', 'Maior regime de motor e relação de caixa mais baixa aumentam a retenção do travão-motor.'],
      es: ['El libro indica reducir hasta 20 km/h por debajo de la velocidad considerada segura antes de gestionar el descenso.', 'El fading es el sobrecalentamiento del freno de servicio que reduce el rozamiento y la eficacia; los ralentizadores ayudan a evitarlo.', 'Mayor régimen de motor y relación de caja más baja aumentan la retención del freno motor.'],
    },
  },
  {
    code: '6',
    title: { pt: 'Ações em caso de falha', es: 'Acciones en caso de fallo' },
    concept: {
      pt: 'Perante falha de travões, sobretudo numa descida, deixe de acelerar, reduza mudanças e utilize todos os meios de retenção disponíveis. A reação deve adaptar-se a reta, curva ou declive.',
      es: 'Ante un fallo de frenos, sobre todo en un descenso, deja de acelerar, reduce marchas y utiliza todos los medios de retención disponibles. La reacción debe adaptarse a recta, curva o pendiente.',
    },
    essentials: {
      pt: ['Pedal esponjoso sugere ar; pedal quase ao fundo sugere perda de líquido; maior esforço pode indicar aquecimento ou desgaste.', 'Humidade exige secagem com travagens suaves e repetidas; travagem desigual exige reparação imediata.', 'Em descida: fique junto ao bordo direito se seguro, use travão-motor e retardadores; em emergência, pode usar o travão de estacionamento.'],
      es: ['Pedal esponjoso sugiere aire; pedal casi al fondo sugiere pérdida de líquido; mayor esfuerzo puede indicar calentamiento o desgaste.', 'La humedad exige secado con frenadas suaves y repetidas; la frenada desigual requiere reparación inmediata.', 'En descenso: circula junto al borde derecho si es seguro, usa freno motor y ralentizadores; en emergencia puede usarse el freno de estacionamiento.'],
    },
  },
  {
    code: '7',
    title: { pt: 'Programa eletrónico de estabilidade (ESP)', es: 'Programa electrónico de estabilidad (ESP)' },
    concept: {
      pt: 'O ESP deteta o início de derrapagem do eixo dianteiro ou traseiro e trava as rodas necessárias para manter a trajetória; em alguns veículos também reduz a força que chega do motor.',
      es: 'El ESP detecta el inicio de derrape del eje delantero o trasero y frena las ruedas necesarias para mantener la trayectoria; en algunos vehículos también reduce la fuerza que llega del motor.',
    },
    essentials: {
      pt: ['Derrapagem traseira em curva: trava a roda dianteira exterior.', 'Derrapagem dianteira em curva: trava a roda traseira interior.', 'Corrige subviragem e apoia-se em sistemas como ABS e ASR.'],
      es: ['Derrape trasero en curva: frena la rueda delantera exterior.', 'Derrape delantero en curva: frena la rueda trasera interior.', 'Corrige el subviraje y se apoya en sistemas como ABS y ASR.'],
    },
  },
  {
    code: '8',
    title: { pt: 'AEBS e EBS', es: 'AEBS y EBS' },
    concept: {
      pt: 'O AEBS reduz automaticamente a velocidade quando deteta risco de colisão e aumenta a pressão se a travagem do condutor for insuficiente. O EBS comanda os cilindros de serviço de forma imediata, simultânea e uniforme.',
      es: 'El AEBS reduce automáticamente la velocidad cuando detecta riesgo de colisión y aumenta la presión si la frenada del conductor es insuficiente. El EBS manda los cilindros de servicio de forma inmediata, simultánea y uniforme.',
    },
    essentials: {
      pt: ['AEBS = travagem automática de emergência por risco de colisão.', 'EBS sincroniza aplicação e libertação dos travões e pode encurtar a distância de travagem.'],
      es: ['AEBS = frenado automático de emergencia por riesgo de colisión.', 'EBS sincroniza aplicación y liberación de los frenos y puede acortar la distancia de frenado.'],
    },
  },
  {
    code: '9',
    title: { pt: 'Assistência à travagem de emergência (BAS)', es: 'Asistencia a la frenada de emergencia (BAS)' },
    concept: {
      pt: 'O BAS reconhece a rapidez ou força aplicada ao pedal numa emergência e multiplica a pressão de travagem para tornar a paragem mais eficaz.',
      es: 'El BAS reconoce la rapidez o fuerza aplicada al pedal en una emergencia y multiplica la presión de frenado para hacer más eficaz la detención.',
    },
    essentials: {
      pt: ['É um sistema de segurança ativa; não substitui distância, velocidade adequada nem atenção.', 'Atua com comando eletrónico associado ao travão pneumático convencional.'],
      es: ['Es un sistema de seguridad activa; no sustituye distancia, velocidad adecuada ni atención.', 'Actúa con mando electrónico asociado al freno neumático convencional.'],
    },
  },
  {
    code: '10',
    title: { pt: 'Distribuição eletrónica da força de travagem (EBV)', es: 'Distribución electrónica de la fuerza de frenado (EBV)' },
    concept: {
      pt: 'O EBV, também designado EBD por alguns fabricantes, regula a repartição de travagem entre os eixos dianteiro e traseiro conforme a massa apoiada em cada um.',
      es: 'El EBV, también denominado EBD por algunos fabricantes, regula el reparto de frenado entre los ejes delantero y trasero conforme a la masa apoyada en cada uno.',
    },
    essentials: {
      pt: ['A função-chave é distribuir a força, não evitar diretamente o bloqueio.', 'A carga e a sua distribuição alteram a massa sobre cada eixo.'],
      es: ['La función clave es repartir la fuerza, no evitar directamente el bloqueo.', 'La carga y su distribución alteran la masa sobre cada eje.'],
    },
  },
  {
    code: '11',
    title: { pt: 'Sistema antibloqueio (ABS)', es: 'Sistema antibloqueo (ABS)' },
    concept: {
      pt: 'O ABS evita que as rodas bloqueiem numa travagem brusca. Com sensores que comparam a velocidade angular das rodas, reduz temporariamente a pressão na roda prestes a bloquear.',
      es: 'El ABS evita que las ruedas se bloqueen en una frenada brusca. Con sensores que comparan la velocidad angular de las ruedas, reduce temporalmente la presión en la rueda que va a bloquearse.',
    },
    essentials: {
      pt: ['Numa emergência com ABS, o condutor pode pressionar o pedal a fundo; o sistema modula a pressão.', 'Mantém direcionalidade, reduz risco de derrapagem e melhora a travagem em piso molhado.', 'Não reduz muito a distância no seco e pode aumentá-la em gravilha, gelo ou neve.'],
      es: ['En una emergencia con ABS, el conductor puede pisar el pedal a fondo; el sistema modula la presión.', 'Mantiene direccionalidad, reduce el riesgo de derrape y mejora la frenada en firme mojado.', 'No reduce mucho la distancia en seco y puede aumentarla en grava, hielo o nieve.'],
    },
  },
  {
    code: '12',
    title: { pt: 'Controlo de tração: TCS, ASR e EDS', es: 'Control de tracción: TCS, ASR y EDS' },
    concept: {
      pt: 'Estes sistemas evitam a perda de tração das rodas motrizes em baixa aderência. Usam informação semelhante à do ABS e podem reduzir potência do motor ou travar uma roda motriz que patina.',
      es: 'Estos sistemas evitan la pérdida de tracción de las ruedas motrices con baja adherencia. Usan información semejante a la del ABS y pueden reducir potencia del motor o frenar una rueda motriz que patina.',
    },
    essentials: {
      pt: ['Se ambas as rodas motrizes patinam, reduz potência; se apenas uma patina, pode travá-la.', 'Pode ser desligado temporariamente, por exemplo, com correntes de neve.', 'EDS ajuda no arranque em pavimento escorregadio.'],
      es: ['Si patinan ambas ruedas motrices, reduce potencia; si patina solo una, puede frenarla.', 'Puede desconectarse temporalmente, por ejemplo, con cadenas de nieve.', 'El EDS ayuda al arranque en firme deslizante.'],
    },
  },
  {
    code: '13',
    title: { pt: 'Sistemas de vigilância do veículo (IVMS)', es: 'Sistemas de vigilancia del vehículo (IVMS)' },
    concept: {
      pt: 'Os IVMS combinam dispositivo embarcado e software para localizar a frota, recolher dados e enviá-los à base de operações.',
      es: 'Los IVMS combinan dispositivo embarcado y software para localizar la flota, recoger datos y enviarlos a la base de operaciones.',
    },
    essentials: {
      pt: ['Permitem geolocalização, estimativa de entrega e acompanhamento do estilo de condução.', 'Podem registar consumo, ralenti, zonas de consumo, distribuição de carga e interior do veículo.', 'Podem apoiar o controlo de tempos, alertas de cinto/velocidade e botões de pânico.'],
      es: ['Permiten geolocalización, estimación de entrega y seguimiento del estilo de conducción.', 'Pueden registrar consumo, ralentí, zonas de consumo, distribución de carga e interior del vehículo.', 'Pueden apoyar el control de tiempos, alertas de cinturón/velocidad y botones de pánico.'],
    },
  },
  {
    code: '14',
    title: { pt: 'Outros dispositivos de automação ou ajuda à condução', es: 'Otros dispositivos de automatización o ayuda a la conducción' },
    concept: {
      pt: 'Os ADAS usam visão artificial para reconhecer via, limites, veículos, peões e ciclistas, avaliando o risco antes que se transforme numa situação crítica.',
      es: 'Los ADAS usan visión artificial para reconocer vía, límites, vehículos, peatones y ciclistas, evaluando el riesgo antes de que se transforme en una situación crítica.',
    },
    essentials: {
      pt: ['Radar mede distância, ângulo e velocidade por ondas refletidas.', 'Lidar/láser calcula distâncias pelo tempo de retorno do pulso e ajuda a reconhecer limites e espaço livre.', 'Câmaras processam cor, textura, forma e padrões visuais do ambiente.'],
      es: ['El radar mide distancia, ángulo y velocidad mediante ondas reflejadas.', 'El lidar/láser calcula distancias por el tiempo de retorno del pulso y ayuda a reconocer límites y espacio libre.', 'Las cámaras procesan color, textura, forma y patrones visuales del entorno.'],
    },
  },
  {
    code: '14.1',
    title: { pt: 'Principais funções ADAS', es: 'Principales funciones ADAS' },
    concept: {
      pt: 'Cada sigla identifica uma função de aviso ou assistência: alertar, manter trajetória, regular distância, reconhecer sinais ou detetar risco em ângulos mortos.',
      es: 'Cada sigla identifica una función de aviso o asistencia: alertar, mantener trayectoria, regular distancia, reconocer señales o detectar riesgo en ángulos muertos.',
    },
    essentials: {
      pt: ['FCW/PCS: alerta de colisão frontal; LDW: alerta de saída de faixa; LKA: mantém o veículo na faixa.', 'PCW: alerta para peões/ciclistas; HMW: mede distância de segurança; ACC: regula velocidade e distância ao veículo da frente.', 'SLI/TSR: indicam ou reconhecem limites/sinais; BSM: ângulo morto; IHC: comutação automática entre máximos e médios.'],
      es: ['FCW/PCS: alerta de colisión frontal; LDW: alerta de salida de carril; LKA: mantiene el vehículo en el carril.', 'PCW: alerta para peatones/ciclistas; HMW: mide distancia de seguridad; ACC: regula velocidad y distancia con el vehículo precedente.', 'SLI/TSR: indican o reconocen límites/señales; BSM: ángulo muerto; IHC: conmutación automática entre luces de carretera y cruce.'],
    },
  },
];

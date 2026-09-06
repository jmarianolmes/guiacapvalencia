export type Language = 'pt' | 'es';

import { objetivo11Literal, objetivo12Literal } from './temarioLiterales';
import { common11DetailedSummary, common12DetailedSummary, type DetailedSummaryItem } from './temarioDetailedSummaries';

type Localized = Record<Language, string>;

type FullReadingItem = {
  label: string;
  body: string;
};

type FullReadingBlock = {
  title: Localized;
  paragraphs?: string[];
  bullets?: string[];
  items?: FullReadingItem[];
};

type FullReading = {
  note: Localized;
  literalText?: string;
  blocks?: FullReadingBlock[];
};

export type TemarioTopic = {
  id: string;
  code: string;
  title: Localized;
  summary: Localized;
  points: Record<Language, string[]>;
  detailedSummary?: DetailedSummaryItem[];
  sourceIds: string[];
  fullReading?: FullReading;
};

export type TemarioBlock = {
  id: string;
  title: Localized;
  description: Localized;
  accent: 'emerald' | 'cyan' | 'violet';
  topics: TemarioTopic[];
};

export type Temario = {
  id: 'common' | 'goods';
  title: Localized;
  subtitle: Localized;
  blocks: TemarioBlock[];
};

export const temarioSources = [
  {
    id: 'cap',
    label: 'Real Decreto 284/2021 — programa CAP',
    url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2021-6624',
  },
  {
    id: 'dgt-efficient',
    label: 'DGT — Conducción eficiente',
    url: 'https://www.dgt.es/muevete-con-seguridad/conviertete-en-un-buen-conductor/consejos-generales/conduccion-eficiente/',
  },
  {
    id: 'dgt-adas',
    label: 'DGT — Sistemas ADAS',
    url: 'https://www.dgt.es/muevete-con-seguridad/sistemas-avanzados-ayuda-conduccion/Sistemas-avanzados-de-ayuda-a-la-conduccion-ADAS-/',
  },
  {
    id: 'eu-rest',
    label: 'EUR-Lex — tempos de condução e descanso',
    url: 'https://eur-lex.europa.eu/ES/legal-content/summary/driving-time-and-rest-periods-in-the-road-transport-sector.html',
  },
  {
    id: 'tacho',
    label: 'Ministério da Indústria — Tacógrafos',
    url: 'https://industria.gob.es/Calidad-Industrial/vehiculos/Paginas/tacografos.aspx',
  },
  {
    id: 'insst',
    label: 'INSST — Seguridad vial laboral',
    url: 'https://www.insst.es/materias/transversales/seguridad-vial-laboral',
  },
  {
    id: 'contract',
    label: 'Lei 15/2009 — contrato de transporte terrestre',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2009-18004',
  },
  {
    id: 'cargo',
    label: 'Guia europeia de fixação de cargas',
    url: 'https://op.europa.eu/en/publication-detail/-/publication/30c7c1dc-f26e-44af-bd4c-2434b43edd7e',
  },
  {
    id: 'cargo-module',
    label: 'CAP — sujeción de cargas',
    url: 'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion4-modulo6',
  },
] as const;

const comunes: Temario = {
  id: 'common',
  title: { pt: 'CAP Comunes', es: 'CAP Comunes' },
  subtitle: {
    pt: 'Base comum para transporte profissional: condução racional, regulamentação, segurança, saúde e serviço.',
    es: 'Base común del transporte profesional: conducción racional, reglamentación, seguridad, salud y servicio.',
  },
  blocks: [
    {
      id: 'common-driving',
      title: { pt: 'Bloco 1 — Condução racional e segurança', es: 'Bloque 1 — Conducción racional y seguridad' },
      description: {
        pt: 'Como utilizar o veículo com eficiência, preservar seus sistemas e antecipar riscos.',
        es: 'Cómo utilizar el vehículo con eficiencia, preservar sus sistemas y anticipar riesgos.',
      },
      accent: 'emerald',
      topics: [
        {
          id: 'common-11', code: 'Objetivo 1.1',
          title: { pt: 'Conhecer as características da cadeia cinemática para otimizar sua utilização', es: 'Conocer las características de la cadena cinemática para optimizar su utilización' },
          summary: {
            pt: 'Este objetivo explica como a energia do combustível se transforma em movimento e como a caixa de velocidades permite adaptar força, rotação e velocidade às condições reais de circulação.',
            es: 'Este objetivo explica cómo la energía del combustible se transforma en movimiento y cómo la caja de velocidades permite adaptar fuerza, régimen y velocidad a las condiciones reales de circulación.',
          },
          points: {
            pt: ['A cadeia cinemática reúne motor, embreagem, caixa de velocidades, árvore de transmissão, grupo cónico-diferencial, semieixos e rodas. O motor cria energia mecânica a partir do combustível; a transmissão desmultiplica e encaminha essa energia até às rodas motrizes, onde se converte em tração. A força necessária varia com a inclinação, a massa total e a velocidade pretendida.', 'Par é a força de rotação. O par motor nasce da pressão dos gases queimados sobre o pistão e é transmitido ao virabrequim; mede-se normalmente em Nm. O enchimento do cilindro, a quantidade de ar, a combustão e o regime de rotações condicionam o par. Em rotações muito altas há menos tempo para entrada de ar e queima adequada, por isso o par deixa de aumentar e pode diminuir.', 'O par máximo representa o maior esforço que o motor entrega num determinado regime, habitualmente intermédio. Um motor elástico mantém valores altos de par numa faixa ampla de rotações. Já o par na roda é o esforço efetivamente aplicado às rodas motrizes: a caixa e o grupo cónico reduzem a rotação e multiplicam o par, pelo que uma relação curta oferece mais força e menos velocidade.', 'Potência é a rapidez com que o motor realiza trabalho e resulta da combinação entre par e número de rotações. Expressa-se em W, kW ou CV; a equivalência apresentada no livro é 1 kW = 1,36 CV e 1 CV = 0,736 kW. O valor máximo de potência não coincide com o de par máximo: o par culmina antes, enquanto a potência aumenta até rotações mais elevadas.', 'O consumo específico relaciona combustível e potência produzida. A melhor eficiência ocorre próximo da zona de par máximo e com carga adequada, não em rotações excessivas. O conta-rotações indica a zona económica: marcha longa quando as condições permitem, rotações médias e utilização correta da caixa reduzem consumo, ruído e desgaste. Os diagramas de cobertura mostram como as relações de caixa mantêm o motor na faixa útil.'],
            es: ['La cadena cinemática reúne motor, embrague, caja de velocidades, árbol de transmisión, grupo cónico-diferencial, palieres y ruedas. El motor crea energía mecánica a partir del combustible; la transmisión desmultiplica y conduce esa energía hasta las ruedas motrices, donde se convierte en tracción. La fuerza necesaria varía con la pendiente, la masa total y la velocidad deseada.', 'El par es la fuerza de rotación. En el motor nace de la presión de los gases quemados sobre el pistón y se transmite al cigüeñal; se mide habitualmente en Nm. El llenado del cilindro, la cantidad de aire, la combustión y el régimen de giro condicionan el par. A revoluciones muy altas hay menos tiempo para la entrada de aire y la combustión adecuada, por lo que el par deja de aumentar y puede disminuir.', 'El par máximo representa el mayor esfuerzo que entrega el motor a un régimen determinado, normalmente intermedio. Un motor elástico conserva valores elevados de par en una gama amplia de revoluciones. El par en rueda es el esfuerzo aplicado realmente a las ruedas motrices: la caja y el grupo cónico reducen el giro y multiplican el par, por lo que una relación corta ofrece más fuerza y menos velocidad.', 'La potencia es la rapidez con que el motor realiza trabajo y resulta de combinar par y número de revoluciones. Se expresa en W, kW o CV; la equivalencia indicada en el libro es 1 kW = 1,36 CV y 1 CV = 0,736 kW. El valor máximo de potencia no coincide con el de par máximo: el par culmina antes, mientras que la potencia aumenta hasta regímenes más altos.', 'El consumo específico relaciona combustible y potencia producida. La mejor eficiencia se consigue cerca de la zona de par máximo y con carga adecuada, no a revoluciones excesivas. El cuentarrevoluciones señala la zona económica: una marcha larga cuando las condiciones lo permiten, regímenes medios y el uso correcto de la caja reducen consumo, ruido y desgaste. Los diagramas de cobertura muestran cómo las relaciones de caja mantienen el motor en su zona útil.'],
          }, detailedSummary: common11DetailedSummary, sourceIds: ['cap', 'dgt-efficient'],
          fullReading: {
            note: {
              pt: 'Cópia literal do Objetivo 1.1 da transcrição corrigida fornecida. A numeração, os títulos e os parágrafos foram preservados tal como no material de origem.',
              es: 'Copia literal del Objetivo 1.1 de la transcripción corregida aportada. La numeración, los títulos y los párrafos se han preservado tal como figuran en el material de origen.',
            },
            literalText: objetivo11Literal,
          },
        },
        {
          id: 'common-12', code: 'Objetivo 1.2',
          title: { pt: 'Características técnicas e funcionamento dos dispositivos de segurança', es: 'Características técnicas y funcionamiento de los dispositivos de seguridad' },
          summary: {
            pt: 'Este objetivo reúne a técnica de travagem, os retardadores, a escolha de marcha, a utilização da inércia e os sistemas eletrónicos que ajudam o condutor a manter controlo, estabilidade e segurança.',
            es: 'Este objetivo reúne la técnica de frenado, los ralentizadores, la elección de marcha, el uso de la inercia y los sistemas electrónicos que ayudan al conductor a mantener control, estabilidad y seguridad.',
          },
          points: {
            pt: ['A travagem segura começa pela antecipação. Uma redução progressiva conserva aderência, evita bloqueio, reduz fadiga e desgaste e dá tempo de reação aos restantes utilizadores. A eficácia depende de pneus, pressão no pedal, pavimento, velocidade, massa, distribuição e fixação da carga, bem como do estado de conservação dos travões. Em pouca aderência, os retardadores devem ser desativados.', 'Os veículos pesados dispõem de travão de serviço, de estacionamento e de socorro/emergência. O travão de serviço deve perder pressão à medida que a velocidade baixa, ajudando a estabilizar carga e passageiros. O estacionamento imobiliza o veículo e pode servir como emergência; os circuitos redundantes mantêm uma capacidade de travagem se um circuito falhar.', 'O calor gerado pela travagem pode provocar fading, isto é, perda de eficácia por sobreaquecimento. Por isso, motor e retardadores devem ser usados antes e em conjunto com o travão de serviço. O travão-motor retém com mudança engatada; o elétrico atua na transmissão por campo magnético; o hidráulico usa a circulação de óleo. Cada um diminui o desgaste do travão principal e exige aplicação progressiva.', 'A relação de transmissão deve manter o motor na zona económica e adaptar-se à velocidade, perfil da via, massa do veículo e carga. Relações curtas oferecem mais retenção e força; em descidas prolongadas, reduza a velocidade antes, use retardador e, se necessário, travão de serviço progressivamente até uma margem segura. A inércia permite antecipar, soltar o acelerador com marcha engrenada e evitar travagens desnecessárias.', 'Em falhas de travagem, deixe de acelerar, reduza progressivamente as mudanças e combine os sistemas disponíveis. Reconheça sinais como pedal esponjoso, perda de líquido, aquecimento, humidade, desgaste ou travagem desigual. ESP mantém a trajetória corrigindo derrapagens; ABS evita bloqueio; EBS sincroniza a resposta; AEBS e BAS reforçam a travagem de emergência; EBV distribui a força; ASR/TCS controla a patinagem. ADAS, IVMS e alertas complementam a condução, mas não substituem o condutor.'],
            es: ['La frenada segura empieza por la anticipación. Una reducción progresiva conserva la adherencia, evita el bloqueo, reduce fatiga y desgaste y da tiempo de reacción a los demás usuarios. La eficacia depende de los neumáticos, la presión sobre el pedal, el pavimento, la velocidad, la masa, la distribución y sujeción de la carga, así como del estado de los frenos. Con poca adherencia, deben desconectarse los ralentizadores.', 'Los vehículos pesados disponen de freno de servicio, estacionamiento y socorro/emergencia. El freno de servicio debe perder presión a medida que disminuye la velocidad, ayudando a estabilizar carga y pasajeros. El de estacionamiento inmoviliza el vehículo y puede servir como emergencia; los circuitos redundantes conservan capacidad de frenado si falla uno de ellos.', 'El calor generado por la frenada puede provocar fading, es decir, pérdida de eficacia por sobrecalentamiento. Por eso deben utilizarse el motor y los ralentizadores antes y junto al freno de servicio. El freno motor retiene con una marcha engranada; el eléctrico actúa sobre la transmisión mediante un campo magnético; el hidráulico emplea la circulación de aceite. Cada uno reduce el desgaste del freno principal y requiere una aplicación progresiva.', 'La relación de transmisión debe mantener el motor en la zona económica y adaptarse a velocidad, perfil de la vía, masa del vehículo y carga. Las relaciones cortas ofrecen mayor retención y fuerza; en descensos prolongados hay que reducir la velocidad antes, usar el ralentizador y, si hace falta, el freno de servicio progresivamente hasta un margen seguro. La inercia permite anticipar, soltar el acelerador con una marcha engranada y evitar frenadas innecesarias.', 'Ante fallos de frenado, deja de acelerar, reduce progresivamente las marchas y combina los sistemas disponibles. Reconoce señales como pedal esponjoso, pérdida de líquido, calentamiento, humedad, desgaste o frenada desigual. El ESP mantiene la trayectoria corrigiendo derrapes; el ABS evita el bloqueo; el EBS sincroniza la respuesta; AEBS y BAS refuerzan la frenada de emergencia; el EBV distribuye la fuerza; ASR/TCS controla el patinaje. ADAS, IVMS y las alertas complementan la conducción, pero no sustituyen al conductor.'],
          }, detailedSummary: common12DetailedSummary, sourceIds: ['cap', 'dgt-adas'],
          fullReading: {
            note: {
              pt: 'Cópia literal do Objetivo 1.2 da transcrição corrigida fornecida. A numeração, os títulos e os parágrafos foram preservados tal como no material de origem.',
              es: 'Copia literal del Objetivo 1.2 de la transcripción corregida aportada. La numeración, los títulos y los párrafos se han preservado tal como figuran en el material de origen.',
            },
            literalText: objetivo12Literal,
          },
        },
        {
          id: 'common-13', code: 'Objetivo 1.3',
          title: { pt: 'Otimização de combustível e condução eficiente', es: 'Optimización de combustible y conducción eficiente' },
          summary: {
            pt: 'Condução eficiente busca reduzir consumo e emissões com segurança: planejamento, fluidez, antecipação e manutenção. Não é conduzir mais devagar em qualquer condição; é conduzir de modo estável e adequado.',
            es: 'La conducción eficiente busca reducir consumo y emisiones con seguridad: planificación, fluidez, anticipación y mantenimiento. No es conducir más despacio en cualquier condición; es conducir de forma estable y adecuada.',
          },
          points: {
            pt: ['Planeje rota, horários e paradas para reduzir quilometragem improdutiva e evitar congestionamentos previsíveis.', 'Acelere com suavidade, circule em marcha longa quando seguro e evite frenagens que exigirão nova aceleração.', 'Mantenha pressão de pneus, manutenção, carga e aerodinâmica sob controle; todos influenciam o consumo.', 'Use inércia com responsabilidade: retire o pé do acelerador com antecedência, mantendo distância e marcha engatada quando apropriado.'],
            es: ['Planifica ruta, horarios y paradas para reducir kilómetros improductivos y evitar congestiones previsibles.', 'Acelera con suavidad, circula en marcha larga cuando sea seguro y evita frenadas que exigirán una nueva aceleración.', 'Mantén bajo control presión de neumáticos, mantenimiento, carga y aerodinámica; todos influyen en el consumo.', 'Usa la inercia con responsabilidad: levanta el pie del acelerador con antelación, manteniendo distancia y marcha engranada cuando proceda.'],
          }, sourceIds: ['cap', 'dgt-efficient'],
        },
        {
          id: 'common-13bis', code: 'Objetivo 1.3 bis',
          title: { pt: 'Antecipação de riscos, via, clima e utilizadores vulneráveis', es: 'Anticipación de riesgos, vía, clima y usuarios vulnerables' },
          summary: {
            pt: 'A leitura ativa da via permite detectar perigos antes que se transformem em emergência. O condutor profissional ajusta velocidade, distância e plano de viagem às condições reais.',
            es: 'La lectura activa de la vía permite detectar peligros antes de que se conviertan en emergencia. El conductor profesional ajusta velocidad, distancia y plan de viaje a las condiciones reales.',
          },
          points: {
            pt: ['Avalie geometria da via, tráfego, visibilidade, vento, chuva, gelo e estado do pavimento antes de decidir velocidade e manobra.', 'Planeje deslocamento em condições meteorológicas extraordinárias e saiba quando adiar, interromper ou cancelar a viagem.', 'Amplie o campo visual, identifique situações potencialmente perigosas e preserve margem de segurança.', 'Preste atenção especial a peões, ciclistas, motociclistas e veículos pequenos nos ângulos mortos.'],
            es: ['Evalúa geometría de la vía, tráfico, visibilidad, viento, lluvia, hielo y estado del firme antes de decidir velocidad y maniobra.', 'Planifica el desplazamiento en condiciones meteorológicas extraordinarias y sabe cuándo aplazar, interrumpir o cancelar el viaje.', 'Amplía el campo visual, identifica situaciones potencialmente peligrosas y conserva un margen de seguridad.', 'Presta especial atención a peatones, ciclistas, motociclistas y vehículos pequeños en los ángulos muertos.'],
          }, sourceIds: ['cap', 'dgt-efficient', 'dgt-adas'],
        },
      ],
    },
    {
      id: 'common-regulation',
      title: { pt: 'Bloco 2 — Regulamentação e ambiente social', es: 'Bloque 2 — Reglamentación y entorno social' },
      description: {
        pt: 'Regras sociais do transporte, tacógrafo, qualificação profissional e documentação do condutor.',
        es: 'Reglas sociales del transporte, tacógrafo, cualificación profesional y documentación del conductor.',
      },
      accent: 'cyan',
      topics: [
        {
          id: 'common-21', code: 'Objetivo 2.1',
          title: { pt: 'Jornada, tempos de condução, descanso e tacógrafo', es: 'Jornada, tiempos de conducción, descanso y tacógrafo' },
          summary: {
            pt: 'O transporte profissional combina legislação de tempos sociais, regras de jornada e registo correto de atividades. Organizar o trabalho corretamente é uma responsabilidade do motorista e da empresa.',
            es: 'El transporte profesional combina legislación de tiempos sociales, reglas de jornada y registro correcto de actividades. Organizar el trabajo correctamente es una responsabilidad del conductor y de la empresa.',
          },
          points: {
            pt: ['Memorize as referências-base: 9 h diárias, extensão a 10 h até duas vezes por semana, 56 h semanais, 90 h em duas semanas e pausa de 45 min após 4,5 h.', 'Diferencie pausa, descanso diário, descanso semanal regular e reduzido; registre corretamente condução, outro trabalho, disponibilidade e descanso.', 'Conheça cartões, seletores, entradas manuais, impressões, anomalias e proibição de manipulação do tacógrafo.', 'Verifique documentos obrigatórios do condutor e a validade de CAP, permissões, cartões e certificados aplicáveis.'],
            es: ['Memoriza las referencias básicas: 9 h diarias, ampliación a 10 h hasta dos veces por semana, 56 h semanales, 90 h en dos semanas y pausa de 45 min tras 4,5 h.', 'Diferencia pausa, descanso diario, descanso semanal regular y reducido; registra correctamente conducción, otros trabajos, disponibilidad y descanso.', 'Conoce tarjetas, selectores, entradas manuales, impresiones, anomalías y la prohibición de manipular el tacógrafo.', 'Comprueba los documentos obligatorios del conductor y la vigencia de CAP, permisos, tarjetas y certificados aplicables.'],
          }, sourceIds: ['cap', 'eu-rest', 'tacho'],
        },
      ],
    },
    {
      id: 'common-health',
      title: { pt: 'Bloco 3 — Saúde, segurança viária, serviço e logística', es: 'Bloque 3 — Salud, seguridad vial, servicio y logística' },
      description: {
        pt: 'Prevenção de acidentes, bem-estar, emergências e postura profissional.',
        es: 'Prevención de accidentes, bienestar, emergencias y conducta profesional.',
      },
      accent: 'violet',
      topics: [
        {
          id: 'common-31', code: 'Objetivo 3.1',
          title: { pt: 'Riscos da estrada e acidentes de trabalho', es: 'Riesgos de la carretera y accidentes de trabajo' },
          summary: {
            pt: 'Os acidentes em missão envolvem pessoa, veículo, via, ambiente e organização do trabalho. Veículos pesados exigem atenção especial por massa, dimensões, ângulos mortos e distância de paragem.',
            es: 'Los accidentes en misión involucran persona, vehículo, vía, entorno y organización del trabajo. Los vehículos pesados exigen especial atención por masa, dimensiones, ángulos muertos y distancia de parada.',
          },
          points: {
            pt: ['Analise causa imediata e causa organizacional: horários, pressão de entrega, pausas, rota e apoio diante de incidentes.', 'Inspecione elementos de segurança ativa e passiva: pneus, freios, iluminação, suspensão, cinto e manutenção.', 'Reconheça consequências humanas, materiais, operacionais e econômicas de um sinistro.', 'Aplique prevenção tanto em rota como nas zonas de carga e descarga.'],
            es: ['Analiza causa inmediata y causa organizativa: horarios, presión de entrega, pausas, ruta y apoyo ante incidencias.', 'Inspecciona elementos de seguridad activa y pasiva: neumáticos, frenos, alumbrado, suspensión, cinturón y mantenimiento.', 'Reconoce consecuencias humanas, materiales, operativas y económicas de un siniestro.', 'Aplica prevención tanto en ruta como en las zonas de carga y descarga.'],
          }, sourceIds: ['cap', 'insst'],
        },
        {
          id: 'common-32', code: 'Objetivo 3.2',
          title: { pt: 'Prevenção da criminalidade e imigração clandestina', es: 'Prevención de la delincuencia y de la inmigración clandestina' },
          summary: {
            pt: 'Segurança da carga, do veículo e das pessoas exige prevenção, comunicação e verificação sistemática. O condutor deve seguir os procedimentos da empresa e respeitar dignidade, legalidade e segurança.',
            es: 'La seguridad de la carga, del vehículo y de las personas exige prevención, comunicación y comprobación sistemática. El conductor debe seguir los procedimientos de la empresa y respetar dignidad, legalidad y seguridad.',
          },
          points: {
            pt: ['Escolha estacionamento adequado, controle chaves e acessos e faça inspeção visual antes da partida e após paradas.', 'Use lista de comprovação para lacres, lona, portas, compartimentos e sinais de intrusão.', 'Comunique incidentes pelos canais definidos; não se exponha a confronto ou risco desnecessário.', 'Conheça responsabilidades do transportador e a importância de documentação e rastreabilidade.'],
            es: ['Elige estacionamiento adecuado, controla llaves y accesos y realiza inspección visual antes de salir y tras las paradas.', 'Usa una lista de comprobación para precintos, lona, puertas, compartimentos y signos de intrusión.', 'Comunica incidencias por los canales definidos; no te expongas a confrontación o riesgo innecesario.', 'Conoce responsabilidades del transportista y la importancia de documentación y trazabilidad.'],
          }, sourceIds: ['cap', 'insst'],
        },
        {
          id: 'common-33', code: 'Objetivo 3.3',
          title: { pt: 'Riscos físicos, ergonomia e equipamentos de proteção', es: 'Riesgos físicos, ergonomía y equipos de protección' },
          summary: {
            pt: 'Movimentação de carga, posturas repetitivas, vibração e quedas são riscos reais. A prevenção começa por planejar a tarefa, usar meios auxiliares e manter postura segura.',
            es: 'La manipulación de carga, las posturas repetitivas, la vibración y las caídas son riesgos reales. La prevención empieza por planificar la tarea, usar medios auxiliares y mantener una postura segura.',
          },
          points: {
            pt: ['Avalie peso, pega, percurso e obstáculos antes de levantar ou mover uma carga.', 'Use equipamentos adequados e EPI quando previstos; não improvise dispositivos de elevação ou fixação.', 'Mantenha três pontos de apoio ao acessar cabine, plataforma ou caixa.', 'Alterne posições, faça pausas e comunique dores ou limitações que possam comprometer segurança.'],
            es: ['Evalúa peso, agarre, recorrido y obstáculos antes de levantar o mover una carga.', 'Usa equipos adecuados y EPI cuando estén previstos; no improvises dispositivos de elevación o sujeción.', 'Mantén tres puntos de apoyo al acceder a cabina, plataforma o caja.', 'Alterna posiciones, realiza pausas y comunica dolores o limitaciones que puedan comprometer la seguridad.'],
          }, sourceIds: ['cap', 'insst'],
        },
        {
          id: 'common-34', code: 'Objetivo 3.4',
          title: { pt: 'Aptidão física e mental: alimentação, álcool, medicamentos, fadiga e stress', es: 'Aptitud física y mental: alimentación, alcohol, medicamentos, fatiga y estrés' },
          summary: {
            pt: 'Aptidão para conduzir não é apenas sentir-se desperto. Sono, fadiga, stress, álcool, drogas e medicamentos podem reduzir atenção, julgamento e tempo de resposta.',
            es: 'La aptitud para conducir no consiste solo en sentirse despierto. Sueño, fatiga, estrés, alcohol, drogas y medicamentos pueden reducir atención, juicio y tiempo de respuesta.',
          },
          points: {
            pt: ['Programe descanso real e regular; bebidas estimulantes não substituem sono reparador.', 'Não conduza sob efeito de álcool, drogas ou medicação que altere a capacidade; confirme advertências e orientação médica.', 'Reconheça sinais precoces de fadiga: bocejos, dificuldade de foco, esquecimentos, mudanças de faixa e irritação.', 'Concilie alimentação, hidratação, exercício e ciclos atividade/repouso com a rota e a jornada.'],
            es: ['Programa descanso real y regular; las bebidas estimulantes no sustituyen al sueño reparador.', 'No conduzcas bajo efectos de alcohol, drogas o medicación que altere la capacidad; comprueba advertencias y consejo médico.', 'Reconoce señales tempranas de fatiga: bostezos, dificultad de concentración, olvidos, cambios de carril e irritación.', 'Concilia alimentación, hidratación, ejercicio y ciclos de actividad/reposo con la ruta y la jornada.'],
          }, sourceIds: ['cap', 'dgt-efficient', 'insst'],
        },
        {
          id: 'common-35', code: 'Objetivo 3.5',
          title: { pt: 'Emergências, acidente, incêndio e primeiros socorros', es: 'Emergencias, accidente, incendio y primeros auxilios' },
          summary: {
            pt: 'Em uma emergência, a prioridade é evitar novos danos. A sequência PAS — Proteger, Avisar, Socorrer — organiza a atuação inicial sem ultrapassar a própria formação.',
            es: 'En una emergencia, la prioridad es evitar nuevos daños. La secuencia PAS — Proteger, Avisar, Socorrer — organiza la actuación inicial sin exceder la propia formación.',
          },
          points: {
            pt: ['Proteja o local, sinalize e avalie riscos de tráfego, incêndio, carga perigosa e energia antes de se aproximar.', 'Acione serviços de socorro com localização e informações claras; siga instruções recebidas.', 'Preste auxílio básico apenas quando seguro e dentro da sua competência; não mova vítimas sem necessidade iminente.', 'Conheça extintores, evacuação, comportamento em agressões e a declaração amigável de acidente.'],
            es: ['Protege el lugar, señaliza y evalúa riesgos de tráfico, incendio, carga peligrosa y energía antes de acercarte.', 'Avisa a los servicios de socorro con ubicación e información clara; sigue las instrucciones recibidas.', 'Presta auxilio básico solo cuando sea seguro y dentro de tu competencia; no muevas víctimas sin necesidad inminente.', 'Conoce extintores, evacuación, actuación ante agresiones y la declaración amistosa de accidente.'],
          }, sourceIds: ['cap', 'insst'],
        },
        {
          id: 'common-36', code: 'Objetivo 3.6',
          title: { pt: 'Imagem de marca, atendimento, manutenção e organização do trabalho', es: 'Imagen de marca, atención, mantenimiento y organización del trabajo' },
          summary: {
            pt: 'O motorista representa a empresa em cada entrega, contato e decisão. Serviço de qualidade combina comunicação, cuidado do veículo, organização e prevenção de conflitos.',
            es: 'El conductor representa a la empresa en cada entrega, contacto y decisión. Un servicio de calidad combina comunicación, cuidado del vehículo, organización y prevención de conflictos.',
          },
          points: {
            pt: ['Adote comunicação clara, respeito a clientes, destinatários, autoridades e outros intervenientes.', 'Conheça os diferentes papéis do motorista: segurança, documentação, conservação do veículo e informação da operação.', 'Planeje trabalho, pausas, rotas, verificação prévia e reporte de avarias.', 'Registre ocorrências de maneira objetiva para reduzir litígios comerciais e financeiros.'],
            es: ['Adopta una comunicación clara y respeto hacia clientes, destinatarios, autoridades y otros intervinientes.', 'Conoce los diferentes papeles del conductor: seguridad, documentación, conservación del vehículo e información de la operación.', 'Planifica trabajo, pausas, rutas, comprobación previa y comunicación de averías.', 'Registra incidencias de forma objetiva para reducir conflictos comerciales y financieros.'],
          }, sourceIds: ['cap', 'insst'],
        },
      ],
    },
  ],
};

const mercancias: Temario = {
  id: 'goods',
  title: { pt: 'CAP Mercancías', es: 'CAP Mercancías' },
  subtitle: {
    pt: 'Aplicação específica ao transporte de mercadorias: carga, estiva, regulamentação, contratos e mercado.',
    es: 'Aplicación específica al transporte de mercancías: carga, estiba, reglamentación, contratos y mercado.',
  },
  blocks: [
    {
      id: 'goods-loading',
      title: { pt: 'Bloco 1 — Operações de carga e utilização segura do veículo', es: 'Bloque 1 — Operaciones de carga y utilización segura del vehículo' },
      description: {
        pt: 'Fundamentos físicos, capacidade, distribuição, estabilidade e fixação da mercadoria.',
        es: 'Fundamentos físicos, capacidad, distribución, estabilidad y sujeción de la mercancía.',
      },
      accent: 'emerald',
      topics: [
        {
          id: 'goods-14-dynamics', code: 'Objetivo 1.4',
          title: { pt: 'Forças, carga útil, volume, repartição e estabilidade', es: 'Fuerzas, carga útil, volumen, reparto y estabilidad' },
          summary: {
            pt: 'Uma carga segura começa antes de fechar o veículo. O plano deve respeitar massa autorizada, limites por eixo, volume, centro de gravidade e comportamento dinâmico nas manobras.',
            es: 'Una carga segura empieza antes de cerrar el vehículo. El plan debe respetar masa autorizada, límites por eje, volumen, centro de gravedad y comportamiento dinámico en las maniobras.',
          },
          points: {
            pt: ['Calcule carga útil a partir das massas do veículo e confirme limites de massa máxima e por eixo.', 'Distribua o peso de modo uniforme e o mais baixo possível, evitando concentrações que sobrecarreguem eixos ou elevem o centro de gravidade.', 'Considere inércia, força centrífuga, atrito e transferência de carga em frenagem, curva e aceleração.', 'Adapte condução à carga: mais massa e centro de gravidade alto ampliam distância de frenagem e risco de instabilidade.'],
            es: ['Calcula la carga útil a partir de las masas del vehículo y confirma límites de masa máxima y por eje.', 'Distribuye el peso de forma uniforme y lo más bajo posible, evitando concentraciones que sobrecarguen ejes o eleven el centro de gravedad.', 'Considera inercia, fuerza centrífuga, rozamiento y transferencia de carga en frenada, curva y aceleración.', 'Adapta la conducción a la carga: más masa y centro de gravedad alto aumentan la distancia de frenado y el riesgo de inestabilidad.'],
          }, sourceIds: ['cap', 'cargo', 'cargo-module'],
        },
        {
          id: 'goods-14-stowage', code: 'Objetivo 1.4',
          title: { pt: 'Embalagem, estiva, amarração e verificação da carga', es: 'Embalaje, estiba, amarre y comprobación de la carga' },
          summary: {
            pt: 'A estiva integra colocação, proteção, distribuição e fixação. Não basta usar cintas: é necessário escolher método, dispositivo e ponto de amarração compatíveis com a carga e o veículo.',
            es: 'La estiba integra colocación, protección, distribución y sujeción. No basta con usar cintas: hay que elegir método, dispositivo y punto de amarre compatibles con la carga y el vehículo.',
          },
          points: {
            pt: ['Diferencie bloqueio e amarração; aplique o método indicado para a forma, massa, embalagem e risco de tombamento da mercadoria.', 'Verifique cintas, correntes, cabos, catracas, pontos de fixação, etiquetas e capacidade de amarração antes do uso.', 'Use proteção de arestas e material de enchimento quando necessário; não misture dispositivos incompatíveis na mesma solução.', 'Reinspecione a carga após os primeiros quilómetros, paradas e qualquer manobra ou condição que possa alterar a tensão.'],
            es: ['Diferencia bloqueo y amarre; aplica el método indicado para la forma, masa, embalaje y riesgo de vuelco de la mercancía.', 'Comprueba cinchas, cadenas, cables, carracas, puntos de fijación, etiquetas y capacidad de amarre antes de usarlos.', 'Usa protectores de cantos y material de relleno cuando sea necesario; no mezcles dispositivos incompatibles en la misma solución.', 'Reinspecciona la carga tras los primeros kilómetros, paradas y cualquier maniobra o condición que pueda modificar la tensión.'],
          }, sourceIds: ['cap', 'cargo', 'cargo-module'],
        },
        {
          id: 'goods-14-handling', code: 'Objetivo 1.4',
          title: { pt: 'Meios de manipulação, carga especial e lona', es: 'Medios de manipulación, carga especial y lona' },
          summary: {
            pt: 'Operações de carga e descarga exigem coordenação, área controlada e meios adequados. Cargas especiais, apoios e cobertura devem ser compatíveis com a natureza do transporte.',
            es: 'Las operaciones de carga y descarga exigen coordinación, zona controlada y medios adecuados. Las cargas especiales, apoyos y cobertura deben ser compatibles con la naturaleza del transporte.',
          },
          points: {
            pt: ['Planeje manobras de empilhador, grua ou plataforma; afaste pessoas da zona de risco e siga sinalização combinada.', 'Identifique tipos de mercadoria que requerem apoios, separação, proteção ou técnica específica de estiva.', 'Verifique integridade de embalagens, portas, laterais, lona e dispositivos de fecho antes da partida.', 'Entoldar protege a carga e deve ser feito sem criar risco de queda, excesso de altura ou fixação deficiente.'],
            es: ['Planifica maniobras de carretilla, grúa o plataforma; aleja a las personas de la zona de riesgo y sigue la señalización acordada.', 'Identifica tipos de mercancía que requieren apoyos, separación, protección o técnica específica de estiba.', 'Comprueba integridad de embalajes, puertas, laterales, lona y dispositivos de cierre antes de salir.', 'El entoldado protege la carga y debe realizarse sin crear riesgo de caída, exceso de altura o sujeción deficiente.'],
          }, sourceIds: ['cap', 'cargo', 'insst'],
        },
      ],
    },
    {
      id: 'goods-regulation',
      title: { pt: 'Bloco 2 — Regulamentação do transporte de mercadorias', es: 'Bloque 2 — Reglamentación del transporte de mercancías' },
      description: {
        pt: 'Títulos, documentos, restrições, contratos e operação internacional.',
        es: 'Títulos, documentos, restricciones, contratos y operación internacional.',
      },
      accent: 'cyan',
      topics: [
        {
          id: 'goods-22-national', code: 'Objetivo 2.2',
          title: { pt: 'Títulos habilitantes, documentos a bordo e restrições', es: 'Títulos habilitantes, documentos a bordo y restricciones' },
          summary: {
            pt: 'A operação legal depende de autorizações, qualificações e documentos adequados ao veículo, condutor, serviço e tipo de mercadoria. A conferência documental faz parte da rotina operacional.',
            es: 'La operación legal depende de autorizaciones, cualificaciones y documentos adecuados al vehículo, conductor, servicio y tipo de mercancía. La comprobación documental forma parte de la rutina operativa.',
          },
          points: {
            pt: ['Diferencie documentos do condutor, do veículo, da empresa e do transporte concreto.', 'Verifique CAP, habilitação, cartão de condutor, registos do tacógrafo, ITV e documentos de controlo aplicáveis.', 'Consulte restrições de circulação, itinerários, limitações locais e taxas de infraestrutura antes de iniciar o serviço.', 'Quando houver dúvida, siga instruções atualizadas da empresa e das autoridades; não presuma que uma autorização anterior cobre uma nova operação.'],
            es: ['Diferencia documentos del conductor, del vehículo, de la empresa y del transporte concreto.', 'Comprueba CAP, permiso, tarjeta de conductor, registros del tacógrafo, ITV y documentos de control aplicables.', 'Consulta restricciones de circulación, itinerarios, limitaciones locales y tasas de infraestructura antes de iniciar el servicio.', 'Cuando haya duda, sigue las instrucciones actualizadas de la empresa y de las autoridades; no presumas que una autorización anterior cubre una nueva operación.'],
          }, sourceIds: ['cap', 'eu-rest', 'tacho'],
        },
        {
          id: 'goods-22-contract', code: 'Objetivo 2.2',
          title: { pt: 'Contrato, carta de porte e responsabilidades das partes', es: 'Contrato, carta de porte y responsabilidades de las partes' },
          summary: {
            pt: 'O contrato identifica quem contrata, transporta, entrega e expede. A carta de porte e outros documentos preservam instruções, reservas, rastreabilidade e prova da operação.',
            es: 'El contrato identifica quién contrata, transporta, entrega y expide. La carta de porte y otros documentos conservan instrucciones, reservas, trazabilidad y prueba de la operación.',
          },
          points: {
            pt: ['Distinga carregador, porteador, destinatário e expedidor; cada papel pode ter obrigações diferentes.', 'Confira identificação das partes, descrição da mercadoria, quantidades, instruções, local de carga/entrega e reservas relevantes.', 'Registre anomalias aparentes, danos, lacres e incidências segundo o procedimento da empresa.', 'Compreenda que responsabilidades por carga, estiva, transporte, entrega e preço dependem do contrato e da norma aplicável.'],
            es: ['Distingue cargador, porteador, destinatario y expedidor; cada papel puede tener obligaciones diferentes.', 'Comprueba identificación de las partes, descripción de la mercancía, cantidades, instrucciones, lugar de carga/entrega y reservas relevantes.', 'Registra anomalías aparentes, daños, precintos e incidencias según el procedimiento de la empresa.', 'Comprende que las responsabilidades por carga, estiba, transporte, entrega y precio dependen del contrato y de la norma aplicable.'],
          }, sourceIds: ['cap', 'contract'],
        },
        {
          id: 'goods-22-international', code: 'Objetivo 2.2',
          title: { pt: 'Transporte internacional, CMR, fronteiras e documentos especiais', es: 'Transporte internacional, CMR, fronteras y documentos especiales' },
          summary: {
            pt: 'No transporte internacional, a preparação documental e a coordenação com transitários, operadores e destinatários evitam imobilizações e litígios. O CMR é referência central para o contrato rodoviário internacional no seu âmbito.',
            es: 'En el transporte internacional, la preparación documental y la coordinación con transitarios, operadores y destinatarios evitan inmovilizaciones y conflictos. El CMR es una referencia central para el contrato internacional por carretera en su ámbito.',
          },
          points: {
            pt: ['Verifique previamente autorizações, documentação de carga, instruções aduaneiras e requisitos do país de trânsito/destino.', 'Preencha e confira carta de porte internacional conforme o processo da empresa; dados incompletos geram atrasos e riscos.', 'Entenda o papel de transitários e operadores: coordenam serviços, documentação e relações contratuais.', 'Em fronteiras ou controlos, mantenha documentos acessíveis, siga instruções e comunique qualquer divergência imediatamente.'],
            es: ['Comprueba previamente autorizaciones, documentación de carga, instrucciones aduaneras y requisitos del país de tránsito/destino.', 'Cumplimenta y revisa la carta de porte internacional conforme al proceso de la empresa; datos incompletos generan retrasos y riesgos.', 'Entiende el papel de transitarios y operadores: coordinan servicios, documentación y relaciones contractuales.', 'En fronteras o controles, mantén los documentos accesibles, sigue instrucciones y comunica cualquier discrepancia de inmediato.'],
          }, sourceIds: ['cap', 'contract'],
        },
      ],
    },
    {
      id: 'goods-market',
      title: { pt: 'Bloco 3 — Mercado, logística e organização do transporte', es: 'Bloque 3 — Mercado, logística y organización del transporte' },
      description: {
        pt: 'Contexto econômico do transporte rodoviário e organização dos seus participantes.',
        es: 'Contexto económico del transporte por carretera y organización de sus participantes.',
      },
      accent: 'violet',
      topics: [
        {
          id: 'goods-37', code: 'Objetivo 3.7',
          title: { pt: 'Entorno econômico, atividades, empresas e especializações', es: 'Entorno económico, actividades, empresas y especializaciones' },
          summary: {
            pt: 'O transporte rodoviário conecta produção, distribuição e consumo, mas opera integrado a outros modos e serviços auxiliares. Entender a cadeia logística ajuda a tomar melhores decisões operacionais.',
            es: 'El transporte por carretera conecta producción, distribución y consumo, pero opera integrado con otros modos y servicios auxiliares. Entender la cadena logística ayuda a tomar mejores decisiones operativas.',
          },
          points: {
            pt: ['Compare o transporte rodoviário com outros modos quanto a flexibilidade, capilaridade, capacidade, custo e integração.', 'Identifique atividades de transporte, operadores, agências, transitários, armazenagem, manutenção e outros serviços auxiliares.', 'Reconheça especializações como temperatura controlada, perigosas, volume, distribuição urbana, internacional e cargas indivisíveis.', 'Acompanhe mudanças de mercado ligadas a digitalização, sustentabilidade, segurança e exigências de rastreabilidade.'],
            es: ['Compara el transporte por carretera con otros modos respecto a flexibilidad, capilaridad, capacidad, coste e integración.', 'Identifica actividades de transporte, operadores, agencias, transitarios, almacenaje, mantenimiento y otros servicios auxiliares.', 'Reconoce especializaciones como temperatura controlada, peligrosas, volumen, distribución urbana, internacional y cargas indivisibles.', 'Sigue cambios de mercado ligados a digitalización, sostenibilidad, seguridad y exigencias de trazabilidad.'],
          }, sourceIds: ['cap', 'contract'],
        },
      ],
    },
  ],
};

export const temarios: Temario[] = [comunes, mercancias];

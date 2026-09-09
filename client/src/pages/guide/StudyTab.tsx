import { trpc } from '@/lib/trpc';

interface StudyTabProps {
  language: 'pt' | 'es';
}

function cleanDisplayedOption(option: string, letter: string) {
  const value = String(option ?? '').trim();
  const prefix = new RegExp(`^${letter}\\s*[)\\.\\-:]\\s*`, 'i');
  return value.replace(prefix, '').trim();
}

export default function StudyTab({ language }: StudyTabProps) {
  const analysisQuery = trpc.guide.getOfficialExamAnalysis.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: 1 });
  const content = {
    pt: {
      title: '📋 Cola Completa — Para Imprimir e Estudar',
      subtitle: 'Resumo dos valores e regras que mais caem na prova. Decore estes dados.',
      officialMemoryTitle: '🎯 Revisão Oficial Prioritária — O que Memorizar',
      officialMemorySubtitle: 'Questões recorrentes encontradas exclusivamente nas 34 provas oficiais. Memorize o conteúdo correto, não apenas a letra da resposta.',
      officialAnswer: 'Resposta oficial',
      officialOccurrences: 'ocorrências oficiais',
      officialExams: 'provas',
      officialGroupsTitle: 'Siglas, regras e pontos recorrentes das provas oficiais',
      officialGroupsSubtitle: 'Cada bloco abaixo é formado por questões recorrentes do acervo oficial; abra Pegadinhas para ver todas as alternativas e a proveniência completa.',
      
      sections: [
        {
          title: '⏰ Tempos de Condução',
          items: [
            { label: 'Condução diária normal', value: '9 horas' },
            { label: 'Condução diária estendida', value: '10 h (máx. 2x/semana)' },
            { label: 'Condução contínua máx.', value: '4,5 horas' },
            { label: 'Pausa obrigatória', value: '45 min (ou 15+30)' },
            { label: 'Condução semanal máx.', value: '56 horas' },
            { label: 'Condução em 2 semanas', value: '90 horas' },
          ]
        },
        {
          title: '🛏️ Tempos de Descanso',
          items: [
            { label: 'Descanso diário normal', value: '11 horas' },
            { label: 'Descanso diário reduzido', value: '9 h (máx. 3x entre 2 semanais)' },
            { label: 'Descanso semanal normal', value: '45 horas' },
            { label: 'Descanso semanal reduzido', value: '24 horas' },
            { label: 'Recuperação do reduzido', value: 'De uma só vez, antes da 3ª semana' },
          ]
        },
        {
          title: '💰 Valores Legais',
          items: [
            { label: 'Junta Arbitral (presumido)', value: '≤ 5.000 euros' },
            { label: 'Isenção tacógrafo (raio)', value: '100 km' },
            { label: 'MMA proibição carga/descarga', value: '> 7,5 toneladas' },
            { label: 'Validade CAP', value: '5 anos' },
            { label: 'Viagens CEMT', value: 'Ilimitadas (a cada 3, 1 no país)' },
          ]
        },
        {
          title: '🚦 Velocidades Máximas (Caminhões)',
          items: [
            { label: 'Autovias / Autoestradas', value: '90 km/h' },
            { label: 'Vias convencionais', value: '80 km/h' },
            { label: 'Dentro de cidades', value: '50 km/h' },
          ]
        },
        {
          title: '🔥 Incêndio — Tetraedro do Fogo',
          items: [
            { label: 'Combustível', value: 'Material que queima' },
            { label: 'Comburente', value: 'Oxigênio' },
            { label: 'Calor', value: 'Temperatura de ignição' },
            { label: 'Reação em cadeia', value: '4º elemento (tetraedro)' },
            { label: 'Extinção por resfriamento', value: 'Água' },
          ]
        },
        {
          title: '🚑 Primeiros Socorros (PAS)',
          items: [
            { label: 'P — Proteger', value: 'Sinalizar e afastar perigos' },
            { label: 'A — Avisar', value: 'Ligar para emergências' },
            { label: 'S — Socorrer', value: 'Prestar auxílio básico' },
            { label: 'Hemorragia', value: 'Pressionar com pano limpo' },
            { label: '1ª medida pós-acidente', value: 'Desligar motor dos veículos' },
          ]
        },
        {
          title: '📜 Infrações (Gravidade)',
          items: [
            { label: '+2h acima condução diária', value: 'MUITO GRAVE' },
            { label: 'Manipulação do tacógrafo', value: 'MUITO GRAVE' },
            { label: 'Carência de dados (tacógrafo)', value: 'MUITO GRAVE' },
            { label: 'Tacógrafo analógico no lugar do digital', value: 'MUITO GRAVE' },
            { label: 'Falta descanso diário (grave)', value: 'Imobilización do veículo' },
          ]
        },
        {
          title: '🌍 Tipos de Transporte',
          items: [
            { label: 'Interior', value: 'Dentro do mesmo país' },
            { label: 'Internacional', value: 'Entre países diferentes' },
            { label: 'Cabotagem', value: 'Estrangeiro opera dentro do país' },
            { label: 'Privado complementar', value: 'Empresa transporta seus próprios bens' },
            { label: 'Público', value: 'Serviço de transporte para terceiros' },
          ]
        },
        {
          title: '🧠 Condução Eficiente e Sistemas de Segurança',
          items: [
            { label: 'Condução eficiente', value: 'Antecipar, manter fluidez e evitar acelerações/frenagens bruscas' },
            { label: 'Descidas', value: 'Escolher marcha e usar freio-motor/retardador antes de ganhar velocidade' },
            { label: 'ADAS', value: 'Assistência ao condutor; não substitui observação, distância e velocidade adequada' },
            { label: 'ABS / ESP / ASR', value: 'Antibloqueio, estabilidade e tração: ajudam, mas não vencem os limites de aderência' },
            { label: 'AEBS / ACC / LKA', value: 'Frenagem, cruzeiro adaptativo e faixa: manter mãos, atenção e responsabilidade' },
          ]
        },
        {
          title: '📦 Carga e Estiva — Checklist Essencial',
          items: [
            { label: 'Antes de carregar', value: 'Confirmar MMA, limites por eixo, carga útil, volume e centro de gravidade' },
            { label: 'Distribuição', value: 'Peso uniforme e baixo; nunca concentrar carga de forma a sobrecarregar eixos' },
            { label: 'Fixação', value: 'Combinar bloqueio e/ou amarração conforme carga, veículo e risco de tombamento' },
            { label: 'Cintas e correntes', value: 'Verificar etiqueta, LC, desgaste, catracas, pontos de fixação e proteção de arestas' },
            { label: 'Revisão', value: 'Reinspecionar carga após saída, paradas e situações que possam alterar a tensão' },
          ]
        },
        {
          title: '📄 Documentação e Transporte Internacional',
          items: [
            { label: 'Partes do contrato', value: 'Carregador contrata, porteador transporta, destinatário recebe, expedidor entrega por conta do carregador' },
            { label: 'Carta de porte', value: 'Confere mercadoria, partes, locais, instruções, reservas e rastreabilidade' },
            { label: 'CMR', value: 'Referência do contrato rodoviário internacional no seu âmbito de aplicação' },
            { label: 'Antes da viagem', value: 'Confirmar permissões, documentos da carga, instruções aduaneiras e requisitos de trânsito/destino' },
            { label: 'Tacógrafo', value: 'Registar corretamente condução, outro trabalho, disponibilidade, pausa e descanso; nunca manipular' },
          ]
        },
        {
          title: '🛡️ Saúde, Risco e Emergência',
          items: [
            { label: 'Fadiga', value: 'Descanso regular é a medida eficaz; estimulantes não substituem sono reparador' },
            { label: 'Aptidão', value: 'Não conduzir sob álcool, drogas ou medicação que reduza capacidade' },
            { label: 'Ergonomia', value: 'Planejar movimentação, usar meios auxiliares, EPI e três pontos de apoio' },
            { label: 'PAS', value: 'Proteger a cena, Avisar socorro, Socorrer dentro da própria competência' },
            { label: 'Incidente', value: 'Sinalizar, comunicar, registrar objetivamente e seguir o procedimento da empresa' },
          ]
        },
      ]
    },
    es: {
      title: '📋 Cola Completa — Para Imprimir y Estudiar',
      subtitle: 'Resumen de valores y reglas que más caen en el examen. Memoriza estos datos.',
      officialMemoryTitle: '🎯 Repaso Oficial Prioritario — Qué Memorizar',
      officialMemorySubtitle: 'Preguntas recurrentes encontradas exclusivamente en los 34 exámenes oficiales. Memoriza el contenido correcto, no solo la letra de la respuesta.',
      officialAnswer: 'Respuesta oficial',
      officialOccurrences: 'apariciones oficiales',
      officialExams: 'exámenes',
      officialGroupsTitle: 'Siglas, reglas y puntos recurrentes de los exámenes oficiales',
      officialGroupsSubtitle: 'Cada bloque se forma con preguntas recurrentes del acervo oficial; abre Trampas para ver todas las alternativas y la procedencia completa.',
      
      sections: [
        {
          title: '⏰ Tiempos de Conducción',
          items: [
            { label: 'Conducción diaria normal', value: '9 horas' },
            { label: 'Conducción diaria extendida', value: '10 h (máx. 2x/semana)' },
            { label: 'Conducción continua máx.', value: '4,5 horas' },
            { label: 'Pausa obligatoria', value: '45 min (o 15+30)' },
            { label: 'Conducción semanal máx.', value: '56 horas' },
            { label: 'Conducción en 2 semanas', value: '90 horas' },
          ]
        },
        {
          title: '🛏️ Tiempos de Descanso',
          items: [
            { label: 'Descanso diario normal', value: '11 horas' },
            { label: 'Descanso diario reducido', value: '9 h (máx. 3x entre 2 semanales)' },
            { label: 'Descanso semanal normal', value: '45 horas' },
            { label: 'Descanso semanal reducido', value: '24 horas' },
            { label: 'Recuperación del reducido', value: 'De una sola vez, antes de la 3ª semana' },
          ]
        },
        {
          title: '💰 Valores Legales',
          items: [
            { label: 'Junta Arbitral (presumido)', value: '≤ 5.000 euros' },
            { label: 'Exención tacógrafo (radio)', value: '100 km' },
            { label: 'MMA prohibición carga/descarga', value: '> 7,5 toneladas' },
            { label: 'Validez CAP', value: '5 años' },
            { label: 'Viajes CEMT', value: 'Ilimitados (cada 3, 1 en el país)' },
          ]
        },
        {
          title: '🚦 Velocidades Máximas (Camiones)',
          items: [
            { label: 'Autovías / Autopistas', value: '90 km/h' },
            { label: 'Vías convencionales', value: '80 km/h' },
            { label: 'Dentro de ciudades', value: '50 km/h' },
          ]
        },
        {
          title: '🔥 Incendio — Tetraedro del Fuego',
          items: [
            { label: 'Combustible', value: 'Material que quema' },
            { label: 'Comburente', value: 'Oxígeno' },
            { label: 'Calor', value: 'Temperatura de ignición' },
            { label: 'Reacción en cadena', value: '4º elemento (tetraedro)' },
            { label: 'Extinción por enfriamiento', value: 'Agua' },
          ]
        },
        {
          title: '🚑 Primeros Auxilios (PAS)',
          items: [
            { label: 'P — Proteger', value: 'Señalizar y alejar peligros' },
            { label: 'A — Avisar', value: 'Llamar a emergencias' },
            { label: 'S — Socorrer', value: 'Prestar auxilio básico' },
            { label: 'Hemorragia', value: 'Presionar con paño limpio' },
            { label: '1ª medida post-accidente', value: 'Apagar motor de los vehículos' },
          ]
        },
        {
          title: '📜 Infracciones (Gravedad)',
          items: [
            { label: '+2h sobre conducción diaria', value: 'MUY GRAVE' },
            { label: 'Manipulación del tacógrafo', value: 'MUY GRAVE' },
            { label: 'Carencia de datos (tacógrafo)', value: 'MUY GRAVE' },
            { label: 'Tacógrafo analógico en lugar del digital', value: 'MUY GRAVE' },
            { label: 'Falta descanso diario (grave)', value: 'Inmovilización del vehículo' },
          ]
        },
        {
          title: '🌍 Tipos de Transporte',
          items: [
            { label: 'Interior', value: 'Dentro del mismo país' },
            { label: 'Internacional', value: 'Entre países diferentes' },
            { label: 'Cabotaje', value: 'Extranjero opera dentro del país' },
            { label: 'Privado complementario', value: 'Empresa transporta sus propios bienes' },
            { label: 'Público', value: 'Servicio de transporte para terceros' },
          ]
        },
        {
          title: '🧠 Conducción Eficiente y Sistemas de Seguridad',
          items: [
            { label: 'Conducción eficiente', value: 'Anticipar, mantener fluidez y evitar aceleraciones/frenadas bruscas' },
            { label: 'Descensos', value: 'Elegir marcha y usar freno motor/ralentizador antes de ganar velocidad' },
            { label: 'ADAS', value: 'Asistencia al conductor; no sustituye observación, distancia ni velocidad adecuada' },
            { label: 'ABS / ESP / ASR', value: 'Antibloqueo, estabilidad y tracción: ayudan, pero no vencen los límites de adherencia' },
            { label: 'AEBS / ACC / LKA', value: 'Frenada, crucero adaptativo y carril: mantener manos, atención y responsabilidad' },
          ]
        },
        {
          title: '📦 Carga y Estiba — Lista Esencial',
          items: [
            { label: 'Antes de cargar', value: 'Confirmar MMA, límites por eje, carga útil, volumen y centro de gravedad' },
            { label: 'Reparto', value: 'Peso uniforme y bajo; nunca concentrar carga de forma que se sobrecarguen los ejes' },
            { label: 'Sujeción', value: 'Combinar bloqueo y/o amarre según carga, vehículo y riesgo de vuelco' },
            { label: 'Cinchas y cadenas', value: 'Comprobar etiqueta, LC, desgaste, carracas, puntos de anclaje y protectores de cantos' },
            { label: 'Revisión', value: 'Reinspeccionar la carga tras la salida, paradas y situaciones que puedan modificar la tensión' },
          ]
        },
        {
          title: '📄 Documentación y Transporte Internacional',
          items: [
            { label: 'Partes del contrato', value: 'Cargador contrata, porteador transporta, destinatario recibe y expedidor entrega por cuenta del cargador' },
            { label: 'Carta de porte', value: 'Comprueba mercancía, partes, lugares, instrucciones, reservas y trazabilidad' },
            { label: 'CMR', value: 'Referencia del contrato internacional por carretera en su ámbito de aplicación' },
            { label: 'Antes del viaje', value: 'Confirmar permisos, documentos de carga, instrucciones aduaneras y requisitos de tránsito/destino' },
            { label: 'Tacógrafo', value: 'Registrar conducción, otros trabajos, disponibilidad, pausa y descanso; nunca manipular' },
          ]
        },
        {
          title: '🛡️ Salud, Riesgo y Emergencia',
          items: [
            { label: 'Fatiga', value: 'El descanso regular es la medida eficaz; los estimulantes no sustituyen el sueño reparador' },
            { label: 'Aptitud', value: 'No conducir bajo alcohol, drogas o medicación que reduzca la capacidad' },
            { label: 'Ergonomía', value: 'Planificar manipulación, usar medios auxiliares, EPI y tres puntos de apoyo' },
            { label: 'PAS', value: 'Proteger la escena, Avisar a emergencias y Socorrer dentro de la propia competencia' },
            { label: 'Incidencia', value: 'Señalizar, comunicar, registrar objetivamente y seguir el procedimiento de la empresa' },
          ]
        },
      ]
    }
  };

  const data = content[language];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{data.title}</h2>
        <p className="text-slate-600">{data.subtitle}</p>
      </div>

      {analysisQuery.data && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h3 className="text-xl font-bold text-amber-950">{data.officialMemoryTitle}</h3>
          <p className="mt-2 text-sm text-amber-900">{data.officialMemorySubtitle}</p>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {analysisQuery.data.topRepeated.map((question, index) => {
              const answerText = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD }[question.correctAnswer];
              return (
                <article key={`${question.question}-${index}`} className="rounded-lg border border-amber-200 bg-white p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-amber-800">#{index + 1}</span>
                    <span className="text-xs text-slate-600">{question.occurrences} {data.officialOccurrences} · {question.exams.length} {data.officialExams}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                  <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-900"><strong>{data.officialAnswer}:</strong> {question.correctAnswer}) {cleanDisplayedOption(answerText, question.correctAnswer)}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-6 border-t border-amber-200 pt-5">
            <h4 className="font-bold text-amber-950">{data.officialGroupsTitle}</h4>
            <p className="mt-1 text-sm text-amber-900">{data.officialGroupsSubtitle}</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {analysisQuery.data.memorizationGroups.map((group) => (
                <article key={group.id} className="rounded-lg border border-amber-200 bg-white p-4">
                  <h5 className="font-semibold text-slate-900">{language === 'pt' ? group.titlePt : group.titleEs}</h5>
                  <p className="mt-1 text-sm text-slate-600">{language === 'pt' ? group.descriptionPt : group.descriptionEs}</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-800">
                    {group.questions.map((question) => {
                      const answerText = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD }[question.correctAnswer];
                      return <li key={question.question} className="rounded border-l-4 border-green-400 bg-green-50 p-2"><p className="font-medium text-slate-900">{question.question}</p><span className="mt-1 block font-semibold text-green-950">{question.correctAnswer}) {cleanDisplayedOption(answerText, question.correctAnswer)}</span><span className="block pt-1 text-xs text-slate-600">{question.occurrences} {data.officialOccurrences} · {question.exams.length} {data.officialExams}</span></li>;
                    })}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.sections.map((section, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-xl font-bold mb-4">{section.title}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {section.items.map((item, itemIdx) => (
              <div key={itemIdx} className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold text-slate-900">{item.label}</div>
                <div className="text-slate-600">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

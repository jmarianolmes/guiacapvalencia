import { Card, CardContent } from '@/components/ui/card';

interface SiglasTabProps {
  language: 'pt' | 'es';
}

export default function SiglasTab({ language }: SiglasTabProps) {
  const siglas = [
    {
      acronym: 'ABS',
      fullName: 'Anti-lock Braking System',
      pt: 'Evita o bloqueio das rodas durante frenagens intensas, mantendo a capacidade de direção.',
      es: 'Evita el bloqueo de las ruedas durante frenadas intensas, manteniendo la capacidad de dirección.',
    },
    {
      acronym: 'ESP',
      fullName: 'Electronic Stability Program',
      pt: 'Controle eletrônico de estabilidade. Evita derrapagens e capotamentos em curvas.',
      es: 'Control electrónico de estabilidad. Evita derrapes y vuelcos en curvas.',
    },
    {
      acronym: 'ACC',
      fullName: 'Adaptive Cruise Control',
      pt: 'Controle de cruzeiro adaptativo. Mantém distância segura do veículo à frente automaticamente.',
      es: 'Control de crucero adaptativo. Mantiene distancia segura del vehículo delantero automáticamente.',
    },
    {
      acronym: 'BAS/EBA',
      fullName: 'Brake Assist System',
      pt: 'Assistência de frenagem de emergência. Detecta pisada brusca e aplica força máxima de frenagem.',
      es: 'Asistencia de frenada de emergencia. Detecta pisada brusca y aplica fuerza máxima de frenada.',
    },
    {
      acronym: 'ASR/TCS',
      fullName: 'Anti-Slip Regulation',
      pt: 'Controle de tração. Evita que as rodas patinem ao acelerar em pisos escorregadios.',
      es: 'Control de tracción. Evita que las ruedas patinen al acelerar en pisos resbaladizos.',
    },
    {
      acronym: 'LKA',
      fullName: 'Lane Keeping Assist',
      pt: 'Assistente de manutenção de faixa. Alerta ou corrige quando o veículo sai da faixa sem sinalizar.',
      es: 'Asistente de mantenimiento de carril. Alerta o corrige cuando el vehículo sale del carril sin señalizar.',
    },
    {
      acronym: 'FCW',
      fullName: 'Forward Collision Warning',
      pt: 'Alerta de colisão frontal iminente. Avisa o motorista de obstáculos à frente.',
      es: 'Alerta de colisión frontal inminente. Avisa al conductor de obstáculos adelante.',
    },
    {
      acronym: 'EBS',
      fullName: 'Electronic Braking System',
      pt: 'Sistema de frenagem eletrônico. Distribui a força de frenagem entre os eixos de forma ótima.',
      es: 'Sistema de frenada electrónico. Distribuye la fuerza de frenada entre los ejes de forma óptima.',
    },
    {
      acronym: 'LDWS',
      fullName: 'Lane Departure Warning System',
      pt: 'Sistema de alerta de saída de faixa. Semelhante ao LKA, mas apenas alerta sem intervir.',
      es: 'Sistema de alerta de salida de carril. Similar al LKA, pero solo alerta sin intervenir.',
    },
    {
      acronym: 'AEBS',
      fullName: 'Advanced Emergency Braking System',
      pt: 'Frenagem de emergência autônoma. Freia automaticamente para evitar ou reduzir colisões.',
      es: 'Frenada de emergencia autónoma. Frena automáticamente para evitar o reducir colisiones.',
    },
    {
      acronym: 'TPMS',
      fullName: 'Tire Pressure Monitoring System',
      pt: 'Monitoramento da pressão dos pneus em tempo real.',
      es: 'Monitoreo de la presión de los neumáticos en tiempo real.',
    },
    {
      acronym: 'CMR',
      fullName: 'Convention Marchandises Routières',
      pt: 'Convenção internacional que regula o contrato de transporte de mercadorias por estrada.',
      es: 'Convención internacional que regula el contrato de transporte de mercancías por carretera.',
    },
    {
      acronym: 'ADR',
      fullName: 'Accord Dangereux Routier',
      pt: 'Regulamento europeu para transporte de mercadorias perigosas por estrada.',
      es: 'Reglamento europeo para transporte de mercancías peligrosas por carretera.',
    },
    {
      acronym: 'CEMT',
      fullName: 'Conférence Européenne des Ministres des Transports',
      pt: 'Autorização multilateral para transporte internacional entre países membros.',
      es: 'Autorización multilateral para transporte internacional entre países miembros.',
    },
    {
      acronym: 'CAP',
      fullName: 'Certificado de Aptitud Profesional',
      pt: 'Qualificação obrigatória para motoristas profissionais. Válido por 5 anos.',
      es: 'Cualificación obligatoria para conductores profesionales. Válido por 5 años.',
    },
    {
      acronym: 'OEA',
      fullName: 'Operador Económico Autorizado',
      pt: 'Estatuto aduaneiro que facilita o comércio internacional para empresas confiáveis.',
      es: 'Estatuto aduanero que facilita el comercio internacional para empresas confiables.',
    },
    {
      acronym: 'PAS',
      fullName: 'Proteger, Avisar, Socorrer',
      pt: 'Protocolo de atuação em emergências: Proteger a cena, Avisar os serviços e Socorrer as vítimas.',
      es: 'Protocolo de actuación en emergencias: Proteger la escena, Avisar los servicios y Socorrer las víctimas.',
    },
    {
      acronym: 'ITV',
      fullName: 'Inspección Técnica de Vehículos',
      pt: 'Inspeção técnica obrigatória periódica do veículo (equivalente ao DETRAN brasileiro).',
      es: 'Inspección técnica obligatoria periódica del vehículo.',
    },
    {
      acronym: 'ADAS',
      fullName: 'Advanced Driver Assistance Systems',
      pt: 'Conjunto de sistemas avançados que auxiliam a condução, podendo alertar ou atuar em freio, acelerador, direção e sinalização.',
      es: 'Conjunto de sistemas avanzados que ayudan a la conducción y pueden alertar o actuar sobre freno, acelerador, dirección y señalización.',
    },
    {
      acronym: 'EBD',
      fullName: 'Electronic Brakeforce Distribution',
      pt: 'Distribuição eletrônica da força de frenagem entre rodas e eixos conforme a aderência e a carga.',
      es: 'Distribución electrónica de la fuerza de frenada entre ruedas y ejes según adherencia y carga.',
    },
    {
      acronym: 'MMA',
      fullName: 'Masa Máxima Autorizada',
      pt: 'Massa máxima permitida para o veículo em circulação, incluindo o próprio veículo, pessoas e carga.',
      es: 'Masa máxima permitida del vehículo en circulación, incluido el propio vehículo, personas y carga.',
    },
    {
      acronym: 'EN 12195',
      fullName: 'Norma europea de sujeción de cargas',
      pt: 'Referência europeia para métodos, dispositivos e cálculo da fixação de carga em transporte rodoviário.',
      es: 'Referencia europea para métodos, dispositivos y cálculo de la sujeción de carga en el transporte por carretera.',
    },
    {
      acronym: 'LC',
      fullName: 'Lashing Capacity',
      pt: 'Capacidade de amarração indicada na etiqueta do dispositivo de fixação; deve ser verificada antes do uso.',
      es: 'Capacidad de amarre indicada en la etiqueta del dispositivo de sujeción; debe comprobarse antes de usarlo.',
    },
    {
      acronym: 'LOTT',
      fullName: 'Ley de Ordenación de los Transportes Terrestres',
      pt: 'Lei espanhola de ordenação dos transportes terrestres, referência para a atividade de transporte.',
      es: 'Ley española de ordenación de los transportes terrestres, referencia para la actividad de transporte.',
    },
    {
      acronym: 'ROTT',
      fullName: 'Reglamento de Ordenación de los Transportes Terrestres',
      pt: 'Regulamento que desenvolve a ordenação do transporte terrestre e seus requisitos operacionais.',
      es: 'Reglamento que desarrolla la ordenación del transporte terrestre y sus requisitos operativos.',
    },
    {
      acronym: 'EPI',
      fullName: 'Equipo de Protección Individual',
      pt: 'Equipamento de proteção individual utilizado para controlar riscos durante carga, descarga e outras tarefas.',
      es: 'Equipo de protección individual utilizado para controlar riesgos durante carga, descarga y otras tareas.',
    },
    {
      acronym: 'PRL',
      fullName: 'Prevención de Riesgos Laborales',
      pt: 'Prevenção de riscos ocupacionais: identifica, avalia e controla riscos ligados ao trabalho do motorista.',
      es: 'Prevención de riesgos laborales: identifica, evalúa y controla los riesgos ligados al trabajo del conductor.',
    },
    {
      acronym: 'SIT',
      fullName: 'Sistemas Inteligentes de Transporte',
      pt: 'Tecnologias que apoiam informação, gestão, segurança e eficiência nas operações de transporte.',
      es: 'Tecnologías que apoyan la información, gestión, seguridad y eficiencia en las operaciones de transporte.',
    },
    {
      acronym: 'e-CMR',
      fullName: 'Carta de porte internacional electrónica',
      pt: 'Versão eletrônica da carta de porte internacional, utilizada quando o processo e a norma aplicável a admitem.',
      es: 'Versión electrónica de la carta de porte internacional, utilizada cuando el proceso y la norma aplicable la admiten.',
    },
  ];

  const title = language === 'pt' 
    ? '🔧 Siglas Essenciais — Veículo, Carga, Segurança e Transporte'
    : '🔧 Siglas Esenciales — Vehículo, Carga, Seguridad y Transporte';
  
  const subtitle = language === 'pt'
    ? 'Memorize a sigla, o significado e, principalmente, a função prática em segurança, estiva, documentação e operação.'
    : 'Memoriza la sigla, su significado y, sobre todo, su función práctica en seguridad, estiba, documentación y operación.';

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-slate-600">{subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {siglas.map((sigla, idx) => (
          <Card key={idx} className="border-t-4 border-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-3">
                <p className="text-2xl font-bold text-blue-600">{sigla.acronym}</p>
                <p className="text-xs text-slate-500 italic">{sigla.fullName}</p>
              </div>
              <p className="text-sm text-slate-700">
                {language === 'pt' ? sigla.pt : sigla.es}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

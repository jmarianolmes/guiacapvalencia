export type ChapterGroup = 'common' | 'goods';

export type SimulatorChapter = {
  id: string;
  code: string;
  group: ChapterGroup;
  titlePt: string;
  titleEs: string;
  keywords: string[];
};

export type ChapterQuestion = {
  subject: string;
  question: string;
  stem?: string | null;
  normalized?: string | null;
};

export const simulatorChapters: SimulatorChapter[] = [
  { id: 'common-1-1', code: '1.1', group: 'common', titlePt: 'Cadeia cinemática, torque, potência e transmissão', titleEs: 'Cadena cinemática, par, potencia y transmisión', keywords: ['motor', 'par motor', 'potencia', 'cuentarrevoluciones', 'embrague', 'caja de cambio', 'caja de cambios', 'relación de transmisión', 'relacion de transmision', 'transmisión', 'transmision'] },
  { id: 'common-1-2', code: '1.2', group: 'common', titlePt: 'Frenos, retardadores e sistemas de segurança', titleEs: 'Frenos, ralentizadores y sistemas de seguridad', keywords: ['freno', 'retardador', 'ralentizador', 'abs', 'esp', 'asr', 'tcs', 'ebs', 'ebv', 'bas', 'aebs', 'acc', 'lka', 'ldws', 'tpms'] },
  { id: 'common-1-3', code: '1.3', group: 'common', titlePt: 'Consumo de combustível e condução eficiente', titleEs: 'Consumo de combustible y conducción eficiente', keywords: ['consumo', 'carburante', 'combustible', 'conducción eficiente', 'conduccion eficiente', 'velocidad constante', 'presión de los neumáticos', 'presion de los neumaticos'] },
  { id: 'common-1-3bis', code: '1.3 bis', group: 'common', titlePt: 'Riscos da via, tráfego, clima e utilizadores vulneráveis', titleEs: 'Riesgos de la vía, tráfico, clima y usuarios vulnerables', keywords: ['meteorológ', 'meteorolog', 'lluvia', 'niebla', 'nieve', 'viento', 'distracción', 'distraccion', 'usuario vulnerable', 'distancia de seguridad', 'tráfico', 'trafico', 'adelantamiento'] },
  { id: 'common-2-1', code: '2.1', group: 'common', titlePt: 'Jornada, tempos de condução, descanso e tacógrafo', titleEs: 'Jornada, tiempos de conducción, descanso y tacógrafo', keywords: ['tacógrafo', 'tacografo', 'descanso', 'pausa', 'conducción diaria', 'conduccion diaria', 'jornada', 'reglamento 561', 'reglamento 165', 'cualificación', 'cualificacion', 'certificado de aptitud profesional'] },
  { id: 'common-3-1', code: '3.1', group: 'common', titlePt: 'Riscos da estrada e acidentes de trabalho', titleEs: 'Riesgos de la carretera y accidentes de trabajo', keywords: ['accidente', 'siniestr', 'seguridad vial', 'riesgo laboral', 'accidente de trabajo'] },
  { id: 'common-3-2', code: '3.2', group: 'common', titlePt: 'Delinquência e imigração clandestina', titleEs: 'Delincuencia e inmigración clandestina', keywords: ['inmigr', 'delincu', 'clandest', 'polizón', 'polizon'] },
  { id: 'common-3-3', code: '3.3', group: 'common', titlePt: 'Riscos físicos, ergonomia e EPI', titleEs: 'Riesgos físicos, ergonomía y EPI', keywords: ['ergonom', 'equipo de protección', 'equipo de proteccion', 'riesgo físico', 'riesgo fisico', 'manipulación manual', 'manipulacion manual'] },
  { id: 'common-3-4', code: '3.4', group: 'common', titlePt: 'Aptidão física e mental, fadiga e substâncias', titleEs: 'Aptitud física y mental, fatiga y sustancias', keywords: ['alcohol', 'droga', 'fatiga', 'estrés', 'estres', 'medicamento', 'alimentación', 'alimentacion', 'sueño', 'sueno'] },
  { id: 'common-3-5', code: '3.5', group: 'common', titlePt: 'Emergências, incêndio e primeiros socorros', titleEs: 'Emergencias, incendio y primeros auxilios', keywords: ['incendio', 'primeros auxilios', 'hemorrag', 'emergencia', 'extintor', 'socorr'] },
  { id: 'common-3-6', code: '3.6', group: 'common', titlePt: 'Imagem de marca, serviço e organização do trabalho', titleEs: 'Imagen de marca, servicio y organización del trabajo', keywords: ['imagen de marca', 'atención al cliente', 'atencion al cliente', 'mantenimiento', 'organización del trabajo', 'organizacion del trabajo', 'litigio'] },
  { id: 'goods-1-4', code: '1.4', group: 'goods', titlePt: 'Carga, repartição, estabilidade e estiva', titleEs: 'Carga, reparto, estabilidad y estiba', keywords: ['estiba', 'carga', 'masa máxima', 'masa maxima', 'mma', 'eje', 'volumen', 'embalaje', 'cinta', 'amarre', 'sujeción', 'sujecion', 'entold', 'lona', 'mercancía peligrosa', 'mercancia peligrosa'] },
  { id: 'goods-2-2', code: '2.2', group: 'goods', titlePt: 'Regulamentação, contrato e transporte internacional', titleEs: 'Reglamentación, contrato y transporte internacional', keywords: ['cmr', 'carta de porte', 'contrato de transporte', 'transportista', 'porteador', 'cargador', 'destinatario', 'junta arbitral', 'autorización', 'autorizacion', 'frontera', 'aduan', 'documento', 'cabotaje', 'tránsito', 'transito', 'cemt', 'lott', 'rott', 'restricción', 'restriccion', 'tasa'] },
  { id: 'goods-3-7', code: '3.7', group: 'goods', titlePt: 'Mercado, empresas e organização do transporte', titleEs: 'Mercado, empresas y organización del transporte', keywords: ['mercado', 'empresa de transporte', 'operador', 'logística', 'logistica', 'actividad auxiliar', 'modo de transporte', 'especialización', 'especializacion', 'sector del transporte'] },
];

export function findSimulatorChapter(question: ChapterQuestion): SimulatorChapter | undefined {
  const text = `${question.question} ${question.stem ?? ''}`.toLocaleLowerCase('es-ES');
  const group: ChapterGroup = question.subject.toLocaleLowerCase('es-ES').includes('mercancias') ? 'goods' : 'common';
  return simulatorChapters.find((chapter) => chapter.group === group && chapter.keywords.some((keyword) => text.includes(keyword)));
}

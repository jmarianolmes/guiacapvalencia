import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const OFFICIAL_BASE = 'https://www.transportes.gob.es';

const COMMON_SECTION_CANDIDATES = [1, 2, 3];
const COMMON_OBJECTIVE_CANDIDATES = [
  '1_1', '1_2', '1_3', '1_3_bis', '1_4', '1_5',
  '2_1', '2_2', '2_3',
  '3_1', '3_2', '3_3', '3_4', '3_5', '3_6', '3_7',
];
const GOODS_OBJECTIVE_CANDIDATES = ['1', '2', '3'];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es-ES');
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

function sourceUrls(question: { chapterId: string | null; chapterCode: string | null; subject: string; provaDate: string }) {
  const chapterCode = question.chapterCode?.toLowerCase().replace(/\s+/g, '')
    || question.chapterId?.replace(/^(common|goods)-/i, '').replace('-', '.')
    || '';
  const objective = chapterCode.replace(/bis$/, '_bis').replace(/\./g, '_');
  const isGoods = /mercanc|mercad|goods/i.test(`${question.subject} ${question.provaDate}`);
  if (isGoods && objective) {
    const preferred = objective.split('_')[0];
    const orderedGoodsObjectives = [
      ...(GOODS_OBJECTIVE_CANDIDATES.includes(preferred) ? [preferred] : []),
      ...GOODS_OBJECTIVE_CANDIDATES.filter((item) => item !== preferred),
    ];
    return orderedGoodsObjectives.map((item) => `${OFFICIAL_BASE}/areas-de-actividad/transporte-terrestre/servicios-al-transportista/cap/preguntas-especificasmercancias-objetivo-${item}`)
      .concat(GOODS_OBJECTIVE_CANDIDATES.map((item) => `${OFFICIAL_BASE}/areas-de-actividad/transporte-terrestre/servicios-al-transportista/cap/preguntas-especificas-mercancias-objetivo-${item}`));
  }
  const preferredObjectives = objective ? [objective, ...COMMON_OBJECTIVE_CANDIDATES.filter((item) => item !== objective)] : COMMON_OBJECTIVE_CANDIDATES;
  return preferredObjectives.flatMap((item) => COMMON_SECTION_CANDIDATES.map((section) => `${OFFICIAL_BASE}/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion${section}-objetivo${item}`));
}

function findAnswer(pageText: string, question: { question: string; optionA: string; optionB: string; optionC: string; optionD: string }) {
  const normalizedPage = normalize(pageText);
  const normalizedQuestion = normalize(question.question);
  const questionIndex = normalizedPage.indexOf(normalizedQuestion);
  if (questionIndex < 0) return null;
  const nearby = normalizedPage.slice(questionIndex, questionIndex + 7000);
  const optionMatches = [question.optionA, question.optionB, question.optionC, question.optionD]
    .filter((option) => nearby.includes(normalize(option))).length;
  if (optionMatches < 2) return null;
  const answerMatch = nearby.match(/respuesta\s*:\s*([abcd])/i);
  return answerMatch ? answerMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' : null;
}

function findBundledOfficialAnswer(question: { question: string; chapterCode: string | null }) {
  const objective = question.chapterCode?.toLowerCase().replace(/bis$/, '_bis').replace(/\./g, '_');
  if (!objective) return null;
  try {
    const file = join(process.cwd(), 'server', 'data', `of_cap_objetivo_${objective}.json`);
    const records = JSON.parse(readFileSync(file, 'utf8')) as Array<{ question?: string; correctAnswer?: 'A' | 'B' | 'C' | 'D' }>;
    const target = normalize(question.question);
    return records.find((record) => normalize(record.question || '') === target)?.correctAnswer || null;
  } catch {
    return null;
  }
}

export type OfficialLookupResult = {
  found: boolean;
  suggestedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  sourceUrl: string;
  message: string;
};

export async function lookupOfficialQuestion(question: {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  chapterId: string | null;
  chapterCode: string | null;
  subject: string;
  provaDate: string;
}): Promise<OfficialLookupResult> {
  const urls = sourceUrls(question);
  let lastUrl = urls[0];
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Guia-CAP-Valencia-admin-review/1.0' } });
      if (!response.ok) continue;
      const text = htmlToText(await response.text());
      const suggestedAnswer = findAnswer(text, question);
      if (suggestedAnswer) {
        return { found: true, suggestedAnswer, sourceUrl: url, message: 'Pregunta localizada na fonte oficial. Confirme antes de salvar.' };
      }
    } catch {
      // A comparação manual continua disponível quando a fonte não puder ser lida.
    }
  }
  const bundledAnswer = findBundledOfficialAnswer(question);
  if (bundledAnswer) {
    return { found: true, suggestedAnswer: bundledAnswer, sourceUrl: urls[0], message: 'Resposta localizada no material oficial importado. Confirme também na fonte online antes de salvar.' };
  }
  return {
    found: false,
    suggestedAnswer: null,
    sourceUrl: lastUrl,
    message: 'Não foi possível localizar automaticamente. Use Comparar para conferir manualmente na fonte oficial.',
  };
}

export function getOfficialSourceUrl(question: { chapterId: string | null; chapterCode: string | null; subject: string; provaDate: string }) {
  return sourceUrls(question)[0];
}

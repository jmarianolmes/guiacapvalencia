import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const OFFICIAL_BASE = 'https://www.transportes.gob.es';

const OFFICIAL_COMMON_URLS = [
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo1_1',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo1_2',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo1_3',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo1_3_bis',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo2_1',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo3_1',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo3_2',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo3_3',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo3_4',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo3_5',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion1-objetivo3_6',
];

const OFFICIAL_GOODS_URLS = [
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion2-objetivo1_4',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion2-objetivo2_2',
  'https://www.transportes.gob.es/transporte-terrestre/examenes-y-formacion/examenes-de-formacion-de-conductores-profesionales-cap/seccion2-objetivo3_7',
];

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

function resolveBlockId(question: { chapterId: string | null; internalCode?: string | null }) {
  if (question.chapterId && /^(common|goods)-/.test(question.chapterId)) return question.chapterId;
  const code = question.internalCode?.toUpperCase().match(/^([CM])(\d{2})/) ;
  if (!code) return null;
  const group = code[2][0];
  const objective = code[2][1];
  return code[1] === 'M' ? `goods-${group}-${objective}` : `common-${group}-${objective}`;
}

function sourceUrls(question: { chapterId: string | null; chapterCode: string | null; internalCode?: string | null; subject: string; provaDate: string }) {
  const blockId = resolveBlockId(question);
  const isGoods = blockId?.startsWith('goods-') || /mercanc|mercad|goods/i.test(`${question.subject} ${question.provaDate}`);
  const urls = isGoods ? OFFICIAL_GOODS_URLS : OFFICIAL_COMMON_URLS;
  const blockIndex = isGoods
    ? ({ 'goods-1-4': 0, 'goods-2-2': 1, 'goods-3-7': 2 } as Record<string, number>)[blockId || '']
    : ({
        'common-1-1': 0,
        'common-1-2': 1,
        'common-1-3': 2,
        'common-1-3bis': 3,
        'common-2-1': 4,
        'common-3-1': 5,
        'common-3-2': 6,
        'common-3-3': 7,
        'common-3-4': 8,
        'common-3-5': 9,
        'common-3-6': 10,
      } as Record<string, number>)[blockId || ''];
  if (blockIndex === undefined) return urls;
  return [urls[blockIndex], ...urls.filter((_url, index) => index !== blockIndex)];
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

function findBundledOfficialAnswer(question: { question: string; chapterId: string | null; chapterCode: string | null; internalCode?: string | null }) {
  const blockId = resolveBlockId(question);
  const objective = (question.chapterCode?.toLowerCase().replace(/bis$/, '_bis').replace(/\./g, '_')
    || blockId?.replace(/^common-/, '').replace(/-/g, '_'));
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
  ofAnswer: 'A' | 'B' | 'C' | 'D' | null;
  onlineAnswer: 'A' | 'B' | 'C' | 'D' | null;
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
  internalCode?: string | null;
  subject: string;
  provaDate: string;
}): Promise<OfficialLookupResult> {
  const urls = sourceUrls(question);
  let lastUrl = urls[0];
  const ofAnswer = findBundledOfficialAnswer(question);
  let onlineAnswer: 'A' | 'B' | 'C' | 'D' | null = null;
  let onlineUrl = urls[0];
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Guia-CAP-Valencia-admin-review/1.0' } });
      if (!response.ok) continue;
      const text = htmlToText(await response.text());
      const suggestedAnswer = findAnswer(text, question);
      if (suggestedAnswer) {
        onlineAnswer = suggestedAnswer;
        onlineUrl = url;
        break;
      }
    } catch {
      // A comparação manual continua disponível quando a fonte não puder ser lida.
    }
  }
  const suggestedAnswer = onlineAnswer || ofAnswer;
  const divergence = onlineAnswer && ofAnswer && onlineAnswer !== ofAnswer;
  if (suggestedAnswer) return {
    found: true,
    suggestedAnswer,
    ofAnswer,
    onlineAnswer,
    sourceUrl: onlineAnswer ? onlineUrl : urls[0],
    message: divergence
      ? `Divergência: banco OF = ${ofAnswer}; fonte online = ${onlineAnswer}. Confira manualmente antes de salvar.`
      : onlineAnswer ? 'Resposta encontrada na fonte online e comparada com o banco OF.' : 'Resposta encontrada no banco OF. A fonte online não respondeu; compare manualmente antes de salvar.',
  };
  return {
    found: false,
    suggestedAnswer: null,
    ofAnswer,
    onlineAnswer,
    sourceUrl: lastUrl,
    message: 'Não foi possível localizar automaticamente. Use Comparar para conferir manualmente na fonte oficial.',
  };
}

export function getOfficialSourceUrl(question: { chapterId: string | null; chapterCode: string | null; internalCode?: string | null; subject: string; provaDate: string }) {
  return sourceUrls(question)[0];
}

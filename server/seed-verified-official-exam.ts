/**
 * Importa as provas homologadas pelo usuário na tabela isolada de provas oficiais.
 *
 * Este importador não lê nem remove simulator_questions e não aplica
 * classificação, equivalência, deduplicação ou correção automática.
 */
import fs from "node:fs";
import path from "node:path";
import { count } from "drizzle-orm";
import { getDb } from "./db";
import { verifiedOfficialQuestions } from "../drizzle/schema";

type Answer = "A" | "B" | "C" | "D";

type SourceRecord = {
  id: string;
  convocatoria: string;
  tipo: string;
  numero: number;
  texto_original: string;
  enunciado: string;
  opciones: Record<Answer, string>;
  respuesta_correcta: Answer;
  validacao: string;
};

type SourceFile = {
  status: string;
  registros: SourceRecord[];
  quantidade_questoes: number;
  quantidade_respostas: number;
};

const SOURCE_DIRECTORY = path.join(process.cwd(), "server/data/verified-official-exams");
const EXPECTED_FILE_COUNT = 34;
const EXPECTED_QUESTION_COUNT = 103;
const letters: Answer[] = ["A", "B", "C", "D"];

function assertSource(fileName: string, data: SourceFile) {
  const expectedDate = fileName.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}_MERCANCIAS\.json$/.test(fileName)) {
    throw new Error(`${fileName}: nome de arquivo inválido; esperada data ISO e MERCANCIAS.`);
  }
  if (data.status !== "APROVADO") throw new Error(`${fileName}: prova não está marcada como APROVADO.`);
  if (data.quantidade_questoes !== EXPECTED_QUESTION_COUNT || data.quantidade_respostas !== EXPECTED_QUESTION_COUNT || data.registros.length !== EXPECTED_QUESTION_COUNT) {
    throw new Error(`${fileName}: devem existir exatamente 103 questões e 103 respostas.`);
  }
  for (let index = 0; index < data.registros.length; index += 1) {
    const record = data.registros[index];
    const expectedNumber = index + 1;
    if (
      record.id !== `${expectedDate}-MERCANCIAS-Q${String(expectedNumber).padStart(3, "0")}`
      || record.convocatoria !== expectedDate
      || record.tipo !== "MERCANCIAS"
      || record.numero !== expectedNumber
      || record.validacao !== "APROVADO"
      || !record.texto_original
      || !record.enunciado
      || !record.opciones.A
      || !record.opciones.B
      || !record.opciones.C
      || !record.opciones.D
      || !letters.includes(record.respuesta_correcta)
    ) {
      throw new Error(`${fileName}: estrutura inválida na questão ${expectedNumber}.`);
    }
  }
}

async function seedVerifiedOfficialExams() {
  const db = await getDb();
  if (!db) throw new Error("Falha de conexão com o banco de dados.");
  const fileNames = fs.readdirSync(SOURCE_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
  if (fileNames.length !== EXPECTED_FILE_COUNT) {
    throw new Error(`Foram encontrados ${fileNames.length} arquivos; eram esperados ${EXPECTED_FILE_COUNT}.`);
  }

  const sources = fileNames.map((fileName) => ({
    fileName,
    data: JSON.parse(fs.readFileSync(path.join(SOURCE_DIRECTORY, fileName), "utf8")) as SourceFile,
  }));
  for (const source of sources) assertSource(source.fileName, source.data);

  const examDates = sources.map(({ fileName }) => fileName.slice(0, 10));
  if (new Set(examDates).size !== EXPECTED_FILE_COUNT) throw new Error("Há datas de prova duplicadas nos arquivos homologados.");
  const [existing] = await db.select({ total: count() }).from(verifiedOfficialQuestions);
  if (Number(existing?.total ?? 0) === EXPECTED_FILE_COUNT * EXPECTED_QUESTION_COUNT) {
    console.log(`As ${EXPECTED_FILE_COUNT} provas homologadas já estão carregadas; seed ignorado.`);
    return;
  }

  // Upsert only this isolated verified projection. The legacy simulator_questions
  // table is deliberately never read, deleted or written by this importer.
  // sourceId is stable, so re-running the seed preserves question IDs, reports,
  // correction overlays and historical answer references.
  for (const { data } of sources) {
    for (const record of data.registros) {
      await db.insert(verifiedOfficialQuestions).values({
        sourceId: record.id,
        examDate: record.convocatoria,
        model: "VERIFIED_OFFICIAL",
        questionNumber: record.numero,
        subject: "Mercancias",
        question: record.texto_original,
        stem: record.enunciado,
        optionA: record.opciones.A,
        optionB: record.opciones.B,
        optionC: record.opciones.C,
        optionD: record.opciones.D,
        correctAnswer: record.respuesta_correcta,
        isReserve: record.numero > 100,
      }).onDuplicateKeyUpdate({ set: {
        examDate: record.convocatoria,
        model: "VERIFIED_OFFICIAL",
        questionNumber: record.numero,
        subject: "Mercancias",
        question: record.texto_original,
        stem: record.enunciado,
        optionA: record.opciones.A,
        optionB: record.opciones.B,
        optionC: record.opciones.C,
        optionD: record.opciones.D,
        correctAnswer: record.respuesta_correcta,
        isReserve: record.numero > 100,
      } });
    }
  }

  console.log(`Importadas ${EXPECTED_FILE_COUNT} provas homologadas (${EXPECTED_FILE_COUNT * EXPECTED_QUESTION_COUNT} questões).`);
}

seedVerifiedOfficialExams().catch((error) => {
  console.error("Erro na importação das provas homologadas:", error);
  process.exitCode = 1;
});
